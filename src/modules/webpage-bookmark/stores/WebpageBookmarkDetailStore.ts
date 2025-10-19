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

    const currentIsDirectory = computed<boolean>(
      (): boolean =>
        webpageBookmark.value?.type === WebpageBookmarkType.DIRECTORY,
    );
    // for the root directory, there will be some unavailable behaviors and data
    const currentIsRoot = computed<boolean>(
      (): boolean => webpageBookmark.value?.id === WEB_BOOKMARK_ROOT_DIR_ID,
    );
    const currentParentId = computed<string>(
      (): string =>
        webpageBookmark.value?.parent_id ?? WEB_BOOKMARK_ROOT_DIR_ID,
    );

    const webpageBookmarkChildren = ref<WebpageBookmark[]>([]);

    const isFetchingData = ref<boolean>(false);
    const triggerIsFetchingData = (): void => {
      isFetchingData.value = !isFetchingData.value;
    };

    return {
      webpageBookmark,
      currentIsDirectory,
      currentIsRoot,
      currentParentId,
      webpageBookmarkChildren,
      isFetchingData,
      triggerIsFetchingData,
    };
  },
);
