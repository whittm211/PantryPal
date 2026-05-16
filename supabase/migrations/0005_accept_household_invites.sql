-- Accept household invite tokens without exposing invite rows to clients.

create schema if not exists private;

create or replace function private.accept_household_invite(
  invite_token text,
  member_display_name text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  requester uuid := auth.uid();
  target_household_id uuid;
  display_name text := nullif(btrim(member_display_name), '');
begin
  if requester is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  select i.household_id
    into target_household_id
  from public.household_invites i
  where i.token = invite_token
    and i.accepted_at is null
    and i.expires_at > now()
  limit 1;

  if target_household_id is null then
    raise exception 'Invite link is invalid or expired' using errcode = '22023';
  end if;

  insert into public.household_members (household_id, user_id, role, display_name)
  values (target_household_id, requester, 'member', coalesce(display_name, 'Household member'))
  on conflict (household_id, user_id) do update
    set display_name = coalesce(excluded.display_name, public.household_members.display_name);

  update public.household_invites
    set accepted_at = coalesce(accepted_at, now())
  where token = invite_token
    and accepted_at is null;

  return target_household_id;
end;
$$;

create or replace function public.accept_household_invite(
  invite_token text,
  member_display_name text default null
)
returns uuid
language sql
security invoker
set search_path = ''
as $$
  select private.accept_household_invite(invite_token, member_display_name);
$$;

revoke all on schema private from public;
grant usage on schema private to authenticated;

revoke execute on function private.accept_household_invite(text, text) from public, anon;
grant execute on function private.accept_household_invite(text, text) to authenticated;

revoke execute on function public.accept_household_invite(text, text) from public, anon;
grant execute on function public.accept_household_invite(text, text) to authenticated;
