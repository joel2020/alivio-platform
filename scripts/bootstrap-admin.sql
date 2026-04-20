-- =============================================================
-- bootstrap-admin.sql
-- Run this in the Supabase SQL Editor to bootstrap platform admins.
--
-- Usage:
--   1. Go to https://supabase.com/dashboard/project/ovxttubotjebnaoedllu/sql
--   2. Replace emails in the allowlist + one-off grant section
--   3. Run the script
--   4. Verify with the SELECT statements at the bottom
-- =============================================================

-- Step 1: Configure auto-bootstrap allowlist used by DB trigger.
-- Any user with an email in this comma-separated list is auto-promoted
-- to users.is_platform_admin on insert/update.
ALTER DATABASE postgres
SET app.settings.platform_admin_emails = 'joel@aliviosearchpartners.com';

-- Step 2: (Optional) one-off immediate grant for an existing user.
UPDATE public.users
SET is_platform_admin = true
WHERE lower(email) = lower('joel@aliviosearchpartners.com');

-- Step 3: Verify allowlist setting.
SELECT current_setting('app.settings.platform_admin_emails', true) AS platform_admin_emails;

-- Step 4: Verify users.
SELECT id, email, is_platform_admin
FROM public.users
WHERE lower(email) = lower('joel@aliviosearchpartners.com');

-- To revoke admin access for one user:
-- UPDATE public.users SET is_platform_admin = false WHERE lower(email) = lower('joel@aliviosearchpartners.com');

-- To clear allowlist (disables auto-bootstrap):
-- ALTER DATABASE postgres RESET app.settings.platform_admin_emails;
