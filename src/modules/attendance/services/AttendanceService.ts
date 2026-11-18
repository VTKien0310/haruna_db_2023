import type { BackendPort } from "@/ports/backend/BackendPort";
import { BackendApiError } from "@/ports/backend/BackendPortTypes";
import type { ToastService } from "@/modules/master/services/ToastService";
import type { ModalService } from "@/modules/master/services/ModalService";
import { useAttendanceStore } from "../AttendanceStore";
import {
  ENTRY_TABLES,
  type Row,
  type WorkdayException,
  WorkdayExceptionType,
} from "../AttendanceEntities";
import {
  type AttendanceEntry,
  type AttendanceFact,
  type AttendanceFormData,
  type EntryFilters,
  type WorkdayExceptionFormData,
  ENDPOINTS,
  PAGE_SIZE,
} from "../AttendanceTypes";
import { AttendancePresentationService } from "./AttendancePresentationService";
import { AttendanceFormService } from "./AttendanceFormService";
import { t } from "../locales";

export class AttendanceService {
  constructor(
    private readonly backend: BackendPort,
    private readonly toast: ToastService,
    private readonly presentation: AttendancePresentationService,
    private readonly forms: AttendanceFormService,
    private readonly modal: ModalService,
  ) {}
  resetSession(owner: string) {
    const store = useAttendanceStore();
    if (store.state.owner === owner) return;
    const epoch = store.state.epoch + 1;
    store.state = { ...this.emptyAttendanceState(), owner, epoch };
  }
  private emptyAttendanceState(): ReturnType<
    typeof useAttendanceStore
  >["state"] {
    return {
      owner: "",
      epoch: 0,
      revision: 0,
      saving: false,
      requests: {
        dashboard: 0,
        ledger: 0,
        list: 0,
        detail: 0,
        missed: 0,
        workdayExceptions: 0,
      },
      today: "",
      todayEntries: [],
      exceptions: [],
      workStart: "",
      bank: null,
      dashboardStatus: "idle",
      banks: [],
      year: "",
      transactions: [],
      ledgerStatus: "idle",
      entries: [],
      count: 0,
      listStatus: "idle",
      detail: null,
      detailTransactions: [],
      detailStatus: "idle",
      missed: [],
      missedStatus: "idle",
      workdayExceptions: [],
      workdayExceptionsStatus: "idle",
      deletingWorkdayException: "",
    };
  }
  private async all<T>(
    fetch: (
      start: number,
      end: number,
    ) => PromiseLike<{ data: T[] | null; error: unknown }>,
  ) {
    const rows: T[] = [];
    for (let start = 0; ; start += 500) {
      const { data, error } = await fetch(start, start + 499);
      if (error || !data) return null;
      rows.push(...data);
      if (data.length < 500) return rows;
    }
  }
  private async hydrate(
    parents: Row<"pto_affect_entries">[],
    date?: string,
  ): Promise<AttendanceEntry[] | null> {
    const facts = new Map<string, AttendanceFact>();
    for (const kind of ENTRY_TABLES) {
      const ids = parents
        .filter((e) => e.entry_type === kind && e.entry_id)
        .map((e) => e.entry_id!);
      for (let i = 0; i < ids.length; i += 100) {
        let query = this.backend.spbClient
          .from(kind)
          .select("*")
          .in("id", ids.slice(i, i + 100));
        if (date) query = query.eq("date", date);
        const { data, error } = await query;
        if (error || !data) return null;
        for (const fact of data) facts.set(`${kind}:${fact.id}`, fact);
      }
    }
    return parents.map((e) => ({
      ...e,
      fact: facts.get(`${e.entry_type}:${e.entry_id}`) ?? null,
    }));
  }
  private fail() {
    this.toast.error(t("loadFailed"));
    return false;
  }
  async loadDashboard(): Promise<boolean> {
    const s = useAttendanceStore().state;
    if (!s.owner) return false;
    const request = ++s.requests.dashboard;
    s.dashboardStatus = "loading";
    const today = this.presentation.now().format("YYYY-MM-DD");
    try {
      const [parents, exceptions, banks, profiles] = await Promise.all([
        this.all((a, b) =>
          this.backend.spbClient
            .from("pto_affect_entries")
            .select("*")
            .eq("owner_id", s.owner)
            .in(
              "entry_type",
              ENTRY_TABLES.filter((k) => k !== "miss_check_in_entries"),
            )
            .order("id")
            .range(a, b),
        ),
        this.backend.spbClient
          .from("workday_exceptions")
          .select("*")
          .eq("date", today),
        this.backend.spbClient
          .from("pto_banks")
          .select("*")
          .eq("owner_id", s.owner)
          .eq("year", Number(today.slice(0, 4))),
        this.backend.spbClient
          .from("profiles")
          .select("*")
          .eq("user_id", s.owner),
      ]);
      if (
        !parents ||
        exceptions.error ||
        !exceptions.data ||
        banks.error ||
        !banks.data ||
        profiles.error ||
        !profiles.data?.[0]
      ) {
        if (this.current(s) && request === s.requests.dashboard) {
          s.dashboardStatus = "error";
          return this.fail();
        }
        return false;
      }
      const entries = await this.hydrate(parents, today);
      if (!this.current(s) || request !== s.requests.dashboard) return false;
      if (!entries) {
        s.dashboardStatus = "error";
        return this.fail();
      }
      s.today = today;
      s.todayEntries = entries.filter((e) => e.fact);
      s.exceptions = exceptions.data;
      s.workStart = profiles.data[0].work_start_date;
      s.bank = banks.data[0] ?? null;
      s.dashboardStatus = "ready";
      return true;
    } catch {
      if (this.current(s) && request === s.requests.dashboard) {
        s.dashboardStatus = "error";
        return this.fail();
      }
      return false;
    }
  }
  private current(s: ReturnType<typeof useAttendanceStore>["state"]) {
    return useAttendanceStore().state === s;
  }
  private invalidateViews(
    s: ReturnType<typeof useAttendanceStore>["state"],
  ): void {
    s.revision++;
    for (const key of [
      "dashboard",
      "ledger",
      "list",
      "detail",
      "missed",
      "workdayExceptions",
    ] as const)
      s.requests[key]++;
    s.dashboardStatus = "idle";
    s.ledgerStatus = "idle";
    s.listStatus = "idle";
    s.detailStatus = "idle";
    s.missedStatus = "idle";
    s.workdayExceptionsStatus = "idle";
  }
  async loadLedger(year?: string): Promise<boolean> {
    const s = useAttendanceStore().state;
    if (!s.owner) return false;
    const request = ++s.requests.ledger;
    s.ledgerStatus = "loading";
    try {
      const banks = await this.all((a, b) =>
        this.backend.spbClient
          .from("pto_banks")
          .select("*")
          .eq("owner_id", s.owner)
          .order("year", { ascending: false })
          .order("id")
          .range(a, b),
      );
      if (!banks) {
        if (this.current(s) && request === s.requests.ledger) {
          s.ledgerStatus = "error";
          return this.fail();
        }
        return false;
      }
      const selected =
        banks.find(
          (b) =>
            String(b.year) ===
            (year || s.year || this.presentation.now().format("YYYY")),
        ) || banks[0];
      const transactions = selected
        ? await this.all((a, b) =>
            this.backend.spbClient
              .from("pto_transactions")
              .select("*")
              .eq("pto_bank_id", selected.id)
              .order("created_at")
              .order("id")
              .range(a, b),
          )
        : [];
      if (!this.current(s) || request !== s.requests.ledger) return false;
      if (!transactions) {
        s.ledgerStatus = "error";
        return this.fail();
      }
      s.banks = banks;
      s.year = selected ? String(selected.year) : "";
      s.transactions = transactions;
      s.ledgerStatus = "ready";
      return true;
    } catch {
      if (this.current(s) && request === s.requests.ledger) {
        s.ledgerStatus = "error";
        return this.fail();
      }
      return false;
    }
  }
  async loadEntries(filters: EntryFilters): Promise<boolean> {
    const s = useAttendanceStore().state;
    if (!s.owner) return false;
    const request = ++s.requests.list;
    s.listStatus = "loading";
    try {
      let query = this.backend.spbClient
        .from("pto_affect_entries")
        .select("*", { count: "exact" })
        .eq("owner_id", s.owner);
      if (filters.kind) query = query.eq("entry_type", filters.kind);
      if (filters.exemption)
        query = query.eq("no_deduction", Number(filters.exemption));
      if (filters.from)
        query = query.gte("created_at", this.forms.dateBoundary(filters.from));
      if (filters.to)
        query = query.lt(
          "created_at",
          this.forms.dateBoundary(filters.to, true),
        );
      if (filters.title)
        query = query.ilike(
          "title",
          `%${filters.title.replace(/[\\%_]/g, "\\$&")}%`,
        );
      const { data, error, count } = await query
        .order("created_at", { ascending: filters.ascending })
        .order("id", { ascending: filters.ascending })
        .range((filters.page - 1) * PAGE_SIZE, filters.page * PAGE_SIZE - 1);
      const entries = !error && data ? await this.hydrate(data) : null;
      if (!this.current(s) || request !== s.requests.list) return false;
      if (!entries) {
        s.listStatus = "error";
        return this.fail();
      }
      s.entries = entries;
      s.count = count ?? 0;
      s.listStatus = "ready";
      return true;
    } catch {
      if (this.current(s) && request === s.requests.list) {
        s.listStatus = "error";
        return this.fail();
      }
      return false;
    }
  }
  async loadDetail(id: string): Promise<boolean> {
    const s = useAttendanceStore().state;
    if (!s.owner) return false;
    const request = ++s.requests.detail;
    s.detailStatus = "loading";
    s.detail = null;
    s.detailTransactions = [];
    try {
      const { data, error } = await this.backend.spbClient
        .from("pto_affect_entries")
        .select("*")
        .eq("owner_id", s.owner)
        .eq("id", id);
      const entries = !error && data ? await this.hydrate(data) : null;
      const transactions = entries?.length
        ? await this.all((a, b) =>
            this.backend.spbClient
              .from("pto_transactions")
              .select("*")
              .eq("entry_id", id)
              .order("created_at", { ascending: false })
              .order("id")
              .range(a, b),
          )
        : [];
      if (!this.current(s) || request !== s.requests.detail) return false;
      if (!entries || !transactions) {
        s.detailStatus = "error";
        return this.fail();
      }
      s.detail = entries[0] ?? null;
      s.detailTransactions = transactions;
      s.detailStatus = "ready";
      return true;
    } catch {
      if (this.current(s) && request === s.requests.detail) {
        s.detailStatus = "error";
        return this.fail();
      }
      return false;
    }
  }
  async loadMissed(): Promise<boolean> {
    const s = useAttendanceStore().state;
    if (!s.owner) return false;
    const request = ++s.requests.missed;
    s.missedStatus = "loading";
    try {
      const result = await this.backend.get<string[]>(
        "attendance/missed-check-ins",
      );
      if (!this.current(s) || request !== s.requests.missed) return false;
      if (result.isErr()) {
        s.missedStatus = "error";
        return this.fail();
      }
      s.missed = result.unwrap();
      s.missedStatus = "ready";
      return true;
    } catch {
      if (this.current(s) && request === s.requests.missed) {
        s.missedStatus = "error";
        return this.fail();
      }
      return false;
    }
  }
  async loadWorkdayExceptions(): Promise<boolean> {
    const s = useAttendanceStore().state;
    if (!s.owner) return false;
    const request = ++s.requests.workdayExceptions;
    s.workdayExceptionsStatus = "loading";
    try {
      const exceptions = await this.all<WorkdayException>((a, b) =>
        this.backend.spbClient
          .from("workday_exceptions")
          .select("id, type, date, time, title, created_at, updated_at")
          .order("date")
          .order("id")
          .range(a, b),
      );
      if (!this.current(s) || request !== s.requests.workdayExceptions)
        return false;
      if (!exceptions) {
        s.workdayExceptionsStatus = "error";
        this.toast.error(t("workdayExceptionsLoadFailed"));
        return false;
      }
      s.workdayExceptions = exceptions;
      s.workdayExceptionsStatus = "ready";
      return true;
    } catch {
      if (this.current(s) && request === s.requests.workdayExceptions) {
        s.workdayExceptionsStatus = "error";
        this.toast.error(t("workdayExceptionsLoadFailed"));
      }
      return false;
    }
  }

