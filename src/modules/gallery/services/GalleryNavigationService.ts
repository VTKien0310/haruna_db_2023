import type {Router} from 'vue-router';
import {GalleryRouteName} from '@/modules/gallery/GalleryRouter';
import type {UseSwipeDirection} from '@vueuse/core';

export class GalleryNavigationService {
  constructor(
      private readonly router: Router,
  ) {}

  navigateToMediaDetailPage(mediaId: string): void {
    this.router.push(this.mediaDetailRoute(mediaId));
  }

  navigateToAdjacentMedia(
      swipeDirection: UseSwipeDirection,
      prevMediaId: string | null,
      nextMediaId: string | null,
  ): void {
    // navigate backward
    if (swipeDirection === 'right' && prevMediaId) {
      this.router.replace(this.mediaDetailRoute(prevMediaId));
      return;
    }

    // navigate forward
    if (swipeDirection === 'left' && nextMediaId) {
      this.router.replace(this.mediaDetailRoute(nextMediaId));
      return;
    }
  }

  private mediaDetailRoute(mediaId: string) {
    return {
      name: GalleryRouteName.DETAIL,
      query: {
        file: mediaId,
      },
    };
  }
}
