import { GalleryListService } from "@/modules/gallery/services/GalleryListService";
import { UploadMediaService } from "@/modules/gallery/services/UploadMediaService";
import { MediaDetailService } from "@/modules/gallery/services/MediaDetailService";
import {supabasePort} from '@/ports/supabase/SupabasePort';
import {
  GalleryStatisticService
} from '@/modules/gallery/services/GalleryStatisticService';
import {
  useModalService,
  useToastService,
} from '@/modules/master/MasterServiceContainer';
import router from '@/router';

const useGalleryListService = () => new GalleryListService(
    supabasePort,
    useToastService(),
);

const useUploadMediaService = () => new UploadMediaService(
    router,
    supabasePort,
    useToastService(),
    useModalService(),
    useGalleryListService(),
);

const useMediaDetailService = () => new MediaDetailService(
    supabasePort,
    useToastService(),
    useModalService(),
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
