alter table reflections
add column if not exists scenario_category text,
add column if not exists primary_demon text,
add column if not exists unmet_need text,
add column if not exists observe_next text;

create index if not exists reflections_user_primary_demon_idx
on reflections(user_id, primary_demon);

create index if not exists reflections_user_unmet_need_idx
on reflections(user_id, unmet_need);
