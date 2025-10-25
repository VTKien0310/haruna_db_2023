<script setup lang="ts">
import { IonPage } from "@ionic/vue";
import WebpageBookmarkDirectory from "@/modules/webpage-bookmark/components/WebpageBookmarkDirectory.vue";
import { useRoute } from "vue-router";
import { onMounted, watch } from "vue";
import { useWebpageBookmarkDetailService } from "@/modules/webpage-bookmark/WebpageBookmarkServiceContainer.ts";
import { useWebpageBookmarkDetailStore } from "@/modules/webpage-bookmark/stores/WebpageBookmarkDetailStore.ts";
import { VaProgressBar } from "vuestic-ui";
import WebpageBookmarkLink from "@/modules/webpage-bookmark/components/WebpageBookmarkLink.vue";

const webpageBookmarkStore = useWebpageBookmarkDetailStore();

const route = useRoute();

const webpageBookmarkDetailService = useWebpageBookmarkDetailService();

watch(
  () => route.params.id,
  (id) => {
    if (!id) {
      return;
    }
    webpageBookmarkDetailService.loadWebpageBookmarkIntoStore(id as string);
  },
  { immediate: true },
);
</script>

<template>
  <ion-page>
    <va-progress-bar
      v-show="webpageBookmarkStore.isFetchingData"
      indeterminate
      style="height: 1%"
    />
    <WebpageBookmarkDirectory
      v-if="webpageBookmarkStore.currentIsDirectory"
      style="height: 99%"
    />
    <WebpageBookmarkLink
      v-if="!webpageBookmarkStore.currentIsDirectory"
      style="height: 99%"
    />
  </ion-page>
</template>

<style scoped></style>
