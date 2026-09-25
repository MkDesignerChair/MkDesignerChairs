"use client";

import { usePathname } from "next/navigation";

export default function StoreStatusNotice({ settings }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  const message = settings.maintenanceMode ? "We are currently performing scheduled maintenance. Browsing remains available while service updates are completed." : !settings.storeOpen ? "Our showroom is currently closed. You can still send an enquiry and our team will respond during business hours." : settings.announcementEnabled && settings.announcementBar ? settings.announcementBar : "";
  if (!message) return null;

  return <aside className={`store-status-notice${settings.maintenanceMode ? " store-status-notice--maintenance" : ""}`} role="status"><span>{settings.maintenanceMode ? "Maintenance update" : !settings.storeOpen ? "Store update" : "Notice"}</span><p>{message}</p></aside>;
}
