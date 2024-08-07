import type {RouteRecordRaw} from 'vue-router';

export enum GalleryRouteName {
  LIST = 'gallery.list',
  UPLOAD = 'gallery.upload',
  DETAIL = 'gallery.detail'
}

const galleryRouter: RouteRecordRaw[] = [
  {
    path: '/gallery',
    name: GalleryRouteName.LIST,
    component: () => import('@/modules/gallery/pages/GalleryListPage.vue'),
  },
  {
    path: '/gallery/upload',
    name: GalleryRouteName.UPLOAD,
    component: () => import('@/modules/gallery/pages/GalleryUploadPage.vue'),
  },
  {
    path: '/gallery/view',
    name: GalleryRouteName.DETAIL,
    component: () => import('@/modules/gallery/pages/GalleryDetailPage.vue'),
  },
];

export default galleryRouter;