  private workdayExceptionWriteError(
    error: Error,
    action: "create" | "delete",
  ): void {
    const code = error instanceof BackendApiError ? error.code : "";
    switch (code) {
      case "past_workday_exception_immutable":
        this.toast.error(t("workdayExceptionDateInvalid"));
        return;
      case "invalid_workday_exception_day":
        this.toast.error(t("workdayExceptionDayInvalid"));
        return;
      case "workday_exception_overlap":
        this.toast.error(t("workdayExceptionOverlap"));
        return;
      case "pto_adjustment_conflict":
        this.toast.error(t("workdayExceptionPtoConflict"));
        return;
      case "workday_exception_not_found":
        this.toast.error(t("workdayExceptionNotFound"));
        return;
      case "forbidden":
        this.toast.error(t("workdayExceptionPermissionDenied"));
        return;
      case "validation_error":
        this.toast.error(t("workdayExceptionInputInvalid"));
        return;
      default:
        this.toast.error(
          t(
            action === "create"
              ? "workdayExceptionSaveFailed"
              : "workdayExceptionDeleteFailed",
          ),
        );
    }
  }

  async createWorkdayException(
    form: WorkdayExceptionFormData,
  ): Promise<boolean> {
    const s = useAttendanceStore().state;
    if (!s.owner || s.saving) return false;
    const validation = this.forms.validateWorkdayException(form);
    if (validation) {
      this.toast.error(validation);
      return false;
    }
    s.saving = true;
    try {
      if (
        form.type === String(WorkdayExceptionType.HOLIDAY) &&
        !(await this.modal.confirm(t("workdayExceptionHolidayConfirm")))
      )
        return false;
      if (!this.current(s)) return false;
      const result = await this.backend.post<WorkdayException>(
        "attendance/workday-exceptions",
        this.forms.workdayExceptionPayload(form),
      );
      if (!this.current(s)) return false;
      if (result.isErr()) {
        this.workdayExceptionWriteError(result.unwrapErr(), "create");
        return false;
      }
      this.invalidateViews(s);
      this.toast.info(t("workdayExceptionSaved"));
      return true;
    } catch {
      if (this.current(s)) this.toast.error(t("workdayExceptionSaveFailed"));
      return false;
    } finally {
      if (this.current(s)) s.saving = false;
    }
  }

