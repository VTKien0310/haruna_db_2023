<script setup lang="ts">
import {useAuthStore} from "@/modules/auth/AuthStore";

const authStore = useAuthStore();

function handleLogout() {
  authStore.signOut()
}
</script>

<template>
  <h1>Profile page</h1>
  <va-button @click="handleLogout" color="danger">
    Logout
  </va-button>
</template>

<style scoped>

</style>