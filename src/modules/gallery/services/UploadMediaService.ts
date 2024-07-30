import { useGalleryUploadStore } from "@/modules/gallery/stores/GalleryUploadStore";
import { GalleryRouteName } from "@/modules/gallery/GalleryRouter";
import type { GalleryListService } from "@/modules/gallery/services/GalleryListService";
import {defaultStorageFileOptions} from '@/ports/supabase/SupabasePort';
import { uuid } from "@supabase/supabase-js/dist/main/lib/helpers";
import { MediaTypeEnum } from "@/modules/gallery/GalleryEntities";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import type {SupabaseClient} from '@supabase/supabase-js';
import type {ToastService} from '@/modules/master/services/ToastService';
import type {ModalService} from '@/modules/master/services/ModalService';
import type {Router} from 'vue-router';

const imageFileType: string = "image";
const videoFileType: string = "video";

export class UploadMediaService {
  private readonly galleryUploadStore = useGalleryUploadStore();

  /**
   * Represents the lazy-loaded FFmpeg object.
   */
  private ffmpeg: FFmpeg | null = null;

  constructor(
      private readonly router: Router,
      private readonly supabasePort: SupabaseClient,
      private readonly toastService: ToastService,
      private readonly modalService: ModalService,
      private readonly galleryListService: GalleryListService,
  ) {
  }

  uploadPendingNewMediaFiles(): void {
    this.modalService.confirm(
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
      this.toastService.error(`Failed to upload ${file.name}`);

      return false;
    }

    // upload file progress count for both image and video
    this.galleryUploadStore.currentProgressUploadedFileCount += 1;

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

    // create db record progress count for video
    this.galleryUploadStore.currentProgressUploadedFileCount += 1;

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
    // the video's signed url is needed to fetch the video to local and create the thumbnail
    const {data, error} = await this.supabasePort.
        storage.
        from('medias').
        createSignedUrl(storageVideoFilePath, 600);

    if (error || !data) {
      this.toastService.error(`Failed to generate signed URL for ${storageVideoFilePath} to create thumbnail`);

      return '';
    }

    try {
      // prepare to create video thumbnail
      const ffmpeg: FFmpeg = await this.loadFfmpeg();

      const storageFileName: string = storageVideoFilePath.split('/').
          at(-1)!.split('.').at(0)!;
      const thumbnailFileName: string = `${storageFileName}_thumb.png`;

      // create video thumbnail using the frame at 1s of the video
      await ffmpeg.writeFile(video.name, await fetchFile(data.signedUrl));
      await ffmpeg.exec([
        '-i',
        video.name,
        '-ss',
        '00:00:01',
        '-frames:v',
        '1',
        thumbnailFileName,
      ]);
      const thumbnail = await ffmpeg.readFile(thumbnailFileName);

      // create thumbnail progress count for video
      this.galleryUploadStore.currentProgressUploadedFileCount += 1;

      // upload the thumbnail to storage
      const thumbnailUploadResult = await this.supabasePort.storage.from(
          'thumbnails').upload(
          thumbnailFileName,
          new Blob([thumbnail], {type: 'image/png'}),
          defaultStorageFileOptions,
      );

      if (thumbnailUploadResult.error || !thumbnailUploadResult.data?.path) {
        this.toastService.error(`Failed to upload thumbnail ${thumbnailFileName}`);

        return '';
      }

      // upload thumbnail progress count for video
      this.galleryUploadStore.currentProgressUploadedFileCount += 1;

      return thumbnailUploadResult.data.path;
    } catch (e: unknown) {
      this.toastService.error(`Failed to create thumbnail for ${video.name}`);

      return '';
    }
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

    // create db record progress count for image
    this.galleryUploadStore.currentProgressUploadedFileCount += 1;

    return true;
  }

  private toastFailedToCreateMediaRecord(originalFile: File): boolean {
    this.toastService.error(`Failed to create record for ${originalFile.name}`);

    return false;
  }

  private getFileType(file: File): string {
    return file.type.split("/")[0] ?? "";
  }

  private setUpFileCountStatisticForNewUploadProcess(): void {
    const pendingImageFileCount = this.galleryUploadStore.pendingNewMediaFiles.filter(
        (file) => this.getFileType(file) === imageFileType,
    ).length;

    // each image has 2 progress counts: upload the file + create the db record
    const imageProgressCount = pendingImageFileCount * 2;

    const pendingVideoFileCount = this.galleryUploadStore.pendingNewMediaFiles.filter(
        (file) => this.getFileType(file) === videoFileType,
    ).length;

    // each video has 4 progress counts: upload the file + create the db record + create the thumbnail + upload the thumbnail
    const videoProgressCount = pendingVideoFileCount * 4;

    this.galleryUploadStore.currentProgressTotalFileCount = imageProgressCount +
        videoProgressCount;

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
      this.router.push({
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
