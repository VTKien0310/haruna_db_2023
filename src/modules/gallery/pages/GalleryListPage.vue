<script setup lang="ts">

import GalleryToUploadPageButton from "@/modules/gallery/components/GalleryToUploadPageButton.vue";
import {useGalleryListStore} from "@/modules/gallery/stores/GalleryListStore";
import {onActivated, onMounted, ref} from "vue";
import GalleryListItem from "@/modules/gallery/components/GalleryListItem.vue";

const galleryListStore = useGalleryListStore();

const galleryListPageContent = ref<HTMLDivElement | null>(null);

const saveGalleryContainerLastScrollPosition = (): void => {
  galleryListStore.galleryContainerScrollPosition = galleryListPageContent.value?.scrollTop ?? 0
}

const restoreGalleryContainerLastScrollPosition = (): void => {
  if (galleryListPageContent.value) {
    galleryListPageContent.value.scrollTop = galleryListStore.galleryContainerScrollPosition;
  }
}

interface ScrollEventDataType {
  target: {
    scrollTop: number,
    clientHeight: number,
    scrollHeight: number
  }
}

const loadMoreMedias = ({target: {scrollTop, clientHeight, scrollHeight}}: ScrollEventDataType) => {
  if (scrollTop + clientHeight >= scrollHeight * 0.75) {
    galleryListStore.fetchMedias()
  }
}

onActivated(() => {
  restoreGalleryContainerLastScrollPosition()
})

onMounted(() => {
  galleryListStore.refreshMedias()
})
</script>

<template>
  <div
      @scroll="loadMoreMedias"
      @scrollend="saveGalleryContainerLastScrollPosition"
      ref="galleryListPageContent"
      class="h-screen overflow-scroll"
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
        v-show="galleryListStore.isFetchingGalleryMedias"
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
</template>

<style scoped>

</style>