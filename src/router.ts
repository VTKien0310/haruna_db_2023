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
    // scrollBehavior(to, from, savedPosition) {
    //     if (savedPosition) {
    //         return savedPosition
    //     } else {
    //         return { left: 0, top: 0}
    //     }
    // },
})

export default router
