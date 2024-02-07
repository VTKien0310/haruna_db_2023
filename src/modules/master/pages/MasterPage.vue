<script setup lang="ts">
import {IonPage, onIonViewDidEnter} from '@ionic/vue';
import {useGalleryListStore} from '@/modules/gallery/stores/GalleryListStore';
import {useAuthStore} from '@/modules/auth/stores/AuthStore';
import {computed, ref} from 'vue';

const galleryListStore = useGalleryListStore();
const authStore = useAuthStore();

const totalMediasCount = ref<number>(0);
const uploadedMediasCount = ref<number>(0);

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
});
</script>

<template>
  <ion-page>
    <div class="w-full min-h-screen flex flex-col justify-start items-center content-center">
      <div class="w-full">
        <h5>Total media count: {{ totalMediasCount }}</h5>
        <h5>Uploaded media count: {{ uploadedMediasCount }}</h5>
      </div>

      <div class="w-full">
        <h5>Upload contribution percentage</h5>
        <va-progress-bar
            :model-value="uploadContributionPercentage"
            :max="100"
            size="large"
            content-inside
            show-percent
        >
          {{ uploadContributionPercentage }}
        </va-progress-bar>
      </div>

    </div>
  </ion-page>
</template>

<style scoped>

</style>
