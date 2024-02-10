<script setup lang="ts">
import {IonPage, onIonViewDidEnter} from '@ionic/vue';
import {useGalleryListStore} from '@/modules/gallery/stores/GalleryListStore';
import {useAuthStore} from '@/modules/auth/stores/AuthStore';
import {computed, ref} from 'vue';
import type {Media} from "@/modules/gallery/GalleryEntities";
import {useMediaStore} from "@/modules/gallery/stores/MediaStore";

const galleryListStore = useGalleryListStore();
const mediaStore = useMediaStore();
const authStore = useAuthStore();

const totalMediasCount = ref<number>(0);
const uploadedMediasCount = ref<number>(0);
const latestUploadedMedia = ref<Media | null>(null)

const uploadContributionPercentage = computed(() => {
  // create a filling up animation instead of a draining down for the progress bar
  if (uploadedMediasCount.value === 0 || totalMediasCount.value === 0) {
    return 0;
  }

  return Math.round((uploadedMediasCount.value * 100) / totalMediasCount.value);
});

onIonViewDidEnter(async () => {
  const me = await authStore.me();

  uploadedMediasCount.value = await galleryListStore.countUserUploadedMedias(me!);
  totalMediasCount.value = await galleryListStore.countTotalMedias();
  latestUploadedMedia.value = await galleryListStore.getLatestUploadMedia()
});
</script>

<template>
  <ion-page>
    <div class="w-full min-h-screen flex flex-col justify-start items-center content-center">

      <div class="w-full">
        <div class="grid grid-cols-2 gap-px place-content-center place-items-center">

          <va-card class="w-full">
            <va-card-title>Latest media uploaded at</va-card-title>
            <va-card-content>
              {{ latestUploadedMedia ? mediaStore.transformMediaCreatedAtToReadableFormat(latestUploadedMedia) : '' }}
            </va-card-content>
          </va-card>

          <va-card class="w-full">
            <va-card-title>Newly uploaded count</va-card-title>
            <va-card-content>10</va-card-content>
          </va-card>

          <va-card class="w-full">
            <va-card-title>Total media count</va-card-title>
            <va-card-content>{{ totalMediasCount }}</va-card-content>
          </va-card>

          <va-card class="w-full">
            <va-card-title>Uploaded by you count</va-card-title>
            <va-card-content>{{ uploadedMediasCount }}</va-card-content>
          </va-card>

        </div>
      </div>

      <va-card square class="w-full">
        <va-card-title>Upload contribution percentage</va-card-title>
        <va-card-content>
          <va-progress-bar
              :model-value="uploadContributionPercentage"
              :max="100"
              size="large"
              content-inside
              show-percent
          >
            {{ uploadContributionPercentage }}
          </va-progress-bar>
        </va-card-content>
      </va-card>

    </div>
  </ion-page>
</template>

<style scoped>

</style>
