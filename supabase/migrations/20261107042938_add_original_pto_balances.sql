alter table "public"."pto_banks"
    add column "original_annual_balance" integer default 0,
    add column "original_extended_balance" integer default 0,
    add column "original_seniority_balance" integer default 0;
