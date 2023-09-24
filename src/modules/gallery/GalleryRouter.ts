import type {RouteRecordRaw} from "vue-router";

export enum GalleryRouteName {
    GALLERY = 'gallery'
}

const galleryRouter: RouteRecordRaw = {
    path: '/gallery',
    name: GalleryRouteName.GALLERY,
    component: () => import('@/modules/gallery/pages/GalleryPage.vue')
}

export default galleryRouter