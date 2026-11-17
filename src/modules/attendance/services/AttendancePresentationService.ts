import { type AttendanceEntry, ATTENDANCE_ZONE } from "../AttendanceTypes";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import {
  PtoTransactionCause,
  type PtoTransaction,
  type Row,
} from "../AttendanceEntities";
import { t } from "../locales";
dayjs.extend(utc);
dayjs.extend(timezone);
type Interval = [number, number];
const TRANSACTION_CAUSE_KEYS = new Map<string, Parameters<typeof t>[0]>(
  Object.entries({
    [PtoTransactionCause.CHECK_IN_CREATE]: "transactionCauses.checkInRecorded",
    [PtoTransactionCause.TIME_OFF_CREATE]: "transactionCauses.timeOffRecorded",
    [PtoTransactionCause.LEAVE_WORK_CREATE]:
      "transactionCauses.temporaryAbsenceRecorded",
    [PtoTransactionCause.WORK_TIME_CREATE]:
      "transactionCauses.lateEarlyRecorded",
    [PtoTransactionCause.REMOTE_WORK_CREATE]:
      "transactionCauses.remoteWorkRecorded",
    [PtoTransactionCause.MISS_CHECK_IN_CREATE]:
      "transactionCauses.missedCheckInRecorded",
    [PtoTransactionCause.CHECK_IN_UPDATE]: "transactionCauses.checkInUpdated",
    [PtoTransactionCause.TIME_OFF_UPDATE]: "transactionCauses.timeOffUpdated",
    [PtoTransactionCause.LEAVE_WORK_UPDATE]:
      "transactionCauses.temporaryAbsenceUpdated",
    [PtoTransactionCause.WORK_TIME_UPDATE]:
      "transactionCauses.lateEarlyUpdated",
    [PtoTransactionCause.REMOTE_WORK_UPDATE]:
      "transactionCauses.remoteWorkUpdated",
  } satisfies Record<PtoTransactionCause, Parameters<typeof t>[0]>),
);
export class AttendancePresentationService {
  transactionCause(cause: string): string {
    return t(
      TRANSACTION_CAUSE_KEYS.get(cause) ?? "transactionCauses.adjustment",
    );
  }

  now() {
    return dayjs().tz(ATTENDANCE_ZONE);
  }
  dateTime(value: string) {
    return dayjs(value).tz(ATTENDANCE_ZONE).format("YYYY-MM-DD HH:mm");
  }
  minutes(value: number | null) {
    if (value === null) return "—";
    const n = Math.abs(value);
    return `${value < 0 ? "−" : ""}${Math.floor(n / 480)}d ${Math.floor((n % 480) / 60)}h ${n % 60}m`;
  }
  clockMinutes(value: string) {
    const [h, m] = value.split(":").map(Number);
    return h * 60 + m;
  }
  shifts(date: string, exceptions: Row<"workday_exceptions">[]): Interval[] {
    const weekday = dayjs.utc(date).day();
    return (
      [
        [480, 720],
        [810, 1050],
      ] as Interval[]
    ).filter((_, i) => {
      const relevant = exceptions.filter(
        (e) => e.date === date && (e.time === 0 || e.time === i + 1),
      );
      return (
        !relevant.some((e) => e.type === 1) &&
        ((weekday > 0 && weekday < 6) || relevant.some((e) => e.type === 0))
      );
    });
  }
  status(
    date: string,
    workStart: string,
    exceptions: Row<"workday_exceptions">[],
    entries: AttendanceEntry[],
  ) {
    const arrival = entries.find(
      (e) => e.entry_type === "check_in_entries" && e.fact?.date === date,
    );
    if (arrival)
      return {
        label: `${t("checkedIn")} ${String(arrival.fact?.time).slice(0, 5)}`,
        enabled: false,
      };
    const shifts = date < workStart ? [] : this.shifts(date, exceptions);
    const covered: Interval[] = [];
    for (const e of entries) {
      const f = e.fact;
      if (!f || f.date !== date) continue;
      if (
        e.entry_type === "remote_work_entries" ||
        e.entry_type === "time_off_entries"
      ) {
        if (f.type === 0 || f.type === 1) covered.push([480, 720]);
        if (f.type === 0 || f.type === 2) covered.push([810, 1050]);
      } else if (e.entry_type === "leave_work_entries" && f.start && f.end)
        covered.push([this.clockMinutes(f.start), this.clockMinutes(f.end)]);
      else if (e.entry_type === "work_time_entries") {
        const start = f.time === 0 ? 480 : 810;
        const end = start + 240;
        covered.push(
          f.type === 0
            ? [start, start + (f.duration ?? 0)]
            : [end - (f.duration ?? 0), end],
        );
      }
    }
    const needsPresence = shifts.some(([start, end]) => {
      let cursor = start;
      for (const [a, b] of [...covered].sort((a, b) => a[0] - b[0])) {
        if (b <= cursor) continue;
        if (a > cursor) break;
        cursor = Math.max(cursor, b);
      }
      return cursor < end;
    });
    if (!needsPresence) return { label: t("notRequired"), enabled: false };
    if (!shifts.some((s) => s[0] === 480))
      return { label: t("afternoonUnavailable"), enabled: false };
    return { label: t("required"), enabled: true };
  }
  groups(transactions: PtoTransaction[], ascending: boolean) {
    const groups = new Map<
      string,
      {
        month: string;
        rows: PtoTransaction[];
        deducted: number;
        restored: number;
        excess: number;
        cancelled: number;
      }
    >();
    const sorted = [...transactions].sort((a, b) => {
      const order =
        a.created_at.localeCompare(b.created_at) || a.id.localeCompare(b.id);
      return ascending ? order : -order;
    });
    for (const row of sorted) {
      const month = dayjs(row.created_at).tz(ATTENDANCE_ZONE).format("YYYY-MM");
      const g = groups.get(month) ?? {
        month,
        rows: [],
        deducted: 0,
        restored: 0,
        excess: 0,
        cancelled: 0,
      };
      g.rows.push(row);
      const balance = row.value - row.exceed_bank_value;
      if (row.type === 0) {
        g.deducted += balance;
        g.excess += row.exceed_bank_value;
      } else {
        g.restored += balance;
        g.cancelled += row.exceed_bank_value;
      }
      groups.set(month, g);
    }
    return [...groups.values()];
  }
  fact(entry: AttendanceEntry) {
    const f = entry.fact;
    if (!f) return t("missingFact");
    const parts = [f.date];
    if (typeof f.time === "string") parts.push(f.time.slice(0, 5));
    if (f.start && f.end)
      parts.push(`${f.start.slice(0, 5)}–${f.end.slice(0, 5)}`);
    if (entry.entry_type === "work_time_entries")
      parts.push(
        f.time === 0 ? t("morning") : t("afternoon"),
        f.type === 0 ? t("late") : t("early"),
        this.minutes(f.duration ?? 0),
      );
    else if (f.type !== undefined)
      parts.push(
        f.type === 0
          ? t("fullDay")
          : f.type === 1
            ? t("morning")
            : t("afternoon"),
      );
    if (f.penalty !== undefined) parts.push(this.minutes(f.penalty));
    return parts.join(" · ");
  }
}
