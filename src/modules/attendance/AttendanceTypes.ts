import type { EntryKind, Row } from "./AttendanceEntities";

export const ENDPOINTS: Partial<Record<EntryKind, string>> = {
  check_in_entries: "check-ins",
  time_off_entries: "time-offs",
  remote_work_entries: "remote-works",
  work_time_entries: "work-times",
  leave_work_entries: "leave-works",
};
export const ATTENDANCE_ZONE = "Asia/Ho_Chi_Minh";
export const PAGE_SIZE = 50;
export const WORKDAY_CALENDAR_MIN_YEAR = 2026;

export type LoadStatus = "idle" | "loading" | "ready" | "error";
export type WorkdayCalendarDayStatus = "past" | "today" | "future";
export interface WorkdayCalendarDay {
  date: string;
  day: number;
  status: WorkdayCalendarDayStatus;
  exceptions: Row<"workday_exceptions">[];
}

export type AttendanceFact = {
  date: string;
  id: string;
  time?: string | number;
  type?: number;
  duration?: number;
  start?: string;
  end?: string;
  penalty?: number;
};
export type AttendanceEntry = Row<"pto_affect_entries"> & {
  fact: AttendanceFact | null;
};

export interface EntryFilters {
  kind: string;
  from: string;
  to: string;
  exemption: string;
  title: string;
  ascending: boolean;
  page: number;
}
export interface AttendanceFormData {
  kind: EntryKind;
  date: string;
  endDate: string;
  period: string;
  shift: string;
  direction: string;
  clock: string;
  endClock: string;
  title: string;
  note: string;
  exempt: boolean;
}

export interface WorkdayExceptionFormData {
  type: string;
  date: string;
  time: string;
  title: string;
}
