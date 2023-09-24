import {createRouter, createWebHistory} from 'vue-router'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'master',
            component: () => import('@/modules/master/MasterModule.vue')
        },
        {
            path: '/auth',
            name: 'auth',
            component: () => import('@/modules/auth/AuthModule.vue'),
            children: [
                {
                    path: '',
                    name: 'profile',
                    alias: 'profile',
                    component: () => import('@/modules/auth/pages/ProfilePage.vue')
                },
                {
                    path: 'login',
                    name: 'login',
                    component: () => import('@/modules/auth/pages/LoginPage.vue')
                }
            ]
        },
        {
            path: '/gallery',
            name: 'gallery',
            component: () => import('@/modules/gallery/pages/GalleryPage.vue')
        }
    ]
})

export default router
