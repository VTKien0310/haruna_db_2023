<script setup lang="ts">
import {useAuthStore} from "@/modules/auth/stores/AuthStore";
import {computed, onMounted, reactive, ref} from "vue";
import type {ProfileDetail} from "@/modules/auth/AuthTypes";

const authStore = useAuthStore();

const profileFormContent = reactive<ProfileDetail>({
  name: '',
  password: ''
})

function reloadProfileFormContent(): void {
  profileFormContent.name = authStore.profile?.name ?? ''
  profileFormContent.password = ''
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
  authStore.updateCurrentUserProfile(profileFormContent).then(() => {
    reloadProfileFormContent()
    isUpdatingProfile.value = false
  })
}

function handleLogout() {
  authStore.signOut()
}

onMounted(() => {
  reloadProfileFormContent()
})
</script>

<template>
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
            placeholder="Minimum length of 8 characters"
            class="mt-2 w-full"
        />

        <va-button
            :disabled="!enableUpdateProfileButton"
            :loading="isUpdatingProfile"
            preset="secondary"
            border-color="primary"
            type="submit"
            class="mt-6 w-full"
        >
          Update
        </va-button>

      </va-form>

      <va-button class="w-full" @click="handleLogout" color="danger">
        Logout
      </va-button>

    </div>
  </div>
</template>

<style scoped>

</style>