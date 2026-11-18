import { beforeEach, describe, expect, it, vi } from "vitest";
import { AttendanceFormService } from "@/modules/attendance/services/AttendanceFormService";
import { AttendancePresentationService } from "@/modules/attendance/services/AttendancePresentationService";
import { AttendanceService } from "@/modules/attendance/services/AttendanceService";
import { useAttendanceStore } from "@/modules/attendance/AttendanceStore";
import {
  WorkdayExceptionTime,
  WorkdayExceptionType,
  type WorkdayException,
} from "@/modules/attendance/AttendanceEntities";
import { t } from "@/modules/attendance/locales";
import {
  BackendApiError,
  BackendApiResult,
} from "@/ports/backend/BackendPortTypes";
import {
  makeBackendFake,
  queryError,
  queryResult,
} from "../../fakes/BackendFake";
import { makeModal, makeToast } from "../../fakes/Collaborators";
import { exception } from "./AttendanceFixtures";

const display = new AttendancePresentationService();
const forms = new AttendanceFormService(display);
const ID = "123e4567-e89b-42d3-a456-426614174000";

function future(overrides: Partial<WorkdayException> = {}): WorkdayException {
  return exception({
    id: ID,
    date: "2026-11-18",
    type: WorkdayExceptionType.HOLIDAY,
    time: WorkdayExceptionTime.FULL_DAY,
    title: "Company holiday",
    ...overrides,
  });
}

function workdayForm() {
  return {
    ...forms.emptyWorkdayException(),
    type: String(WorkdayExceptionType.WORKDAY),
    date: "2026-11-21",
    title: "Release workday",
  };
}

