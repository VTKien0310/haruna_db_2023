<script setup lang="ts">
import { type Media, MediaTypeEnum } from "@/modules/gallery/GalleryEntities";
import { computed, onMounted, ref } from "vue";
import {
  useGalleryNavigationService,
  useMediaDetailService,
} from "@/modules/gallery/GalleryServiceContainer";
import { HIcon } from "@/libs/ui";
import { t } from "@/modules/gallery/locales";

const props = defineProps<{
  media: Media;
}>();

const mediaThumbnailSignedUrl = ref<string>("");
const mediaThumbnailSignedUrlCreated = computed((): boolean => {
  return mediaThumbnailSignedUrl.value != "";
});

const mediaDetailService = useMediaDetailService();
const galleryNavigationService = useGalleryNavigationService();

const mediaIsVideo = computed(
  (): boolean => props.media.type === MediaTypeEnum.VIDEO,
);

onMounted(() => {
  mediaDetailService
    .createThumbnailUrlForMedia(props.media, false)
    .then((signedUrl: string) => {
      mediaThumbnailSignedUrl.value = signedUrl;
    });
});
</script>

<template>
  <div
    @click="galleryNavigationService.navigateToMediaDetailPage(media.id)"
    class="relative"
  >
    <img
      v-if="mediaThumbnailSignedUrlCreated"
      :src="mediaThumbnailSignedUrl"
      :alt="t('uploadedMediaAlt')"
      class="m-auto max-h-screen max-w-full"
    />

    <h-icon
      v-if="mediaIsVideo"
      name="videocam"
      class="absolute right-1 bottom-1"
      color="backgroundElement"
    />
  </div>
</template>

<style scoped></style>
