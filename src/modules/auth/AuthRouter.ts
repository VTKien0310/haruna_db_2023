import type {RouteRecordRaw} from "vue-router";

export enum AuthRouteName {
    PROFILE = 'auth.profile',
    LOGIN = 'auth.login'
}

const authRouter: RouteRecordRaw[] = [
    {
        path: '/auth',
        name: AuthRouteName.PROFILE,
        component: () => import('@/modules/auth/pages/AuthProfilePage.vue')
    },
    {
        path: '/auth/login',
        name: AuthRouteName.LOGIN,
        component: () => import('@/modules/auth/pages/AuthLoginPage.vue')
    }
]

export default authRouter