import { beforeEach, describe, expect, it } from "vitest";
import { ProfileService } from "@/modules/auth/services/ProfileService";
import { useAuthStore } from "@/modules/auth/stores/AuthStore";
import {
  makeBackendFake,
  queryResult,
  queryError,
} from "../../../fakes/BackendFake";
import { makeToast } from "../../../fakes/Collaborators";
import {
  makeProfile,
  makeUserSpecialPermission,
} from "../../../factories/Records";
import { t } from "@/modules/auth/locales";

describe("ProfileService", () => {
  let backend: ReturnType<typeof makeBackendFake>;
  let toast: ReturnType<typeof makeToast>;
  let service: ProfileService;
  beforeEach(() => {
    backend = makeBackendFake();
    toast = makeToast();
    service = new ProfileService(backend.port, toast.service);
  });
  it("clears profile and special permissions without a user", async () => {
    useAuthStore().profile = makeProfile();
    useAuthStore().userSpecialPermissions = [makeUserSpecialPermission()];
    backend.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });
    await service.refreshCurrentUserProfile();
    expect(useAuthStore().profile).toBeNull();
    expect(useAuthStore().userSpecialPermissions).toEqual([]);
    expect(backend.spbClient.from).not.toHaveBeenCalled();
  });
  it("loads the current user's profile and special permissions", async () => {
    backend.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });
    const profileQuery = backend.query(queryResult([makeProfile()]));
    const specialPermissionsQuery = backend.query(
      queryResult([makeUserSpecialPermission()]),
    );
    await service.refreshCurrentUserProfile();
    expect(profileQuery.eq).toHaveBeenCalledWith("user_id", "user-1");
    expect(specialPermissionsQuery.eq).toHaveBeenCalledWith(
      "user_id",
      "user-1",
    );
    expect(useAuthStore().profile).toEqual(makeProfile());
    expect(useAuthStore().userSpecialPermissions).toEqual([
      makeUserSpecialPermission(),
    ]);
  });
  it("stores an empty permission list when the user has no permissions", async () => {
    backend.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });
    useAuthStore().userSpecialPermissions = [makeUserSpecialPermission()];
    backend.query(queryResult([makeProfile()]));
    backend.query(queryResult([]));
    await service.refreshCurrentUserProfile();
    expect(useAuthStore().userSpecialPermissions).toEqual([]);
  });
  it("clears profile on query error without discarding permissions", async () => {
    backend.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });
    backend.query(queryError());
    backend.query(queryResult([makeUserSpecialPermission()]));
    await service.refreshCurrentUserProfile();
    expect(useAuthStore().profile).toBeNull();
    expect(useAuthStore().userSpecialPermissions).toEqual([
      makeUserSpecialPermission(),
    ]);
    expect(toast.error).toHaveBeenCalledWith(t("messages.fetchProfileFailed"));
  });
  it("clears special permissions on query error without discarding profile", async () => {
    backend.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });
    useAuthStore().userSpecialPermissions = [makeUserSpecialPermission()];
    backend.query(queryResult([makeProfile()]));
    backend.query(queryError());
    await service.refreshCurrentUserProfile();
    expect(useAuthStore().profile).toEqual(makeProfile());
    expect(useAuthStore().userSpecialPermissions).toEqual([]);
    expect(toast.error).toHaveBeenCalledWith(
      t("messages.fetchSpecialPermissionsFailed"),
    );
  });
  it.each(["", "new-password"])(
    "updates name, dates, and conditionally password %j",
    async (password) => {
      backend.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-1" } },
        error: null,
      });
      backend.auth.updateUser.mockResolvedValue({ error: null });
      const update = backend.query(queryResult());
      backend.query(queryResult([makeProfile({ name: "Updated" })]));
      backend.query(queryResult([]));
      await service.updateCurrentUserProfile({
        name: "Updated",
        password,
        birthDate: "1991-02-03",
        workStartDate: "2021-05-06",
      });
      expect(update.update).toHaveBeenCalledWith({
        name: "Updated",
        birth_date: "1991-02-03",
        work_start_date: "2021-05-06",
      });
      expect(useAuthStore().profile?.name).toBe("Updated");
      expect(backend.auth.updateUser).toHaveBeenCalledTimes(password ? 1 : 0);
    },
  );
});
