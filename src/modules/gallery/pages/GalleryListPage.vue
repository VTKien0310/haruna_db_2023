<script setup lang="ts">
import GalleryToUploadPageButton from "@/modules/gallery/components/GalleryToUploadPageButton.vue";
import { useGalleryListStore } from "@/modules/gallery/stores/GalleryListStore";
import { onMounted, ref } from "vue";
import { IonPage } from "@ionic/vue";
import { useGalleryListService } from "@/modules/gallery/GalleryServiceContainer";
import GalleryGridItem from "@/modules/gallery/components/GalleryGridItem.vue";
import GalleryListItem from "@/modules/gallery/components/GalleryListItem.vue";
import {
  type ButtonOption,
  VaButtonToggle,
  VaProgressCircle,
} from "vuestic-ui";

const viewModeOptions: ButtonOption[] = [
  { value: "grid", icon: "grid_view" },
  { value: "list", icon: "splitscreen" },
];

type ViewMode = "grid" | "list";

const currentViewMode = ref<ViewMode>("grid");

const galleryListService = useGalleryListService();

const galleryListStore = useGalleryListStore();

const galleryListPageContent = ref<HTMLDivElement | null>(null);

const loadMoreMedias = (event: Event): void => {
  const target = event.currentTarget as HTMLDivElement | null;

  if (!target) {
    return;
  }

  const { scrollTop, clientHeight, scrollHeight } = target;

  if (scrollTop + clientHeight >= scrollHeight * 0.85) {
    galleryListService.fetchMedias();
  }
};

onMounted(() => {
  galleryListService.refreshMedias();
});
</script>

<template>
  <ion-page>
    <div class="m-1 flex flex-row content-center items-center justify-end">
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
      class="invisible-scroll-bar h-screen overflow-scroll"
    >
      <!-- grid view -->
      <div
        v-show="currentViewMode === 'grid'"
        class="grid grid-cols-4 place-content-center place-items-center gap-px md:grid-cols-6 lg:grid-cols-10"
      >
        <GalleryGridItem
          v-for="media in galleryListStore.medias"
          :key="media.id"
          :media="media"
        />
      </div>

      <!-- list view -->
      <div
        v-show="currentViewMode === 'list'"
        class="grid grid-cols-1 place-content-center place-items-center gap-px"
      >
        <GalleryListItem
          v-for="media in galleryListStore.medias"
          :key="media.id"
          :media="media"
        />
      </div>

      <!-- medias fetch progress indicator -->
      <div
        v-show="
          galleryListStore.isFetchingGalleryMedias &&
          !galleryListStore.hasFetchedAllRecords
        "
        class="flex w-full flex-row content-center items-center justify-center"
      >
        <va-progress-circle indeterminate />
      </div>

      <div class="fixed right-3 bottom-12">
        <GalleryToUploadPageButton />
      </div>

      <!-- push the content up so the app bar won't block the view -->
      <div class="h-20"></div>
    </div>
  </ion-page>
</template>

<style scoped></style>
