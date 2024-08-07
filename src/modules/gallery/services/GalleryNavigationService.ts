import type {Router} from 'vue-router';
import type {UseIonRouterResult} from '@ionic/vue';
import {GalleryRouteName} from '@/modules/gallery/GalleryRouter';
import type {UseSwipeDirection} from '@vueuse/core';

export class GalleryNavigationService {
  constructor(
      private readonly router: Router,
      private readonly ionRouter: UseIonRouterResult,
  ) {}

  navigateToMediaDetailPage(mediaId: string): void {
    this.router.push({
      name: GalleryRouteName.DETAIL,
      params: {
        id: mediaId,
      },
    });
  }

  navigateToAdjacentMedia(
      swipeDirection: UseSwipeDirection,
      prevMediaId: string | null,
      nextMediaId: string | null,
  ): void {
    // navigate backward
    if (swipeDirection === 'right' && prevMediaId) {
      this.ionRouter.replace({
        name: GalleryRouteName.DETAIL,
        params: {
          id: prevMediaId,
        },
      });
      return;
    }

    // navigate forward
    if (swipeDirection === 'left' && nextMediaId) {
      this.ionRouter.replace({
        name: GalleryRouteName.DETAIL,
        params: {
          id: nextMediaId,
        },
      });
      return;
    }
  }
}
