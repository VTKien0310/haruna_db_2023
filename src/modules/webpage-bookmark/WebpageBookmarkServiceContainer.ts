import { CreateWebpageBookmarkService } from "@/modules/webpage-bookmark/services/CreateWebpageBookmarkService.ts";
import { supabasePort } from "@/ports/supabase/SupabasePort.ts";
import {
  useMasterNavigationService,
  useToastService,
} from "@/modules/master/MasterServiceContainer.ts";
import { WebpageBookmarkDetailService } from "@/modules/webpage-bookmark/services/WebpageBookmarkDetailService.ts";
import { ListWebpageBookmarkService } from "@/modules/webpage-bookmark/services/ListWebpageBookmarkService.ts";

const useCreateWebpageBookmarkService = () =>
  new CreateWebpageBookmarkService(supabasePort, useToastService());

const useListWebpageBookmarkService = () =>
  new ListWebpageBookmarkService(supabasePort, useToastService());

const useWebpageBookmarkDetailService = () =>
  new WebpageBookmarkDetailService(
    supabasePort,
    useToastService(),
    useMasterNavigationService(),
    useListWebpageBookmarkService(),
  );

export { useCreateWebpageBookmarkService, useWebpageBookmarkDetailService };
