<script setup lang="ts">
import { type Media, MediaTypeEnum } from "@/modules/gallery/GalleryEntities";
import { computed, onMounted, ref } from "vue";
import {
  useGalleryNavigationService,
  useMediaDetailService,
} from "@/modules/gallery/GalleryServiceContainer";
import { HIcon, HImage, HSkeleton } from "@/libs/ui";

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
    .createThumbnailUrlForMedia(props.media)
    .then((signedUrl: string) => {
      mediaThumbnailSignedUrl.value = signedUrl;
    });
});
</script>

<template>
  <div class="relative h-full w-full">
    <h-image
      v-if="mediaThumbnailSignedUrlCreated"
      :src="mediaThumbnailSignedUrl"
      @click="galleryNavigationService.navigateToMediaDetailPage(media.id)"
      fit="cover"
      :ratio="1"
      class="h-full w-full"
    >
      <template #loader>
        <h-skeleton
          animation="pulse"
          variant="squared"
          width="100%"
          height="100%"
        />
      </template>
    </h-image>

    <h-icon
      v-if="mediaIsVideo"
      name="videocam"
      class="absolute right-1 bottom-1"
      color="backgroundElement"
    />
  </div>
</template>

<style scoped></style>
