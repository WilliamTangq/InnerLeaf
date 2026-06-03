create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  mode_tried text,
  ease_of_start text,
  reflection_length text,
  clarity_help text,
  would_use_again text,
  comparison_feedback text,
  blocker text,
  other_thoughts text,
  created_at timestamp with time zone default now()
);
