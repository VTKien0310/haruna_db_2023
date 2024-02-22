import {defineStore} from "pinia";
import {ref} from "vue";
import {type Media, MediaTypeEnum} from "@/modules/gallery/GalleryEntities";
import {supabasePort} from "@/ports/supabase/SupabasePort";
import {useToast} from "vuestic-ui";
import type {User} from '@supabase/supabase-js';
import dayjs from "dayjs";

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
        if (hasFetchedAllRecords.value || isFetchingGalleryMedias.value) {
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
        medias.value = [];
        offset.value = 0
        hasFetchedAllRecords.value = false;
        turnOffIsFetchingMediaState();
    }

    async function refreshMedias(): Promise<void> {
        reset();
        return fetchMedias()
    }

    async function countTotalMedias(): Promise<number> {
        const {count, error} = await supabasePort
            .from('medias')
            .select('*', {
                count: 'exact',
                head: true,
            });

        if (error || count === null) {
            init({
                message: 'Failed to count total medias',
                color: 'danger',
            });

            return 0;
        }

        return count;
    }

    async function countUserUploadedMedias(user: User): Promise<number> {
        const {count, error} = await supabasePort
            .from('medias')
            .select('*', {
                count: 'exact',
                head: true,
            })
            .eq('uploader_id', user.id);

        if (error || count === null) {
            init({
                message: "Failed to count user's uploaded medias",
                color: 'danger',
            });

            return 0;
        }

        return count;
    }

    async function getLatestUploadMedia(): Promise<Media | null> {
        const {data, error} = await supabasePort
            .from('medias')
            .select()
            .limit(1)
            .order('created_at', {ascending: false});

        if (error || data === null || data.length === 0) {
            return null;
        }

        return data[0];
    }

    async function countUploadedMediasWithinPassDays(days: number): Promise<number> {
        const targetPointInTime: string = dayjs().subtract(days, 'day').utc().toISOString();

        const {count, error} = await supabasePort
            .from('medias')
            .select('*', {
                count: 'exact',
                head: true,
            })
            .filter('created_at', 'gte', targetPointInTime);

        if (error || count === null) {
            init({
                message: 'Failed to count newly uploaded medias',
                color: 'danger',
            });

            return 0;
        }

        return count;
    }

    return {
        isFetchingGalleryMedias,
        hasFetchedAllRecords,
        medias,
        fetchMedias,
        refreshMedias,
        reset,
        countTotalMedias,
        countUserUploadedMedias,
        getLatestUploadMedia,
        countUploadedMediasWithinPassDays,
    }
})
