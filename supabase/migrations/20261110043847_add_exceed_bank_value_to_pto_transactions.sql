alter table public.pto_transactions
  add column exceed_bank_value integer not null default 0,
  add constraint pto_transactions_exceed_bank_value_check check (exceed_bank_value >= 0);
