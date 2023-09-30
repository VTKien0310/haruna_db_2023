<script setup lang="ts">
import {RouterView, useRouter} from 'vue-router'
import {computed} from "vue";
import {AuthRouteName} from "@/modules/auth/AuthRouter";
import {MasterRouteName} from "@/modules/master/MasterRouter";
import {GalleryRouteName} from "@/modules/gallery/GalleryRouter";
import {useAuthStore} from "@/modules/auth/AuthStore";

const authStore = useAuthStore()
authStore.registerOnAuthStateChange()

const router = useRouter()
const hideNavBar = computed((): boolean => {
  return router.currentRoute.value.name === AuthRouteName.LOGIN
})
</script>

<template>
  <keep-alive>
    <router-view/>
  </keep-alive>
  <va-app-bar
      v-if="!hideNavBar"
      bottom
      fixed
      class="flex flex-row justify-around content-center items-center"
  >
    <router-link :to="{name: MasterRouteName.MASTER}">
      <va-button
          icon="home"
          color="backgroundPrimary"
          preset="secondary"
      />
    </router-link>
    <router-link :to="{name: GalleryRouteName.GALLERY}">
      <va-button
          icon="image"
          color="backgroundPrimary"
          preset="secondary"
      />
    </router-link>
    <router-link :to="{name: AuthRouteName.PROFILE}">
      <va-button
          icon="person"
          color="backgroundPrimary"
          preset="secondary"
      />
    </router-link>
  </va-app-bar>
</template>

<style scoped>
</style>
