import { GalleryListService } from "@/modules/gallery/services/GalleryListService";

export class GalleryServiceContainer {
  galleryListService(): GalleryListService {
    return new GalleryListService();
  }
}

const galleryServiceContainer: GalleryServiceContainer =
  new GalleryServiceContainer();

export default galleryServiceContainer;
