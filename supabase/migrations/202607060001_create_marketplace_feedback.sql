create table if not exists public.marketplace_feedback (
  id uuid primary key default gen_random_uuid(),
  locale text,
  scenario_id text,
  clarity_response text,
  alternative_selected text,
  pattern_interest text,
  beta_email text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  constraint marketplace_feedback_scenario_check
    check (scenario_id in ('delayed_reply', 'study_pressure', 'social_comparison')),
  constraint marketplace_feedback_clarity_check
    check (clarity_response in ('yes', 'somewhat', 'no')),
  constraint marketplace_feedback_alternative_check
    check (alternative_selected in ('chatgpt', 'friend', 'notes', 'social_media', 'nothing')),
  constraint marketplace_feedback_pattern_check
    check (pattern_interest in ('yes', 'maybe', 'no'))
);

create index if not exists marketplace_feedback_created_at_idx
on public.marketplace_feedback(created_at desc);
