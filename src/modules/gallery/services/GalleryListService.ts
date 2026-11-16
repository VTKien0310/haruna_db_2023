import { useGalleryListStore } from "@/modules/gallery/stores/GalleryListStore";
import type { Media } from "@/modules/gallery/GalleryEntities";
import type { BackendPort } from "@/ports/backend/BackendPort";
import { t } from "@/modules/gallery/locales";
import type { ToastService } from "@/modules/master/services/ToastService";

export class GalleryListService {
  private readonly galleryListStore = useGalleryListStore();

  constructor(
    private readonly backendPort: BackendPort,
    private readonly toastService: ToastService,
  ) {}

  turnOnIsFetchingMediaState(): void {
    this.galleryListStore.isFetchingGalleryMedia = true;
  }

  turnOffIsFetchingMediaState(): void {
    this.galleryListStore.isFetchingGalleryMedia = false;
  }

  async fetchMedia(): Promise<void> {
    if (
      this.galleryListStore.hasFetchedAllRecords ||
      this.galleryListStore.isFetchingGalleryMedia
    ) {
      return;
    }

    this.turnOnIsFetchingMediaState();

    const range: number = 50;

    const { data, error } = await this.backendPort.spbClient
      .from("medias")
      .select()
      .range(this.galleryListStore.offset, this.galleryListStore.offset + range)
      .order("created_at", { ascending: false });

    if (error || data === null) {
      this.toastService.error(t("messages.fetchMediaFailed"));
      this.turnOffIsFetchingMediaState();
      return;
    }

    this.processFetchedData(data);

    this.turnOffIsFetchingMediaState();
  }

  private processFetchedData(data: Media[]): void {
    if (data.length === 0) {
      this.galleryListStore.hasFetchedAllRecords = true;
      return;
    }

    this.galleryListStore.media.push(...data);

    this.galleryListStore.offset = this.galleryListStore.offset + data.length;
  }

  reset(): void {
    this.galleryListStore.media = [];
    this.galleryListStore.offset = 0;
    this.galleryListStore.hasFetchedAllRecords = false;
    this.turnOffIsFetchingMediaState();
  }

  async refreshMedia(): Promise<void> {
    this.reset();
    return this.fetchMedia();
  }

  async getPrevAndNextMediaIdInList(currentMedia: Media): Promise<{
    prevId: string | null;
    nextId: string | null;
  }> {
    const currentMediaListIndex: number = this.galleryListStore.media.findIndex(
      (media: Media) => media.id === currentMedia.id,
    );

    const currentMediaNotFoundInList = currentMediaListIndex === -1;
    if (currentMediaNotFoundInList) {
      return {
        prevId: null,
        nextId: null,
      };
    }

    const prevMediaId: string | null =
      currentMediaListIndex > 0
        ? this.galleryListStore.media[currentMediaListIndex - 1].id
        : null;

    // load more media if the current media is last in list
    const currentMediaIsLastInList: boolean =
      currentMediaListIndex === this.galleryListStore.media.length - 1;
    if (currentMediaIsLastInList) {
      await this.fetchMedia();
    }

    const nextMediaIndex: number = currentMediaListIndex + 1;
    const nextMediaId: string | null =
      this.galleryListStore.media[nextMediaIndex]?.id ?? null;

    return {
      prevId: prevMediaId,
      nextId: nextMediaId,
    };
  }
}
