drop
policy if exists "Medias authenticated select" on storage.objects;
create
policy "Medias authenticated select"
on storage.objects
as permissive
for
select
    to authenticated
    using (bucket_id = 'medias');

drop
policy if exists "Medias authenticated insert" on storage.objects;
create
policy "Medias authenticated insert"
on storage.objects
as permissive
for insert
to authenticated
with check (bucket_id = 'medias');

drop
policy if exists "Medias authenticated update" on storage.objects;
create
policy "Medias authenticated update"
on storage.objects
as permissive
for
update
    to authenticated
    using (bucket_id = 'medias')
with check (bucket_id = 'medias');

drop
policy if exists "Medias authenticated delete" on storage.objects;
create
policy "Medias authenticated delete"
on storage.objects
as permissive
for delete
to authenticated
using (bucket_id = 'medias');


drop
policy if exists "Thumbnails authenticated select" on storage.objects;
create
policy "Thumbnails authenticated select"
on storage.objects
as permissive
for
select
    to authenticated
    using (bucket_id = 'thumbnails');

drop
policy if exists "Thumbnails authenticated insert" on storage.objects;
create
policy "Thumbnails authenticated insert"
on storage.objects
as permissive
for insert
to authenticated
with check (bucket_id = 'thumbnails');

drop
policy if exists "Thumbnails authenticated update" on storage.objects;
create
policy "Thumbnails authenticated update"
on storage.objects
as permissive
for
update
    to authenticated
    using (bucket_id = 'thumbnails')
with check (bucket_id = 'thumbnails');

drop
policy if exists "Thumbnails authenticated delete" on storage.objects;
create
policy "Thumbnails authenticated delete"
on storage.objects
as permissive
for delete
to authenticated
using (bucket_id = 'thumbnails');


drop
policy if exists "Resized authenticated select" on storage.objects;
create
policy "Resized authenticated select"
on storage.objects
as permissive
for
select
    to authenticated
    using (bucket_id = 'resized');

drop
policy if exists "Resized authenticated insert" on storage.objects;
create
policy "Resized authenticated insert"
on storage.objects
as permissive
for insert
to authenticated
with check (bucket_id = 'resized');

drop
policy if exists "Resized authenticated update" on storage.objects;
create
policy "Resized authenticated update"
on storage.objects
as permissive
for
update
    to authenticated
    using (bucket_id = 'resized')
with check (bucket_id = 'resized');

drop
policy if exists "Resized authenticated delete" on storage.objects;
create
policy "Resized authenticated delete"
on storage.objects
as permissive
for delete
to authenticated
using (bucket_id = 'resized');


drop
policy if exists "Arcana vault service role select" on storage.objects;
create
policy "Arcana vault service role select"
on storage.objects
as permissive
for
select
    to service_role
    using (bucket_id = 'arcana-vault');

drop
policy if exists "Arcana vault service role insert" on storage.objects;
create
policy "Arcana vault service role insert"
on storage.objects
as permissive
for insert
to service_role
with check (bucket_id = 'arcana-vault');

drop
policy if exists "Arcana vault service role update" on storage.objects;
create
policy "Arcana vault service role update"
on storage.objects
as permissive
for
update
    to service_role
    using (bucket_id = 'arcana-vault')
with check (bucket_id = 'arcana-vault');

drop
policy if exists "Arcana vault service role delete" on storage.objects;
create
policy "Arcana vault service role delete"
on storage.objects
as permissive
for delete
to service_role
using (bucket_id = 'arcana-vault');
