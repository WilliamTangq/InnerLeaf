alter table public.reflections
  add column if not exists emotional_validation text,
  add column if not exists emotion text,
  add column if not exists trigger text,
  add column if not exists facts text,
  add column if not exists interpretation text,
  add column if not exists thought_pattern text,
  add column if not exists behaviour text,
  add column if not exists behavioural_insight text,
  add column if not exists next_question text,
  add column if not exists mode text;
