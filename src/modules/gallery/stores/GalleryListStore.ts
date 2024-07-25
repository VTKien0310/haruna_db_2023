import {defineStore} from "pinia";
import {ref} from "vue";
import {type Media} from "@/modules/gallery/GalleryEntities";
import {supabasePort} from "@/ports/supabase/SupabasePort";
import {useToast} from "vuestic-ui";
import type {User} from '@supabase/supabase-js';
import dayjs from "dayjs";

export const useGalleryListStore = defineStore('gallery-list', () => {
    const isFetchingGalleryMedias = ref<boolean>(false);

    const medias = ref<Media[]>([]);
    const offset = ref<number>(0);
    const hasFetchedAllRecords = ref<boolean>(false);

    const {init} = useToast()

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
        offset,
        countTotalMedias,
        countUserUploadedMedias,
        getLatestUploadMedia,
        countUploadedMediasWithinPassDays,
    }
})
