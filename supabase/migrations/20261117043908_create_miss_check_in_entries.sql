begin;

create table public.miss_check_in_entries (
    id uuid primary key default gen_random_uuid(),
    date date not null,
    penalty integer not null,
    constraint miss_check_in_entries_penalty_check check (penalty >= 0)
);

alter table public.miss_check_in_entries enable row level security;

alter table public.pto_affect_entries
    drop constraint pto_affect_entries_entry_type_check,
    add constraint pto_affect_entries_entry_type_check check (entry_type in (
        'check_in_entries',
        'time_off_entries',
        'leave_work_entries',
        'work_time_entries',
        'remote_work_entries',
        'miss_check_in_entries'
    ));

revoke all on table public.miss_check_in_entries from anon, authenticated;
grant select on table public.miss_check_in_entries to authenticated;
grant all on table public.miss_check_in_entries to service_role;

create policy "Enable users to view their own data only"
on public.miss_check_in_entries
for select
to authenticated
using (exists (
    select 1
    from public.pto_affect_entries as entries
    where entries.entry_id = miss_check_in_entries.id
        and entries.entry_type = 'miss_check_in_entries'
        and entries.owner_id = (select auth.uid())
));

commit;
