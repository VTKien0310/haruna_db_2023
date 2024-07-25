<script setup lang="ts">
import {IonPage, onIonViewDidEnter} from '@ionic/vue';
import {computed, ref} from 'vue';
import type {Media} from "@/modules/gallery/GalleryEntities";
import {useGalleryStatisticService, useMediaDetailService} from '@/modules/gallery/GalleryServiceContainer';
import {useProfileService} from '@/modules/auth/AuthServiceContainer';

const mediaDetailService = useMediaDetailService();
const galleryStatisticService = useGalleryStatisticService();

const profileService = useProfileService();

const totalMediasCount = ref<number>(0);
const uploadedMediasCount = ref<number>(0);
const latestUploadedMedia = ref<Media | null>(null)
const newlyUploadedMedia = ref<number>(0);

const uploadContributionPercentage = computed(() => {
  // create a filling up animation instead of a draining down for the progress bar
  if (uploadedMediasCount.value === 0 || totalMediasCount.value === 0) {
    return 0;
  }

  return Math.round((uploadedMediasCount.value * 100) / totalMediasCount.value);
});

const isFetchingData = ref<boolean>(false);

onIonViewDidEnter(async () => {
  isFetchingData.value = true;

  const me = await profileService.me();

  uploadedMediasCount.value = await galleryStatisticService.countUserUploadedMedias(me!);
  totalMediasCount.value = await galleryStatisticService.countTotalMedias();
  latestUploadedMedia.value = await galleryStatisticService.getLatestUploadMedia();
  newlyUploadedMedia.value = await galleryStatisticService.countUploadedMediasWithinPassDays(7);

  isFetchingData.value = false;
});
</script>

<template>
  <ion-page>
    <div class="w-full min-h-screen flex flex-col justify-start items-center content-center">

      <va-progress-bar v-if="isFetchingData" class="w-full" indeterminate/>

      <div class="w-full px-2 pt-2">
        <div class="w-full grid grid-cols-2 gap-1 place-content-center place-items-center">

          <va-card class="w-full h-full m-1" color="background-primary">
            <va-card-title>Latest media uploaded at</va-card-title>
            <va-card-content>
              {{
                latestUploadedMedia ? mediaDetailService.transformMediaCreatedAtToHumanReadableFormat(latestUploadedMedia) : '--/--/----'
              }}
            </va-card-content>
          </va-card>

          <va-card class="w-full h-full m-1" color="background-primary">
            <va-card-title>Newly uploaded count</va-card-title>
            <va-card-content>{{ newlyUploadedMedia }}</va-card-content>
          </va-card>

          <va-card class="w-full h-full m-1" color="background-primary">
            <va-card-title>Total media count</va-card-title>
            <va-card-content>{{ totalMediasCount }}</va-card-content>
          </va-card>

          <va-card class="w-full h-full m-1" color="background-primary">
            <va-card-title>Uploaded by you count</va-card-title>
            <va-card-content>{{ uploadedMediasCount }}</va-card-content>
          </va-card>

        </div>
      </div>

      <div class="w-full px-2 pt-1">
        <va-card class="w-full h-full" color="background-primary">
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

    </div>
  </ion-page>
</template>

<style scoped>

</style>
