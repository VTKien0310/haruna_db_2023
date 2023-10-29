<script setup lang="ts">
import type {Media} from "@/modules/gallery/GalleryEntities";
import {useMediaStore} from "@/modules/gallery/stores/MediaStore";
import {computed, onMounted, ref} from "vue";

const props = defineProps<{
  media: Media
}>()

const mediaSignedUrl = ref<string>('')
const mediaSignedUrlCreated = computed((): boolean => {
  return mediaSignedUrl.value != ''
})

const mediaStore = useMediaStore()

onMounted(() => {
  mediaStore.createSignedUrlForMedia(props.media).then((signedUrl: string) => {
    mediaSignedUrl.value = signedUrl
  })
})
</script>

<template>
  <va-image
      v-if="mediaSignedUrlCreated"
      :src="mediaSignedUrl"
      lazy
      fit="contain"
      class="gallery-list-item w-24 h-24"
  ></va-image>
</template>

<style scoped>
.gallery-list-item {
  background-color: var(--va-background-element);
}
</style>