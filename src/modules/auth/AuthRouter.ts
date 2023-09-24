import type {RouteRecordRaw} from "vue-router";

const authRouter: RouteRecordRaw = {
    path: '/auth',
    name: 'auth',
    component: () => import('@/modules/auth/pages/AuthPage.vue'),
    children: [
        {
            path: '',
            name: 'profile',
            alias: 'profile',
            component: () => import('@/modules/auth/pages/AuthProfilePage.vue')
        },
        {
            path: 'login',
            name: 'login',
            component: () => import('@/modules/auth/pages/AuthLoginPage.vue')
        }
    ]
}

export default authRouter