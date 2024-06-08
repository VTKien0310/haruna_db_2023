import {useGalleryListStore} from "@/modules/gallery/stores/GalleryListStore";
import {useToast} from "vuestic-ui";
import {supabasePort} from "@/ports/supabase/SupabasePort";
import type {Media} from "@/modules/gallery/GalleryEntities";

export class GalleryListService {
    private readonly galleryListStore = useGalleryListStore();
    private readonly toastInit = useToast().init;

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

        const {data, error} = await supabasePort
            .from('medias')
            .select()
            .range(this.galleryListStore.offset, this.galleryListStore.offset + range)
            .order('created_at', {ascending: false});

        if (error || data === null) {
            this.toastInit({
                message: 'Failed to fetch medias',
                color: 'danger'
            })
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

    private reset(): void {
        this.galleryListStore.medias = [];
        this.galleryListStore.offset = 0
        this.galleryListStore.hasFetchedAllRecords = false;
        this.turnOffIsFetchingMediaState();
    }

    async refreshMedias(): Promise<void> {
        this.reset();
        return this.fetchMedias()
    }
}