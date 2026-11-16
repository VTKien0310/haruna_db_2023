<script setup lang="ts">
import { useWebpageBookmarkDetailStore } from "@/modules/webpage-bookmark/stores/WebpageBookmarkDetailStore.ts";
import { t } from "@/modules/webpage-bookmark/locales";

const webpageBookmarkDetailStore = useWebpageBookmarkDetailStore();
</script>

<template>
  <div
    class="flex w-full flex-row content-center items-center justify-between pt-3 pr-1 pb-1 pl-4"
  >
    <p class="overflow-hidden text-ellipsis whitespace-nowrap">
      {{
        webpageBookmarkDetailStore.isFetchingData
          ? t("elements.fetchingData")
          : webpageBookmarkDetailStore.webpageBookmarkHeaderTitle
      }}
    </p>
  </div>
</template>

<style scoped></style>
