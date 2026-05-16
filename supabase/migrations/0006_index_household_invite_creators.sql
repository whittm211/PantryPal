-- Cover the invite creator foreign key for owner invite lookups and deletes.

create index if not exists household_invites_created_by_idx
  on public.household_invites (created_by);
