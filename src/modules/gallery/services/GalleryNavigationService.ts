import type {Router} from 'vue-router';
import {GalleryRouteName} from '@/modules/gallery/GalleryRouter';

export class GalleryNavigationService {
  constructor(
      private readonly router: Router,
  ) {}

  navigateToMediaDetailPage(mediaId: string): void {
    this.router.push(this.mediaDetailRoute(mediaId));
  }

  replaceMediaDetailPage(mediaId: string): void {
    this.router.replace(this.mediaDetailRoute(mediaId));
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
