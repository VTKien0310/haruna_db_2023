import type { RouteRecordRaw } from "vue-router";

export enum MasterRouteName {
  MASTER = "master",
  NOT_FOUND = "not-found",
  BAD_REQUEST = "bad-request",
}

const masterRouter: RouteRecordRaw[] = [
  {
    path: "/",
    name: MasterRouteName.MASTER,
    component: () => import("@/modules/master/pages/MasterPage.vue"),
  },
  {
    path: "/404",
    name: MasterRouteName.NOT_FOUND,
    component: () => import("@/modules/master/pages/NotFoundPage.vue"),
  },
  {
    path: "/400",
    name: MasterRouteName.BAD_REQUEST,
    component: () => import("@/modules/master/pages/BadRequestPage.vue"),
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: {
      name: MasterRouteName.NOT_FOUND,
    },
  },
];

export default masterRouter;
