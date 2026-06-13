alter table public.profiles
add column if not exists display_name text,
add column if not exists avatar_url text,
add column if not exists avatar_path text,
add column if not exists updated_at timestamp with time zone default now();

alter table public.profiles
drop constraint if exists profiles_role_check;

alter table public.profiles
add constraint profiles_role_check check (role in ('user', 'admin', 'tester'));

update public.profiles
set role = 'admin'
where lower(email) = 'admin@gmail.com';

-- Manual setup required before these policies are useful:
-- Supabase Dashboard -> Storage -> Create bucket
-- Name: avatars
-- Public: true

drop policy if exists "Users can upload own avatars" on storage.objects;
drop policy if exists "Users can update own avatars" on storage.objects;
drop policy if exists "Users can delete own avatars" on storage.objects;
drop policy if exists "Public can view avatars" on storage.objects;

create policy "Users can upload own avatars"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can update own avatars"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can delete own avatars"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Public can view avatars"
on storage.objects
for select
to public
using (bucket_id = 'avatars');
