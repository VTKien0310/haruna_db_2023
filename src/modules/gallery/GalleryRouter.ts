import type {RouteRecordRaw} from "vue-router";

const galleryRouter: RouteRecordRaw = {
    path: '/gallery',
    name: 'gallery',
    component: () => import('@/modules/gallery/pages/GalleryPage.vue')
}

export default galleryRouter