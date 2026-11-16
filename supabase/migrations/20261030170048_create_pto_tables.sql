create table "public"."pto_banks" (
    "id" uuid not null default gen_random_uuid(),
    "owner_id" uuid not null default auth.uid(),
    "annual_balance" integer not null default 0,
    "extended_balance" integer not null default 0,
    "year" integer not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."pto_banks" enable row level security;

CREATE UNIQUE INDEX pto_banks_owner_id_year_key ON public.pto_banks USING btree (owner_id, year);

CREATE UNIQUE INDEX pto_banks_pkey ON public.pto_banks USING btree (id);

alter table "public"."pto_banks" add constraint "pto_banks_pkey" PRIMARY KEY using index "pto_banks_pkey";

alter table "public"."pto_banks" add constraint "pto_banks_owner_id_year_key" UNIQUE using index "pto_banks_owner_id_year_key";

alter table "public"."pto_banks" add constraint "pto_banks_annual_balance_check" CHECK ((annual_balance >= 0)) not valid;

alter table "public"."pto_banks" validate constraint "pto_banks_annual_balance_check";

alter table "public"."pto_banks" add constraint "pto_banks_extended_balance_check" CHECK ((extended_balance >= 0)) not valid;

alter table "public"."pto_banks" validate constraint "pto_banks_extended_balance_check";

alter table "public"."pto_banks" add constraint "pto_banks_year_check" CHECK ((year >= 0)) not valid;

alter table "public"."pto_banks" validate constraint "pto_banks_year_check";

alter table "public"."pto_banks" add constraint "pto_banks_owner_id_fkey" FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."pto_banks" validate constraint "pto_banks_owner_id_fkey";

create table "public"."pto_affect_entries" (
    "id" uuid not null default gen_random_uuid(),
    "entry_id" uuid,
    "entry_type" character varying,
    "no_deduction" smallint not null default 0,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."pto_affect_entries" enable row level security;

CREATE INDEX pto_affect_entries_entry_id_entry_type_idx ON public.pto_affect_entries USING btree (entry_id, entry_type);

CREATE UNIQUE INDEX pto_affect_entries_pkey ON public.pto_affect_entries USING btree (id);

alter table "public"."pto_affect_entries" add constraint "pto_affect_entries_pkey" PRIMARY KEY using index "pto_affect_entries_pkey";

alter table "public"."pto_affect_entries" add constraint "pto_affect_entries_entry_type_check" CHECK ((entry_type::text = ANY (ARRAY['check_in_entries'::character varying, 'time_off_entries'::character varying, 'leave_work_entries'::character varying, 'work_time_entries'::character varying, 'remote_work_entries'::character varying]::text[]))) not valid;

alter table "public"."pto_affect_entries" validate constraint "pto_affect_entries_entry_type_check";

alter table "public"."pto_affect_entries" add constraint "pto_affect_entries_no_deduction_check" CHECK ((no_deduction = ANY (ARRAY[0, 1]))) not valid;

alter table "public"."pto_affect_entries" validate constraint "pto_affect_entries_no_deduction_check";

create table "public"."pto_transactions" (
    "id" uuid not null default gen_random_uuid(),
    "pto_bank_id" uuid not null,
    "entry_id" uuid not null,
    "cause" character varying not null,
    "value" integer not null,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."pto_transactions" enable row level security;

CREATE INDEX pto_transactions_entry_id_idx ON public.pto_transactions USING btree (entry_id);

CREATE INDEX pto_transactions_pto_bank_id_idx ON public.pto_transactions USING btree (pto_bank_id);

CREATE UNIQUE INDEX pto_transactions_pkey ON public.pto_transactions USING btree (id);

alter table "public"."pto_transactions" add constraint "pto_transactions_pkey" PRIMARY KEY using index "pto_transactions_pkey";

alter table "public"."pto_transactions" add constraint "pto_transactions_pto_bank_id_fkey" FOREIGN KEY (pto_bank_id) REFERENCES pto_banks(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."pto_transactions" validate constraint "pto_transactions_pto_bank_id_fkey";

alter table "public"."pto_transactions" add constraint "pto_transactions_entry_id_fkey" FOREIGN KEY (entry_id) REFERENCES pto_affect_entries(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."pto_transactions" validate constraint "pto_transactions_entry_id_fkey";

create table "public"."check_in_entries" (
    "id" uuid not null default gen_random_uuid(),
    "date" date not null,
    "time" time without time zone not null
);


alter table "public"."check_in_entries" enable row level security;

CREATE UNIQUE INDEX check_in_entries_pkey ON public.check_in_entries USING btree (id);

alter table "public"."check_in_entries" add constraint "check_in_entries_pkey" PRIMARY KEY using index "check_in_entries_pkey";

create table "public"."time_off_entries" (
    "id" uuid not null default gen_random_uuid(),
    "date" date not null,
    "type" smallint not null
);


alter table "public"."time_off_entries" enable row level security;

CREATE UNIQUE INDEX time_off_entries_pkey ON public.time_off_entries USING btree (id);

alter table "public"."time_off_entries" add constraint "time_off_entries_pkey" PRIMARY KEY using index "time_off_entries_pkey";

alter table "public"."time_off_entries" add constraint "time_off_entries_type_check" CHECK ((type = ANY (ARRAY[0, 1, 2]))) not valid;

alter table "public"."time_off_entries" validate constraint "time_off_entries_type_check";

create table "public"."leave_work_entries" (
    "id" uuid not null default gen_random_uuid(),
    "date" date not null,
    "start" time without time zone not null,
    "end" time without time zone not null
);


alter table "public"."leave_work_entries" enable row level security;

CREATE UNIQUE INDEX leave_work_entries_pkey ON public.leave_work_entries USING btree (id);

alter table "public"."leave_work_entries" add constraint "leave_work_entries_pkey" PRIMARY KEY using index "leave_work_entries_pkey";

create table "public"."work_time_entries" (
    "id" uuid not null default gen_random_uuid(),
    "date" date not null,
    "type" smallint not null
);


alter table "public"."work_time_entries" enable row level security;

CREATE UNIQUE INDEX work_time_entries_pkey ON public.work_time_entries USING btree (id);

alter table "public"."work_time_entries" add constraint "work_time_entries_pkey" PRIMARY KEY using index "work_time_entries_pkey";

alter table "public"."work_time_entries" add constraint "work_time_entries_type_check" CHECK ((type = ANY (ARRAY[0, 1]))) not valid;

alter table "public"."work_time_entries" validate constraint "work_time_entries_type_check";

create table "public"."remote_work_entries" (
    "id" uuid not null default gen_random_uuid(),
    "date" date not null,
    "type" smallint not null
);


alter table "public"."remote_work_entries" enable row level security;

CREATE UNIQUE INDEX remote_work_entries_pkey ON public.remote_work_entries USING btree (id);

alter table "public"."remote_work_entries" add constraint "remote_work_entries_pkey" PRIMARY KEY using index "remote_work_entries_pkey";

alter table "public"."remote_work_entries" add constraint "remote_work_entries_type_check" CHECK ((type = ANY (ARRAY[0, 1, 2]))) not valid;

alter table "public"."remote_work_entries" validate constraint "remote_work_entries_type_check";

create table "public"."workday_exceptions" (
    "id" uuid not null default gen_random_uuid(),
    "type" smallint not null,
    "date" date not null,
    "time" smallint not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."workday_exceptions" enable row level security;

CREATE UNIQUE INDEX workday_exceptions_pkey ON public.workday_exceptions USING btree (id);

alter table "public"."workday_exceptions" add constraint "workday_exceptions_pkey" PRIMARY KEY using index "workday_exceptions_pkey";

alter table "public"."workday_exceptions" add constraint "workday_exceptions_type_check" CHECK ((type = ANY (ARRAY[0, 1]))) not valid;

alter table "public"."workday_exceptions" validate constraint "workday_exceptions_type_check";

alter table "public"."workday_exceptions" add constraint "workday_exceptions_time_check" CHECK (("time" = ANY (ARRAY[0, 1, 2]))) not valid;

alter table "public"."workday_exceptions" validate constraint "workday_exceptions_time_check";

revoke all on table "public"."pto_banks" from "anon";

revoke all on table "public"."pto_banks" from "authenticated";

revoke all on table "public"."pto_affect_entries" from "anon";

revoke all on table "public"."pto_affect_entries" from "authenticated";

revoke all on table "public"."pto_transactions" from "anon";

revoke all on table "public"."pto_transactions" from "authenticated";

revoke all on table "public"."check_in_entries" from "anon";

revoke all on table "public"."check_in_entries" from "authenticated";

revoke all on table "public"."time_off_entries" from "anon";

revoke all on table "public"."time_off_entries" from "authenticated";

revoke all on table "public"."leave_work_entries" from "anon";

revoke all on table "public"."leave_work_entries" from "authenticated";

revoke all on table "public"."work_time_entries" from "anon";

revoke all on table "public"."work_time_entries" from "authenticated";

revoke all on table "public"."remote_work_entries" from "anon";

revoke all on table "public"."remote_work_entries" from "authenticated";

revoke all on table "public"."workday_exceptions" from "anon";

revoke all on table "public"."workday_exceptions" from "authenticated";

grant select on table "public"."pto_banks" to "authenticated";

grant select on table "public"."pto_affect_entries" to "authenticated";

grant select on table "public"."pto_transactions" to "authenticated";

grant select on table "public"."check_in_entries" to "authenticated";

grant select on table "public"."time_off_entries" to "authenticated";

grant select on table "public"."leave_work_entries" to "authenticated";

grant select on table "public"."work_time_entries" to "authenticated";

grant select on table "public"."remote_work_entries" to "authenticated";

grant select on table "public"."workday_exceptions" to "authenticated";

grant all on table "public"."pto_banks" to "service_role";

grant all on table "public"."pto_affect_entries" to "service_role";

grant all on table "public"."pto_transactions" to "service_role";

grant all on table "public"."check_in_entries" to "service_role";

grant all on table "public"."time_off_entries" to "service_role";

grant all on table "public"."leave_work_entries" to "service_role";

grant all on table "public"."work_time_entries" to "service_role";

grant all on table "public"."remote_work_entries" to "service_role";

grant all on table "public"."workday_exceptions" to "service_role";

create policy "Enable users to view their own data only"
on "public"."pto_banks"
as permissive
for select
to authenticated
using ((( SELECT auth.uid() AS uid) = owner_id));


create policy "Enable users to view their own data only"
on "public"."pto_transactions"
as permissive
for select
to authenticated
using ((EXISTS ( SELECT 1
   FROM pto_banks
  WHERE ((pto_banks.id = pto_transactions.pto_bank_id) AND (pto_banks.owner_id = ( SELECT auth.uid() AS uid))))));


create policy "Enable users to view their own data only"
on "public"."pto_affect_entries"
as permissive
for select
to authenticated
using ((EXISTS ( SELECT 1
   FROM (pto_transactions
     JOIN pto_banks ON ((pto_banks.id = pto_transactions.pto_bank_id)))
  WHERE ((pto_transactions.entry_id = pto_affect_entries.id) AND (pto_banks.owner_id = ( SELECT auth.uid() AS uid))))));


create policy "Enable users to view their own data only"
on "public"."check_in_entries"
as permissive
for select
to authenticated
using ((EXISTS ( SELECT 1
   FROM ((pto_affect_entries
     JOIN pto_transactions ON ((pto_transactions.entry_id = pto_affect_entries.id)))
     JOIN pto_banks ON ((pto_banks.id = pto_transactions.pto_bank_id)))
  WHERE ((pto_affect_entries.entry_id = check_in_entries.id) AND (pto_affect_entries.entry_type = 'check_in_entries'::character varying) AND (pto_banks.owner_id = ( SELECT auth.uid() AS uid))))));


create policy "Enable users to view their own data only"
on "public"."time_off_entries"
as permissive
for select
to authenticated
using ((EXISTS ( SELECT 1
   FROM ((pto_affect_entries
     JOIN pto_transactions ON ((pto_transactions.entry_id = pto_affect_entries.id)))
     JOIN pto_banks ON ((pto_banks.id = pto_transactions.pto_bank_id)))
  WHERE ((pto_affect_entries.entry_id = time_off_entries.id) AND (pto_affect_entries.entry_type = 'time_off_entries'::character varying) AND (pto_banks.owner_id = ( SELECT auth.uid() AS uid))))));


create policy "Enable users to view their own data only"
on "public"."leave_work_entries"
as permissive
for select
to authenticated
using ((EXISTS ( SELECT 1
   FROM ((pto_affect_entries
     JOIN pto_transactions ON ((pto_transactions.entry_id = pto_affect_entries.id)))
     JOIN pto_banks ON ((pto_banks.id = pto_transactions.pto_bank_id)))
  WHERE ((pto_affect_entries.entry_id = leave_work_entries.id) AND (pto_affect_entries.entry_type = 'leave_work_entries'::character varying) AND (pto_banks.owner_id = ( SELECT auth.uid() AS uid))))));


create policy "Enable users to view their own data only"
on "public"."work_time_entries"
as permissive
for select
to authenticated
using ((EXISTS ( SELECT 1
   FROM ((pto_affect_entries
     JOIN pto_transactions ON ((pto_transactions.entry_id = pto_affect_entries.id)))
     JOIN pto_banks ON ((pto_banks.id = pto_transactions.pto_bank_id)))
  WHERE ((pto_affect_entries.entry_id = work_time_entries.id) AND (pto_affect_entries.entry_type = 'work_time_entries'::character varying) AND (pto_banks.owner_id = ( SELECT auth.uid() AS uid))))));


create policy "Enable users to view their own data only"
on "public"."remote_work_entries"
as permissive
for select
to authenticated
using ((EXISTS ( SELECT 1
   FROM ((pto_affect_entries
     JOIN pto_transactions ON ((pto_transactions.entry_id = pto_affect_entries.id)))
     JOIN pto_banks ON ((pto_banks.id = pto_transactions.pto_bank_id)))
  WHERE ((pto_affect_entries.entry_id = remote_work_entries.id) AND (pto_affect_entries.entry_type = 'remote_work_entries'::character varying) AND (pto_banks.owner_id = ( SELECT auth.uid() AS uid))))));


create policy "Enable read access for all authenticated users"
on "public"."workday_exceptions"
as permissive
for select
to authenticated
using (true);


CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.pto_banks FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime('updated_at');

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.pto_affect_entries FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime('updated_at');

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.workday_exceptions FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime('updated_at');
