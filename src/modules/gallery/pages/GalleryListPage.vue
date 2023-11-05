<script setup lang="ts">

import GalleryToUploadPageButton from "@/modules/gallery/components/GalleryToUploadPageButton.vue";
import {useGalleryListStore} from "@/modules/gallery/stores/GalleryListStore";
import {onMounted} from "vue";
import GalleryListItem from "@/modules/gallery/components/GalleryListItem.vue";

const galleryListStore = useGalleryListStore();

onMounted(() => {
  galleryListStore.refreshMedias()
})
</script>

<template>
  <div class="min-h-screen">

    <div class="max-h-screen overflow-hidden">
      <va-infinite-scroll :load="galleryListStore.fetchMedias">
        <div class="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-20 gap-px place-content-center place-items-center">
          <GalleryListItem
              v-for="media in galleryListStore.medias"
              :key="media.id"
              :media="media"
          />
        </div>
      </va-infinite-scroll>
    </div>

    <div class="fixed bottom-12 right-3">
      <GalleryToUploadPageButton/>
    </div>
  </div>
</template>

<style scoped>

</style>