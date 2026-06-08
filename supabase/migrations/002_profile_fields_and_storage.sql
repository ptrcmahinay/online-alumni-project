-- Add missing profile fields
alter table public.profiles
  add column if not exists student_number text,
  add column if not exists location text,
  add column if not exists bio text,
  add column if not exists graduation_year text,
  add column if not exists employment_status text,
  add column if not exists company text,
  add column if not exists position text,
  add column if not exists industry text,
  add column if not exists website text,
  add column if not exists github text,
  add column if not exists twitter text,
  add column if not exists linkedin text,
  add column if not exists resume_url text,
  add column if not exists certificates jsonb default '[]'::jsonb;

-- Allow users to update their own profile
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Create storage buckets
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('documents', 'documents', true)
on conflict (id) do nothing;

-- Storage policies: avatars
drop policy if exists "Anyone can view avatars" on storage.objects;
create policy "Anyone can view avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "Users can upload their own avatar" on storage.objects;
create policy "Users can upload their own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
  );

drop policy if exists "Users can update their own avatar" on storage.objects;
create policy "Users can update their own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid() = owner
  );

drop policy if exists "Users can delete their own avatar" on storage.objects;
create policy "Users can delete their own avatar"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.uid() = owner
  );

-- Storage policies: documents
drop policy if exists "Anyone can view documents" on storage.objects;
create policy "Anyone can view documents"
  on storage.objects for select
  using (bucket_id = 'documents');

drop policy if exists "Users can upload their own documents" on storage.objects;
create policy "Users can upload their own documents"
  on storage.objects for insert
  with check (
    bucket_id = 'documents'
    and auth.role() = 'authenticated'
  );

drop policy if exists "Users can update their own documents" on storage.objects;
create policy "Users can update their own documents"
  on storage.objects for update
  using (
    bucket_id = 'documents'
    and auth.uid() = owner
  );

drop policy if exists "Users can delete their own documents" on storage.objects;
create policy "Users can delete their own documents"
  on storage.objects for delete
  using (
    bucket_id = 'documents'
    and auth.uid() = owner
  );
