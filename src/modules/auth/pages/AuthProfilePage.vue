<script setup lang="ts">
import {useAuthStore} from "@/modules/auth/stores/AuthStore";
import {computed, onMounted, reactive, ref} from "vue";
import type {ProfileDetail} from "@/modules/auth/AuthTypes";
import {IonPage} from "@ionic/vue";
import {useUploadMediaService} from "@/modules/gallery/GalleryServiceContainer";
import {useAuthenticationService, useProfileService} from '@/modules/auth/AuthServiceContainer';

const authenticationService = useAuthenticationService();
const profileService = useProfileService();
const authStore = useAuthStore();

const profileFormContent = reactive<ProfileDetail>({
  name: '',
  password: ''
})

function reloadProfileFormContent(): void {
  profileService.refreshCurrentUserProfile().then(() => {
    profileFormContent.name = authStore.profile?.name ?? ''
    profileFormContent.password = ''
  })
}

const isUpdatingProfile = ref<boolean>(false);

const enableUpdateProfileButton = computed((): boolean => {
  const nameHasBeenUpdated: boolean = (profileFormContent.name && profileFormContent.name.length > 0) as boolean
      && (profileFormContent.name !== authStore.profile?.name);

  const passwordHasBeenInput: boolean = (profileFormContent.password && profileFormContent.password.length >= 8) as boolean;

  return (nameHasBeenUpdated || passwordHasBeenInput) && !isUpdatingProfile.value;
});

function handleUpdateProfile() {
  isUpdatingProfile.value = true
  profileService.updateCurrentUserProfile(profileFormContent).then(() => {
    reloadProfileFormContent()
    isUpdatingProfile.value = false
  })
}

const uploadMediaService = useUploadMediaService();

const handleLogout = async () => {
  uploadMediaService.reset()
  await authenticationService.signOut();
}

onMounted(() => {
  reloadProfileFormContent()
})
</script>

<template>
  <ion-page>
    <div class="w-full min-h-screen p-3 flex flex-col justify-start sm:justify-center items-center content-center">
      <div class="w-full sm:w-1/2 md:w-1/3 lg:w-1/5 xl:w-1/5">

        <va-form
            @submit.prevent="handleUpdateProfile"
            ref="profileForm"
            tag="form"
            class="w-full mb-2 flex flex-col justify-center items-center content-center"
        >

          <va-input
              v-model="profileFormContent.name"
              label="Name"
              name="name"
              class="w-full"
          />

          <va-input
              v-model="profileFormContent.password"
              label="Password"
              name="password"
              type="password"
              placeholder="Minimum length of 8 characters"
              class="mt-2 w-full"
          />

          <div class="w-full mt-6 flex flex-row justify-between">

            <va-button
                :disabled="!enableUpdateProfileButton"
                :loading="isUpdatingProfile"
                icon="save"
                type="submit"
                class="w-full mr-1"
            />

            <va-button
                @click="reloadProfileFormContent"
                icon="replay"
                preset="secondary"
                border-color="primary"
                class="w-full ml-1"
            />

          </div>

        </va-form>

        <va-button @click="handleLogout" icon="logout" class="w-full" color="danger"/>

      </div>
    </div>
  </ion-page>
</template>

<style scoped>

</style>
