import type {RouteRecordRaw} from "vue-router";

export enum AuthRouteName {
    PROFILE = 'profile',
    LOGIN = 'login'
}

const authRouter: RouteRecordRaw = {
    path: '/auth',
    name: 'auth',
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