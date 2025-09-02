import { CreateWebpageBookmarkService } from "@/modules/webpage-bookmark/services/CreateWebpageBookmarkService.ts";
import { supabasePort } from "@/ports/supabase/SupabasePort.ts";
import {
  useMasterNavigationService,
  useToastService,
} from "@/modules/master/MasterServiceContainer.ts";
import { WebpageBookmarkDetailService } from "@/modules/webpage-bookmark/services/WebpageBookmarkDetailService.ts";

const useCreateWebpageBookmarkService = () =>
  new CreateWebpageBookmarkService(supabasePort, useToastService());

const useWebpageBookmarkDetailService = () =>
  new WebpageBookmarkDetailService(
    supabasePort,
    useToastService(),
    useMasterNavigationService(),
  );

export { useCreateWebpageBookmarkService, useWebpageBookmarkDetailService };
