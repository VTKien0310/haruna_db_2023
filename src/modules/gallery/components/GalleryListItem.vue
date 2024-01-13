<script setup lang="ts">
import type {Media} from "@/modules/gallery/GalleryEntities";
import {useMediaStore} from "@/modules/gallery/stores/MediaStore";
import {computed, onMounted, ref} from "vue";
import router from "@/router";
import {GalleryRouteName} from "@/modules/gallery/GalleryRouter";
import {IonImg} from "@ionic/vue";

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
  <div class="w-full h-full">
    <ion-img
        v-if="mediaSignedUrlCreated"
        :src="mediaSignedUrl"
        @click="navigateToUploadDetailPage"
        class="w-full h-full"
    />

    <div class="flex flex-row justify-center content-center items-center">
      <VaProgressCircle v-if="!mediaSignedUrlCreated" indeterminate/>
    </div>
  </div>

<!--  <va-image-->
<!--      v-if="mediaSignedUrlCreated"-->
<!--      :src="mediaSignedUrl"-->
<!--      @click="navigateToUploadDetailPage"-->
<!--      lazy-->
<!--      fit="cover"-->
<!--      :ratio="1"-->
<!--      class="w-full h-full"-->
<!--  >-->
<!--    <template #loader>-->
<!--      <VaSkeleton animation="pulse" variant="squared" width="100%" height="100%"/>-->
<!--    </template>-->
<!--  </va-image>-->

</template>

<style scoped>
</style>