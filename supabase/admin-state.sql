-- Run in the Supabase SQL Editor before deploying the Supabase-backed admin state.
-- This table stores the existing admin JSON state, including product/category/content image URLs.

create table if not exists public.admin_state (
  state_key text primary key,
  data jsonb not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.admin_state_set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_admin_state_updated_at on public.admin_state;
create trigger set_admin_state_updated_at
before update on public.admin_state
for each row execute function public.admin_state_set_updated_at();

alter table public.admin_state enable row level security;

revoke all on public.admin_state from anon;
revoke all on public.admin_state from authenticated;
grant select, insert, update, delete on public.admin_state to authenticated;

drop policy if exists admin_full_access on public.admin_state;
create policy admin_full_access
on public.admin_state
for all
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));
