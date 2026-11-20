<script setup lang="ts">
import AttendanceNavigation from "@/modules/attendance/components/AttendanceNavigation.vue";
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

type NavItem =
  | {
      type: "link";
      label: string;
      icon: string;
      routeName: string;
      routeParams?: Record<string, string>;
    }
  | {
      type: "attendance";
    };

const navItems = computed<NavItem[]>(() => [
  {
    type: "link",
    label: t("elements.navHome"),
    icon: "home",
    routeName: MasterRouteName.MASTER,
  },
  {
    type: "attendance",
  },
  {
    type: "link",
    label: t("elements.navTranslation"),
    icon: "translate",
    routeName: TranslationRouteName.TRANSLATION,
  },
  {
    type: "link",
    label: t("elements.navGallery"),
    icon: "image",
    routeName: GalleryRouteName.LIST,
  },
  {
    type: "link",
    label: t("elements.navBookmarks"),
    icon: "topic",
    routeName: WebpageBookmarkRouteName.ROOT,
    routeParams: { id: WEB_BOOKMARK_ROOT_DIR_ID },
  },
  {
    type: "link",
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
          <template
            v-for="item in navItems"
            :key="item.type === 'attendance' ? 'attendance' : item.routeName"
          >
            <AttendanceNavigation
              v-if="item.type === 'attendance'"
              @navigate="closeSidebar"
            />
            <h-sidebar-item
              v-else
              @click="navigateTo(item.routeName, item.routeParams)"
              :active="currentRouteName === item.routeName"
            >
              <h-sidebar-item-content>
                <h-icon :name="item.icon" />
                <h-sidebar-item-title>{{ item.label }}</h-sidebar-item-title>
              </h-sidebar-item-content>
            </h-sidebar-item>
          </template>
        </div>
      </h-sidebar>
    </HDrawer>
  </ion-app>
</template>
