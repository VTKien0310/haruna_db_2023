import type { Database } from "@/ports/backend/database.types";
export type Row<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type PtoBank = Row<"pto_banks">;
export type PtoTransaction = Row<"pto_transactions">;
export type WorkdayException = Row<"workday_exceptions">;

export enum WorkdayExceptionType {
  WORKDAY = 0,
  HOLIDAY = 1,
}

export enum WorkdayExceptionTime {
  FULL_DAY = 0,
  MORNING = 1,
  AFTERNOON = 2,
}

export const ENTRY_TABLES = [
  "check_in_entries",
  "time_off_entries",
  "remote_work_entries",
  "work_time_entries",
  "leave_work_entries",
  "miss_check_in_entries",
] as const;
export type EntryKind = (typeof ENTRY_TABLES)[number];

export enum PtoTransactionCause {
  CHECK_IN_CREATE = "check_in_entries_create",
  TIME_OFF_CREATE = "time_off_entries_create",
  LEAVE_WORK_CREATE = "leave_work_entries_create",
  WORK_TIME_CREATE = "work_time_entries_create",
  REMOTE_WORK_CREATE = "remote_work_entries_create",
  MISS_CHECK_IN_CREATE = "miss_check_in_entries_create",
  CHECK_IN_UPDATE = "check_in_entries_update",
  TIME_OFF_UPDATE = "time_off_entries_update",
  LEAVE_WORK_UPDATE = "leave_work_entries_update",
  WORK_TIME_UPDATE = "work_time_entries_update",
  REMOTE_WORK_UPDATE = "remote_work_entries_update",
}
