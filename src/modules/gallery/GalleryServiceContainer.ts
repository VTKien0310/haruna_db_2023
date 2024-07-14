import { GalleryListService } from "@/modules/gallery/services/GalleryListService";
import { UploadMediaService } from "@/modules/gallery/services/UploadMediaService";
import { MediaDetailService } from "@/modules/gallery/services/MediaDetailService";

const useGalleryListService = () => new GalleryListService();

const useUploadMediaService = () =>
  new UploadMediaService(
    useGalleryListService(),
  );

const useMediaDetailService = () =>
  new MediaDetailService(
    useGalleryListService(),
  );

export { useGalleryListService, useMediaDetailService, useUploadMediaService };
