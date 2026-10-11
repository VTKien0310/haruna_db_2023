import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import { UploadMediaService } from "@/modules/gallery/services/UploadMediaService";
import { GalleryListService } from "@/modules/gallery/services/GalleryListService";
import { useGalleryUploadStore } from "@/modules/gallery/stores/GalleryUploadStore";
import {
  makeBackendFake,
  queryResult,
  queryError,
} from "../../../fakes/BackendFake";
import { makeToast, makeModal, makeRouter } from "../../../fakes/Collaborators";

const ffmpeg = vi.hoisted(() => ({
  load: vi.fn(async () => true),
  writeFile: vi.fn(async () => true),
  exec: vi.fn(async () => 0),
  readFile: vi.fn(async () => new Uint8Array([1, 2])),
}));
vi.mock("@ffmpeg/ffmpeg", () => ({
  FFmpeg: class {
    load = ffmpeg.load;
    writeFile = ffmpeg.writeFile;
    exec = ffmpeg.exec;
    readFile = ffmpeg.readFile;
  },
}));
vi.mock("@ffmpeg/util", () => ({
  toBlobURL: vi.fn(async () => "blob:dummy"),
  fetchFile: vi.fn(async () => new Uint8Array([1])),
}));

describe("UploadMediaService", () => {
  let backend: ReturnType<typeof makeBackendFake>;
  let toast: ReturnType<typeof makeToast>;
  let modal: ReturnType<typeof makeModal>;
  let router: ReturnType<typeof makeRouter>;
  let service: UploadMediaService;
  beforeEach(() => {
    backend = makeBackendFake();
    toast = makeToast();
    modal = makeModal();
    router = makeRouter();
    const list = new GalleryListService(backend.port, toast.service);
    vi.spyOn(list, "refreshMedias").mockResolvedValue();
    service = new UploadMediaService(
      router,
      backend.port,
      toast.service,
      modal.service,
      list,
    );
  });
  it("filters non-media files and resets pending uploads", () => {
    useGalleryUploadStore().pendingNewMediaFiles = [
      new File(["a"], "a.png", { type: "image/png" }),
      new File(["b"], "b.txt", { type: "text/plain" }),
    ];
    service.filterPendingFilesForValidForUpload();
    expect(useGalleryUploadStore().pendingNewMediaFiles).toHaveLength(1);
    service.reset();
    expect(useGalleryUploadStore().pendingNewMediaFiles).toEqual([]);
  });
  it("does not upload when cancelled", async () => {
    service.uploadPendingNewMediaFiles();
    await flushPromises();
    expect(backend.storage.upload).not.toHaveBeenCalled();
  });
  it.each(["image/png", "video/mp4"])(
    "uploads %s using fake storage and media processing",
    async (mime) => {
      const file = new File(
        ["dummy"],
        mime.startsWith("image") ? "a.png" : "a.mp4",
        { type: mime },
      );
      useGalleryUploadStore().pendingNewMediaFiles = [file];
      modal.confirm.mockResolvedValue(true);
      backend.storage.upload
        .mockResolvedValueOnce(queryResult({ path: file.name }))
        .mockResolvedValueOnce(queryResult({ path: "thumb.png" }));
      backend.storage.createSignedUrl.mockResolvedValue(
        queryResult({ signedUrl: "https://media.invalid/dummy" }),
      );
      const query = backend.query(queryResult());
      service.uploadPendingNewMediaFiles();
      await flushPromises();
      expect(query.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          name: file.name,
          mime,
          storage_path: file.name,
          type: mime.startsWith("image") ? 0 : 1,
        }),
      );
      expect(useGalleryUploadStore()).toMatchObject({
        pendingNewMediaFiles: [],
        isHandlingCreateNewMedia: false,
        currentProgressTotalFileCount: 0,
        currentProgressUploadedFileCount: 0,
      });
      expect(router.push).toHaveBeenCalledWith({ name: "gallery.list" });
      expect(ffmpeg.exec).toHaveBeenCalledTimes(
        mime.startsWith("video") ? 1 : 0,
      );
    },
  );
  it.each(["storage", "record"])(
    "retains failed uploads after %s failure",
    async (stage) => {
      const file = new File(["dummy"], "a.png", { type: "image/png" });
      useGalleryUploadStore().pendingNewMediaFiles = [file];
      modal.confirm.mockResolvedValue(true);
      backend.storage.upload.mockResolvedValue(
        stage === "storage" ? queryError() : queryResult({ path: "a.png" }),
      );
      if (stage === "record") backend.query(queryError());
      service.uploadPendingNewMediaFiles();
      await flushPromises();
      expect(useGalleryUploadStore().pendingNewMediaFiles).toEqual([file]);
      expect(useGalleryUploadStore().isHandlingCreateNewMedia).toBe(false);
      expect(router.push).not.toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalled();
    },
  );
});
