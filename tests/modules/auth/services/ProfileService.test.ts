import { beforeEach, describe, expect, it } from "vitest";
import { ProfileService } from "@/modules/auth/services/ProfileService";
import { useAuthStore } from "@/modules/auth/stores/AuthStore";
import {
  makeBackendFake,
  queryResult,
  queryError,
} from "../../../fakes/BackendFake";
import { makeToast } from "../../../fakes/Collaborators";
import { makeProfile } from "../../../factories/Records";

describe("ProfileService", () => {
  let backend: ReturnType<typeof makeBackendFake>;
  let toast: ReturnType<typeof makeToast>;
  let service: ProfileService;
  beforeEach(() => {
    backend = makeBackendFake();
    toast = makeToast();
    service = new ProfileService(backend.port, toast.service);
  });
  it("clears profile without a user", async () => {
    useAuthStore().profile = makeProfile();
    backend.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });
    await service.refreshCurrentUserProfile();
    expect(useAuthStore().profile).toBeNull();
    expect(backend.spbClient.from).not.toHaveBeenCalled();
  });
  it("loads the current user's profile", async () => {
    backend.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });
    const query = backend.query(queryResult([makeProfile()]));
    await service.refreshCurrentUserProfile();
    expect(query.eq).toHaveBeenCalledWith("user_id", "user-1");
    expect(useAuthStore().profile).toEqual(makeProfile());
  });
  it("clears profile on query error", async () => {
    backend.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });
    backend.query(queryError());
    await service.refreshCurrentUserProfile();
    expect(useAuthStore().profile).toBeNull();
    expect(toast.error).toHaveBeenCalled();
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
