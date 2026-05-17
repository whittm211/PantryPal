# PantryPal Admin Cleanup Runbook

Use this after QA or launch testing to remove disposable test accounts and data from Supabase.

Do not run destructive SQL until the dry-run queries show only records you intend to remove.

## What Gets Stored

PantryPal cloud data is tied to Supabase Auth users:

- `auth.users`
- `public.user_state`
- `public.households`
- `public.household_members`
- `public.household_invites`
- `public.household_state`

The migrations use cascading foreign keys, so deleting a test user from `auth.users` removes that user's personal state and owned household data.

## Known QA Account Patterns

Disposable accounts created during release QA used addresses like:

- `pantrypalqa+...@gmail.com`
- `pantrypal.qa....@example.com`

Most test accounts also used the display name `QA Tester`.

## Dry Run: Find Test Users

Run this in the Supabase SQL editor:

```sql
select
  id,
  email,
  raw_user_meta_data,
  created_at,
  last_sign_in_at
from auth.users
where
  email ilike 'pantrypalqa+%@gmail.com'
  or email ilike 'pantrypal.qa.%@example.com'
  or raw_user_meta_data->>'display_name' ilike '%qa tester%'
order by created_at desc;
```

Review every row before deleting anything.

## Dry Run: See Related App Data

Replace the email filters if needed.

```sql
with qa_users as (
  select id, email
  from auth.users
  where
    email ilike 'pantrypalqa+%@gmail.com'
    or email ilike 'pantrypal.qa.%@example.com'
    or raw_user_meta_data->>'display_name' ilike '%qa tester%'
)
select 'user_state' as table_name, count(*) as rows
from public.user_state
where user_id in (select id from qa_users)
union all
select 'households' as table_name, count(*) as rows
from public.households
where owner_user_id in (select id from qa_users)
union all
select 'household_members' as table_name, count(*) as rows
from public.household_members
where user_id in (select id from qa_users)
union all
select 'household_invites' as table_name, count(*) as rows
from public.household_invites
where created_by in (select id from qa_users);
```

## Delete Test Users

Only run this after confirming the dry-run result contains disposable QA users.

```sql
delete from auth.users
where
  email ilike 'pantrypalqa+%@gmail.com'
  or email ilike 'pantrypal.qa.%@example.com'
  or raw_user_meta_data->>'display_name' ilike '%qa tester%';
```

## Verify Cleanup

```sql
select
  id,
  email,
  raw_user_meta_data,
  created_at
from auth.users
where
  email ilike 'pantrypalqa+%@gmail.com'
  or email ilike 'pantrypal.qa.%@example.com'
  or raw_user_meta_data->>'display_name' ilike '%qa tester%';
```

The result should be empty.

## Clean Local Browser QA Data

Guest-mode QA data is stored in browser local storage. To clear it:

1. Open PantryPal in the browser.
2. Open browser dev tools.
3. Go to Application or Storage.
4. Clear local storage for `https://whittm211.github.io`.
5. Reload PantryPal and confirm the default guest data appears.

Do not clear browser storage if you need to keep guest-mode data. Export a JSON backup first from Settings -> Data -> Export JSON.
