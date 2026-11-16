begin;

alter table public.pto_affect_entries add column owner_id uuid;

-- Keep ownership stable between validation and backfill.
lock table public.pto_transactions, public.pto_banks in share mode;

do $$
begin
    if exists (
        select entries.id
        from public.pto_affect_entries as entries
        left join public.pto_transactions as transactions on transactions.entry_id = entries.id
        left join public.pto_banks as banks on banks.id = transactions.pto_bank_id
        group by entries.id
        having count(distinct banks.owner_id) <> 1
    ) then
        raise exception 'Cannot backfill pto_affect_entries.owner_id: each entry must have exactly one distinct owner through PTO transactions and banks';
    end if;
end;
$$;

update public.pto_affect_entries as entries
set owner_id = banks.owner_id
from public.pto_transactions as transactions
join public.pto_banks as banks on banks.id = transactions.pto_bank_id
where transactions.entry_id = entries.id;

alter table public.pto_affect_entries
    alter column owner_id set not null,
    alter column owner_id set default auth.uid();

alter table public.pto_affect_entries
    add constraint pto_affect_entries_owner_id_fkey
    foreign key (owner_id) references auth.users(id) on update cascade on delete cascade;

create index pto_affect_entries_owner_id_idx on public.pto_affect_entries using btree (owner_id);

alter policy "Enable users to view their own data only"
on public.pto_affect_entries
to authenticated
using (owner_id = (select auth.uid()));

alter policy "Enable users to view their own data only"
on public.check_in_entries
to authenticated
using (exists (
    select 1
    from public.pto_affect_entries as entries
    where entries.entry_id = check_in_entries.id
        and entries.entry_type = 'check_in_entries'
        and entries.owner_id = (select auth.uid())
));

alter policy "Enable users to view their own data only"
on public.time_off_entries
to authenticated
using (exists (
    select 1
    from public.pto_affect_entries as entries
    where entries.entry_id = time_off_entries.id
        and entries.entry_type = 'time_off_entries'
        and entries.owner_id = (select auth.uid())
));

alter policy "Enable users to view their own data only"
on public.leave_work_entries
to authenticated
using (exists (
    select 1
    from public.pto_affect_entries as entries
    where entries.entry_id = leave_work_entries.id
        and entries.entry_type = 'leave_work_entries'
        and entries.owner_id = (select auth.uid())
));

alter policy "Enable users to view their own data only"
on public.work_time_entries
to authenticated
using (exists (
    select 1
    from public.pto_affect_entries as entries
    where entries.entry_id = work_time_entries.id
        and entries.entry_type = 'work_time_entries'
        and entries.owner_id = (select auth.uid())
));

alter policy "Enable users to view their own data only"
on public.remote_work_entries
to authenticated
using (exists (
    select 1
    from public.pto_affect_entries as entries
    where entries.entry_id = remote_work_entries.id
        and entries.entry_type = 'remote_work_entries'
        and entries.owner_id = (select auth.uid())
));

commit;
