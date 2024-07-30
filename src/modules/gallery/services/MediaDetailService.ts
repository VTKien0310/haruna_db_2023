import dayjs from "dayjs";
import type { Media } from "@/modules/gallery/GalleryEntities";
import { useModal, useToast } from "vuestic-ui";
import type { Profile } from "@/modules/auth/ProfileEntities";
import { domPort } from "@/ports/dom/DomPort";
import type { GalleryListService } from "@/modules/gallery/services/GalleryListService";
import router from "@/router";
import { GalleryRouteName } from "@/modules/gallery/GalleryRouter";
import type { TransformOptions } from "@supabase/storage-js/src/lib/types";
import { MediaTypeEnum } from "@/modules/gallery/GalleryEntities";
import type {SupabaseClient} from '@supabase/supabase-js';

type SignedUrlOptions = {
  download?: string | boolean;
  transform?: TransformOptions;
};

export class MediaDetailService {
  private readonly toastInit = useToast().init;
  private readonly confirmModal = useModal().confirm;

  constructor(
      private readonly supabasePort: SupabaseClient,
      private readonly galleryListService: GalleryListService
  ) {
  }

  async downloadMedia(media: Media): Promise<void> {
    const { data, error } = await this.supabasePort.storage
      .from("medias")
      .download(media.storage_path);

    if (error || !data) {
      this.toastInit({
        message: `Failed to download media with id ${media.id}`,
        color: "danger",
      });
      return;
    }

    domPort.triggerDownloadBlob(data, media.name);
  }

  async getMediaUploader(media: Media): Promise<Profile | null> {
    const { data, error } = await this.supabasePort
      .from("profiles")
      .select()
      .eq("user_id", media.uploader_id);

    if (error || !data) {
      this.toastInit({
        message: `Failed to fetch uploader of media with id ${media.id}`,
        color: "danger",
      });
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

    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + " " +
      sizes[i];
  }

  transformMediaCreatedAtToHumanReadableFormat(media: Media): string {
    return dayjs(media.created_at).format("DD/MM/YYYY");
  }

  private toastFailedToGenerateSignedUrl(path: string | null): string {
    this.toastInit({
      message: `Failed to generate signed URL for ${path}`,
      color: "danger",
    });

    return "";
  }

  private async createSignedUrlForMedia(
    media: Media,
    options: SignedUrlOptions,
  ): Promise<string> {
    const { data, error } = await this.supabasePort.storage
      .from("medias")
      .createSignedUrl(media.storage_path, 1800, options);

    if (error || !data) {
      return this.toastFailedToGenerateSignedUrl(media.storage_path);
    }

    return data.signedUrl;
  }

  private async createThumbnailUrlForPhotoMedia(
    media: Media,
    thumbnailSpecification: SignedUrlOptions,
  ): Promise<string> {
    return this.createSignedUrlForMedia(media, thumbnailSpecification);
  }

  private async createThumbnailUrlForVideoMedia(
    media: Media,
    thumbnailSpecification: SignedUrlOptions,
  ): Promise<string> {
    if (!media.thumbnail_path) {
      return this.toastFailedToGenerateSignedUrl(media.thumbnail_path);
    }

    const { data, error } = await this.supabasePort
      .storage
      .from("thumbnails")
      .createSignedUrl(media.thumbnail_path, 1800, thumbnailSpecification);

    if (error || !data) {
      return this.toastFailedToGenerateSignedUrl(media.thumbnail_path);
    }

    return data.signedUrl;
  }

  async createThumbnailUrlForMedia(media: Media, forGridUsage: boolean = true): Promise<string> {
    // grid use 1:1 display ratio while list use 4:3 display ratio
    const thumbnailSpecification: SignedUrlOptions = {
      transform: {
        width: forGridUsage ? 500 : 750,
        height: forGridUsage ? 500 : 563,
        resize: 'contain',
      },
    };

    if (media.type === MediaTypeEnum.PHOTO) {
      return this.createThumbnailUrlForPhotoMedia(
        media,
        thumbnailSpecification,
      );
    }

    return this.createThumbnailUrlForVideoMedia(media, thumbnailSpecification);
  }

  async createFullSizeViewUrlForMedia(media: Media): Promise<string> {
    return this.createSignedUrlForMedia(media, {});
  }

  async getMediaById(id: string): Promise<Media | null> {
    const { data, error } = await this.supabasePort.from("medias")
      .select()
      .limit(1)
      .eq("id", id);

    if (error || !data) {
      this.toastInit({
        message: `Failed to fetch media with id ${id}`,
        color: "danger",
      });
      return null;
    }

    if (!data[0]) {
      this.toastInit({
        message: `Media with id ${id} not found`,
        color: "danger",
      });
      return null;
    }

    return data[0];
  }

  private redirectAndRefreshGallery(): void {
    router.push({
      name: GalleryRouteName.LIST,
    });
    this.galleryListService.refreshMedias();
  }

  private async deleteMediaRecordInDb(id: string): Promise<boolean> {
    const { error } = await this.supabasePort
      .from("medias")
      .delete()
      .eq("id", id);

    return !error;
  }

  private async deleteMediaFileInBucket(storagePath: string) {
    const { data, error } = await this.supabasePort.storage
      .from("medias")
      .remove([storagePath]);

    return !error;
  }

  async deleteMedia(media: Media): Promise<void> {
    this.confirmModal(`Proceed to delete the file?`).then(
      async (confirmation: boolean): Promise<void> => {
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
          this.toastInit({
            message: `Failed to delete media with id ${media.id}`,
            color: "danger",
          });
          return;
        }

        this.redirectAndRefreshGallery();
      },
    );
  }

  navigateToMediaDetailPage(mediaId: string): void {
    router.push({
      name: GalleryRouteName.DETAIL,
      params: {
        id: mediaId
      }
    })
  }
}
