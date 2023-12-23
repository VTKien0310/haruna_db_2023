create table "public"."medias" (
    "id" uuid not null default gen_random_uuid(),
    "uploader_id" uuid,
    "name" text not null,
    "mime" character varying not null,
    "size" bigint not null,
    "type" smallint not null,
    "storage_path" text not null,
    "created_at" timestamp with time zone not null default (now() AT TIME ZONE 'utc'::text),
    "updated_at" timestamp with time zone not null default (now() AT TIME ZONE 'utc'::text)
);


alter table "public"."medias" enable row level security;

CREATE UNIQUE INDEX medias_id_key ON public.medias USING btree (id);

CREATE UNIQUE INDEX medias_pkey ON public.medias USING btree (id);

alter table "public"."medias" add constraint "medias_pkey" PRIMARY KEY using index "medias_pkey";

alter table "public"."medias" add constraint "medias_id_key" UNIQUE using index "medias_id_key";

alter table "public"."medias" add constraint "medias_uploader_id_fkey" FOREIGN KEY (uploader_id) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."medias" validate constraint "medias_uploader_id_fkey";


