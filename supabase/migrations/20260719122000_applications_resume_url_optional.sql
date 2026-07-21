-- Applications may provide LinkedIn instead of a resume link; the
-- public-intake function enforces at least one of the two.
alter table public.applications alter column resume_url drop not null;
