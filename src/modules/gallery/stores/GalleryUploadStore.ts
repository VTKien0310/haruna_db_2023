import { defineStore } from "pinia";
import { ref } from "vue";

export const useGalleryUploadStore = defineStore("gallery-upload", () => {
  const pendingNewMediaFiles = ref<File[]>([]);

  const currentProgressUploadedFileCount = ref<number>(0);
  const currentProgressTotalFileCount = ref<number>(0);

  const isImageUploadMode = ref<boolean>(true);

  const isHandlingCreateNewMedia = ref<boolean>(false);

  return {
    pendingNewMediaFiles,
    isHandlingCreateNewMedia,
    isImageUploadMode,
    currentProgressUploadedFileCount,
    currentProgressTotalFileCount,
  };
});
