import type { RouteRecordRaw } from "vue-router";

export enum AuthRouteName {
  PROFILE = "auth.profile",
  LOGIN = "auth.login",
  FORGOT_PASSWORD = "auth.forgot-password",
  RESET_PASSWORD = "auth.reset-password",
}

const authRouter: RouteRecordRaw[] = [
  {
    path: "/auth",
    name: AuthRouteName.PROFILE,
    component: () => import("@/modules/auth/pages/AuthProfilePage.vue"),
  },
  {
    path: "/auth/login",
    name: AuthRouteName.LOGIN,
    component: () => import("@/modules/auth/pages/AuthLoginPage.vue"),
  },
  {
    path: "/auth/forgot-password",
    name: AuthRouteName.FORGOT_PASSWORD,
    component: () => import("@/modules/auth/pages/AuthForgotPasswordPage.vue"),
  },
  {
    path: "/auth/reset-password",
    name: AuthRouteName.RESET_PASSWORD,
    component: () => import("@/modules/auth/pages/AuthResetPasswordPage.vue"),
  },
];

export default authRouter;
