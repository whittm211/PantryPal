-- Shared household app state for pantry, groceries, meal plans, recipes, and related data.

create table if not exists public.household_state (
  household_id uuid not null references public.households (id) on delete cascade,
  key text not null,
  value jsonb not null,
  updated_by uuid references auth.users (id) on delete set null,
  updated_at timestamptz not null default now(),
  primary key (household_id, key)
);

alter table public.household_state enable row level security;

create index if not exists household_state_updated_by_idx
  on public.household_state (updated_by);

drop policy if exists "household_state_select_member" on public.household_state;
create policy "household_state_select_member"
  on public.household_state for select
  to authenticated
  using (
    exists (
      select 1 from public.household_members m
      where m.household_id = household_state.household_id
        and m.user_id = (select auth.uid())
    )
  );

drop policy if exists "household_state_insert_member" on public.household_state;
create policy "household_state_insert_member"
  on public.household_state for insert
  to authenticated
  with check (
    updated_by = (select auth.uid())
    and exists (
      select 1 from public.household_members m
      where m.household_id = household_state.household_id
        and m.user_id = (select auth.uid())
    )
  );

drop policy if exists "household_state_update_member" on public.household_state;
create policy "household_state_update_member"
  on public.household_state for update
  to authenticated
  using (
    exists (
      select 1 from public.household_members m
      where m.household_id = household_state.household_id
        and m.user_id = (select auth.uid())
    )
  )
  with check (
    updated_by = (select auth.uid())
    and exists (
      select 1 from public.household_members m
      where m.household_id = household_state.household_id
        and m.user_id = (select auth.uid())
    )
  );

revoke all privileges on table public.household_state from anon;
revoke all privileges on table public.household_state from authenticated;
grant select, insert, update on table public.household_state to authenticated;
