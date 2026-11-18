import { beforeEach, describe, expect, it, vi } from "vitest";
import attendanceRoutes, {
  AttendanceRouteName,
} from "@/modules/attendance/AttendanceRouter";
import { ensureWorkdayExceptionAccess } from "@/modules/attendance/AttendanceGuards";
import {
  AttendanceAccess,
  AttendanceAccessService,
} from "@/modules/attendance/services/AttendanceAccessService";
import { UserSpecialPermissionType } from "@/modules/auth/AuthEntities";
import { AuthRouteName } from "@/modules/auth/AuthRouter";
import { MasterRouteName } from "@/modules/master/MasterRouter";
import {
  makeBackendFake,
  queryError,
  queryResult,
} from "../../fakes/BackendFake";
import { makeUserSpecialPermission } from "../../factories/Records";

const dependencies = vi.hoisted(() => ({
  manage: vi.fn(),
}));
vi.mock("@/modules/attendance/AttendanceServiceContainer", () => ({
  useAttendanceAccessService: () => ({
    manageWorkdayExceptions: dependencies.manage,
  }),
}));

describe("AttendanceAccessService", () => {
  let backend: ReturnType<typeof makeBackendFake>;
  let service: AttendanceAccessService;

  beforeEach(() => {
    backend = makeBackendFake();
    service = new AttendanceAccessService(backend.port);
  });

  function user(id: string | null = "user-1") {
    backend.auth.getUser.mockResolvedValue({
      data: { user: id ? { id } : null },
      error: null,
    });
  }

  it("checks the authentic current user and typed permission row", async () => {
    user();
    const query = backend.query(queryResult([makeUserSpecialPermission()]));
    expect(await service.manageWorkdayExceptions()).toBe(
      AttendanceAccess.ALLOWED,
    );
    expect(query.select).toHaveBeenCalledWith("permission");
    expect(query.eq).toHaveBeenCalledWith("user_id", "user-1");
    expect(query.eq).toHaveBeenCalledWith(
      "permission",
      UserSpecialPermissionType.MANAGE_WORKDAY_EXCEPTIONS,
    );
    expect(query.limit).toHaveBeenCalledWith(1);
  });

  it("distinguishes unauthenticated, missing, and failed access checks", async () => {
    user(null);
    expect(await service.manageWorkdayExceptions()).toBe(
      AttendanceAccess.UNAUTHENTICATED,
    );
    expect(backend.spbClient.from).not.toHaveBeenCalled();

    user();
    backend.query(queryResult([]));
    expect(await service.manageWorkdayExceptions()).toBe(
      AttendanceAccess.DENIED,
    );

    backend.query(queryError());
    expect(await service.manageWorkdayExceptions()).toBe(
      AttendanceAccess.DENIED,
    );
  });
});

describe("ensureWorkdayExceptionAccess", () => {
  it.each([
    [AttendanceAccess.ALLOWED, true],
    [AttendanceAccess.UNAUTHENTICATED, { name: AuthRouteName.LOGIN }],
    [AttendanceAccess.DENIED, { name: MasterRouteName.NOT_FOUND }],
  ])("maps %s to the expected navigation result", async (access, outcome) => {
    dependencies.manage.mockResolvedValue(access);
    expect(await ensureWorkdayExceptionAccess()).toEqual(outcome);
  });

  it("protects both management routes with the same guard", () => {
    for (const name of [
      AttendanceRouteName.WORKDAY_EXCEPTIONS,
      AttendanceRouteName.WORKDAY_EXCEPTION_CREATE,
    ]) {
      const route = attendanceRoutes.find(
        (candidate) => candidate.name === name,
      );
      expect(route?.beforeEnter).toBe(ensureWorkdayExceptionAccess);
    }
  });
});
