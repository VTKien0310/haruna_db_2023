alter table public.work_time_entries
    add column duration integer not null default 0,
    add column "time" smallint not null default 0,
    add constraint work_time_entries_duration_check check (duration >= 0),
    add constraint work_time_entries_time_check check ("time" in (0, 1));

comment on column public.work_time_entries.duration is 'Nonnegative drift from normal working time in minutes.';
comment on column public.work_time_entries.type is 'Drift direction: 0 = late, 1 = early.';
comment on column public.work_time_entries."time" is 'Shift: 0 = morning, 1 = afternoon.';
