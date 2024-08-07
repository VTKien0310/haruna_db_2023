import type {Router} from 'vue-router';
import {GalleryRouteName} from '@/modules/gallery/GalleryRouter';
import type {UseSwipeDirection} from '@vueuse/core';

export class GalleryNavigationService {
  constructor(
      private readonly router: Router,
  ) {}

  navigateToMediaDetailPage(mediaId: string): void {
    this.router.push({
      name: GalleryRouteName.DETAIL,
      query: {
        file: mediaId,
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
      this.router.replace({
        name: GalleryRouteName.DETAIL,
        query: {
          file: prevMediaId,
        },
      });
      return;
    }

    // navigate forward
    if (swipeDirection === 'left' && nextMediaId) {
      this.router.replace({
        name: GalleryRouteName.DETAIL,
        query: {
          file: nextMediaId,
        },
      });
      return;
    }
  }
}
