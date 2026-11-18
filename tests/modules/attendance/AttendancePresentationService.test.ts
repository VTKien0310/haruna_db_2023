import { describe, it, expect, vi } from "vitest";
import { AttendancePresentationService } from "@/modules/attendance/services/AttendancePresentationService";
import { AttendanceFormService } from "@/modules/attendance/services/AttendanceFormService";
import { entry, exception, transaction } from "./AttendanceFixtures";
import { t } from "@/modules/attendance/locales";
const display = new AttendancePresentationService();
const forms = new AttendanceFormService(display);
describe("AttendancePresentationService", () => {
  it("uses the company date across UTC midnight", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-16T18:00:59Z"));
    expect(display.now().format("YYYY-MM-DD HH:mm")).toBe("2026-11-17 01:00");
  });
  it("handles weekends, enabled shifts, holidays, and employment start", () => {
    expect(display.shifts("2026-11-21", [])).toEqual([]);
    expect(
      display.shifts("2026-11-21", [
        exception({ date: "2026-11-21", type: 0, time: 1 }),
      ]),
    ).toEqual([[480, 720]]);
    expect(display.shifts("2026-11-17", [exception({ time: 1 })])).toEqual([
      [810, 1050],
    ]);
    expect(
      display.shifts("2026-11-21", [
        exception({ date: "2026-11-21", type: 0 }),
        exception({ date: "2026-11-21", type: 1 }),
      ]),
    ).toEqual([]);
    expect(display.status("2026-11-17", "2026-12-01", [], []).enabled).toBe(
      false,
    );
  });
  it("requires presence only in uncovered scheduled intervals", () => {
    const morning = entry({
      entry_type: "time_off_entries",
      fact: { id: "m", date: "2026-11-17", type: 1 },
    });
    const afternoon = entry({
      entry_type: "remote_work_entries",
      fact: { id: "a", date: "2026-11-17", type: 2 },
    });
    expect(
      display.status("2026-11-17", "2026-01-01", [], [morning]).enabled,
    ).toBe(true);
    expect(
      display.status("2026-11-17", "2026-01-01", [], [morning, afternoon])
        .label,
    ).toBe(t("notRequired"));
    expect(
      display.status("2026-11-17", "2026-01-01", [], [morning, morning])
        .enabled,
    ).toBe(true);
  });
  it("unions temporary absence and late/early coverage without double counting", () => {
    const facts = [
      entry({
        entry_type: "leave_work_entries",
        fact: { id: "a", date: "2026-11-17", start: "08:00", end: "10:00" },
      }),
      entry({
        entry_type: "work_time_entries",
        fact: { id: "b", date: "2026-11-17", time: 0, type: 1, duration: 120 },
      }),
      entry({
        entry_type: "remote_work_entries",
        fact: { id: "c", date: "2026-11-17", type: 2 },
      }),
    ];
    expect(display.status("2026-11-17", "2026-01-01", [], facts).enabled).toBe(
      false,
    );
    facts[0].fact!.end = "09:59";
    expect(display.status("2026-11-17", "2026-01-01", [], facts).enabled).toBe(
      true,
    );
  });
  it("distinguishes afternoon-only restriction from time off and existing arrival", () => {
    expect(
      display.status("2026-11-17", "2026-01-01", [exception({ time: 1 })], []),
    ).toEqual({ enabled: false, label: t("afternoonUnavailable") });
    expect(
      display.status("2026-11-17", "2026-01-01", [], [entry()]).label,
    ).toContain("09:00");
  });
  it("groups by local month and separates balance from excess/refunds", () => {
    const rows = [
      transaction({ id: "a", created_at: "2026-10-31T18:00:00Z" }),
      transaction({ id: "b", type: 1, value: 50, exceed_bank_value: 40 }),
      transaction({ id: "c", created_at: "2026-10-01T00:00:00Z" }),
    ];
    const groups = display.groups(rows, false);
    expect(groups.map((g) => g.month)).toEqual(["2026-11", "2026-10"]);
    expect(groups[0]).toMatchObject({
      deducted: 60,
      restored: 10,
      excess: 40,
      cancelled: 40,
    });
    expect(display.groups(rows, true)[0].month).toBe("2026-10");
    expect(rows[0].id).toBe("a");
  });
  it("formats signed minute totals and missing original allowance", () => {
    expect(display.minutes(541)).toBe("1d 1h 1m");
    expect(display.minutes(-60)).toBe("−0d 1h 0m");
    expect(display.minutes(null)).toBe("—");
  });
});
describe("AttendancePresentationService workday calendar", () => {
  it("provides supported years and stable month and weekday labels", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2027-01-01T00:00:00Z"));
    expect(display.workdayCalendarYears()).toEqual(["2026", "2027"]);
    const months = display.workdayCalendarMonths();
    expect(months).toHaveLength(12);
    expect(months[0]).toEqual({ value: "01", label: "January" });
    expect(months[11]).toEqual({ value: "12", label: "December" });
    expect(
      display.workdayCalendarWeekdays().map((weekday) => weekday.label),
    ).toEqual([
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ]);
    expect(display.workdayCalendarMonthLabel("2026-02")).toBe("February 2026");
  });

  it("groups same-day exceptions and uses the company date for day states", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-16T18:00:59Z"));
    const weeks = display.workdayCalendarWeeks("2026-11", [
      exception({ id: "past", date: "2026-11-16" }),
      exception({ id: "today-am", date: "2026-11-17", time: 1 }),
      exception({ id: "today-pm", date: "2026-11-17", time: 2 }),
      exception({ id: "future", date: "2026-11-18" }),
      exception({ id: "outside", date: "2026-12-01" }),
    ]);
    expect(weeks).toHaveLength(6);
    expect(weeks[0].slice(0, 6)).toEqual(Array.from({ length: 6 }, () => null));
    const days = weeks.flat().filter((day) => day !== null);
    expect(days).toHaveLength(30);
    expect(days[0]).toMatchObject({ date: "2026-11-01", status: "past" });
    expect(days.find((day) => day.date === "2026-11-16")?.status).toBe("past");
    const today = days.find((day) => day.date === "2026-11-17");
    expect(today?.status).toBe("today");
    expect(today?.exceptions.map((row) => row.id)).toEqual([
      "today-am",
      "today-pm",
    ]);
    expect(days.find((day) => day.date === "2026-11-18")?.status).toBe(
      "future",
    );
    expect(
      days.flatMap((day) => day.exceptions.map((row) => row.id)),
    ).not.toContain("outside");
  });

  it("handles leap months and transitions across calendar years", () => {
    const leapDays = display
      .workdayCalendarWeeks("2028-02", [])
      .flat()
      .filter((day) => day !== null);
    expect(leapDays).toHaveLength(29);
    expect(display.shiftWorkdayCalendarMonth("2026-01", -1)).toBe("2025-12");
    expect(display.shiftWorkdayCalendarMonth("2026-12", 1)).toBe("2027-01");
    expect(display.shiftWorkdayCalendarMonth("2026-11", 1)).toBe("2026-12");
  });
});
describe("AttendanceFormService", () => {
  it("validates ranges, shifts, clock order, and current-year check-ins", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-17T02:00:00Z"));
    const f = forms.empty();
    expect(forms.validate(f)).toBe("");
    f.date = "2026-02-30";
    expect(forms.validate(f)).not.toBe("");
    f.date = "2026-11-18";
    expect(forms.validate(f)).not.toBe("");
    Object.assign(f, {
      kind: "time_off_entries",
      date: "2026-11-17",
      endDate: "2026-11-18",
      period: "1",
    });
    expect(forms.validate(f)).not.toBe("");
    f.period = "0";
    expect(forms.validate(f)).toBe("");
    Object.assign(f, {
      kind: "leave_work_entries",
      clock: "10:00",
      endClock: "10:00",
    });
    expect(forms.validate(f)).not.toBe("");
  });
  it("converts clock input and round-trips edited late/early facts", () => {
    for (const direction of [0, 1])
      for (const shift of [0, 1]) {
        const e = entry({
          entry_type: "work_time_entries",
          fact: {
            id: "f",
            date: "2026-11-17",
            time: shift,
            type: direction,
            duration: 65,
          },
        });
        const form = forms.fromEntry(e);
        expect(forms.payload(form, true)).toMatchObject({
          time: shift,
          type: direction,
          duration: 65,
          date: "2026-11-17",
        });
      }
  });
  it("constructs only supported fields for each API endpoint", () => {
    const f = forms.empty();
    expect(forms.payload(f, false)).not.toHaveProperty("title");
    Object.assign(f, { kind: "remote_work_entries", exempt: true });
    expect(forms.payload(f, false)).not.toHaveProperty("no_deduction");
    Object.assign(f, { kind: "time_off_entries", endDate: "2026-11-18" });
    expect(forms.payload(f, false)).toHaveProperty("end_date", "2026-11-18");
    expect(forms.payload(f, true)).not.toHaveProperty("end_date");
    Object.assign(f, {
      kind: "leave_work_entries",
      clock: "10:00",
      endClock: "11:00",
    });
    expect(forms.payload(f, false)).toMatchObject({
      start: "10:00",
      end: "11:00",
      no_deduction: 1,
    });
  });
  it("rejects nonworking dates and shift-specific holidays", () => {
    const f = {
      ...forms.empty(),
      kind: "time_off_entries" as const,
      date: "2026-11-20",
      endDate: "2026-11-23",
    };
    expect(forms.scheduled(f, [], false)).toBe(false);
    f.endDate = "";
    f.date = "2026-11-17";
    expect(forms.scheduled(f, [exception({ time: 1 })], false)).toBe(false);
    f.period = "2";
    expect(forms.scheduled(f, [exception({ time: 1 })], false)).toBe(true);
  });
  it("keeps past-year and system entries read-only and preserves edit year", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-17T02:00:00Z"));
    expect(forms.editable(entry({ entry_type: "miss_check_in_entries" }))).toBe(
      false,
    );
    expect(
      forms.editable(entry({ fact: { id: "f", date: "2025-11-17" } })),
    ).toBe(false);
    const f = forms.fromEntry(entry());
    f.date = "2027-01-01";
    expect(forms.validate(f, entry())).not.toBe("");
  });
  it("builds inclusive local-date filtering boundaries", () => {
    expect(forms.dateBoundary("2026-11-17")).toBe("2026-11-16T17:00:00.000Z");
    expect(forms.dateBoundary("2026-11-17", true)).toBe(
      "2026-11-17T17:00:00.000Z",
    );
  });
});

describe("AttendancePresentationService transaction causes", () => {
  it.each([
    ["check_in_entries_create", "Check-in recorded"],
    ["time_off_entries_create", "Time off recorded"],
    ["leave_work_entries_create", "Temporary absence recorded"],
    ["work_time_entries_create", "Late arrival / early departure recorded"],
    ["remote_work_entries_create", "Remote work recorded"],
    ["miss_check_in_entries_create", "Missed check-in recorded"],
    ["check_in_entries_update", "Check-in updated"],
    ["time_off_entries_update", "Time off updated"],
    ["leave_work_entries_update", "Temporary absence updated"],
    ["work_time_entries_update", "Late arrival / early departure updated"],
    ["remote_work_entries_update", "Remote work updated"],
  ])("displays %s as %s", (cause, label) => {
    expect(display.transactionCause(cause)).toBe(label);
  });
  it.each(["future_cause", "", "toString", "__proto__"])(
    "uses a friendly fallback for unknown cause %s",
    (cause) => {
      expect(display.transactionCause(cause)).toBe("PTO adjustment");
    },
  );
});
