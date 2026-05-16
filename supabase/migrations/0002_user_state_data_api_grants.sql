-- Ensure existing projects expose user_state to authenticated clients.
-- RLS policies from 0001 still restrict access to the signed-in user's rows.

grant usage on schema public to authenticated;
revoke all privileges on table public.user_state from authenticated;
grant select, insert, update, delete on table public.user_state to authenticated;