  async deleteWorkdayException(exception: WorkdayException): Promise<boolean> {
    const s = useAttendanceStore().state;
    if (!s.owner || s.saving) return false;
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        exception.id,
      ) ||
      !this.forms.workdayExceptionMutable(exception.date)
    ) {
      this.toast.error(t("workdayExceptionDateInvalid"));
      return false;
    }
    s.saving = true;
    s.deletingWorkdayException = exception.id;
    try {
      const confirmed = await this.modal.confirm(
        t(
          exception.type === WorkdayExceptionType.HOLIDAY
            ? "workdayExceptionDeleteHolidayConfirm"
            : "workdayExceptionDeleteWorkdayConfirm",
        ),
      );
      if (!confirmed || !this.current(s)) return false;
      const result = await this.backend.delete(
        `attendance/workday-exceptions/${encodeURIComponent(exception.id)}`,
      );
      if (!this.current(s)) return false;
      if (result.isErr()) {
        this.workdayExceptionWriteError(result.unwrapErr(), "delete");
        return false;
      }
      this.invalidateViews(s);
      this.toast.info(t("workdayExceptionDeleted"));
      return true;
    } catch {
      if (this.current(s)) this.toast.error(t("workdayExceptionDeleteFailed"));
      return false;
    } finally {
      if (this.current(s)) {
        s.saving = false;
        s.deletingWorkdayException = "";
      }
    }
  }

  async quickCheckIn(): Promise<boolean> {
    const s = useAttendanceStore().state;
    const pressed = this.presentation.now();
    if (s.saving) return false;
    if (
      s.dashboardStatus !== "ready" ||
      s.today !== pressed.format("YYYY-MM-DD")
    ) {
      await this.loadDashboard();
      return false;
    }
    if (
      !this.presentation.status(
        s.today,
        s.workStart,
        s.exceptions,
        s.todayEntries,
      ).enabled
    )
      return false;
    const form = this.forms.empty();
    form.date = pressed.format("YYYY-MM-DD");
    form.clock = pressed.format("HH:mm");
    const result = await this.save(form);
    await this.loadDashboard();
    return result;
  }
  async save(
    form: AttendanceFormData,
    entry?: AttendanceEntry,
  ): Promise<boolean> {
    const s = useAttendanceStore().state;
    if (!s.owner || s.saving) return false;
    const validation = this.forms.validate(form, entry);
    if (validation) {
      this.toast.error(validation);
      return false;
    }
    const endpoint = ENDPOINTS[form.kind];
    if (!endpoint) return false;
    s.saving = true;
    try {
      const last =
        form.kind === "time_off_entries" && !entry
          ? form.endDate || form.date
          : form.date;
      const { data, error } = await this.backend.spbClient
        .from("workday_exceptions")
        .select("*")
        .gte("date", form.date)
        .lte("date", last);
      if (!this.current(s)) return false;
      if (error || !data) return this.fail();
      if (!this.forms.scheduled(form, data, Boolean(entry))) {
        this.toast.error(t("nonWorkday"));
        return false;
      }
      const body = this.forms.payload(form, Boolean(entry));
      const result = entry
        ? await this.backend.patch(
            `attendance/${endpoint}/${entry.entry_id}`,
            body,
          )
        : await this.backend.post(`attendance/${endpoint}`, body);
      if (!this.current(s)) return false;
      if (result.isErr()) {
        const error = result.unwrapErr();
        const code = error instanceof BackendApiError ? error.code : "";
        this.toast.error(
          code === "check_in_already_exists"
            ? t("duplicate")
            : code === "attendance_non_workday"
              ? t("nonWorkday")
              : code.includes("overlap") || code.includes("already_exists")
                ? t("conflict")
                : code === "check_in_date_out_of_range" ||
                    code === "past_year_entry_not_editable"
                  ? t("dateInvalid")
                  : t("saveFailed"),
        );
        return false;
      }
      this.invalidateViews(s);
      this.toast.info(t("saved"));
      return true;
    } catch {
      if (this.current(s)) this.toast.error(t("saveFailed"));
      return false;
    } finally {
      if (this.current(s)) s.saving = false;
    }
  }
}
