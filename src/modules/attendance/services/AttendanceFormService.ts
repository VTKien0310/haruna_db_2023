import {
  type Row,
  WorkdayExceptionTime,
  WorkdayExceptionType,
} from "../AttendanceEntities";
import dayjs from "dayjs";

import {
  type AttendanceEntry,
  type AttendanceFormData,
  type WorkdayExceptionFormData,
  ATTENDANCE_ZONE,
  ENDPOINTS,
} from "../AttendanceTypes";
import { AttendancePresentationService } from "./AttendancePresentationService";
import { t } from "../locales";
export class AttendanceFormService {
  constructor(private readonly presentation: AttendancePresentationService) {}
  empty(): AttendanceFormData {
    return {
      kind: "check_in_entries",
      date: this.presentation.now().format("YYYY-MM-DD"),
      endDate: "",
      period: "0",
      shift: "0",
      direction: "0",
      clock: "08:00",
      endClock: "09:00",
      title: "",
      note: "",
      exempt: false,
    };
  }
  editable(entry: AttendanceEntry) {
    return Boolean(
      entry.fact &&
      entry.entry_id &&
      ENDPOINTS[entry.entry_type as keyof typeof ENDPOINTS] &&
      entry.fact.date.slice(0, 4) === this.presentation.now().format("YYYY"),
    );
  }
  fromEntry(entry: AttendanceEntry): AttendanceFormData {
    const f = this.empty();
    const fact = entry.fact;
    if (!fact) return f;
    f.kind = entry.entry_type as AttendanceFormData["kind"];
    f.date = fact.date;
    f.title = entry.title;
    f.note = entry.note;
    f.exempt = entry.no_deduction === 1;
    if (f.kind === "work_time_entries") {
      f.shift = String(fact.time);
      f.direction = String(fact.type);
      const start = fact.time === 0 ? 480 : 810;
      const mins =
        fact.type === 0
          ? start + (fact.duration ?? 0)
          : start + 240 - (fact.duration ?? 0);
      f.clock = `${Math.floor(mins / 60)
        .toString()
        .padStart(2, "0")}:${(mins % 60).toString().padStart(2, "0")}`;
    } else if (f.kind === "check_in_entries")
      f.clock = String(fact.time).slice(0, 5);
    else if (f.kind === "leave_work_entries") {
      f.clock = fact.start!.slice(0, 5);
      f.endClock = fact.end!.slice(0, 5);
    } else f.period = String(fact.type);
    return f;
  }
  validDate(value: string) {
    return (
      /^\d{4}-\d{2}-\d{2}$/.test(value) &&
      dayjs.utc(value).isValid() &&
      dayjs.utc(value).format("YYYY-MM-DD") === value
    );
  }
  dateBoundary(date: string, next = false) {
    return dayjs
      .tz(
        `${dayjs
          .utc(date)
          .add(next ? 1 : 0, "day")
          .format("YYYY-MM-DD")}T00:00:00`,
        ATTENDANCE_ZONE,
      )
      .toISOString();
  }
  validate(f: AttendanceFormData, entry?: AttendanceEntry): string {
    if (!ENDPOINTS[f.kind] || !this.validDate(f.date)) return t("dateInvalid");
    if (
      entry &&
      (!this.editable(entry) ||
        entry.entry_type !== f.kind ||
        f.date.slice(0, 4) !== entry.fact?.date.slice(0, 4))
    )
      return t("readOnly");
    if (
      f.kind === "check_in_entries" &&
      (f.date.slice(0, 4) !== this.presentation.now().format("YYYY") ||
        f.date > this.presentation.now().format("YYYY-MM-DD"))
    )
      return t("dateInvalid");
    if (
      ["check_in_entries", "work_time_entries", "leave_work_entries"].includes(
        f.kind,
      ) &&
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(f.clock)
    )
      return t("timeInvalid");
    if (f.kind === "work_time_entries") {
      const start = f.shift === "0" ? 480 : 810;
      const n = this.presentation.clockMinutes(f.clock);
      const duration = f.direction === "0" ? n - start : start + 240 - n;
      if (
        !["0", "1"].includes(f.shift) ||
        !["0", "1"].includes(f.direction) ||
        duration < 1 ||
        duration > 240
      )
        return t("timeInvalid");
    }
    if (
      f.kind === "leave_work_entries" &&
      (!/^([01]\d|2[0-3]):[0-5]\d$/.test(f.endClock) || f.clock >= f.endClock)
    )
      return t("timeInvalid");
    if (
      ["time_off_entries", "remote_work_entries"].includes(f.kind) &&
      !["0", "1", "2"].includes(f.period)
    )
      return t("timeInvalid");
    if (f.kind === "time_off_entries" && !entry && f.endDate) {
      if (
        !this.validDate(f.endDate) ||
        f.endDate < f.date ||
        dayjs.utc(f.endDate).diff(dayjs.utc(f.date), "day") > 365 ||
        (f.endDate !== f.date && f.period !== "0")
      )
        return t("rangeInvalid");
    }
    return "";
  }
  scheduled(
    f: AttendanceFormData,
    exceptions: Row<"workday_exceptions">[],
    editing: boolean,
  ) {
    const last =
      f.kind === "time_off_entries" && !editing ? f.endDate || f.date : f.date;
    for (
      let day = dayjs.utc(f.date);
      day.format("YYYY-MM-DD") <= last;
      day = day.add(1, "day")
    ) {
      const shifts = this.presentation
        .shifts(day.format("YYYY-MM-DD"), exceptions)
        .map((s) => s[0]);
      let required: number[];
      if (f.kind === "check_in_entries") required = [480];
      else if (f.kind === "work_time_entries")
        required = [f.shift === "0" ? 480 : 810];
      else if (f.kind === "leave_work_entries") {
        const start = this.presentation.clockMinutes(f.clock),
          end = this.presentation.clockMinutes(f.endClock);
        required = [
          [480, 720],
          [810, 1050],
        ]
          .filter(([a, b]) => start < b && a < end)
          .map(([a]) => a);
        if (!required.length) {
          if (!shifts.length) return false;
          continue;
        }
      } else
        required =
          f.period === "0" ? [480, 810] : [f.period === "1" ? 480 : 810];
      if (!required.every((s) => shifts.includes(s))) return false;
    }
    return true;
  }
  payload(f: AttendanceFormData, editing: boolean): Record<string, unknown> {
    const body: Record<string, unknown> = { note: f.note };
    if (f.kind !== "remote_work_entries") body.no_deduction = f.exempt ? 1 : 0;
    if (f.kind !== "check_in_entries")
      body.title = f.title.trim() || "Untitled";
    if (f.kind === "time_off_entries" && !editing) {
      body.start_date = f.date;
      body.end_date = f.endDate || f.date;
    } else body.date = f.date;
    if (f.kind === "check_in_entries") body.time = f.clock;
    else if (f.kind === "time_off_entries" || f.kind === "remote_work_entries")
      body.type = Number(f.period);
    else if (f.kind === "leave_work_entries") {
      body.start = f.clock;
      body.end = f.endClock;
    } else if (f.kind === "work_time_entries") {
      body.time = Number(f.shift);
      body.type = Number(f.direction);
      const start = f.shift === "0" ? 480 : 810;
      const mins = this.presentation.clockMinutes(f.clock);
      body.duration = f.direction === "0" ? mins - start : start + 240 - mins;
    }
    return body;
  }

