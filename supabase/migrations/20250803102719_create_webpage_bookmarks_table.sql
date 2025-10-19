drop policy "Enable delete for users based on uploader_id" on "public"."medias";

drop policy "Enable insert for users based on uploader_id" on "public"."medias";

drop policy "Enable update for users based on user_id" on "public"."profiles";

create table "public"."webpage_bookmarks" (
    "id" uuid not null default gen_random_uuid(),
    "owner_id" uuid default auth.uid(),
    "url" text not null,
    "name" text not null,
    "description" text not null,
    "created_at" timestamp with time zone not null default (now() AT TIME ZONE 'utc'::text),
    "updated_at" timestamp with time zone not null default (now() AT TIME ZONE 'utc'::text),
    "root_id" uuid,
    "parent_id" uuid,
    "level" smallint not null,
    "type" smallint not null
);


alter table "public"."webpage_bookmarks" enable row level security;

CREATE UNIQUE INDEX webpage_bookmarks_pkey ON public.webpage_bookmarks USING btree (id);

alter table "public"."webpage_bookmarks" add constraint "webpage_bookmarks_pkey" PRIMARY KEY using index "webpage_bookmarks_pkey";

alter table "public"."webpage_bookmarks" add constraint "webpage_bookmarks_owner_id_fkey" FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."webpage_bookmarks" validate constraint "webpage_bookmarks_owner_id_fkey";

alter table "public"."webpage_bookmarks" add constraint "webpage_bookmarks_parent_id_fkey" FOREIGN KEY (parent_id) REFERENCES webpage_bookmarks(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."webpage_bookmarks" validate constraint "webpage_bookmarks_parent_id_fkey";

alter table "public"."webpage_bookmarks" add constraint "webpage_bookmarks_root_id_fkey" FOREIGN KEY (root_id) REFERENCES webpage_bookmarks(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."webpage_bookmarks" validate constraint "webpage_bookmarks_root_id_fkey";

grant delete on table "public"."webpage_bookmarks" to "anon";

grant insert on table "public"."webpage_bookmarks" to "anon";

grant references on table "public"."webpage_bookmarks" to "anon";

grant select on table "public"."webpage_bookmarks" to "anon";

grant trigger on table "public"."webpage_bookmarks" to "anon";

grant truncate on table "public"."webpage_bookmarks" to "anon";

grant update on table "public"."webpage_bookmarks" to "anon";

grant delete on table "public"."webpage_bookmarks" to "authenticated";

grant insert on table "public"."webpage_bookmarks" to "authenticated";

grant references on table "public"."webpage_bookmarks" to "authenticated";

grant select on table "public"."webpage_bookmarks" to "authenticated";

grant trigger on table "public"."webpage_bookmarks" to "authenticated";

grant truncate on table "public"."webpage_bookmarks" to "authenticated";

grant update on table "public"."webpage_bookmarks" to "authenticated";

grant delete on table "public"."webpage_bookmarks" to "service_role";

grant insert on table "public"."webpage_bookmarks" to "service_role";

grant references on table "public"."webpage_bookmarks" to "service_role";

grant select on table "public"."webpage_bookmarks" to "service_role";

grant trigger on table "public"."webpage_bookmarks" to "service_role";

grant truncate on table "public"."webpage_bookmarks" to "service_role";

grant update on table "public"."webpage_bookmarks" to "service_role";

create policy "Enable delete for users based on owner_id"
on "public"."webpage_bookmarks"
as permissive
for delete
to authenticated
using ((( SELECT auth.uid() AS uid) = owner_id));


create policy "Enable insert for authenticated users only"
on "public"."webpage_bookmarks"
as permissive
for insert
to authenticated
with check (true);


create policy "Enable update for users based on owner_id"
on "public"."webpage_bookmarks"
as permissive
for update
to authenticated
using ((( SELECT auth.uid() AS uid) = owner_id))
with check ((( SELECT auth.uid() AS uid) = owner_id));


create policy "Enable users to view their own data only"
on "public"."webpage_bookmarks"
as permissive
for select
to authenticated
using ((( SELECT auth.uid() AS uid) = owner_id));


create policy "Enable delete for users based on uploader_id"
on "public"."medias"
as permissive
for delete
to authenticated
using ((( SELECT auth.uid() AS uid) = uploader_id));


create policy "Enable insert for users based on uploader_id"
on "public"."medias"
as permissive
for insert
to authenticated
with check ((( SELECT auth.uid() AS uid) = uploader_id));


create policy "Enable update for users based on user_id"
on "public"."profiles"
as permissive
for update
to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));


CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.webpage_bookmarks FOR EACH ROW EXECUTE FUNCTION moddatetime('updated_at');


