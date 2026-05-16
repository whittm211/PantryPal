-- Let every household member read the member roster for their own household.
-- The helper avoids recursive RLS checks on household_members.

create or replace function private.is_household_member(target_household_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.household_members hm
    where hm.household_id = target_household_id
      and hm.user_id = auth.uid()
  );
$$;

revoke execute on function private.is_household_member(uuid) from public, anon;
grant execute on function private.is_household_member(uuid) to authenticated;

drop policy if exists "household_members_select_owner_or_self" on public.household_members;
create policy "household_members_select_household_roster"
  on public.household_members for select
  using (private.is_household_member(household_id));
