<script setup lang="ts">
import { computed, onUnmounted, ref } from "vue";
import { AuthRouteName } from "@/modules/auth/AuthRouter";
import { MasterRouteName } from "@/modules/master/MasterRouter";
import { GalleryRouteName } from "@/modules/gallery/GalleryRouter";
import { IonApp, IonRouterOutlet } from "@ionic/vue";
import router from "@/router";
import { TranslationRouteName } from "@/modules/translation/TranslationRouter";
import { useAuthenticationService } from "@/modules/auth/AuthServiceContainer";
import {
  VaIcon,
  VaSidebar,
  VaSidebarItem,
  VaSidebarItemContent,
  VaSidebarItemTitle,
} from "vuestic-ui";
import { WebpageBookmarkRouteName } from "@/modules/webpage-bookmark/WebpageBookmarkRouter";
import { WEB_BOOKMARK_ROOT_DIR_ID } from "@/modules/webpage-bookmark/WebpageBookmarkEntities.ts";
import AppTopBar from "@/modules/master/components/AppTopBar.vue";
import PwaUpdateNotification from "@/modules/master/components/PwaUpdateNotification.vue";
import { usePwaUpdateService } from "@/modules/master/MasterServiceContainer";

const authenticationService = useAuthenticationService();
authenticationService.registerOnAuthStateChange();

const pwaUpdateService = usePwaUpdateService();
pwaUpdateService.startWatching();

const hideNavBar = computed((): boolean => {
  return router.currentRoute.value.name === AuthRouteName.LOGIN;
});

const isSidebarOpen = ref(false);

const closeSidebar = (): void => {
  isSidebarOpen.value = false;
};

const navigateTo = (
  routeName: string,
  params?: Record<string, string>,
): void => {
  params
    ? router.push({ name: routeName, params })
    : router.push({ name: routeName });

  closeSidebar();
};

const currentRouteName = computed(() => router.currentRoute.value.name);

interface NavItem {
  label: string;
  icon: string;
  routeName: string;
  routeParams?: Record<string, string>;
}

const navItems: NavItem[] = [
  { label: "Home", icon: "home", routeName: MasterRouteName.MASTER },
  { label: "Gallery", icon: "image", routeName: GalleryRouteName.LIST },
  {
    label: "Translation",
    icon: "translate",
    routeName: TranslationRouteName.TRANSLATION,
  },
  {
    label: "Bookmarks",
    icon: "topic",
    routeName: WebpageBookmarkRouteName.ROOT,
    routeParams: { id: WEB_BOOKMARK_ROOT_DIR_ID },
  },
  { label: "Profile", icon: "person", routeName: AuthRouteName.PROFILE },
];

onUnmounted((): void => {
  pwaUpdateService.stopWatching();
});
</script>

<template>
  <ion-app>
    <ion-router-outlet :class="{ 'mt-14': !hideNavBar }" />

    <AppTopBar
      :visible="!hideNavBar"
      @toggle-sidebar="isSidebarOpen = !isSidebarOpen"
    />

    <PwaUpdateNotification />

    <Transition name="sidebar-fade">
      <div
        v-if="isSidebarOpen"
        class="fixed inset-0 z-50 flex"
        @click.self="closeSidebar"
      >
        <div class="h-full w-full bg-black/50" @click="closeSidebar" />
        <va-sidebar
          class="absolute top-0 left-0 h-full"
          color="backgroundElement"
        >
          <div class="flex flex-col gap-1 p-2">
            <va-sidebar-item
              v-for="item in navItems"
              :key="item.routeName"
              @click="navigateTo(item.routeName, item.routeParams)"
              :active="currentRouteName === item.routeName"
            >
              <va-sidebar-item-content>
                <va-icon :name="item.icon" />
                <va-sidebar-item-title>{{ item.label }}</va-sidebar-item-title>
              </va-sidebar-item-content>
            </va-sidebar-item>
          </div>
        </va-sidebar>
      </div>
    </Transition>
  </ion-app>
</template>

<style scoped>
.sidebar-fade-enter-active,
.sidebar-fade-leave-active {
  transition: opacity 0.2s ease;
}

.sidebar-fade-enter-from,
.sidebar-fade-leave-to {
  opacity: 0;
}
</style>
