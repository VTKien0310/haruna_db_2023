import dayjs from "dayjs";
import type { Media } from "@/modules/gallery/GalleryEntities";
import { useToast } from "vuestic-ui";
import type { Profile } from "@/modules/auth/ProfileEntities";
import { supabasePort } from "@/ports/supabase/SupabasePort";
import { domPort } from "@/ports/dom/DomPort";
import type { GalleryListService } from "@/modules/gallery/services/GalleryListService";
import router from "@/router";
import { GalleryRouteName } from "@/modules/gallery/GalleryRouter";

export class MediaDetailService {
  private readonly toastInit = useToast().init;

  constructor(private readonly galleryListService: GalleryListService) {
  }

  redirectAndRefreshGallery(): void {
    router.push({
      name: GalleryRouteName.LIST,
    });
    this.galleryListService.refreshMedias();
  }

  async downloadMedia(media: Media): Promise<void> {
    const { data, error } = await supabasePort.storage
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
    const { data, error } = await supabasePort
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
}
