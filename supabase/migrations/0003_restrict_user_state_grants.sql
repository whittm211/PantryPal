-- Keep authenticated clients on least-privilege CRUD access.
-- RLS policies still restrict rows to auth.uid().

revoke all privileges on table public.user_state from authenticated;
grant select, insert, update, delete on table public.user_state to authenticated;
