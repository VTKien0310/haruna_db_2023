alter table public.pto_affect_entries
  add column title text not null default 'Untitled';

alter table public.workday_exceptions
  add column title text not null default 'Untitled';
