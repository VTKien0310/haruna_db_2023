<script setup lang="ts">
import { IonPage } from "@ionic/vue";
import WebpageBookmarkDirectory from "@/modules/webpage-bookmark/components/WebpageBookmarkDirectory.vue";
import { useRoute } from "vue-router";
import { onMounted, watch } from "vue";
import { useWebpageBookmarkDetailService } from "@/modules/webpage-bookmark/WebpageBookmarkServiceContainer.ts";
import { useWebpageBookmarkDetailStore } from "@/modules/webpage-bookmark/stores/WebpageBookmarkDetailStore.ts";
import { VaProgressBar } from "vuestic-ui";

const webpageBookmarkStore = useWebpageBookmarkDetailStore();

const route = useRoute();

const webpageBookmarkDetailService = useWebpageBookmarkDetailService();

watch(
  () => route.params.id,
  (id) => {
    webpageBookmarkDetailService.loadWebpageBookmark(id as string);
  },
);

onMounted(() => {
  webpageBookmarkDetailService.loadWebpageBookmark(route.params.id as string);
});
</script>

<template>
  <ion-page>
    <va-progress-bar v-if="webpageBookmarkStore.isFetchingData" indeterminate />
    <WebpageBookmarkDirectory
      v-if="
        !webpageBookmarkStore.isFetchingData &&
        webpageBookmarkStore.currentRecordIsDirectory
      "
    />
  </ion-page>
</template>

<style scoped></style>
