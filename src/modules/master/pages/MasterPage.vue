<script setup lang="ts">
import { IonPage, onIonViewDidEnter } from "@ionic/vue";
import { computed, ref } from "vue";
import type { Media } from "@/modules/gallery/GalleryEntities";
import {
  useGalleryStatisticService,
  useMediaDetailService,
} from "@/modules/gallery/GalleryServiceContainer";
import { useAuthStore } from "@/modules/auth/stores/AuthStore";
import { useProfileService } from "@/modules/auth/AuthServiceContainer";
import { VaCard, VaCardContent, VaCardTitle, VaProgressBar } from "vuestic-ui";
import { useListWebpageBookmarkService } from "@/modules/webpage-bookmark/WebpageBookmarkServiceContainer.ts";

const mediaDetailService = useMediaDetailService();

const totalMediasCount = ref<number>(0);
const uploadedMediasCount = ref<number>(0);
const latestUploadedMedia = ref<Media | null>(null);
const newlyUploadedMedia = ref<number>(0);

const uploadContributionPercentage = computed(() => {
  // create a filling up animation instead of a draining down for the progress bar
  if (uploadedMediasCount.value === 0 || totalMediasCount.value === 0) {
    return 0;
  }

  return Math.round((uploadedMediasCount.value * 100) / totalMediasCount.value);
});

const isFetchingData = ref<boolean>(false);
const galleryStatisticService = useGalleryStatisticService();
const profileService = useProfileService();
const authStore = useAuthStore();
const listWebpageBookmarkService = useListWebpageBookmarkService();
onIonViewDidEnter(async () => {
  isFetchingData.value = true;

  // ensure the current user's profile is loaded in the store
  if (!authStore.profile) {
    await profileService.refreshCurrentUserProfile();
  }

  uploadedMediasCount.value =
    await galleryStatisticService.countUserUploadedMedias(
      authStore.profile!.user_id,
    );
  totalMediasCount.value = await galleryStatisticService.countTotalMedias();
  latestUploadedMedia.value =
    await galleryStatisticService.getLatestUploadMedia();
  newlyUploadedMedia.value =
    await galleryStatisticService.countUploadedMediasWithinPassDays(7);

  const deepestLevelWebpageBookmark =
    await listWebpageBookmarkService.getDeepestLevelWebpageBookmark();
  const webpageBookmarkLinkCount =
    await listWebpageBookmarkService.countWebpageBookmarkLinks();
  const webpageBookmarkDirectoryCount =
    await listWebpageBookmarkService.countWebpageBookmarkDirectories();

  isFetchingData.value = false;
});
</script>

<template>
  <ion-page>
    <div
      class="flex min-h-screen w-full flex-col content-center items-center justify-start"
    >
      <va-progress-bar v-if="isFetchingData" class="w-full" indeterminate />

      <div class="w-full px-2 pt-2">
        <div
          class="grid w-full grid-cols-2 place-content-center place-items-center gap-1"
        >
          <va-card class="m-1 h-full w-full" color="background-primary">
            <va-card-title>Latest media uploaded at</va-card-title>
            <va-card-content>
              {{
                latestUploadedMedia
                  ? mediaDetailService.transformMediaCreatedAtToHumanReadableFormat(
                      latestUploadedMedia,
                    )
                  : "--/--/----"
              }}
            </va-card-content>
          </va-card>

          <va-card class="m-1 h-full w-full" color="background-primary">
            <va-card-title>Newly uploaded count</va-card-title>
            <va-card-content>{{ newlyUploadedMedia }}</va-card-content>
          </va-card>

          <va-card class="m-1 h-full w-full" color="background-primary">
            <va-card-title>Total media count</va-card-title>
            <va-card-content>{{ totalMediasCount }}</va-card-content>
          </va-card>

          <va-card class="m-1 h-full w-full" color="background-primary">
            <va-card-title>Uploaded by you count</va-card-title>
            <va-card-content>{{ uploadedMediasCount }}</va-card-content>
          </va-card>
        </div>
      </div>

      <div class="w-full px-2 pt-1">
        <va-card class="h-full w-full" color="background-primary">
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

<style scoped></style>
