import dayjs from "dayjs";
import type { Media } from "@/modules/gallery/GalleryEntities";
import type { Profile } from "@/modules/auth/ProfileEntities";
import { domPort } from "@/ports/dom/DomPort";
import type { GalleryListService } from "@/modules/gallery/services/GalleryListService";
import { GalleryRouteName } from "@/modules/gallery/GalleryRouter";
import { MediaTypeEnum } from "@/modules/gallery/GalleryEntities";
import type { BackendPort } from "@/ports/backend/BackendPort";
import type { ModalService } from "@/modules/master/services/ModalService";
import type { ToastService } from "@/modules/master/services/ToastService";
import type { Router } from "vue-router";
import type { MasterNavigationService } from "@/modules/master/services/MasterNavigationService";

type DisplayRatio = {
  width: number;
  height: number;
};

type ResizedImageCreationResult = {
  thumbnail_signed_url: string;
};

const thumbnailSquareRatio: DisplayRatio = {
  width: 500,
  height: 500,
};

const thumbnailFourToThreeRatio: DisplayRatio = {
  width: 1024,
  height: 768,
};

export class MediaDetailService {
  constructor(
    private readonly router: Router,
    private readonly backendPort: BackendPort,
    private readonly toastService: ToastService,
    private readonly modalService: ModalService,
    private readonly masterNavigationService: MasterNavigationService,
    private readonly galleryListService: GalleryListService,
  ) {}

  async downloadMedia(media: Media): Promise<void> {
    const { data, error } = await this.backendPort.spbClient.storage
      .from("medias")
      .download(media.storage_path);

    if (error || !data) {
      this.toastService.error(`Failed to download media with id ${media.id}`);
      return;
    }

    domPort.triggerDownloadBlob(data, media.name);
  }

  async getMediaUploader(media: Media): Promise<Profile | null> {
    if (!media.uploader_id) {
      return null;
    }

    const { data, error } = await this.backendPort.spbClient
      .from("profiles")
      .select()
      .eq("user_id", media.uploader_id);

    if (error || !data) {
      this.toastService.error(
        `Failed to fetch uploader of media with id ${media.id}`,
      );
      return null;
    }

    return data[0];
  }

  /**
   * Stolen from https://gist.github.com/zentala/1e6f72438796d74531803cc3833c039c
   *
   * @param bytes
   * @param decimals
   */
  transformMediaSizeToHumanReadableFormat(
    bytes: number,
    decimals: number = 2,
  ): string {
    if (bytes == 0) return "0 Bytes";

    const k = 1024,
      sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
      i = Math.floor(Math.log(bytes) / Math.log(k));

    return (
      parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + " " + sizes[i]
    );
  }

  transformMediaCreatedAtToHumanReadableFormat(media: Media): string {
    return dayjs(media.created_at).format("DD/MM/YYYY");
  }

  private toastFailedToGenerateSignedUrl(path: string | null): string {
    this.toastService.error(`Failed to generate signed URL for ${path}`);

    return "";
  }

  private resizedImageName(width: number, height: number): string {
    return `${width}x${height}.jpeg`;
  }

  private async checkIfResizedImageExists(
    media: Media,
    width: number,
    height: number,
  ): Promise<boolean> {
    const { data, error } = await this.backendPort.spbClient.storage
      .from("resized")
      .list(media.id);

    if (error) {
      this.toastService.error(
        `Failed to list resized images of media with id ${media.id}`,
      );

      return false;
    }

    const resizedImageName = this.resizedImageName(width, height);

    return data.filter((item) => item.name === resizedImageName).length > 0;
  }

  private async createSignedUrlForResizedImage(
    media: Media,
    width: number,
    height: number,
  ): Promise<string> {
    const resizedImagePath = `${media.id}/${this.resizedImageName(width, height)}`;

    const { data, error } = await this.backendPort.spbClient.storage
      .from("resized")
      .createSignedUrl(resizedImagePath, 1800);

    if (error || !data) {
      return this.toastFailedToGenerateSignedUrl(resizedImagePath);
    }

    return data.signedUrl;
  }

