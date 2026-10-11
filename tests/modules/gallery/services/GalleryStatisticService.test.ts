import { beforeEach, describe, expect, it, vi } from "vitest";
import { GalleryStatisticService } from "@/modules/gallery/services/GalleryStatisticService";
import {
  makeBackendFake,
  queryResult,
  queryError,
} from "../../../fakes/BackendFake";
import { makeToast } from "../../../fakes/Collaborators";
import { makeMedia } from "../../../factories/Records";

describe("GalleryStatisticService", () => {
  let backend: ReturnType<typeof makeBackendFake>;
  let toast: ReturnType<typeof makeToast>;
  let service: GalleryStatisticService;
  beforeEach(() => {
    backend = makeBackendFake();
    toast = makeToast();
    service = new GalleryStatisticService(backend.port, toast.service);
  });
  it("counts total and user uploads", async () => {
    backend.query(queryResult(null, 12));
    expect(await service.countTotalMedias()).toBe(12);
    const query = backend.query(queryResult(null, 3));
    expect(await service.countUserUploadedMedias("user-1")).toBe(3);
    expect(query.eq).toHaveBeenCalledWith("uploader_id", "user-1");
  });
  it("filters recent uploads using a deterministic UTC cutoff", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-10T00:00:00Z"));
    const query = backend.query(queryResult(null, 4));
    expect(await service.countUploadedMediasWithinPassDays(3)).toBe(4);
    expect(query.filter).toHaveBeenCalledWith(
      "created_at",
      "gte",
      "2026-01-07T00:00:00.000Z",
    );
  });
  it.each([
    "countTotalMedias",
    "countUserUploadedMedias",
    "countUploadedMediasWithinPassDays",
  ] as const)("returns zero on %s failure", async (method) => {
    backend.query(queryError());
    const result =
      method === "countTotalMedias"
        ? await service[method]()
        : method === "countUserUploadedMedias"
          ? await service[method]("user-1")
          : await service[method](7);
    expect(result).toBe(0);
    expect(toast.error).toHaveBeenCalled();
  });
  it("returns latest media or null", async () => {
    backend.query(queryResult([makeMedia()]));
    expect(await service.getLatestUploadMedia()).toEqual(makeMedia());
    backend.query(queryResult([]));
    expect(await service.getLatestUploadMedia()).toBeNull();
  });
});
