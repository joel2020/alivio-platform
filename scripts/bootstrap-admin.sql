-- =============================================================
-- bootstrap-admin.sql
-- Run this in the Supabase SQL Editor to grant platform-admin
-- access to a specific user by email address.
--
-- Usage:
--   1. Go to https://supabase.com/dashboard/project/ovxttubotjebnaoedllu/sql
--   2. Replace 'your-email@example.com' with the target email
--   3. Run the script
--   4. Verify with the SELECT at the bottom
-- =============================================================

-- Step 1: Grant platform-admin to user by email
UPDATE public.users
SET is_platform_admin = true
WHERE email = 'joel@aliviosearchpartners.com';

-- Step 2: Verify
SELECT id, email, is_platform_admin
FROM public.users
WHERE email = 'joel@aliviosearchpartners.com';

-- To revoke admin access:
-- UPDATE public.users SET is_platform_admin = false WHERE email = 'joel@aliviosearchpartners.com';
