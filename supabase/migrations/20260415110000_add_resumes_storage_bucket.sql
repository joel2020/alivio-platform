-- Create private resumes bucket for candidate resume uploads.
insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false)
on conflict (id) do update set public = excluded.public;

-- Allow authenticated users to work with resume objects.
drop policy if exists "Authenticated users can read resumes" on storage.objects;
create policy "Authenticated users can read resumes"
on storage.objects for select
using (bucket_id = 'resumes' and auth.role() = 'authenticated');

drop policy if exists "Authenticated users can upload resumes" on storage.objects;
create policy "Authenticated users can upload resumes"
on storage.objects for insert
with check (bucket_id = 'resumes' and auth.role() = 'authenticated');

drop policy if exists "Authenticated users can update resumes" on storage.objects;
create policy "Authenticated users can update resumes"
on storage.objects for update
using (bucket_id = 'resumes' and auth.role() = 'authenticated')
with check (bucket_id = 'resumes' and auth.role() = 'authenticated');

drop policy if exists "Authenticated users can delete resumes" on storage.objects;
create policy "Authenticated users can delete resumes"
on storage.objects for delete
using (bucket_id = 'resumes' and auth.role() = 'authenticated');

-- Expected object key format: {account_id}/{candidate_id}/{timestamp}-{filename}
