create table if not exists case_notes (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references cases(id) on delete cascade,
  note_text text not null,
  created_at timestamp default now()
);