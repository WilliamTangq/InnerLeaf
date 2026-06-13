-- Ensure profiles table has current auth emails.
update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id
and (p.email is null or p.email <> u.email);

-- Force primary admin role for an existing admin@gmail.com auth user.
update public.profiles p
set role = 'admin',
    updated_at = now()
from auth.users u
where p.id = u.id
and lower(u.email) = 'admin@gmail.com';

-- Ensure future profiles are created with the correct role and a useful default display name.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role, display_name)
  values (
    new.id,
    new.email,
    case
      when lower(new.email) = 'admin@gmail.com' then 'admin'
      else 'user'
    end,
    coalesce(split_part(new.email, '@', 1), 'InnerLeaf user')
  )
  on conflict (id) do update
  set email = excluded.email,
      role = case
        when lower(excluded.email) = 'admin@gmail.com' then 'admin'
        else public.profiles.role
      end,
      updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Verification query:
-- select p.id, p.email, p.role, u.email as auth_email
-- from public.profiles p
-- join auth.users u on u.id = p.id
-- where lower(u.email) = 'admin@gmail.com';
