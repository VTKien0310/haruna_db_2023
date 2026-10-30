import { defineStore } from "pinia";
import { ref } from "vue";
import { type Media } from "@/modules/gallery/GalleryEntities";

export const useGalleryListStore = defineStore("gallery-list", () => {
  const isFetchingGalleryMedia = ref<boolean>(false);

  const media = ref<Media[]>([]);
  const offset = ref<number>(0);
  const hasFetchedAllRecords = ref<boolean>(false);

  return {
    isFetchingGalleryMedia,
    hasFetchedAllRecords,
    media,
    offset,
  };
});
