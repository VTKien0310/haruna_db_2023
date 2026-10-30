<script setup lang="ts">
import { useAuthStore } from "@/modules/auth/stores/AuthStore";
import { computed, onMounted, reactive, ref } from "vue";
import type { ProfileDetail } from "@/modules/auth/AuthTypes";
import { IonPage } from "@ionic/vue";
import { useUploadMediaService } from "@/modules/gallery/GalleryServiceContainer";
import {
  useAuthenticationService,
  useProfileService,
} from "@/modules/auth/AuthServiceContainer";
import { HButton, HForm, HInput } from "@/libs/ui";
import { t } from "@/modules/auth/locales";
import ThemeSelector from "@/modules/master/components/ThemeSelector.vue";

const authenticationService = useAuthenticationService();
const profileService = useProfileService();
const authStore = useAuthStore();

const profileFormContent = reactive<ProfileDetail>({
  name: "",
  password: "",
});

function reloadProfileFormContent(): void {
  profileService.refreshCurrentUserProfile().then(() => {
    profileFormContent.name = authStore.profile?.name ?? "";
    profileFormContent.password = "";
  });
}

const isUpdatingProfile = ref<boolean>(false);

const enableUpdateProfileButton = computed((): boolean => {
  const nameHasBeenUpdated: boolean =
    ((profileFormContent.name &&
      profileFormContent.name.length > 0) as boolean) &&
    profileFormContent.name !== authStore.profile?.name;

  const passwordHasBeenInput: boolean = (profileFormContent.password &&
    profileFormContent.password.length >= 8) as boolean;

  return (
    (nameHasBeenUpdated || passwordHasBeenInput) && !isUpdatingProfile.value
  );
});

function handleUpdateProfile() {
  isUpdatingProfile.value = true;
  profileService.updateCurrentUserProfile(profileFormContent).then(() => {
    reloadProfileFormContent();
    isUpdatingProfile.value = false;
  });
}

const uploadMediaService = useUploadMediaService();

const handleLogout = async () => {
  uploadMediaService.reset();
  await authenticationService.signOut();
};

onMounted(() => {
  reloadProfileFormContent();
});
</script>

<template>
  <ion-page>
    <div
      class="flex h-full w-full flex-col items-center justify-start overflow-y-auto p-4 sm:justify-center"
    >
      <div class="w-full sm:w-1/2 md:w-1/3 lg:w-1/5 xl:w-1/5">
        <h-form
          @submit.prevent="handleUpdateProfile"
          ref="profileForm"
          class="!mb-2 flex w-full flex-col content-center items-center justify-center"
        >
          <h-input
            v-model="profileFormContent.name"
            :label="t('elements.nameLabel')"
            name="name"
            class="w-full"
          />

          <h-input
            v-model="profileFormContent.password"
            :label="t('elements.passwordLabel')"
            name="password"
            type="password"
            :placeholder="t('elements.profilePasswordPlaceholder')"
            class="mt-4 w-full"
          />

          <div class="mt-6 flex w-full flex-row gap-2">
            <h-button
              :disabled="!enableUpdateProfileButton"
              :loading="isUpdatingProfile"
              icon="save"
              type="submit"
              class="min-w-0 flex-1"
            />

            <h-button
              @click="reloadProfileFormContent"
              icon="replay"
              variant="outlined"
              class="min-w-0 flex-1"
            />
          </div>
        </h-form>

        <h-button
          @click="handleLogout"
          icon="logout"
          class="w-full"
          color="danger"
        />
        <ThemeSelector />
      </div>
    </div>
  </ion-page>
</template>

<style scoped></style>
