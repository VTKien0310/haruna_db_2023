import type { RouteRecordRaw } from "vue-router";

export enum WebpageBookmarkRouteName {
  ROOT = "webpage-bookmark.root",
}

const webpageBookmarkRouter: RouteRecordRaw[] = [
  {
    name: WebpageBookmarkRouteName.ROOT,
    path: "/webpage-bookmark/:id",
    component: () =>
      import("@/modules/webpage-bookmark/pages/WebpageBookmarkRootPage.vue"),
  },
];

export default webpageBookmarkRouter;
