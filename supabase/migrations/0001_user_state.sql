-- PantryPal — Phase 3 cloud sync
-- One row per (user, key). Each row holds a JSON blob mirroring what the
-- app currently stores in localStorage. Lets us turn on cross-device sync
-- without rewriting every mutation. Replace with a normalized schema in
-- Phase 3.5 when household sharing arrives.

create table if not exists public.user_state (
  user_id     uuid not null references auth.users (id) on delete cascade,
  key         text not null,
  value       jsonb not null,
  updated_at  timestamptz not null default now(),
  primary key (user_id, key)
);

alter table public.user_state enable row level security;

drop policy if exists "user_state_select_own" on public.user_state;
create policy "user_state_select_own"
  on public.user_state for select
  using (user_id = auth.uid());

drop policy if exists "user_state_insert_own" on public.user_state;
create policy "user_state_insert_own"
  on public.user_state for insert
  with check (user_id = auth.uid());

drop policy if exists "user_state_update_own" on public.user_state;
create policy "user_state_update_own"
  on public.user_state for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "user_state_delete_own" on public.user_state;
create policy "user_state_delete_own"
  on public.user_state for delete
  using (user_id = auth.uid());

create index if not exists user_state_user_idx on public.user_state (user_id);

grant usage on schema public to authenticated;
revoke all privileges on table public.user_state from authenticated;
grant select, insert, update, delete on table public.user_state to authenticated;
