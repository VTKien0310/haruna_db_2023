<script setup lang="ts">
import {useRoute} from "vue-router";
import {computed, onMounted, ref} from "vue";
import {useMediaStore} from "@/modules/gallery/stores/MediaStore";
import type {Media} from "@/modules/gallery/GalleryEntities";

const media = ref<Media | null>(null)
const mediaSignedUrl = ref<string>('')
const mediaSignedUrlCreated = computed((): boolean => {
  return mediaSignedUrl.value != ''
})

const route = useRoute();

const mediaStore = useMediaStore();

onMounted(async () => {
  media.value = await mediaStore.getMediaById(route.params.id)
  mediaSignedUrl.value = await mediaStore.createFullSizeViewUrlForMedia(media.value!)
})
</script>

<template>
  <div
      :style="{ 'background-image': 'url('+mediaSignedUrl+')' }"
      class="h-screen bg-center bg-contain bg-scroll bg-no-repeat"
  >
  </div>
</template>

<style scoped>

</style>