describe("AttendanceWorkdayExceptionService", () => {
  let backend: ReturnType<typeof makeBackendFake>;
  let toast: ReturnType<typeof makeToast>;
  let modal: ReturnType<typeof makeModal>;
  let service: AttendanceService;

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
    vi.setSystemTime(new Date("2026-11-17T02:00:00Z"));
  });

  it("reads every exception through Supabase in stable ascending order", async () => {
    backend.query(queryResult([future()]));
    expect(await service.loadWorkdayExceptions()).toBe(true);
    expect(backend.get).not.toHaveBeenCalled();
    expect(backend.spbClient.from).toHaveBeenCalledWith("workday_exceptions");
    const query = backend.spbClient.from.mock.results[0].value;
    expect(query.select).toHaveBeenCalledWith(
      "id, type, date, time, title, created_at, updated_at",
    );
    expect(query.order).toHaveBeenNthCalledWith(1, "date");
    expect(query.order).toHaveBeenNthCalledWith(2, "id");
    expect(query.range).toHaveBeenCalledWith(0, 499);
    expect(useAttendanceStore().state.workdayExceptions).toEqual([future()]);
    expect(useAttendanceStore().state.workdayExceptionsStatus).toBe("ready");
  });

  it("fetches all list batches and never presents a partial failed read", async () => {
    backend.query(
      queryResult(
        Array.from({ length: 500 }, (_, index) =>
          future({ id: String(index) }),
        ),
      ),
    );
    backend.query(queryResult([future({ id: "last" })]));
    expect(await service.loadWorkdayExceptions()).toBe(true);
    expect(useAttendanceStore().state.workdayExceptions).toHaveLength(501);

    useAttendanceStore().state.workdayExceptions = [];
    backend.query(
      queryResult(
        Array.from({ length: 500 }, (_, index) =>
          future({ id: `partial-${index}` }),
        ),
      ),
    );
    backend.query(queryError());
    expect(await service.loadWorkdayExceptions()).toBe(false);
    expect(useAttendanceStore().state.workdayExceptions).toEqual([]);
    expect(useAttendanceStore().state.workdayExceptionsStatus).toBe("error");
  });

  it("validates titles, company dates, enum values, and weekday rules", () => {
    expect(forms.validateWorkdayException(workdayForm())).toBe("");
    expect(
      forms.validateWorkdayException({ ...workdayForm(), title: "  " }),
    ).toBe(t("workdayExceptionTitleRequired"));
    expect(
      forms.validateWorkdayException({ ...workdayForm(), date: "2026-11-16" }),
    ).toBe(t("workdayExceptionDateInvalid"));
    expect(
      forms.validateWorkdayException({ ...workdayForm(), time: "3" }),
    ).toBe(t("workdayExceptionInputInvalid"));
    expect(
      forms.validateWorkdayException({
        ...workdayForm(),
        date: "2026-11-18",
      }),
    ).toBe(t("workdayExceptionDayInvalid"));
    expect(
      forms.validateWorkdayException({
        ...workdayForm(),
        type: String(WorkdayExceptionType.HOLIDAY),
      }),
    ).toBe(t("workdayExceptionDayInvalid"));
    expect(
      forms.validateWorkdayException({
        ...workdayForm(),
        type: String(WorkdayExceptionType.HOLIDAY),
        date: "2026-11-18",
      }),
    ).toBe("");
  });

  it("creates an added workday with an explicit payload and no PTO confirmation", async () => {
    backend.post.mockResolvedValue(BackendApiResult.ok(future()));
    expect(await service.createWorkdayException(workdayForm())).toBe(true);
    expect(modal.confirm).not.toHaveBeenCalled();
    expect(backend.post).toHaveBeenCalledWith("attendance/workday-exceptions", {
      type: WorkdayExceptionType.WORKDAY,
      date: "2026-11-21",
      time: WorkdayExceptionTime.FULL_DAY,
      title: "Release workday",
    });
    expect(useAttendanceStore().state.revision).toBe(1);
    expect(useAttendanceStore().state.workdayExceptionsStatus).toBe("idle");
    expect(useAttendanceStore().state.saving).toBe(false);
  });

  it("requires holiday impact confirmation and preserves the failed form operation", async () => {
    const form = {
      ...workdayForm(),
      type: String(WorkdayExceptionType.HOLIDAY),
      date: "2026-11-18",
      title: "Company holiday",
    };
    expect(await service.createWorkdayException(form)).toBe(false);
    expect(modal.confirm).toHaveBeenCalledWith(
      t("workdayExceptionHolidayConfirm"),
    );
    expect(backend.post).not.toHaveBeenCalled();
    expect(useAttendanceStore().state.saving).toBe(false);

    modal.confirm.mockResolvedValue(true);
    backend.post.mockResolvedValue(
      BackendApiResult.err(
        new BackendApiError(
          "workday_exception_overlap",
          "private server detail",
          409,
        ),
      ),
    );
    expect(await service.createWorkdayException(form)).toBe(false);
    expect(toast.error).toHaveBeenCalledWith(t("workdayExceptionOverlap"));
    expect(toast.error.mock.calls.at(-1)?.[0]).not.toContain("private");
    expect(form.title).toBe("Company holiday");
    expect(useAttendanceStore().state.saving).toBe(false);
  });

  it.each([
    ["invalid_workday_exception_day", "workdayExceptionDayInvalid"],
    ["pto_adjustment_conflict", "workdayExceptionPtoConflict"],
    ["forbidden", "workdayExceptionPermissionDenied"],
    ["validation_error", "workdayExceptionInputInvalid"],
    ["offline", "workdayExceptionSaveFailed"],
  ] as const)("maps create error %s safely", async (code, message) => {
    backend.post.mockResolvedValue(
      BackendApiResult.err(new BackendApiError(code, "private detail", 409)),
    );
    expect(await service.createWorkdayException(workdayForm())).toBe(false);
    expect(toast.error).toHaveBeenCalledWith(t(message));
  });

  it("prevents duplicate create submissions while a request is pending", async () => {
    let resolve!: (result: BackendApiResult<WorkdayException, Error>) => void;
    backend.post.mockReturnValue(
      new Promise((done) => {
        resolve = done;
      }),
    );
    const first = service.createWorkdayException(workdayForm());
    const second = service.createWorkdayException(workdayForm());
    resolve(BackendApiResult.ok(future()));
    expect(await first).toBe(true);
    expect(await second).toBe(false);
    expect(backend.post).toHaveBeenCalledTimes(1);
  });

  it("deletes only mutable exceptions through the API after confirmation", async () => {
    modal.confirm.mockResolvedValue(true);
    backend.delete.mockResolvedValue(BackendApiResult.ok(null));
    expect(await service.deleteWorkdayException(future())).toBe(true);
    expect(modal.confirm).toHaveBeenCalledWith(
      t("workdayExceptionDeleteHolidayConfirm"),
    );
    expect(backend.delete).toHaveBeenCalledWith(
      `attendance/workday-exceptions/${ID}`,
    );
    expect(useAttendanceStore().state.revision).toBe(1);
    expect(useAttendanceStore().state.deletingWorkdayException).toBe("");
    expect(useAttendanceStore().state.saving).toBe(false);
  });

  it("blocks past deletion and cancelled confirmation without an API write", async () => {
    expect(
      await service.deleteWorkdayException(future({ date: "2026-11-16" })),
    ).toBe(false);
    expect(modal.confirm).not.toHaveBeenCalled();
    expect(backend.delete).not.toHaveBeenCalled();

    expect(await service.deleteWorkdayException(future())).toBe(false);
    expect(modal.confirm).toHaveBeenCalledOnce();
    expect(backend.delete).not.toHaveBeenCalled();
    expect(useAttendanceStore().state.saving).toBe(false);
  });

  it("discards a pending write result when the account changes", async () => {
    let resolve!: (result: BackendApiResult<WorkdayException, Error>) => void;
    backend.post.mockReturnValue(
      new Promise((done) => {
        resolve = done;
      }),
    );
    const pending = service.createWorkdayException(workdayForm());
    service.resetSession("next-owner");
    resolve(BackendApiResult.ok(future()));
    expect(await pending).toBe(false);
    const state = useAttendanceStore().state;
    expect(state.owner).toBe("next-owner");
    expect(state.revision).toBe(0);
    expect(state.workdayExceptions).toEqual([]);
    expect(state.workdayExceptionsStatus).toBe("idle");
    expect(state.saving).toBe(false);
  });
});
