import { GalleryListService } from "@/modules/gallery/services/GalleryListService";
import { UploadMediaService } from "@/modules/gallery/services/UploadMediaService";
import { MediaDetailService } from "@/modules/gallery/services/MediaDetailService";
import {supabasePort} from '@/ports/supabase/SupabasePort';
import {
  GalleryStatisticService
} from '@/modules/gallery/services/GalleryStatisticService';

const useGalleryListService = () => new GalleryListService(supabasePort);

const useUploadMediaService = () => new UploadMediaService(
    supabasePort,
    useGalleryListService(),
);

const useMediaDetailService = () => new MediaDetailService(
    supabasePort,
    useGalleryListService(),
);

const useGalleryStatisticService = () => new GalleryStatisticService(
    supabasePort,
);

export {
  useGalleryListService,
  useMediaDetailService,
  useUploadMediaService,
  useGalleryStatisticService,
};
