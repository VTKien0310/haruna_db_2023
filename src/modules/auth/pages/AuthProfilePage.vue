<script setup lang="ts">
import {useAuthStore} from "@/modules/auth/stores/AuthStore";

const authStore = useAuthStore();

function handleLogout() {
  authStore.signOut()
}
</script>

<template>
  <div class="w-full min-h-screen p-3 flex flex-col justify-start sm:justify-center items-center content-center">
    <div class="w-full sm:w-1/2 md:w-1/3 lg:w-1/5 xl:w-1/5">

      <va-form
          ref="loginForm"
          tag="form"
          class="w-full mb-2 flex flex-col justify-center items-center content-center"
      >

        <va-input
            label="Email"
            name="email"
            class="w-full"
        />

        <va-input
            label="Password"
            name="password"
            class="mt-2 w-full"
        />

        <va-button
            type="submit"
            gradient
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