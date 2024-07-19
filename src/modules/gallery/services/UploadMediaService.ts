import { useGalleryUploadStore } from "@/modules/gallery/stores/GalleryUploadStore";
import { useModal, useToast } from "vuestic-ui";
import router from "@/router";
import { GalleryRouteName } from "@/modules/gallery/GalleryRouter";
import type { GalleryListService } from "@/modules/gallery/services/GalleryListService";
import {defaultStorageFileOptions} from '@/ports/supabase/SupabasePort';
import { uuid } from "@supabase/supabase-js/dist/main/lib/helpers";
import { MediaTypeEnum } from "@/modules/gallery/GalleryEntities";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import type { FileData } from "@ffmpeg/ffmpeg/dist/esm/types";
import type {SupabaseClient} from '@supabase/supabase-js';

const imageFileType: string = "image";
const videoFileType: string = "video";

export class UploadMediaService {
  private readonly galleryUploadStore = useGalleryUploadStore();
  private readonly confirmModal = useModal().confirm;
  private readonly toastInit = useToast().init;

  /**
   * Represents the lazy-loaded FFmpeg object.
   */
  private ffmpeg: FFmpeg | null = null;

  constructor(
      private readonly supabasePort: SupabaseClient,
      private readonly galleryListService: GalleryListService
  ) {
  }

  uploadPendingNewMediaFiles(): void {
    this.confirmModal(
      `Proceed to upload ${this.galleryUploadStore.pendingNewMediaFiles.length} file(s)?`,
    ).then(
      async (confirmToProceed: boolean): Promise<void> => {
        if (!confirmToProceed) {
          return;
        }

        this.setUpFileCountStatisticForNewUploadProcess();
        this.turnOnIsHandlingCreateNewMediaState();

        this.galleryUploadStore.pendingNewMediaFiles = await this
          .handleUploadNewMediaFiles();

        this.resetFileCountStatistic();
        this.turnOffIsHandlingCreateNewMediaState();

        this.redirectToGalleryListIfHasNoUploadError();

        this.galleryListService.refreshMedias();
      },
    );
  }

  private async handleUploadNewMediaFiles(): Promise<File[]> {
    const failedToUploadFiles: File[] = [];

    for (const file of this.galleryUploadStore.pendingNewMediaFiles) {
      const fileUploadSuccessfully: boolean = await this.uploadMedia(file);

      if (!fileUploadSuccessfully) {
        failedToUploadFiles.push(file);
      }

      this.galleryUploadStore.currentProgressUploadedFileCount += 1;
    }

    return failedToUploadFiles;
  }

  private async uploadMedia(file: File): Promise<boolean> {
    const fileExtension: string = this.getFileExtension(file);
    const fileStorageName: string = this.generateFileStorageName(fileExtension);

    const { data, error } = await this.supabasePort.storage
      .from("medias")
      .upload(fileStorageName, file, defaultStorageFileOptions);

    if (error || !data?.path) {
      this.toastInit({
        message: `Failed to upload ${file.name}`,
        color: "danger",
      });

      return false;
    }

    return await this.createMediaRecord(data.path, file);
  }

  private getFileExtension(file: File): string {
    return file.type.split("/").at(-1) ?? "";
  }

  private generateFileStorageName(fileExtension: string): string {
    const uniqueFileName: string = uuid();
    return fileExtension
      ? `${uniqueFileName}.${fileExtension}`
      : uniqueFileName;
  }

  private async createMediaRecord(
    storageFilePath: string,
    originalFile: File,
  ): Promise<boolean> {
    return this.getFileType(originalFile) === imageFileType
      ? this.createPhotoMediaRecord(storageFilePath, originalFile)
      : this.createVideoMediaRecord(storageFilePath, originalFile);
  }

  private async createVideoMediaRecord(
    storageFilePath: string,
    originalFile: File,
  ): Promise<boolean> {
    const thumbnailPath: string = await this.generateThumbnailForVideo(
      storageFilePath,
      originalFile,
    );

    if (!thumbnailPath) {
      return this.toastFailedToCreateMediaRecord(originalFile);
    }

    const { error } = await this.supabasePort
      .from("medias")
      .insert({
        name: originalFile.name,
        mime: originalFile.type,
        size: originalFile.size,
        type: MediaTypeEnum.VIDEO,
        storage_path: storageFilePath,
        thumbnail_path: thumbnailPath,
      });

    if (error) {
      return this.toastFailedToCreateMediaRecord(originalFile);
    }

    return true;
  }