  private async createResizedImage(
    media: Media,
    width: number,
    height: number,
  ): Promise<string | null> {
    const resizedImageResult =
      await this.backendPort.post<ResizedImageCreationResult>(
        `medias/${media.id}/thumbnails`,
        {
          width,
          height,
        },
      );

    if (resizedImageResult.isErr()) {
      return null;
    }

    return resizedImageResult.unwrap().thumbnail_signed_url;
  }

  private async createThumbnailUsingResizedImage(
    media: Media,
    width: number,
    height: number,
  ): Promise<string> {
    const resizedImageExists = await this.checkIfResizedImageExists(
      media,
      width,
      height,
    );
    if (resizedImageExists) {
      return this.createSignedUrlForResizedImage(media, width, height);
    }

    // create the resized image if it doesn't exist, fallback to the original image if the resized image creation failed
    const resizedImageCreationResult = await this.createResizedImage(
      media,
      width,
      height,
    );
    if (!resizedImageCreationResult) {
      const isPhotoMedia = media.type === MediaTypeEnum.PHOTO;
      const bucket = isPhotoMedia ? "medias" : "thumbnails";
      const path = isPhotoMedia ? media.storage_path : media.thumbnail_path;

      const { data, error } = await this.backendPort.spbClient.storage
        .from(bucket)
        .createSignedUrl(path!, 1800, {
          transform: {
            width,
            height,
            resize: "contain",
          },
        });

      if (error || !data) {
        return this.toastFailedToGenerateSignedUrl(media.storage_path);
      }

      return data.signedUrl;
    }

    return resizedImageCreationResult;
  }

  async createThumbnailUrlForMedia(
    media: Media,
    forGridUsage: boolean = true,
  ): Promise<string> {
    // the grid uses 1:1 display ratio while the list use 4:3 display ratio
    const thumbnailDisplayRatio: DisplayRatio = forGridUsage
      ? thumbnailSquareRatio
      : thumbnailFourToThreeRatio;

    return this.createThumbnailUsingResizedImage(
      media,
      thumbnailDisplayRatio.width,
      thumbnailDisplayRatio.height,
    );
  }

  async createFullSizeViewUrlForMedia(media: Media): Promise<string> {
    const { data, error } = await this.backendPort.spbClient.storage
      .from("medias")
      .createSignedUrl(media.storage_path, 1800);

    if (error || !data) {
      return this.toastFailedToGenerateSignedUrl(media.storage_path);
    }

    return data.signedUrl;
  }

  async getMediaById(id: string): Promise<Media | null> {
    const { data, error } = await this.backendPort.spbClient
      .from("medias")
      .select()
      .limit(1)
      .eq("id", id);

    if (error || !data) {
      this.toastService.error(`Failed to fetch media with id ${id}`);
      this.masterNavigationService.navigateTo400();
      return null;
    }

    if (!data[0]) {
      this.toastService.error(`Media with id ${id} not found`);
      this.masterNavigationService.navigateTo404();
      return null;
    }

    return data[0];
  }

  private redirectAndRefreshGallery(): void {
    this.router
      .push({
        name: GalleryRouteName.LIST,
      })
      .then();
    this.galleryListService.refreshMedias().then();
  }

  private async deleteMediaRecordInDb(id: string): Promise<boolean> {
    const { error } = await this.backendPort.spbClient
      .from("medias")
      .delete()
      .eq("id", id);

    return !error;
  }

  private async deleteMediaFileInBucket(storagePath: string) {
    const { error } = await this.backendPort.spbClient.storage
      .from("medias")
      .remove([storagePath]);

    return !error;
  }

  async deleteMedia(media: Media): Promise<void> {
    this.modalService
      .confirm(`Proceed to delete the file?`)
      .then(async (confirmation: boolean): Promise<void> => {
        if (!confirmation) {
          return;
        }

        const deleteDbRecordSuccess = await this.deleteMediaRecordInDb(
          media.id,
        );

        const deleteFileInBucketSuccess = deleteDbRecordSuccess
          ? await this.deleteMediaFileInBucket(media.storage_path)
          : false;

        if (!(deleteDbRecordSuccess && deleteFileInBucketSuccess)) {
          this.toastService.error(`Failed to delete media with id ${media.id}`);
          return;
        }

        this.redirectAndRefreshGallery();
      });
  }
}
