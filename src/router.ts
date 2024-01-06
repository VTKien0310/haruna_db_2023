import {createRouter, createWebHistory} from 'vue-router'
import authRouter from "@/modules/auth/AuthRouter";
import masterRouter from "@/modules/master/MasterRouter";
import galleryRouter from "@/modules/gallery/GalleryRouter";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        masterRouter,
        authRouter,
        galleryRouter
    ],
    scrollBehavior(to, from, savedPosition) {
        if (to.hash) {
            return {
                el: to.hash,
                behavior: 'smooth',
            }
        }

        if (savedPosition) {
            return savedPosition
        }

        return {top: 0, left: 0}
    },
})

export default router
