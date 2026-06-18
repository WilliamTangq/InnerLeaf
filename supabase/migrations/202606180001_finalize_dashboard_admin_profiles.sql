alter table public.profiles
add column if not exists display_name text,
add column if not exists avatar_url text,
add column if not exists avatar_path text,
add column if not exists updated_at timestamp with time zone default now();

alter table public.profiles
drop constraint if exists profiles_role_check;

alter table public.profiles
add constraint profiles_role_check check (role in ('user', 'admin', 'tester'));

update public.profiles p
set email = u.email,
    updated_at = now()
from auth.users u
where p.id = u.id
  and (p.email is null or p.email <> u.email);

update public.profiles p
set role = 'admin',
    email = u.email,
    updated_at = now()
from auth.users u
where p.id = u.id
  and lower(u.email) = 'admin@gmail.com';

