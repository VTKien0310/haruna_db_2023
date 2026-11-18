import { AttendancePresentationService } from "@/modules/attendance/services/AttendancePresentationService";
import { beforeEach, describe, it, expect, vi } from "vitest";
import { AttendanceService } from "@/modules/attendance/services/AttendanceService";
import { AttendanceFormService } from "@/modules/attendance/services/AttendanceFormService";
import { useAttendanceStore } from "@/modules/attendance/AttendanceStore";
import {
  BackendApiResult,
  BackendApiError,
} from "@/ports/backend/BackendPortTypes";
import {
  makeBackendFake,
  queryResult,
  queryError,
} from "../../fakes/BackendFake";
import { makeModal, makeToast } from "../../fakes/Collaborators";
import { entry, bank, transaction } from "./AttendanceFixtures";
import { t } from "@/modules/attendance/locales";
const display = new AttendancePresentationService();
const forms = new AttendanceFormService(display);
describe("AttendanceService", () => {
  let backend: ReturnType<typeof makeBackendFake>,
    toast: ReturnType<typeof makeToast>,
    modal: ReturnType<typeof makeModal>,
    service: AttendanceService;
  beforeEach(() => {
    backend = makeBackendFake();
    toast = makeToast();
    modal = makeModal();
    service = new AttendanceService(
      backend.port,
      toast.service,
      display,
      forms,
      modal.service,
    );
    service.resetSession("owner");
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-17T02:00:59Z"));
  });
  const filters = {
    kind: "",
    from: "",
    to: "",
    exemption: "",
    title: "",
    ascending: false,
    page: 1,
  };
  function dashboard() {
    backend.query(queryResult([]));
    backend.query(queryResult([]));
    backend.query(queryResult([bank()]));
    backend.query(queryResult([{ work_start_date: "2026-01-01" }]));
  }
  it("loads a missing bank without inventing zero balances", async () => {
    backend.query(queryResult([]));
    backend.query(queryResult([]));
    backend.query(queryResult([]));
    backend.query(queryResult([{ work_start_date: "2026-01-01" }]));
    expect(await service.loadDashboard()).toBe(true);
    expect(useAttendanceStore().state.bank).toBeNull();
    expect(useAttendanceStore().state.dashboardStatus).toBe("ready");
  });
  it("keeps failed dashboard data unavailable", async () => {
    backend.query(queryError());
    backend.query(queryResult([]));
    backend.query(queryResult([]));
    backend.query(queryResult([]));
    expect(await service.loadDashboard()).toBe(false);
    expect(useAttendanceStore().state.dashboardStatus).toBe("error");
  });
  it("captures button time before asynchronous validation and blocks duplicate submission", async () => {
    dashboard();
    await service.loadDashboard();
    backend.query(queryResult([]));
    backend.post.mockResolvedValue(BackendApiResult.ok({ id: "fact" }));
    dashboard();
    dashboard();
    const first = service.quickCheckIn();
    vi.setSystemTime(new Date("2026-11-17T02:05:00Z"));
    const second = service.quickCheckIn();
    await Promise.all([first, second]);
    expect(backend.post).toHaveBeenCalledTimes(1);
    expect(backend.post).toHaveBeenCalledWith("attendance/check-ins", {
      date: "2026-11-17",
      time: "09:00",
      note: "",
      no_deduction: 0,
    });
  });
  it("refuses a stale-day quick check-in and reloads", async () => {
    dashboard();
    await service.loadDashboard();
    vi.setSystemTime(new Date("2026-11-17T18:00:00Z"));
    dashboard();
    expect(await service.quickCheckIn()).toBe(false);
    expect(backend.post).not.toHaveBeenCalled();
  });
  it("uses PATCH with the child ID and invalidates loaded data after editing", async () => {
    backend.query(queryResult([]));
    backend.patch.mockResolvedValue(BackendApiResult.ok({}));
    expect(await service.save(forms.fromEntry(entry()), entry())).toBe(true);
    expect(backend.patch).toHaveBeenCalledWith(
      "attendance/check-ins/fact",
      expect.objectContaining({ date: "2026-11-17", time: "09:00" }),
    );
    expect(useAttendanceStore().state.revision).toBe(1);
  });
  it.each([
    "check_in_already_exists",
    "attendance_non_workday",
    "work_time_overlaps",
    "unknown",
  ])(
    "handles API error %s without losing control of saving state",
    async (code) => {
      backend.query(queryResult([]));
      backend.post.mockResolvedValue(
        BackendApiResult.err(
          new BackendApiError(code, "private server message", 409),
        ),
      );
      expect(await service.save(forms.empty())).toBe(false);
      expect(useAttendanceStore().state.saving).toBe(false);
      expect(toast.error).toHaveBeenCalled();
      expect(toast.error.mock.calls[0][0]).not.toContain("private");
    },
  );
  it("rejects holiday writes before calling the API", async () => {
    backend.query(queryResult([{ date: "2026-11-17", type: 1, time: 1 }]));
    expect(await service.save(forms.empty())).toBe(false);
    expect(backend.post).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith(t("nonWorkday"));
  });
  it("loads all ledger batches before reporting complete totals", async () => {
    backend.query(queryResult([bank()]));
    const first = backend.query(
      queryResult(
        Array.from({ length: 500 }, (_, i) => transaction({ id: String(i) })),
      ),
    );
    const second = backend.query(queryResult([transaction({ id: "500" })]));
    expect(await service.loadLedger()).toBe(true);
    expect(useAttendanceStore().state.transactions).toHaveLength(501);
    expect(first.range).toHaveBeenCalledWith(0, 499);
    expect(second.range).toHaveBeenCalledWith(500, 999);
  });
  it("uses the latest available bank when the current year is absent", async () => {
    backend.query(queryResult([bank({ year: 2025 })]));
    backend.query(queryResult([]));
    expect(await service.loadLedger()).toBe(true);
    expect(useAttendanceStore().state.year).toBe("2025");
  });
  it("does not present partially fetched ledger rows after failure", async () => {
    backend.query(queryResult([bank()]));
    backend.query(queryError());
    expect(await service.loadLedger()).toBe(false);
    expect(useAttendanceStore().state.ledgerStatus).toBe("error");
  });
  it("filters owned entries server-side and hydrates child records in batches", async () => {
    const parent = backend.query(
      queryResult(
        [
          entry(),
          entry({ id: "other", entry_id: "missing", entry_type: "unknown" }),
        ],
        2,
      ),
    );
    backend.query(queryResult([entry().fact]));
    expect(
      await service.loadEntries({
        ...filters,
        kind: "check_in_entries",
        from: "2026-11-01",
        to: "2026-11-17",
        exemption: "0",
        title: "100%",
        page: 2,
      }),
    ).toBe(true);
    expect(parent.eq).toHaveBeenCalledWith("owner_id", "owner");
    expect(parent.range).toHaveBeenCalledWith(50, 99);
    expect(parent.ilike).toHaveBeenCalledWith("title", "%100\\%%");
    expect(parent.lt).toHaveBeenCalledWith(
      "created_at",
      "2026-11-17T17:00:00.000Z",
    );
    expect(useAttendanceStore().state.entries[1].fact).toBeNull();
  });
  it("loads entry details and transactions, and handles missing entries", async () => {
    backend.query(queryResult([entry()]));
    backend.query(queryResult([entry().fact]));
    backend.query(queryResult([transaction()]));
    expect(await service.loadDetail("entry")).toBe(true);
    expect(useAttendanceStore().state.detail?.fact?.date).toBe("2026-11-17");
    backend.query(queryResult([]));
    expect(await service.loadDetail("missing")).toBe(true);
    expect(useAttendanceStore().state.detail).toBeNull();
  });
  it("restores initial defaults with fresh state collections when the account changes", () => {
    const store = useAttendanceStore();
    const initial = { ...store.state, requests: { ...store.state.requests } };
    const previous = store.state;
    Object.assign(previous, {
      revision: 3,
      saving: true,
      today: "2026-11-17",
      workStart: "2026-01-01",
      bank: bank(),
      banks: [bank()],
      year: "2026",
      transactions: [transaction()],
      todayEntries: [entry()],
      entries: [entry()],
      count: 1,
      detail: entry(),
      detailTransactions: [transaction()],
      missed: ["2026-11-16"],
      dashboardStatus: "ready",
      ledgerStatus: "error",
      listStatus: "loading",
      detailStatus: "ready",
      missedStatus: "error",
    });
    previous.requests.missed = 5;
    service.resetSession("next-owner");
    expect(store.state).toEqual({
      ...initial,
      owner: "next-owner",
      epoch: initial.epoch + 1,
    });
    expect(store.state).not.toBe(previous);
    expect(store.state.requests).not.toBe(previous.requests);
    for (const key of [
      "todayEntries",
      "exceptions",
      "banks",
      "transactions",
      "entries",
      "detailTransactions",
      "missed",
    ] as const) {
      expect(store.state[key]).not.toBe(previous[key]);
    }
    const firstReset = store.state;
    service.resetSession("third-owner");
    expect(store.state.requests).not.toBe(firstReset.requests);
    expect(store.state.missed).not.toBe(firstReset.missed);
    expect(store.state.epoch).toBe(initial.epoch + 2);
  });
  it("preserves state and pending request counters for the same account", () => {
    const store = useAttendanceStore();
    store.state.missed = ["2026-11-16"];
    store.state.requests.missed = 4;
    const previous = store.state;
    service.resetSession("owner");
    expect(store.state).toBe(previous);
    expect(store.state.missed).toEqual(["2026-11-16"]);
    expect(store.state.requests.missed).toBe(4);
  });
  it("clears account data and discards an old account response", async () => {
    let resolve!: (result: BackendApiResult<unknown, Error>) => void;
    backend.get.mockReturnValue(
      new Promise((r) => {
        resolve = r;
      }),
    );
    const pending = service.loadMissed();
    useAttendanceStore().state.banks = [bank()];
    service.resetSession("next-owner");
    resolve(BackendApiResult.ok(["2026-11-16"]));
    expect(await pending).toBe(false);
    expect(useAttendanceStore().state.missed).toEqual([]);
    expect(useAttendanceStore().state.banks).toEqual([]);
    expect(useAttendanceStore().state.owner).toBe("next-owner");
  });
  it("handles missed-date failure and retry", async () => {
    backend.get
      .mockResolvedValueOnce(BackendApiResult.err(new Error("offline")))
      .mockResolvedValueOnce(BackendApiResult.ok(["2026-11-16"]));
    expect(await service.loadMissed()).toBe(false);
    expect(await service.loadMissed()).toBe(true);
    expect(useAttendanceStore().state.missed).toEqual(["2026-11-16"]);
  });
  it("ignores an older missed-date request even across service instances", async () => {
    let resolve!: (result: BackendApiResult<unknown, Error>) => void;
    backend.get
      .mockReturnValueOnce(
        new Promise((r) => {
          resolve = r;
        }),
      )
      .mockResolvedValueOnce(BackendApiResult.ok(["2026-11-16"]));
    const old = service.loadMissed();
    const next = new AttendanceService(
      backend.port,
      toast.service,
      display,
      forms,
      modal.service,
    );
    expect(await next.loadMissed()).toBe(true);
    resolve(BackendApiResult.ok(["2026-11-10"]));
    expect(await old).toBe(false);
    expect(useAttendanceStore().state.missed).toEqual(["2026-11-16"]);
  });
  it("reconciles a duplicate quick check-in with the saved arrival", async () => {
    dashboard();
    await service.loadDashboard();
    backend.query(queryResult([]));
    backend.post.mockResolvedValue(
      BackendApiResult.err(
        new BackendApiError("check_in_already_exists", "Duplicate", 409),
      ),
    );
    backend.query(queryResult([entry()]));
    backend.query(queryResult([]));
    backend.query(queryResult([bank()]));
    backend.query(queryResult([{ work_start_date: "2026-01-01" }]));
    backend.query(queryResult([entry().fact]));
    expect(await service.quickCheckIn()).toBe(false);
    expect(useAttendanceStore().state.todayEntries[0].fact?.time).toBe(
      "09:00:00",
    );
    expect(useAttendanceStore().state.dashboardStatus).toBe("ready");
  });
});
