alter table reflections
add column if not exists next_step text,
add column if not exists next_step_type text,
add column if not exists follow_up_result text,
add column if not exists follow_up_note text,
add column if not exists follow_up_at timestamp with time zone;
