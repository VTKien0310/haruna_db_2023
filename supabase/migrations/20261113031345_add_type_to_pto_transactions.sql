alter table public.pto_transactions
  add column type smallint not null default 0,
  add constraint pto_transactions_type_check check (type in (0, 1));
