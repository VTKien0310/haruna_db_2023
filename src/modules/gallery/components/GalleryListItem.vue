<script setup lang="ts">
import {type Media, MediaTypeEnum} from '@/modules/gallery/GalleryEntities';
import {computed, onMounted, ref} from 'vue';
import {useMediaDetailService} from '@/modules/gallery/GalleryServiceContainer';

const props = defineProps<{
  media: Media
}>();

const mediaThumbnailSignedUrl = ref<string>('');
const mediaThumbnailSignedUrlCreated = computed((): boolean => {
  return mediaThumbnailSignedUrl.value != '';
});

const mediaDetailService = useMediaDetailService();

const mediaIsVideo = computed((): boolean => props.media.type === MediaTypeEnum.VIDEO);

onMounted(() => {
  mediaDetailService.createThumbnailUrlForMedia(props.media, false).then((signedUrl: string) => {
    mediaThumbnailSignedUrl.value = signedUrl;
  });
});
</script>

<template>
  <div @click="mediaDetailService.navigateToMediaDetailPage(media.id)" class="relative">

    <img
        v-if="mediaThumbnailSignedUrlCreated"
        :src="mediaThumbnailSignedUrl"
        alt="Uploaded media"
        class="max-w-full max-h-screen m-auto"
    >

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
