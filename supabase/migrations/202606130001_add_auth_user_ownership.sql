alter table reflections
add column if not exists user_id uuid references auth.users(id) on delete cascade;

create index if not exists reflections_user_id_idx on reflections(user_id);

alter table feedback
add column if not exists user_id uuid references auth.users(id) on delete set null;

alter table reflections enable row level security;

drop policy if exists "Users can insert own reflections" on reflections;
drop policy if exists "Users can view own reflections" on reflections;
drop policy if exists "Users can update own reflections" on reflections;

create policy "Users can insert own reflections"
on reflections
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can view own reflections"
on reflections
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can update own reflections"
on reflections
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
