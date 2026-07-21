-- Lets edge functions verify a scheduler bearer token against the
-- Vault-stored secret (single source of truth with the cron jobs).
-- Service-role only: not callable by anon/authenticated.
create or replace function public.verify_scheduler_secret(candidate text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from vault.decrypted_secrets
    where name = 'schedulersecret'
      and decrypted_secret = candidate
  );
$$;

revoke execute on function public.verify_scheduler_secret(text) from public;
revoke execute on function public.verify_scheduler_secret(text) from anon;
revoke execute on function public.verify_scheduler_secret(text) from authenticated;
grant execute on function public.verify_scheduler_secret(text) to service_role;
