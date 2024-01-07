<script setup lang="ts">
import type {Media} from "@/modules/gallery/GalleryEntities";
import {useMediaStore} from "@/modules/gallery/stores/MediaStore";
import {computed, onMounted, ref} from "vue";
import router from "@/router";
import {GalleryRouteName} from "@/modules/gallery/GalleryRouter";
import {IonImg, IonThumbnail, IonSkeletonText} from "@ionic/vue";

const props = defineProps<{
  media: Media
}>()

const mediaSignedUrl = ref<string>('')
const mediaSignedUrlCreated = computed((): boolean => {
  return mediaSignedUrl.value != ''
})

const mediaStore = useMediaStore()

const navigateToUploadDetailPage = (): void => {
  router.push({
    name: GalleryRouteName.DETAIL,
    params: {
      id: props.media.id
    }
  })
}

onMounted(() => {
  mediaStore.createThumbnailUrlForMedia(props.media).then((signedUrl: string) => {
    mediaSignedUrl.value = signedUrl
  })
})
</script>

<template>
  <div>
    <ion-thumbnail v-if="!mediaSignedUrlCreated" role="article">
      <ion-skeleton-text :animated="true"></ion-skeleton-text>
    </ion-thumbnail>

    <ion-thumbnail v-if="mediaSignedUrlCreated" @click="navigateToUploadDetailPage" role="article">
      <ion-img :src="mediaSignedUrl"/>
    </ion-thumbnail>
  </div>
</template>

<style scoped>
ion-thumbnail {
  --size: 25vw;
  padding: 1px;
}
</style>