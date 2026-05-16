-- Household sharing foundation.
-- This creates household ownership, membership, and owner-managed invite rows.
-- Follow-up app work will use these tables to turn invite links into real joins.

create table if not exists public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'My Household',
  owner_user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.household_members (
  household_id uuid not null references public.households (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('owner', 'member')),
  display_name text,
  joined_at timestamptz not null default now(),
  primary key (household_id, user_id)
);

create table if not exists public.household_invites (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  token text not null unique,
  created_by uuid not null references auth.users (id) on delete cascade,
  expires_at timestamptz not null default (now() + interval '14 days'),
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.households enable row level security;
alter table public.household_members enable row level security;
alter table public.household_invites enable row level security;

drop policy if exists "households_select_owner" on public.households;
create policy "households_select_owner"
  on public.households for select
  using (owner_user_id = auth.uid());

drop policy if exists "households_insert_owner" on public.households;
create policy "households_insert_owner"
  on public.households for insert
  with check (owner_user_id = auth.uid());

drop policy if exists "households_update_owner" on public.households;
create policy "households_update_owner"
  on public.households for update
  using (owner_user_id = auth.uid())
  with check (owner_user_id = auth.uid());

drop policy if exists "households_delete_owner" on public.households;
create policy "households_delete_owner"
  on public.households for delete
  using (owner_user_id = auth.uid());

drop policy if exists "household_members_select_owner_or_self" on public.household_members;
create policy "household_members_select_owner_or_self"
  on public.household_members for select
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.households h
      where h.id = household_id and h.owner_user_id = auth.uid()
    )
  );

drop policy if exists "household_members_insert_owner_or_self_owner" on public.household_members;
create policy "household_members_insert_owner_or_self_owner"
  on public.household_members for insert
  with check (
    (
      user_id = auth.uid()
      and role = 'owner'
      and exists (
        select 1 from public.households h
        where h.id = household_id and h.owner_user_id = auth.uid()
      )
    )
    or exists (
      select 1 from public.households h
      where h.id = household_id and h.owner_user_id = auth.uid()
    )
  );

drop policy if exists "household_members_update_owner" on public.household_members;
create policy "household_members_update_owner"
  on public.household_members for update
  using (
    exists (
      select 1 from public.households h
      where h.id = household_id and h.owner_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.households h
      where h.id = household_id and h.owner_user_id = auth.uid()
    )
  );

drop policy if exists "household_members_delete_owner_or_self" on public.household_members;
create policy "household_members_delete_owner_or_self"
  on public.household_members for delete
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.households h
      where h.id = household_id and h.owner_user_id = auth.uid()
    )
  );

drop policy if exists "household_invites_select_owner" on public.household_invites;
create policy "household_invites_select_owner"
  on public.household_invites for select
  using (
    exists (
      select 1 from public.households h
      where h.id = household_id and h.owner_user_id = auth.uid()
    )
  );

drop policy if exists "household_invites_insert_owner" on public.household_invites;
create policy "household_invites_insert_owner"
  on public.household_invites for insert
  with check (
    created_by = auth.uid()
    and exists (
      select 1 from public.households h
      where h.id = household_id and h.owner_user_id = auth.uid()
    )
  );

drop policy if exists "household_invites_update_owner" on public.household_invites;
create policy "household_invites_update_owner"
  on public.household_invites for update
  using (
    exists (
      select 1 from public.households h
      where h.id = household_id and h.owner_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.households h
      where h.id = household_id and h.owner_user_id = auth.uid()
    )
  );

drop policy if exists "household_invites_delete_owner" on public.household_invites;
create policy "household_invites_delete_owner"
  on public.household_invites for delete
  using (
    exists (
      select 1 from public.households h
      where h.id = household_id and h.owner_user_id = auth.uid()
    )
  );

create index if not exists households_owner_user_idx on public.households (owner_user_id);
create index if not exists household_members_user_idx on public.household_members (user_id);
create index if not exists household_invites_household_idx on public.household_invites (household_id);
create index if not exists household_invites_token_idx on public.household_invites (token);

revoke all privileges on table public.households from authenticated;
revoke all privileges on table public.household_members from authenticated;
revoke all privileges on table public.household_invites from authenticated;
grant select, insert, update, delete on table public.households to authenticated;
grant select, insert, update, delete on table public.household_members to authenticated;
grant select, insert, update, delete on table public.household_invites to authenticated;
