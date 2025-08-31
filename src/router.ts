import {createRouter, createWebHistory} from '@ionic/vue-router';
import authRouter from "@/modules/auth/AuthRouter";
import masterRouter from "@/modules/master/MasterRouter";
import galleryRouter from "@/modules/gallery/GalleryRouter";
import translationRouter from "@/modules/translation/TranslationRouter";
import webpageBookmarkRouter
  from '@/modules/webpage-bookmark/WebpageBookmarkRouter.ts';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        ...masterRouter,
        ...authRouter,
        ...galleryRouter,
        ...translationRouter,
        ...webpageBookmarkRouter
    ],
})

export default router
