<script setup lang="ts">

import GalleryToUploadPageButton from "@/modules/gallery/components/GalleryToUploadPageButton.vue";
import {useGalleryListStore} from "@/modules/gallery/stores/GalleryListStore";
import {onMounted, ref} from 'vue';
import {IonPage} from "@ionic/vue";
import {useGalleryListService} from "@/modules/gallery/GalleryServiceContainer";
import GalleryGridItem from '@/modules/gallery/components/GalleryGridItem.vue';
import GalleryListItem from '@/modules/gallery/components/GalleryListItem.vue';
import type {ButtonOption} from 'vuestic-ui';

const viewModeOptions: ButtonOption[] = [
  {value: 'grid', icon: 'grid_view'},
  {value: 'list', icon: 'splitscreen'},
];

type ViewMode = 'grid' | 'list';

const currentViewMode = ref<ViewMode>('grid');

const galleryListService = useGalleryListService();

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
  if (scrollTop + clientHeight >= scrollHeight * 0.85) {
    galleryListService.fetchMedias()
  }
}

onMounted(() => {
  galleryListService.refreshMedias()
})
</script>

<template>
  <ion-page>

    <div class="flex flex-row justify-end items-center content-center m-1">
      <!-- view mode selection -->
      <va-button-toggle
          v-model="currentViewMode"
          :options="viewModeOptions"
          preset="secondary"
          border-color="primary"
      />
    </div>

    <div
        @scroll="loadMoreMedias"
        ref="galleryListPageContent"
        class="h-screen overflow-scroll invisible-scroll-bar"
    >

      <!-- grid view -->
      <div v-show="currentViewMode === 'grid'"
           class="grid gap-px place-content-center place-items-center grid-cols-4 md:grid-cols-6 lg:grid-cols-10"
      >
        <GalleryGridItem
            v-for="media in galleryListStore.medias"
            :key="media.id"
            :media="media"
        />
      </div>

      <!-- list view -->
      <div v-show="currentViewMode === 'list'"
           class="grid gap-px place-content-center place-items-center grid-cols-1"
      >
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
