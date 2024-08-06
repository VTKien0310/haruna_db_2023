import dayjs from "dayjs";
import type { Media } from "@/modules/gallery/GalleryEntities";
import type { Profile } from "@/modules/auth/ProfileEntities";
import { domPort } from "@/ports/dom/DomPort";
import type { GalleryListService } from "@/modules/gallery/services/GalleryListService";
import { GalleryRouteName } from "@/modules/gallery/GalleryRouter";
import type { TransformOptions } from "@supabase/storage-js/src/lib/types";
import { MediaTypeEnum } from "@/modules/gallery/GalleryEntities";
import type {SupabaseClient} from '@supabase/supabase-js';
import type {ModalService} from '@/modules/master/services/ModalService';
import type {ToastService} from '@/modules/master/services/ToastService';
import type {Router} from 'vue-router';

type DisplayRatio = {
  width: number;
  height: number;
}

const thumbnailSquareRatio: DisplayRatio = {
  width: 500,
  height: 500,
};

const thumbnailFourToThreeRatio: DisplayRatio = {
  width: 1024,
  height: 768,
};

type SignedUrlOptions = {
  download?: string | boolean;
  transform?: TransformOptions;
};

export class MediaDetailService {
  constructor(
      private readonly router: Router,
      private readonly supabasePort: SupabaseClient,
      private readonly toastService: ToastService,
      private readonly modalService: ModalService,
      private readonly galleryListService: GalleryListService
  ) {
  }

  async downloadMedia(media: Media): Promise<void> {
    const { data, error } = await this.supabasePort.storage
      .from("medias")
      .download(media.storage_path);

    if (error || !data) {
      this.toastService.error(`Failed to download media with id ${media.id}`);
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
      this.toastService.error(`Failed to fetch uploader of media with id ${media.id}`);
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
    this.toastService.error(`Failed to generate signed URL for ${path}`);

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
    const thumbnailDisplayRatio: DisplayRatio = forGridUsage
        ? thumbnailSquareRatio
        : thumbnailFourToThreeRatio;

    const thumbnailSpecification: SignedUrlOptions = {
      transform: {
        width: thumbnailDisplayRatio.width,
        height: thumbnailDisplayRatio.height,
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
      this.toastService.error(`Failed to fetch media with id ${id}`);
      return null;
    }

    if (!data[0]) {
      this.toastService.error(`Media with id ${id} not found`);
      return null;
    }

    return data[0];
  }

  private redirectAndRefreshGallery(): void {
    this.router.push({
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
    this.modalService.confirm(`Proceed to delete the file?`).then(
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
          this.toastService.error(`Failed to delete media with id ${media.id}`);
          return;
        }

        this.redirectAndRefreshGallery();
      },
    );
  }

  navigateToMediaDetailPage(mediaId: string): void {
    this.router.push({
      name: GalleryRouteName.DETAIL,
      params: {
        id: mediaId
      }
    })
  }
}
