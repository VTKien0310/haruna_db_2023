import type {RouteRecordRaw} from "vue-router";

export enum AuthRouteName {
    ROOT = 'auth',
    PROFILE = 'auth.profile',
    LOGIN = 'auth.login'
}

const authRouter: RouteRecordRaw = {
    path: '/auth',
    name: AuthRouteName.ROOT,
    component: () => import('@/modules/auth/pages/AuthPage.vue'),
    children: [
        {
            path: '',
            name: AuthRouteName.PROFILE,
            alias: 'profile',
            component: () => import('@/modules/auth/pages/AuthProfilePage.vue')
        },
        {
            path: 'login',
            name: AuthRouteName.LOGIN,
            component: () => import('@/modules/auth/pages/AuthLoginPage.vue')
        }
    ]
}

export default authRouter