import {
  AuthenticationService,
} from '@/modules/auth/services/AuthenticationService';
import {ProfileService} from '@/modules/auth/services/ProfileService';
import {supabasePort} from '@/ports/supabase/SupabasePort';
import {useGalleryListService} from '@/modules/gallery/GalleryServiceContainer';

const useProfileService = () => new ProfileService(supabasePort);

const useAuthenticationService = () => new AuthenticationService(
    supabasePort,
    useGalleryListService(),
    useProfileService(),
);

export {
  useProfileService,
  useAuthenticationService,
};
