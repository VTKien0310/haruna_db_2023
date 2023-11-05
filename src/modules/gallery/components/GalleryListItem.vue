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
      fit="cover"
      :ratio="1"
      class="w-full h-full"
  >
    <template #loader>
      <VaSkeleton animation="pulse" variant="squared" width="100%" height="100%"/>
    </template>
  </va-image>
</template>

<style scoped>
</style>