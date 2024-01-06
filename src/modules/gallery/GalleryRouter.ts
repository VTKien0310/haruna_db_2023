import type {RouteRecordRaw} from "vue-router";
import GalleryListPage from "@/modules/gallery/pages/GalleryListPage.vue";

export enum GalleryRouteName {
    ROOT = 'gallery',
    LIST = 'gallery.list',
    UPLOAD = 'gallery.upload',
    DETAIL = 'gallery.detail'
}

const galleryRouter: RouteRecordRaw = {
    path: '/gallery',
    name: GalleryRouteName.ROOT,
    component: () => import('@/modules/gallery/pages/GalleryPage.vue'),
    children: [
        {
            path: '',
            name: GalleryRouteName.LIST,
            alias: 'list',
            component: GalleryListPage
        },
        {
            path: 'upload',
            name: GalleryRouteName.UPLOAD,
            component: () => import('@/modules/gallery/pages/GalleryUploadPage.vue')
        },
        {
            path: 'upload/:id',
            name: GalleryRouteName.DETAIL,
            component: () => import('@/modules/gallery/pages/GalleryDetailPage.vue')
        }
    ]
}

export default galleryRouter