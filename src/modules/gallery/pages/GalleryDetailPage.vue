<script setup lang="ts">
import {useRoute} from "vue-router";
import {onMounted} from "vue";
import {useMediaStore} from "@/modules/gallery/stores/MediaStore";
import {computed, ref} from "vue/dist/vue";
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
  mediaSignedUrl.value = await mediaStore.createSignedUrlForMedia(media.value)
})
</script>

<template>
  <h1>Gallery detail {{ route.params.id }}</h1>
</template>

<style scoped>

</style>