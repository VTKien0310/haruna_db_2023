<script setup lang="ts">
import {computed} from "vue";
import {AuthRouteName} from "@/modules/auth/AuthRouter";
import {MasterRouteName} from "@/modules/master/MasterRouter";
import {GalleryRouteName} from "@/modules/gallery/GalleryRouter";
import {useAuthStore} from "@/modules/auth/stores/AuthStore";
import {IonApp, IonRouterOutlet} from '@ionic/vue';
import router from "@/router";

const authStore = useAuthStore()
authStore.registerOnAuthStateChange()

const hideNavBar = computed((): boolean => {
  return router.currentRoute.value.name === AuthRouteName.LOGIN
})
</script>

<template>
  <ion-app>

    <ion-router-outlet/>

    <va-app-bar
        v-if="!hideNavBar"
        bottom
        fixed
        class="flex flex-row justify-around content-center items-center"
    >
      <va-button
          @click="router.push({name: MasterRouteName.MASTER})"
          icon="home"
          color="backgroundPrimary"
          preset="secondary"
      />
      <va-button
          @click="router.push({name: GalleryRouteName.LIST})"
          icon="image"
          color="backgroundPrimary"
          preset="secondary"
      />
      <va-button
          @click="router.push({name: AuthRouteName.PROFILE})"
          icon="person"
          color="backgroundPrimary"
          preset="secondary"
      />
    </va-app-bar>

  </ion-app>
</template>

<style scoped>
</style>
