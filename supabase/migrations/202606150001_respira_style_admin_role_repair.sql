update public.profiles p
set role = 'admin',
    email = u.email,
    updated_at = now()
from auth.users u
where p.id = u.id
  and lower(u.email) = 'admin@gmail.com';
