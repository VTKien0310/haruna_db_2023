create policy "Enable delete for users based on uploader_id"
on "public"."medias"
as permissive
for delete
to authenticated
using ((auth.uid() = uploader_id));


create policy "Enable read access for all authenticated users"
on "public"."medias"
as permissive
for select
to authenticated
using (true);


create policy "Enable insert for users based on uploader_id"
on "public"."medias"
as permissive
for insert
to authenticated
with check (auth.uid() = uploader_id);
