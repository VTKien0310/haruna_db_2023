import {
  AuthenticationService,
} from '@/modules/auth/services/AuthenticationService';
import {ProfileService} from '@/modules/auth/services/ProfileService';
import {supabasePort} from '@/ports/supabase/SupabasePort';
import {useGalleryListService} from '@/modules/gallery/GalleryServiceContainer';
import router from '@/router';
import {useToastService} from '@/modules/master/MasterServiceContainer';

const useProfileService = () => new ProfileService(
    supabasePort,
    useToastService(),
);

const useAuthenticationService = () => new AuthenticationService(
    router,
    supabasePort,
    useToastService(),
    useGalleryListService(),
    useProfileService(),
);

export {
  useProfileService,
  useAuthenticationService,
};
