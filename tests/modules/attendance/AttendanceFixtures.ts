import {
  PtoTransactionCause,
  type Row,
} from "@/modules/attendance/AttendanceEntities";
import type { AttendanceEntry } from "@/modules/attendance/AttendanceTypes";
import type {
  PtoBank,
  PtoTransaction,
} from "@/modules/attendance/AttendanceEntities";
export const bank = (overrides: Partial<PtoBank> = {}): PtoBank => ({
  id: "bank",
  owner_id: "owner",
  year: 2026,
  annual_balance: 600,
  seniority_balance: 60,
  extended_balance: 30,
  original_annual_balance: 6720,
  original_seniority_balance: 60,
  original_extended_balance: null,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
  ...overrides,
});
export const entry = (
  overrides: Partial<AttendanceEntry> = {},
): AttendanceEntry => ({
  id: "entry",
  owner_id: "owner",
  entry_id: "fact",
  entry_type: "check_in_entries",
  title: "Check-in",
  note: "",
  no_deduction: 0,
  created_at: "2026-11-17T02:00:00Z",
  updated_at: "2026-11-17T02:00:00Z",
  fact: { id: "fact", date: "2026-11-17", time: "09:00:00" },
  ...overrides,
});
export const transaction = (
  overrides: Partial<PtoTransaction> = {},
): PtoTransaction => ({
  id: "transaction",
  pto_bank_id: "bank",
  entry_id: "entry",
  created_at: "2026-11-17T02:00:00Z",
  type: 0,
  value: 100,
  exceed_bank_value: 40,
  cause: PtoTransactionCause.CHECK_IN_CREATE,
  ...overrides,
});
export const exception = (
  overrides: Partial<Row<"workday_exceptions">> = {},
): Row<"workday_exceptions"> => ({
  id: "exception",
  date: "2026-11-17",
  type: 1,
  time: 0,
  title: "Holiday",
  created_at: "",
  updated_at: "",
  ...overrides,
});
