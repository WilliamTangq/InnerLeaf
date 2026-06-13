alter table public.profiles
add column if not exists display_name text,
add column if not exists avatar_url text,
add column if not exists updated_at timestamp with time zone default now();

alter table feedback
add column if not exists user_id uuid references auth.users(id) on delete set null;

drop policy if exists "Users can update own profile basics" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;

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
