'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import Razorpay from 'razorpay'
import crypto from 'crypto'
import { trySendOrderConfirmationEmail } from '@/lib/orderConfirmationEmail'
import { tryCreateShiprocketShipmentAndAssignAwbForOrder } from '@/lib/shiprocketOrder'

type CheckoutResult =
  | { success: false; error: string }
  | {
      success: true
      isRazorpay: true
      razorpayOrderId: string
      orderId: string
      orderNumber: string
      amount: number
      totalAmount: number
    }
  | {
      success: true
      isRazorpay: false
      order_number: string
      orderId: string
      totalAmount: number
    }

type CheckoutCartItem = {
  id: string
  variant_id?: string | null
  quantity: number
}

type ResolvedOrderItem = {
  product_id: string
  variant_id: string
  product_name: string
  variant_name: string
  price_at_purchase: number
  quantity: number
  line_total: number
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

let razorpayInstance: any = null
try {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  }
} catch {
  console.warn('Razorpay credentials missing or invalid')
}

function validQuantity(value: unknown) {
  const quantity = Number(value)
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) return null
  return quantity
}

async function getShippingSettings(supabase: any) {
  const { data } = await supabase
    .from('settings')
    .select('shipping')
    .eq('id', 'site_settings')
    .single()

  return data?.shipping || {
    flat_rate: 99,
    free_threshold: 1999,
    cod_charge: 50,
    online_discount: 0,
  }
}

async function resolveVariant(supabase: any, item: CheckoutCartItem) {
  if (item.variant_id && UUID_PATTERN.test(item.variant_id)) {
    const { data: variant, error } = await supabase
      .from('product_variants')
      .select('id, product_id, variant_name, price, stock_quantity, is_active')
      .eq('id', item.variant_id)
      .maybeSingle()

    if (error) throw new Error(error.message)
    if (variant) return variant
  }

  const { data: fallbackVariant, error: fallbackError } = await supabase
    .from('product_variants')
    .select('id, product_id, variant_name, price, stock_quantity, is_active')
    .eq('product_id', item.id)
    .eq('is_active', true)
    .order('price', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (fallbackError) throw new Error(fallbackError.message)
  return fallbackVariant
}

async function resolveOrderItems(supabase: any, cartItems: CheckoutCartItem[]) {
  if (!cartItems.length) {
    return { error: 'Your cart is empty.', items: [] as ResolvedOrderItem[], subtotal: 0 }
  }

  const grouped = new Map<string, ResolvedOrderItem>()

  for (const item of cartItems) {
    const quantity = validQuantity(item.quantity)
    if (!item.id || !quantity) {
      return { error: 'Invalid cart item quantity.', items: [] as ResolvedOrderItem[], subtotal: 0 }
    }

    const variant = await resolveVariant(supabase, item)
    if (!variant || !variant.is_active) {
      return { error: 'One or more selected variants are no longer available.', items: [] as ResolvedOrderItem[], subtotal: 0 }
    }

    if (Number(variant.stock_quantity) < quantity) {
      return { error: `${variant.variant_name || 'Selected variant'} does not have enough stock.`, items: [] as ResolvedOrderItem[], subtotal: 0 }
    }

    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, name, is_active')
      .eq('id', variant.product_id)
      .single()

    if (productError || !product?.is_active) {
      return { error: 'One or more products are no longer available.', items: [] as ResolvedOrderItem[], subtotal: 0 }
    }

    const price = Number(variant.price)
    const existing = grouped.get(variant.id)
    const nextQuantity = (existing?.quantity || 0) + quantity
    if (Number(variant.stock_quantity) < nextQuantity) {
      return { error: `${product.name} does not have enough stock.`, items: [] as ResolvedOrderItem[], subtotal: 0 }
    }

    grouped.set(variant.id, {
      product_id: product.id,
      variant_id: variant.id,
      product_name: product.name,
      variant_name: variant.variant_name || 'Default',
      price_at_purchase: price,
      quantity: nextQuantity,
      line_total: price * nextQuantity,
    })
  }

  const items = Array.from(grouped.values())
  const subtotal = items.reduce((sum, item) => sum + item.line_total, 0)
  return { error: null, items, subtotal }
}

async function calculateCouponDiscount(supabase: any, couponCode: string | undefined, subtotal: number) {
  const normalizedCode = couponCode?.trim().toUpperCase()
  if (!normalizedCode) return { discount: 0, couponId: null as string | null, error: null as string | null }

  const { data: coupon } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', normalizedCode)
    .eq('is_active', true)
    .maybeSingle()

  if (!coupon) return { discount: 0, couponId: null, error: 'Invalid or inactive coupon code.' }
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return { discount: 0, couponId: null, error: 'Coupon has expired.' }
  }
  if (subtotal < Number(coupon.min_purchase || 0)) {
    return { discount: 0, couponId: null, error: `Minimum purchase of ₹${coupon.min_purchase} required to use this coupon.` }
  }
  if (coupon.usage_limit && Number(coupon.used_count || 0) >= Number(coupon.usage_limit)) {
    return { discount: 0, couponId: null, error: 'Coupon usage limit has been reached.' }
  }

  const rawDiscount = coupon.type === 'percentage'
    ? Math.round((subtotal * Number(coupon.value)) / 100)
    : Number(coupon.value)
  const maxDiscount = coupon.max_discount ? Number(coupon.max_discount) : rawDiscount
  return {
    discount: Math.min(rawDiscount, maxDiscount, subtotal),
    couponId: coupon.id as string,
    error: null,
  }
}

