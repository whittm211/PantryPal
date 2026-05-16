-- Reduce RLS auth helper re-evaluation and lock the generated kv store to service-role usage.

drop policy if exists "user_state_select_own" on public.user_state;
create policy "user_state_select_own"
  on public.user_state for select
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "user_state_insert_own" on public.user_state;
create policy "user_state_insert_own"
  on public.user_state for insert
  to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "user_state_update_own" on public.user_state;
create policy "user_state_update_own"
  on public.user_state for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "user_state_delete_own" on public.user_state;
create policy "user_state_delete_own"
  on public.user_state for delete
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "households_select_owner" on public.households;
create policy "households_select_owner"
  on public.households for select
  to authenticated
  using (owner_user_id = (select auth.uid()));

drop policy if exists "households_insert_owner" on public.households;
create policy "households_insert_owner"
  on public.households for insert
  to authenticated
  with check (owner_user_id = (select auth.uid()));

drop policy if exists "households_update_owner" on public.households;
create policy "households_update_owner"
  on public.households for update
  to authenticated
  using (owner_user_id = (select auth.uid()))
  with check (owner_user_id = (select auth.uid()));

drop policy if exists "households_delete_owner" on public.households;
create policy "households_delete_owner"
  on public.households for delete
  to authenticated
  using (owner_user_id = (select auth.uid()));

drop policy if exists "household_members_select_owner_or_self" on public.household_members;
create policy "household_members_select_owner_or_self"
  on public.household_members for select
  to authenticated
  using (
    user_id = (select auth.uid())
    or exists (
      select 1 from public.households h
      where h.id = household_id and h.owner_user_id = (select auth.uid())
    )
  );

drop policy if exists "household_members_insert_owner_or_self_owner" on public.household_members;
create policy "household_members_insert_owner_or_self_owner"
  on public.household_members for insert
  to authenticated
  with check (
    (
      user_id = (select auth.uid())
      and role = 'owner'
      and exists (
        select 1 from public.households h
        where h.id = household_id and h.owner_user_id = (select auth.uid())
      )
    )
    or exists (
      select 1 from public.households h
      where h.id = household_id and h.owner_user_id = (select auth.uid())
    )
  );

drop policy if exists "household_members_update_owner" on public.household_members;
create policy "household_members_update_owner"
  on public.household_members for update
  to authenticated
  using (
    exists (
      select 1 from public.households h
      where h.id = household_id and h.owner_user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.households h
      where h.id = household_id and h.owner_user_id = (select auth.uid())
    )
  );

drop policy if exists "household_members_delete_owner_or_self" on public.household_members;
create policy "household_members_delete_owner_or_self"
  on public.household_members for delete
  to authenticated
  using (
    user_id = (select auth.uid())
    or exists (
      select 1 from public.households h
      where h.id = household_id and h.owner_user_id = (select auth.uid())
    )
  );

drop policy if exists "household_invites_select_owner" on public.household_invites;
create policy "household_invites_select_owner"
  on public.household_invites for select
  to authenticated
  using (
    exists (
      select 1 from public.households h
      where h.id = household_id and h.owner_user_id = (select auth.uid())
    )
  );

drop policy if exists "household_invites_insert_owner" on public.household_invites;
create policy "household_invites_insert_owner"
  on public.household_invites for insert
  to authenticated
  with check (
    created_by = (select auth.uid())
    and exists (
      select 1 from public.households h
      where h.id = household_id and h.owner_user_id = (select auth.uid())
    )
  );

drop policy if exists "household_invites_update_owner" on public.household_invites;
create policy "household_invites_update_owner"
  on public.household_invites for update
  to authenticated
  using (
    exists (
      select 1 from public.households h
      where h.id = household_id and h.owner_user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.households h
      where h.id = household_id and h.owner_user_id = (select auth.uid())
    )
  );

drop policy if exists "household_invites_delete_owner" on public.household_invites;
create policy "household_invites_delete_owner"
  on public.household_invites for delete
  to authenticated
  using (
    exists (
      select 1 from public.households h
      where h.id = household_id and h.owner_user_id = (select auth.uid())
    )
  );

revoke all privileges on table public.kv_store_e808db2a from anon;
revoke all privileges on table public.kv_store_e808db2a from authenticated;
grant select, insert, update, delete on table public.kv_store_e808db2a to service_role;

drop index if exists public.kv_store_e808db2a_key_idx1;

drop policy if exists "kv_store_no_client_access" on public.kv_store_e808db2a;
create policy "kv_store_no_client_access"
  on public.kv_store_e808db2a for all
  to anon, authenticated
  using (false)
  with check (false);
