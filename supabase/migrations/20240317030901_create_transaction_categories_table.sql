create table "public"."transaction_categories"
(
    "id"         uuid                     not null default gen_random_uuid(),
    "user_id"    uuid,
    "name"       text                     not null,
    "created_at" timestamp with time zone not null default (now() AT TIME ZONE 'utc'::text),
    "updated_at" timestamp with time zone not null default (now() AT TIME ZONE 'utc'::text)
);


alter table "public"."transaction_categories"
    enable row level security;

CREATE UNIQUE INDEX transaction_categories_pkey ON public.transaction_categories USING btree (id);

alter table "public"."transaction_categories"
    add constraint "transaction_categories_pkey" PRIMARY KEY using index "transaction_categories_pkey";

alter table "public"."transaction_categories"
    add constraint "public_transaction_categories_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users (id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."transaction_categories"
    validate constraint "public_transaction_categories_user_id_fkey";

create policy "Enable delete for users based on user_id"
    on "public"."transaction_categories"
    as permissive
    for delete
    to authenticated
    using ((auth.uid() = user_id));


create policy "Enable insert for authenticated users only"
    on "public"."transaction_categories"
    as permissive
    for insert
    to authenticated
    with check (true);


create policy "Enable read for authenticated users only"
    on "public"."transaction_categories"
    as permissive
    for select
    to authenticated
    using (true);


create policy "Enable update for users based on user_id"
    on "public"."transaction_categories"
    as permissive
    for update
    to authenticated
    using ((auth.uid() = user_id));

CREATE TRIGGER handle_updated_at
    BEFORE UPDATE
    ON public.transaction_categories
    FOR EACH ROW
EXECUTE FUNCTION moddatetime('updated_at');