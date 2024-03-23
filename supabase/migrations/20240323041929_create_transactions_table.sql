create table "public"."transactions"
(
    "id"         uuid                     not null default gen_random_uuid(),
    "user_id"    uuid                              default auth.uid(),
    "name"       text                     not null,
    "amount"     bigint                   not null,
    "created_at" timestamp with time zone not null default (now() AT TIME ZONE 'utc'::text),
    "updated_at" timestamp with time zone not null default (now() AT TIME ZONE 'utc'::text)
);


alter table "public"."transactions"
    enable row level security;

CREATE UNIQUE INDEX transactions_pkey ON public.transactions USING btree (id);

alter table "public"."transactions"
    add constraint "transactions_pkey" PRIMARY KEY using index "transactions_pkey";

alter table "public"."transactions"
    add constraint "public_transactions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users (id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."transactions"
    validate constraint "public_transactions_user_id_fkey";

create policy "Enable delete for users based on user_id"
    on "public"."transactions"
    as permissive
    for delete
    to authenticated
    using ((auth.uid() = user_id));


create policy "Enable insert for authenticated users only"
    on "public"."transactions"
    as permissive
    for insert
    to authenticated
    with check (true);


create policy "Enable read for authenticated users only"
    on "public"."transactions"
    as permissive
    for select
    to authenticated
    using (true);


create policy "Enable update for users based on user_id"
    on "public"."transactions"
    as permissive
    for update
    to authenticated
    using ((auth.uid() = user_id));


CREATE TRIGGER handle_updated_at
    BEFORE UPDATE
    ON public.transactions
    FOR EACH ROW
EXECUTE FUNCTION moddatetime('updated_at');


