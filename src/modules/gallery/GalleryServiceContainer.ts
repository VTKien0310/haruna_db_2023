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
import {
  GalleryNavigationService
} from '@/modules/gallery/services/GalleryNavigationService';

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
    router,
    supabasePort,
    useToastService(),
    useModalService(),
    useGalleryListService(),
);

const useGalleryStatisticService = () => new GalleryStatisticService(
    supabasePort,
    useToastService(),
);

const useGalleryNavigationService = () => new GalleryNavigationService(
    router,
);

export {
  useGalleryListService,
  useMediaDetailService,
  useUploadMediaService,
  useGalleryStatisticService,
  useGalleryNavigationService
};
