-- profiles: drop unused column, add biographical dates
alter table "public"."profiles" drop column "current_balance";

alter table "public"."profiles"
    add column "birth_date" date not null default now();

alter table "public"."profiles"
    add column "work_start_date" date not null default now();

-- pto_banks: add seniority balance mirroring annual/extended
alter table "public"."pto_banks"
    add column "seniority_balance" integer not null default 0;

alter table "public"."pto_banks"
    add constraint "pto_banks_seniority_balance_check"
    CHECK ((seniority_balance >= 0)) not valid;

alter table "public"."pto_banks"
    validate constraint "pto_banks_seniority_balance_check";
