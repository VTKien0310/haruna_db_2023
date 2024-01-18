<script setup lang="ts">

import GalleryToUploadPageButton from "@/modules/gallery/components/GalleryToUploadPageButton.vue";
import {useGalleryListStore} from "@/modules/gallery/stores/GalleryListStore";
import {onMounted, ref} from "vue";
import GalleryListItem from "@/modules/gallery/components/GalleryListItem.vue";
import {IonPage} from "@ionic/vue";

const galleryListStore = useGalleryListStore();

const galleryListPageContent = ref<HTMLDivElement | null>(null);

interface ScrollEventDataType {
  target: {
    scrollTop: number,
    clientHeight: number,
    scrollHeight: number
  }
}

const loadMoreMedias = ({target: {scrollTop, clientHeight, scrollHeight}}: ScrollEventDataType): void => {
  if (scrollTop + clientHeight >= scrollHeight * 0.75) {
    galleryListStore.fetchMedias()
  }
}

onMounted(() => {
  galleryListStore.refreshMedias()
})
</script>

<template>
  <ion-page>
    <div
        @scroll="loadMoreMedias"
        ref="galleryListPageContent"
        class="h-screen overflow-scroll invisible-scroll-bar"
    >

      <div class="grid grid-cols-4 gap-px place-content-center place-items-center">
        <GalleryListItem
            v-for="media in galleryListStore.medias"
            :key="media.id"
            :media="media"
        />
      </div>

      <!-- medias fetch progress indicator -->
      <div
          v-show="galleryListStore.isFetchingGalleryMedias && !galleryListStore.hasFetchedAllRecords"
          class="w-full flex flex-row justify-center content-center items-center"
      >
        <va-progress-circle indeterminate/>
      </div>

      <div class="fixed bottom-12 right-3">
        <GalleryToUploadPageButton/>
      </div>

      <!-- push the content up so the app bar won't block the view -->
      <div class="h-20"></div>

    </div>
  </ion-page>
</template>

<style scoped>

</style>