import { AuthenticationService } from "@/modules/auth/services/AuthenticationService";
import { ProfileService } from "@/modules/auth/services/ProfileService";
import { backendPort } from "@/ports/backend/BackendPort";
import { useGalleryListService } from "@/modules/gallery/GalleryServiceContainer";
import router from "@/router";
import { useToastService } from "@/modules/master/MasterServiceContainer";

const useProfileService = () =>
  new ProfileService(backendPort.spbClient, useToastService());

const useAuthenticationService = () =>
  new AuthenticationService(
    router,
    backendPort.spbClient,
    useToastService(),
    useGalleryListService(),
    useProfileService(),
  );

export { useProfileService, useAuthenticationService };
