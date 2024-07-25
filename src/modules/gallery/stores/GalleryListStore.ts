import {defineStore} from "pinia";
import {ref} from "vue";
import {type Media} from "@/modules/gallery/GalleryEntities";

export const useGalleryListStore = defineStore('gallery-list', () => {
    const isFetchingGalleryMedias = ref<boolean>(false);

    const medias = ref<Media[]>([]);
    const offset = ref<number>(0);
    const hasFetchedAllRecords = ref<boolean>(false);

    return {
        isFetchingGalleryMedias,
        hasFetchedAllRecords,
        medias,
        offset,
    }
})