async function decrementOrderStockOnce(supabase: any, orderId: string) {
  const { error } = await supabase.rpc('decrement_order_stock_once', {
    order_id_input: orderId,
  })

  if (error) throw new Error(error.message)
}

async function calculateResolvedTotals(
  supabase: any,
  resolved: { subtotal: number },
  paymentMethod: 'COD' | 'RAZORPAY',
  couponCode?: string
) {
  const shippingSettings = await getShippingSettings(supabase)
  const flatRate = Number(shippingSettings.flat_rate ?? 99)
  const freeThreshold = Number(shippingSettings.free_threshold ?? 1999)
  const codCharge = Number(shippingSettings.cod_charge ?? 50)
  const onlineDiscountPercent = Number(shippingSettings.online_discount ?? 0)
  const coupon = await calculateCouponDiscount(supabase, couponCode, resolved.subtotal)
  if (coupon.error) return { error: coupon.error }

  const shipping_cost = resolved.subtotal >= freeThreshold ? 0 : flatRate
  const cod_cost = paymentMethod === 'COD' ? codCharge : 0
  const online_discount_amount = paymentMethod === 'RAZORPAY'
    ? Math.round((resolved.subtotal * onlineDiscountPercent) / 100)
    : 0
  const total_amount = Math.max(
    0,
    resolved.subtotal + shipping_cost + cod_cost - coupon.discount - online_discount_amount
  )

  return {
    error: null,
    couponId: coupon.couponId,
    subtotal: resolved.subtotal,
    shipping_cost,
    cod_cost,
    coupon_discount: coupon.discount,
    online_discount_amount,
    total_amount,
  }
}

export async function calculateCheckoutTotals(
  cartItemsFromFrontend: CheckoutCartItem[],
  paymentMethod: 'COD' | 'RAZORPAY',
  couponCode?: string
) {
  const adminSupabase = createAdminClient()
  const resolved = await resolveOrderItems(adminSupabase, cartItemsFromFrontend || [])
  if (resolved.error) return { success: false, error: resolved.error }

  const totals = await calculateResolvedTotals(adminSupabase, resolved, paymentMethod, couponCode)
  if (totals.error) return { success: false, error: totals.error }

  return {
    success: true,
    subtotal: totals.subtotal,
    shipping_cost: totals.shipping_cost,
    cod_cost: totals.cod_cost,
    coupon_discount: totals.coupon_discount,
    online_discount_amount: totals.online_discount_amount,
    total_amount: totals.total_amount,
  }
}

