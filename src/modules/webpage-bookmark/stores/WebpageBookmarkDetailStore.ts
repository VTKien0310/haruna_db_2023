import { defineStore } from "pinia";
import { computed, ref } from "vue";
import {
  WEB_BOOKMARK_ROOT_DIR_ID,
  type WebpageBookmark,
  WebpageBookmarkType,
} from "@/modules/webpage-bookmark/WebpageBookmarkEntities.ts";

export const useWebpageBookmarkDetailStore = defineStore(
  "webpage-bookmark-detail",
  () => {
    const webpageBookmark = ref<WebpageBookmark | null>(null);

    const currentRecordIsDirectory = computed<boolean>(
      (): boolean =>
        webpageBookmark.value?.type === WebpageBookmarkType.DIRECTORY,
    );
    // for the root directory, there will be some unavailable behaviors and data
    const currentRecordIsRoot = computed<boolean>(
      (): boolean => webpageBookmark.value?.id === WEB_BOOKMARK_ROOT_DIR_ID,
    );

    const isFetchingData = ref<boolean>(false);
    const triggerIsFetchingData = (): void => {
      isFetchingData.value = !isFetchingData.value;
    };

    return {
      webpageBookmark,
      currentRecordIsDirectory,
      currentRecordIsRoot,
      isFetchingData,
      triggerIsFetchingData,
    };
  },
);
