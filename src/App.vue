<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from "vue";
import { AuthRouteName } from "@/modules/auth/AuthRouter";
import { MasterRouteName } from "@/modules/master/MasterRouter";
import { GalleryRouteName } from "@/modules/gallery/GalleryRouter";
import { IonApp, IonRouterOutlet } from "@ionic/vue";
import router from "@/router";
import { TranslationRouteName } from "@/modules/translation/TranslationRouter";
import { useAuthenticationService } from "@/modules/auth/AuthServiceContainer";
import {
  HIcon,
  HDrawer,
  HSidebar,
  HSidebarItem,
  HSidebarItemContent,
  HSidebarItemTitle,
} from "@/libs/ui";
import { WebpageBookmarkRouteName } from "@/modules/webpage-bookmark/WebpageBookmarkRouter";
import { WEB_BOOKMARK_ROOT_DIR_ID } from "@/modules/webpage-bookmark/WebpageBookmarkEntities.ts";
import AppTopBar from "@/modules/master/components/AppTopBar.vue";
import PwaUpdateNotification from "@/modules/master/components/PwaUpdateNotification.vue";
import { usePwaUpdateService } from "@/modules/master/MasterServiceContainer";
import { t } from "@/modules/master/locales";

const authenticationService = useAuthenticationService();
authenticationService.registerOnAuthStateChange();

const pwaUpdateService = usePwaUpdateService();
pwaUpdateService.startWatching();

const hideNavBar = computed((): boolean => {
  const routeName = router.currentRoute.value.name;
  return (
    routeName === AuthRouteName.LOGIN ||
    routeName === AuthRouteName.FORGOT_PASSWORD ||
    routeName === AuthRouteName.RESET_PASSWORD
  );
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
watch(() => router.currentRoute.value.fullPath, closeSidebar);

interface NavItem {
  label: string;
  icon: string;
  routeName: string;
  routeParams?: Record<string, string>;
}

const navItems = computed<NavItem[]>(() => [
  {
    label: t("elements.navHome"),
    icon: "home",
    routeName: MasterRouteName.MASTER,
  },
  {
    label: t("elements.navGallery"),
    icon: "image",
    routeName: GalleryRouteName.LIST,
  },
  {
    label: t("elements.navTranslation"),
    icon: "translate",
    routeName: TranslationRouteName.TRANSLATION,
  },
  {
    label: t("elements.navBookmarks"),
    icon: "topic",
    routeName: WebpageBookmarkRouteName.ROOT,
    routeParams: { id: WEB_BOOKMARK_ROOT_DIR_ID },
  },
  {
    label: t("elements.navProfile"),
    icon: "person",
    routeName: AuthRouteName.PROFILE,
  },
]);

onUnmounted((): void => {
  pwaUpdateService.stopWatching();
});
</script>

<template>
  <ion-app>
    <ion-router-outlet
      :class="{ 'mt-(--h-app-header-height)': !hideNavBar }"
      :inert="isSidebarOpen || undefined"
    />

    <AppTopBar
      :visible="!hideNavBar"
      :sidebar-open="isSidebarOpen"
      :inert="isSidebarOpen || undefined"
      @navigate-home="navigateTo(MasterRouteName.MASTER)"
      @toggle-sidebar="isSidebarOpen = !isSidebarOpen"
    />

    <PwaUpdateNotification />

    <HDrawer
      id="app-navigation"
      v-model="isSidebarOpen"
      :top-offset="hideNavBar ? '0' : 'var(--h-app-header-height)'"
    >
      <h-sidebar>
        <div class="flex flex-col gap-1">
          <h-sidebar-item
            v-for="item in navItems"
            :key="item.routeName"
            @click="navigateTo(item.routeName, item.routeParams)"
            :active="currentRouteName === item.routeName"
          >
            <h-sidebar-item-content>
              <h-icon :name="item.icon" />
              <h-sidebar-item-title>{{ item.label }}</h-sidebar-item-title>
            </h-sidebar-item-content>
          </h-sidebar-item>
        </div>
      </h-sidebar>
    </HDrawer>
  </ion-app>
</template>
