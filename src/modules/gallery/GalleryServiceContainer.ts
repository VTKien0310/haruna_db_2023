import { GalleryListService } from "@/modules/gallery/services/GalleryListService";
import { UploadMediaService } from "@/modules/gallery/services/UploadMediaService";

export class GalleryServiceContainer {
  galleryListService(): GalleryListService {
    return new GalleryListService();
  }

  uploadMediaService(): UploadMediaService {
    return new UploadMediaService(
      this.galleryListService(),
    );
  }
}

const galleryServiceContainer = new GalleryServiceContainer();

export default galleryServiceContainer;
