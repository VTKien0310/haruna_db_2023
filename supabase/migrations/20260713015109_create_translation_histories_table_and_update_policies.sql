drop policy "Enable insert for authenticated users only" on "public"."webpage_bookmarks";


  create table "public"."translation_histories" (
    "id" uuid not null default gen_random_uuid(),
    "owner_id" uuid not null default auth.uid(),
    "source_language" text not null,
    "target_language" text not null,
    "source_text" text not null,
    "translation" text not null,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."translation_histories" enable row level security;

CREATE UNIQUE INDEX translation_histories_pkey ON public.translation_histories USING btree (id);

alter table "public"."translation_histories" add constraint "translation_histories_pkey" PRIMARY KEY using index "translation_histories_pkey";

alter table "public"."translation_histories" add constraint "translation_histories_owner_id_fkey" FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."translation_histories" validate constraint "translation_histories_owner_id_fkey";

grant delete on table "public"."medias" to "anon";

grant insert on table "public"."medias" to "anon";

grant select on table "public"."medias" to "anon";

grant update on table "public"."medias" to "anon";

grant delete on table "public"."medias" to "authenticated";

grant insert on table "public"."medias" to "authenticated";

grant select on table "public"."medias" to "authenticated";

grant update on table "public"."medias" to "authenticated";

grant delete on table "public"."medias" to "service_role";

grant insert on table "public"."medias" to "service_role";

grant select on table "public"."medias" to "service_role";

grant update on table "public"."medias" to "service_role";

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";

grant delete on table "public"."translation_histories" to "anon";

grant insert on table "public"."translation_histories" to "anon";

grant references on table "public"."translation_histories" to "anon";

grant select on table "public"."translation_histories" to "anon";

grant trigger on table "public"."translation_histories" to "anon";

grant truncate on table "public"."translation_histories" to "anon";

grant update on table "public"."translation_histories" to "anon";

grant delete on table "public"."translation_histories" to "authenticated";

grant insert on table "public"."translation_histories" to "authenticated";

grant references on table "public"."translation_histories" to "authenticated";

grant select on table "public"."translation_histories" to "authenticated";

grant trigger on table "public"."translation_histories" to "authenticated";

grant truncate on table "public"."translation_histories" to "authenticated";

grant update on table "public"."translation_histories" to "authenticated";

grant delete on table "public"."translation_histories" to "service_role";

grant insert on table "public"."translation_histories" to "service_role";

grant references on table "public"."translation_histories" to "service_role";

grant select on table "public"."translation_histories" to "service_role";

grant trigger on table "public"."translation_histories" to "service_role";

grant truncate on table "public"."translation_histories" to "service_role";

grant update on table "public"."translation_histories" to "service_role";


  create policy "Enable delete for users based on owner_id"
  on "public"."translation_histories"
  as permissive
  for delete
  to public
using ((( SELECT auth.uid() AS uid) = owner_id));



  create policy "Enable insert for authenticated users only"
  on "public"."translation_histories"
  as permissive
  for insert
  to authenticated
with check ((( SELECT auth.uid() AS uid) = owner_id));



  create policy "Enable update for users based on owner_id"
  on "public"."translation_histories"
  as permissive
  for update
  to authenticated
using ((( SELECT auth.uid() AS uid) = owner_id))
with check ((( SELECT auth.uid() AS uid) = owner_id));



  create policy "Enable users to view their own data only"
  on "public"."translation_histories"
  as permissive
  for select
  to authenticated
using ((( SELECT auth.uid() AS uid) = owner_id));



  create policy "Enable insert for authenticated users only"
  on "public"."webpage_bookmarks"
  as permissive
  for insert
  to authenticated
with check ((( SELECT auth.uid() AS uid) = owner_id));



