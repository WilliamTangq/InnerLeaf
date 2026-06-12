alter table feedback
add column if not exists alternative_tool text,
add column if not exists saving_blocker text;
