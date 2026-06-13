create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null default 'user',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  constraint profiles_role_check check (role in ('user', 'admin', 'tester'))
);

alter table public.profiles enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Admins can view profiles" on public.profiles;

create policy "Users can view own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

create policy "Admins can view profiles"
on public.profiles
for select
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
    and p.role = 'admin'
  )
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (
    new.id,
    new.email,
    case
      when lower(new.email) = 'admin@gmail.com' then 'admin'
      else 'user'
    end
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.prevent_admin_profile_delete()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.role = 'admin' or lower(old.email) = 'admin@gmail.com' then
    raise exception 'Admin profile cannot be deleted';
  end if;
  return old;
end;
$$;

drop trigger if exists prevent_admin_profile_delete_trigger on public.profiles;

create trigger prevent_admin_profile_delete_trigger
before delete on public.profiles
for each row execute function public.prevent_admin_profile_delete();
