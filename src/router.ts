import {createRouter, createWebHistory} from '@ionic/vue-router';
import authRouter from "@/modules/auth/AuthRouter";
import masterRouter from "@/modules/master/MasterRouter";
import galleryRouter from "@/modules/gallery/GalleryRouter";
import financeRouter from "@/modules/finance/FinanceRouter";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        ...masterRouter,
        ...authRouter,
        ...galleryRouter,
        ...financeRouter,
    ],
})

export default router
