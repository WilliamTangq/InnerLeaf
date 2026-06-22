alter table reflections
add column if not exists reflection_language text,
add column if not exists ui_language text,
add column if not exists short_title text,
add column if not exists mood_chip text,
add column if not exists normalized_trigger text,
add column if not exists normalized_thought_pattern text,
add column if not exists normalized_next_step_type text,
add column if not exists normalized_check_in_signal text;

create index if not exists reflections_user_normalized_trigger_idx
on reflections(user_id, normalized_trigger);

create index if not exists reflections_user_normalized_thought_pattern_idx
on reflections(user_id, normalized_thought_pattern);

create index if not exists reflections_user_normalized_next_step_type_idx
on reflections(user_id, normalized_next_step_type);
