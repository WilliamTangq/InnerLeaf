alter table public.reflections
  add column if not exists emotion text,
  add column if not exists trigger text,
  add column if not exists thought_pattern text,
  add column if not exists facts text,
  add column if not exists interpretation text,
  add column if not exists behaviour text,
  add column if not exists next_question text;
