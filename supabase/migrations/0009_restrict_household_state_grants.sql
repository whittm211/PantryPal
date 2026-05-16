-- Ensure household state is only reachable by authenticated household members.

revoke all privileges on table public.household_state from anon;
revoke all privileges on table public.household_state from authenticated;
grant select, insert, update on table public.household_state to authenticated;
