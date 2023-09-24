create table "public"."profiles" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "name" character varying,
    "current_balance" bigint not null default '0'::bigint,
    "created_at" timestamp with time zone not null default (now() AT TIME ZONE 'utc'::text),
    "updated_at" timestamp with time zone not null default (now() AT TIME ZONE 'utc'::text)
);


alter table "public"."profiles" enable row level security;

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

CREATE UNIQUE INDEX profiles_user_id_key ON public.profiles USING btree (user_id);

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."profiles" add constraint "profiles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."profiles" validate constraint "profiles_user_id_fkey";

alter table "public"."profiles" add constraint "profiles_user_id_key" UNIQUE using index "profiles_user_id_key";

create policy "Enable read access for all authenticated users"
on "public"."profiles"
as permissive
for select
to authenticated
using (true);


create policy "Enable update for users based on user_id"
on "public"."profiles"
as permissive
for update
to authenticated
using ((auth.uid() = user_id));