  /**
   * Loads FFmpeg and returns an instance of FFmpeg.
   * If FFmpeg is already loaded, it returns the existing instance.
   *
   * @private
   * @returns {Promise<FFmpeg>} A Promise that resolves to an instance of FFmpeg.
   */
  private async loadFfmpeg(): Promise<FFmpeg> {
    // ffmpeg is already loaded
    if (this.ffmpeg) {
      return this.ffmpeg;
    }

    // load ffmpeg wasm
    const ffmpeg: FFmpeg = new FFmpeg();
    const ffmpegWasmCdnBaseURL: string = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
    // toBlobURL is used to bypass CORS issue, urls with the same domain can be used directly.
    await ffmpeg.load({
      coreURL: await toBlobURL(
          `${ffmpegWasmCdnBaseURL}/ffmpeg-core.js`,
          'text/javascript',
      ),
      wasmURL: await toBlobURL(
          `${ffmpegWasmCdnBaseURL}/ffmpeg-core.wasm`,
          'application/wasm',
      ),
    });

    this.ffmpeg = ffmpeg;

    return this.ffmpeg;
  }

  private async generateThumbnailForVideo(
    storageVideoFilePath: string,
    video: File,
  ): Promise<string> {
    const { data, error } = await this.supabasePort.storage
      .from("medias")
      .createSignedUrl(storageVideoFilePath, 300);

    if (error || !data) {
      this.toastInit({
        message:
          `Failed to generate signed URL for ${storageVideoFilePath} to create thumbnail`,
        color: "danger",
      });

      return "";
    }

    try {
      const ffmpeg: FFmpeg = await this.loadFfmpeg();

      const storageFileName: string = storageVideoFilePath.split("/").at(-1)!
        .split(".").at(0)!;
      const thumbnailFileName: string = `${storageFileName}_thumb.png`;

      /* Create video thumbnail using the frame at 1s of the video  */
      await ffmpeg.writeFile(video.name, await fetchFile(data.signedUrl));
      await ffmpeg.exec([
        "-i",
        video.name,
        "-ss",
        "00:00:01",
        "-frames:v",
        "1",
        thumbnailFileName,
      ]);
      const thumbnail: FileData = await ffmpeg.readFile(thumbnailFileName);

      return await this.storeVideoThumbnail(thumbnail, thumbnailFileName);
    } catch (e: unknown) {
      this.toastInit({
        message: `Failed to create thumbnail for ${video.name}`,
        color: "danger",
      });

      return "";
    }
  }

  private async storeVideoThumbnail(
    thumbnail: FileData,
    thumbnailFileName: string,
  ): Promise<string> {
    const { data, error } = await this.supabasePort.storage
      .from("thumbnails")
      .upload(
        thumbnailFileName,
        new Blob([thumbnail.buffer], { type: "image/png" }),
        defaultStorageFileOptions,
      );

    if (error || !data?.path) {
      this.toastInit({
        message: `Failed to upload thumbnail ${thumbnailFileName}`,
        color: "danger",
      });

      return "";
    }

    return data.path;
  }

  private async createPhotoMediaRecord(
    storageFilePath: string,
    originalFile: File,
  ): Promise<boolean> {
    const { error } = await this.supabasePort
      .from("medias")
      .insert({
        name: originalFile.name,
        mime: originalFile.type,
        size: originalFile.size,
        type: MediaTypeEnum.PHOTO,
        storage_path: storageFilePath,
        thumbnail_path: null,
      });

    if (error) {
      return this.toastFailedToCreateMediaRecord(originalFile);
    }

    return true;
  }

  private toastFailedToCreateMediaRecord(originalFile: File): boolean {
    this.toastInit({
      message: `Failed to create record for ${originalFile.name}`,
      color: "danger",
    });

    return false;
  }

  private getFileType(file: File): string {
    return file.type.split("/")[0] ?? "";
  }

  private setUpFileCountStatisticForNewUploadProcess(): void {
    this.galleryUploadStore.currentProgressTotalFileCount =
      this.galleryUploadStore.pendingNewMediaFiles.length;

    this.galleryUploadStore.currentProgressUploadedFileCount = 0;
  }

  private turnOnIsHandlingCreateNewMediaState(): void {
    this.galleryUploadStore.isHandlingCreateNewMedia = true;
  }

  private turnOffIsHandlingCreateNewMediaState(): void {
    this.galleryUploadStore.isHandlingCreateNewMedia = false;
  }

  private resetFileCountStatistic(): void {
    this.galleryUploadStore.currentProgressTotalFileCount = 0;
    this.galleryUploadStore.currentProgressUploadedFileCount = 0;
  }

  private redirectToGalleryListIfHasNoUploadError(): void {
    if (this.galleryUploadStore.pendingNewMediaFiles.length === 0) {
      router.push({
        name: GalleryRouteName.LIST,
      });
    }
  }

  reset(): void {
    this.galleryUploadStore.pendingNewMediaFiles = [];
    this.turnOffIsHandlingCreateNewMediaState();
  }

  filterPendingFilesForValidForUpload(): void {
    this.galleryUploadStore.pendingNewMediaFiles = this.galleryUploadStore
      .pendingNewMediaFiles
      .filter(
        (file) =>
          [
            imageFileType,
            videoFileType,
          ].includes(this.getFileType(file)),
      );
  }
}
