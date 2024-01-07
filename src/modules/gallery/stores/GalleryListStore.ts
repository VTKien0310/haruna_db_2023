import {defineStore} from "pinia";
import {ref} from "vue";
import type {Media} from "@/modules/gallery/GalleryEntities";
import {supabasePort} from "@/ports/supabase/SupabasePort";
import {useToast} from "vuestic-ui";

export const useGalleryListStore = defineStore('gallery-list', () => {
    const isFetchingGalleryMedias = ref<boolean>(false);

    function turnOnIsFetchingMediaState(): void {
        isFetchingGalleryMedias.value = true;
    }

    function turnOffIsFetchingMediaState(): void {
        isFetchingGalleryMedias.value = false;
    }

    const medias = ref<Media[]>([]);
    const offset = ref<number>(0);
    const range: number = 60;
    const hasFetchedAllRecords = ref<boolean>(false);

    const {init} = useToast()

    async function fetchMedias(): Promise<void> {
        if (hasFetchedAllRecords.value) {
            return;
        }

        turnOnIsFetchingMediaState();

        const {data, error} = await supabasePort
            .from('medias')
            .select()
            .range(offset.value, offset.value + range)
            .order('created_at', {ascending: false});

        if (error || data === null) {
            init({
                message: 'Failed to fetch medias',
                color: 'danger'
            })
            return;
        }

        processFetchedData(data)

        turnOffIsFetchingMediaState();
    }

    function processFetchedData(data: Media[]): void {
        if (data.length === 0) {
            hasFetchedAllRecords.value = true
            return;
        }

        medias.value.push(...data)
        offset.value = offset.value + data.length;
    }

    function reset(): void {
        medias.value = []
        offset.value = 0
        hasFetchedAllRecords.value = false;
        turnOffIsFetchingMediaState();
    }

    async function refreshMedias(): Promise<void> {
        reset();
        return fetchMedias()
    }

    return {
        medias,
        isFetchingGalleryMedias,
        hasFetchedAllRecords,
        fetchMedias,
        refreshMedias,
        reset
    }
})