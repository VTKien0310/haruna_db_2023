<script setup lang="ts">
import {type Media, MediaTypeEnum} from '@/modules/gallery/GalleryEntities';
import {computed, onMounted, ref} from 'vue';
import {useGalleryNavigationService, useMediaDetailService} from '@/modules/gallery/GalleryServiceContainer';

const props = defineProps<{
  media: Media
}>()

const mediaThumbnailSignedUrl = ref<string>('')
const mediaThumbnailSignedUrlCreated = computed((): boolean => {
  return mediaThumbnailSignedUrl.value != ''
})

const mediaDetailService = useMediaDetailService();
const galleryNavigationService  = useGalleryNavigationService();

const mediaIsVideo = computed((): boolean => props.media.type === MediaTypeEnum.VIDEO)

onMounted(() => {
  mediaDetailService.createThumbnailUrlForMedia(props.media).then((signedUrl: string) => {
    mediaThumbnailSignedUrl.value = signedUrl
  })
})
</script>

<template>
  <div class="w-full h-full relative">
    <va-image
        v-if="mediaThumbnailSignedUrlCreated"
        :src="mediaThumbnailSignedUrl"
        @click="galleryNavigationService.navigateToMediaDetailPage(media.id)"
        fit="cover"
        :ratio="1"
        class="w-full h-full"
    >
      <template #loader>
        <va-skeleton animation="pulse" variant="squared" width="100%" height="100%"/>
      </template>
    </va-image>

    <va-icon
        v-if="mediaIsVideo"
        name="videocam"
        class="absolute bottom-1 right-1"
        color="background-element"
    />
  </div>
</template>

<style scoped>
</style>