export async function createOrder(
  addressId: string,
  paymentMethod: 'COD' | 'RAZORPAY',
  cartItemsFromFrontend: CheckoutCartItem[],
  couponCode?: string
): Promise<CheckoutResult> {
  const userSupabase = await createClient()
  const adminSupabase = createAdminClient()
  const { data: { user } } = await userSupabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { data: address } = await adminSupabase
    .from('addresses')
    .select('id')
    .eq('id', addressId)
    .eq('user_id', user.id)
    .single()

  if (!address) return { success: false, error: 'Invalid shipping address' }

  const resolved = await resolveOrderItems(adminSupabase, cartItemsFromFrontend || [])
  if (resolved.error) return { success: false, error: resolved.error }

  const totals = await calculateResolvedTotals(adminSupabase, resolved, paymentMethod, couponCode)
  if (totals.error) return { success: false, error: totals.error }

  const order_number = `AM-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
  const actualPaymentMethod = paymentMethod === 'RAZORPAY' ? 'Online Payment (Razorpay)' : 'Cash on Delivery'

  const { data: order, error: orderError } = await adminSupabase
    .from('orders')
    .insert([{
      order_number,
      user_id: user.id,
      address_id: addressId,
      subtotal: totals.subtotal,
      shipping_cost: totals.shipping_cost,
      total_amount: totals.total_amount,
      payment_status: 'pending',
      order_status: 'pending',
      payment_method: actualPaymentMethod,
    }])
    .select('id, order_number')
    .single()

  if (orderError || !order) {
    return { success: false, error: orderError?.message || 'Failed to create order' }
  }

  const { error: itemsError } = await adminSupabase
    .from('order_items')
    .insert(resolved.items.map(item => ({ ...item, order_id: order.id })))

  if (itemsError) {
    await adminSupabase.from('orders').delete().eq('id', order.id)
    return { success: false, error: 'Failed to create order items' }
  }

  if (totals.couponId) {
    const { data: currentCoupon } = await adminSupabase
      .from('coupons')
      .select('used_count')
      .eq('id', totals.couponId)
      .single()

    await adminSupabase
      .from('coupons')
      .update({ used_count: Number(currentCoupon?.used_count || 0) + 1 })
      .eq('id', totals.couponId)
  }

  if (paymentMethod === 'RAZORPAY') {
    if (!razorpayInstance) {
      await adminSupabase.from('orders').update({ payment_status: 'failed' }).eq('id', order.id)
      return { success: false, error: 'Razorpay is not configured on the server.' }
    }

    try {
      const options = {
        amount: Math.round(totals.total_amount * 100),
        currency: 'INR',
        receipt: order.id,
        payment_capture: 1,
      }
      const rzpOrder = await razorpayInstance.orders.create(options)

      await adminSupabase
        .from('orders')
        .update({ razorpay_order_id: rzpOrder.id })
        .eq('id', order.id)

      return {
        success: true,
        isRazorpay: true,
        razorpayOrderId: rzpOrder.id,
        orderId: order.id,
        orderNumber: order.order_number,
        amount: options.amount,
        totalAmount: totals.total_amount,
      }
    } catch {
      await adminSupabase.from('orders').update({ payment_status: 'failed' }).eq('id', order.id)
      return { success: false, error: 'Failed to initialize payment gateway.' }
    }
  }

  try {
    await decrementOrderStockOnce(adminSupabase, order.id)
  } catch (error: any) {
    await adminSupabase.from('orders').update({ order_status: 'cancelled' }).eq('id', order.id)
    return { success: false, error: error.message || 'Failed to update stock.' }
  }

  await adminSupabase
    .from('cart_items')
    .delete()
    .eq('user_id', user.id)

  await tryCreateShiprocketShipmentAndAssignAwbForOrder(adminSupabase, order.id)
  await trySendOrderConfirmationEmail(adminSupabase, order.id)

  revalidatePath('/cart')
  revalidatePath('/checkout')
  revalidatePath('/profile')
  revalidatePath('/admin/orders')

  return { success: true, isRazorpay: false, order_number: order.order_number, orderId: order.id, totalAmount: totals.total_amount }
}

export async function verifyRazorpayPayment(
  razorpay_payment_id: string,
  razorpay_order_id: string,
  razorpay_signature: string,
  internal_order_id: string
) {
  const supabase = createAdminClient()
  const userSupabase = await createClient()
  const { data: { user } } = await userSupabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const secret = process.env.RAZORPAY_KEY_SECRET
  if (!secret) return { success: false, error: 'Razorpay secret not configured' }

  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex')

  if (generatedSignature !== razorpay_signature) {
    return { success: false, error: 'Payment verification failed: Invalid signature' }
  }

  const { data: order } = await supabase
    .from('orders')
    .select('id, user_id, total_amount, razorpay_order_id, payment_status')
    .eq('id', internal_order_id)
    .eq('user_id', user.id)
    .single()

  if (!order) return { success: false, error: 'Order not found' }
  if (order.payment_status === 'paid') return { success: true }
  if (order.razorpay_order_id !== razorpay_order_id) {
    return { success: false, error: 'Payment verification failed: Razorpay order mismatch' }
  }

  if (razorpayInstance) {
    const payment = await razorpayInstance.payments.fetch(razorpay_payment_id)
    const expectedAmount = Math.round(Number(order.total_amount) * 100)
    if (payment.order_id !== razorpay_order_id || Number(payment.amount) !== expectedAmount || payment.currency !== 'INR') {
      return { success: false, error: 'Payment verification failed: amount or currency mismatch' }
    }
    if (!['authorized', 'captured'].includes(payment.status)) {
      return { success: false, error: 'Payment was not successful' }
    }
  }

  try {
    await decrementOrderStockOnce(supabase, internal_order_id)
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update stock.' }
  }

  const { error: updateError } = await supabase
    .from('orders')
    .update({
      payment_status: 'paid',
      razorpay_payment_id,
      paid_at: new Date().toISOString(),
    })
    .eq('id', internal_order_id)
    .eq('user_id', user.id)
    .eq('razorpay_order_id', razorpay_order_id)

  if (updateError) {
    return { success: false, error: 'Failed to update order status' }
  }

  await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', user.id)

  await tryCreateShiprocketShipmentAndAssignAwbForOrder(supabase, internal_order_id)
  await trySendOrderConfirmationEmail(supabase, internal_order_id)

  revalidatePath('/cart')
  revalidatePath('/checkout')
  revalidatePath('/profile')
  revalidatePath('/admin/orders')

  return { success: true }
}

export async function processCheckout(
  profile: { fullName: string, email: string, phone: string, alternatePhone?: string, street: string, city: string, state: string, zipCode: string },
  items: CheckoutCartItem[],
  paymentMethod: 'COD' | 'RAZORPAY',
  couponCode?: string
): Promise<CheckoutResult> {
  const supabase = await createClient()
  const adminSupabase = createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'You must be logged in to checkout.' }

  let addressId = ''
  const { data: existingAddress } = await adminSupabase
    .from('addresses')
    .select('id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const addressFields = {
    full_name: profile.fullName,
    phone: profile.phone,
    alternate_phone: profile.alternatePhone || null,
    address_line_1: profile.street,
    city: profile.city,
    state: profile.state,
    postal_code: profile.zipCode,
    country: 'India',
  }

  if (existingAddress) {
    const { error } = await adminSupabase
      .from('addresses')
      .update(addressFields)
      .eq('id', existingAddress.id)
      .eq('user_id', user.id)

    if (error) return { success: false, error: error.message || 'Failed to save address.' }
    addressId = existingAddress.id
  } else {
    const { data: newAddress, error: addressError } = await adminSupabase
      .from('addresses')
      .insert({
        id: crypto.randomUUID(),
        user_id: user.id,
        ...addressFields,
        is_default: true,
      })
      .select('id')
      .single()

    if (addressError || !newAddress) {
      return { success: false, error: addressError?.message || 'Failed to save address.' }
    }
    addressId = newAddress.id
  }

  const resolved = await resolveOrderItems(adminSupabase, items || [])
  if (resolved.error) return { success: false, error: resolved.error }

  await adminSupabase.from('cart_items').delete().eq('user_id', user.id)
  const { error: cartError } = await adminSupabase
    .from('cart_items')
    .insert(resolved.items.map(item => ({
      user_id: user.id,
      variant_id: item.variant_id,
      quantity: item.quantity,
    })))

  if (cartError) {
    return { success: false, error: cartError.message || 'Failed to sync cart.' }
  }

  return await createOrder(addressId, paymentMethod, items, couponCode)
}
