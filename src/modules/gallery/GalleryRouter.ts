import type {RouteRecordRaw} from "vue-router";

export enum GalleryRouteName {
    ROOT = 'gallery',
    LIST = 'gallery.list',
    UPLOAD = 'gallery.upload'
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
            component: () => import('@/modules/gallery/pages/GalleryListPage.vue')
        },
        {
            path: 'upload',
            name: GalleryRouteName.UPLOAD,
            component: () => import('@/modules/gallery/pages/GalleryUploadPage.vue')
        }
    ]
}

export default galleryRouter