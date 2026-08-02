import { AuthenticationService } from "@/modules/auth/services/AuthenticationService";
import { ProfileService } from "@/modules/auth/services/ProfileService";
import { backendPort } from "@/ports/backend/BackendPort";
import { useGalleryListService } from "@/modules/gallery/GalleryServiceContainer";
import router from "@/router";
import { useToastService } from "@/modules/master/MasterServiceContainer";
import { useTranslationService } from "@/modules/translation/TranslationServiceContainer";

const useProfileService = () =>
  new ProfileService(backendPort, useToastService());

const useAuthenticationService = () =>
  new AuthenticationService(
    router,
    backendPort,
    useToastService(),
    useGalleryListService(),
    useProfileService(),
    useTranslationService(),
  );

export { useProfileService, useAuthenticationService };