  emptyWorkdayException(): WorkdayExceptionFormData {
    return {
      type: String(WorkdayExceptionType.HOLIDAY),
      date: this.presentation.now().format("YYYY-MM-DD"),
      time: String(WorkdayExceptionTime.FULL_DAY),
      title: "",
    };
  }

  workdayExceptionMutable(date: string): boolean {
    return (
      this.validDate(date) &&
      date >= this.presentation.now().format("YYYY-MM-DD")
    );
  }

  validateWorkdayException(f: WorkdayExceptionFormData): string {
    if (!f.title.trim()) return t("workdayExceptionTitleRequired");
    if (!this.validDate(f.date) || !this.workdayExceptionMutable(f.date))
      return t("workdayExceptionDateInvalid");
    if (!["0", "1"].includes(f.type) || !["0", "1", "2"].includes(f.time))
      return t("workdayExceptionInputInvalid");

    const weekday = dayjs.utc(f.date).day();
    if (
      (f.type === String(WorkdayExceptionType.HOLIDAY) &&
        (weekday === 0 || weekday === 6)) ||
      (f.type === String(WorkdayExceptionType.WORKDAY) &&
        weekday > 0 &&
        weekday < 6)
    )
      return t("workdayExceptionDayInvalid");
    return "";
  }

  workdayExceptionPayload(
    f: WorkdayExceptionFormData,
  ): Record<string, unknown> {
    return {
      type: Number(f.type),
      date: f.date,
      time: Number(f.time),
      title: f.title.trim(),
    };
  }
}
