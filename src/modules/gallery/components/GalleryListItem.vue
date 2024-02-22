<script setup lang="ts">
import {type Media, MediaTypeEnum} from '@/modules/gallery/GalleryEntities';
import {useMediaStore} from '@/modules/gallery/stores/MediaStore';
import {computed, onMounted, ref} from 'vue';
import router from '@/router';
import {GalleryRouteName} from '@/modules/gallery/GalleryRouter';

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
  <div class="w-full h-full relative">
    <va-image
        v-if="mediaSignedUrlCreated"
        :src="mediaSignedUrl"
        @click="navigateToUploadDetailPage"
        lazy
        fit="cover"
        :ratio="1"
        class="w-full h-full"
    >
      <template #loader>
        <va-skeleton animation="pulse" variant="squared" width="100%" height="100%"/>
      </template>
    </va-image>

    <va-icon
        v-if="media.type === MediaTypeEnum.VIDEO"
        name="videocam"
        class="absolute bottom-1 right-1"
        color="background-element"
    />
  </div>
</template>

<style scoped>
</style>
