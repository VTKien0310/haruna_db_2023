import {createRouter, createWebHistory} from '@ionic/vue-router';
import authRouter from "@/modules/auth/AuthRouter";
import masterRouter from "@/modules/master/MasterRouter";
import galleryRouter from "@/modules/gallery/GalleryRouter";
import translationRouter from "@/modules/translation/TranslationRouter";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        ...masterRouter,
        ...authRouter,
        ...galleryRouter,
        ...translationRouter
    ],
})

export default router
