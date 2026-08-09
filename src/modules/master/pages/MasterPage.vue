<script setup lang="ts">
import { IonPage, onIonViewDidEnter } from "@ionic/vue";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import type { Media } from "@/modules/gallery/GalleryEntities";
import {
  useGalleryStatisticService,
  useMediaDetailService,
} from "@/modules/gallery/GalleryServiceContainer";
import { useAuthStore } from "@/modules/auth/stores/AuthStore";
import { useProfileService } from "@/modules/auth/AuthServiceContainer";
import { VaCard, VaCardContent, VaCardTitle, VaProgressBar } from "vuestic-ui";
import { useListWebpageBookmarkService } from "@/modules/webpage-bookmark/WebpageBookmarkServiceContainer.ts";
import WebpageBookmarkPieChart from "@/modules/master/components/WebpageBookmarkPieChart.vue";
import { useTranslationService } from "@/modules/translation/TranslationServiceContainer";
import { useTranslationStore } from "@/modules/translation/stores/TranslationStore";
import { TranslationRouteName } from "@/modules/translation/TranslationRouter";

const mediaDetailService = useMediaDetailService();

const totalMediasCount = ref<number>(0);
const uploadedMediasCount = ref<number>(0);
const latestUploadedMedia = ref<Media | null>(null);
const newlyUploadedMedia = ref<number>(0);
const webpageBookmarkLinkCount = ref<number>(0);
const webpageBookmarkDirectoryCount = ref<number>(0);
const deepestLevelWebpageBookmark = ref<number>(0);

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
const translationService = useTranslationService();
const translationStore = useTranslationStore();
const router = useRouter();

const navigateToTranslationHistory = (historyId: string): void => {
  router.push({
    name: TranslationRouteName.TRANSLATION,
    query: { history: historyId },
  });
};
onIonViewDidEnter(async () => {
  isFetchingData.value = true;

  // ensure the current user's profile is loaded in the store
  if (!authStore.profile) {
    await profileService.refreshCurrentUserProfile();
  }

  uploadedMediasCount.value =
    await galleryStatisticService.countUserUploadedMedias(
      authStore.profile!.user_id!,
    );
  totalMediasCount.value = await galleryStatisticService.countTotalMedias();
  latestUploadedMedia.value =
    await galleryStatisticService.getLatestUploadMedia();
  newlyUploadedMedia.value =
    await galleryStatisticService.countUploadedMediasWithinPassDays(7);

  deepestLevelWebpageBookmark.value =
    await listWebpageBookmarkService.getDeepestLevelWebpageBookmark();
  webpageBookmarkLinkCount.value =
    await listWebpageBookmarkService.countWebpageBookmarkLinks();
  webpageBookmarkDirectoryCount.value =
    await listWebpageBookmarkService.countWebpageBookmarkDirectories();

  // cached in the store to avoid refetching every time this page is visited
  if (!translationStore.hasLoadedLatestHistories) {
    await translationService.fetchLatestTranslationHistories();
  }

  isFetchingData.value = false;
});
</script>

<template>
  <ion-page>
    <div
      class="flex h-fit min-h-screen w-full flex-col content-center items-center justify-start overflow-scroll pb-20"
    >
      <va-progress-bar v-if="isFetchingData" class="w-full" indeterminate />

      <div class="w-full px-2 pt-1">
        <div
          class="grid w-full grid-cols-3 place-content-center place-items-center gap-1"
        >
          <va-card
            class="col-span-3 m-1 h-full w-full md:col-span-1"
            color="background-primary"
          >
            <va-card-title>Web bookmark statistics</va-card-title>
            <va-card-content
              class="mt-2 flex w-full flex-col content-center items-center justify-around md:mt-12"
            >
              <div
                class="flex w-1/2 content-center items-center justify-between"
              >
                <span>Link count:</span>
                <span class="font-bold">{{ webpageBookmarkLinkCount }}</span>
              </div>
              <div
                class="flex w-1/2 content-center items-center justify-between"
              >
                <span>Directory count:</span>
                <span class="font-bold">{{
                  webpageBookmarkDirectoryCount
                }}</span>
              </div>
              <div
                class="flex w-1/2 content-center items-center justify-between"
              >
                <span>Deepest level:</span>
                <span class="font-bold">{{ deepestLevelWebpageBookmark }}</span>
              </div>
            </va-card-content>
          </va-card>

          <va-card
            class="col-span-3 m-1 h-full w-full md:col-start-2"
            color="background-primary"
          >
            <va-card-title>Web bookmarks breakdown</va-card-title>
            <va-card-content>
              <WebpageBookmarkPieChart
                :link-count="webpageBookmarkLinkCount"
                :directory-count="webpageBookmarkDirectoryCount"
              />
            </va-card-content>
          </va-card>

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

          <va-card
            class="m-1 h-full w-full md:col-start-1"
            color="background-primary"
          >
            <va-card-title>Uploaded by you count</va-card-title>
            <va-card-content>{{ uploadedMediasCount }}</va-card-content>
          </va-card>

          <va-card
            class="col-span-2 m-1 h-full w-full md:col-start-2"
            color="background-primary"
          >
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

        <va-card class="m-1 w-full" color="background-primary">
          <va-card-title>Latest translations</va-card-title>
          <va-card-content>
            <va-progress-bar
              v-if="translationStore.isFetchingLatestHistories"
              indeterminate
            />

            <div
              v-else-if="
                translationStore.hasLoadedLatestHistories &&
                translationStore.latestHistories.length === 0
              "
              class="text-secondary flex flex-row items-center justify-center p-3"
            >
              No translation history yet
            </div>

            <div v-else class="flex flex-col gap-2">
              <div
                v-for="record in translationStore.latestHistories"
                :key="record.id"
                @click="navigateToTranslationHistory(record.id)"
                class="border-background-border bg-background-secondary hover:bg-background-element flex cursor-pointer flex-col gap-1 rounded border p-3 transition-colors"
              >
                <span class="text-primary text-sm font-bold">
                  {{ record.source_language }} → {{ record.target_language }}
                </span>
                <span class="text-text-primary truncate">
                  {{ record.source_text }}
                </span>
                <span class="text-secondary truncate">
                  {{ record.translation }}
                </span>
              </div>
            </div>
          </va-card-content>
        </va-card>
      </div>
    </div>
  </ion-page>
</template>

<style scoped></style>
