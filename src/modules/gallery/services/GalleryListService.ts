import {useGalleryListStore} from "@/modules/gallery/stores/GalleryListStore";
import type {Media} from "@/modules/gallery/GalleryEntities";
import type {SupabaseClient} from '@supabase/supabase-js';
import type {ToastService} from '@/modules/master/services/ToastService';

export class GalleryListService {
    private readonly galleryListStore = useGalleryListStore();

    constructor(
        private readonly supabasePort: SupabaseClient,
        private readonly toastService: ToastService,
    ) {}

    turnOnIsFetchingMediaState(): void {
        this.galleryListStore.isFetchingGalleryMedias = true
    }

    turnOffIsFetchingMediaState(): void {
        this.galleryListStore.isFetchingGalleryMedias = false
    }

    async fetchMedias(): Promise<void> {
        if (this.galleryListStore.hasFetchedAllRecords || this.galleryListStore.isFetchingGalleryMedias) {
            return;
        }

        this.turnOnIsFetchingMediaState();

        const range: number = 60;

        const {data, error} = await this.supabasePort
            .from('medias')
            .select()
            .range(this.galleryListStore.offset, this.galleryListStore.offset + range)
            .order('created_at', {ascending: false});

        if (error || data === null) {
            this.toastService.error('Failed to fetch medias')
            return;
        }

        this.processFetchedData(data)

        this.turnOffIsFetchingMediaState();
    }

    private processFetchedData(data: Media[]): void {
        if (data.length === 0) {
            this.galleryListStore.hasFetchedAllRecords = true
            return;
        }

        this.galleryListStore.medias.push(...data)

        this.galleryListStore.offset = this.galleryListStore.offset + data.length;
    }

    reset(): void {
        this.galleryListStore.medias = [];
        this.galleryListStore.offset = 0
        this.galleryListStore.hasFetchedAllRecords = false;
        this.turnOffIsFetchingMediaState();
    }

    async refreshMedias(): Promise<void> {
        this.reset();
        return this.fetchMedias()
    }

    async getPrevAndNextMediaIdInList(currentMedia: Media): Promise<{
        prevId: string | null,
        nextId: string | null
    }> {
        const currentMediaListIndex: number = this.galleryListStore.medias.findIndex(
            (media: Media) => media.id === currentMedia.id,
        );

        const currentMediaNotFoundInList = currentMediaListIndex === -1;
        if (currentMediaNotFoundInList) {
            return {
                prevId: null,
                nextId: null,
            };
        }

        const prevMediaId: string | null = currentMediaListIndex > 0
            ? this.galleryListStore.medias[currentMediaListIndex - 1].id
            : null;

        // load more media if the current media is last in list
        const currentMediaIsLastInList: boolean = currentMediaListIndex ===
            this.galleryListStore.medias.length - 1;
        if (currentMediaIsLastInList) {
            await this.fetchMedias();
        }

        const nextMediaIndex: number = currentMediaListIndex + 1;
        const nextMediaId: string | null = this.galleryListStore.medias[nextMediaIndex]?.id
            ?? null;

        return {
            prevId: prevMediaId,
            nextId: nextMediaId,
        };
    }
}
