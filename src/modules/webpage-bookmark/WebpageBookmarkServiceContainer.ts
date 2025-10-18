import { CreateWebpageBookmarkService } from "@/modules/webpage-bookmark/services/CreateWebpageBookmarkService.ts";
import { supabasePort } from "@/ports/supabase/SupabasePort.ts";
import {
  useMasterNavigationService,
  useModalService,
  useToastService,
} from "@/modules/master/MasterServiceContainer.ts";
import { WebpageBookmarkDetailService } from "@/modules/webpage-bookmark/services/WebpageBookmarkDetailService.ts";
import { ListWebpageBookmarkService } from "@/modules/webpage-bookmark/services/ListWebpageBookmarkService.ts";
import { DeleteWebpageBookmarkService } from "@/modules/webpage-bookmark/services/DeleteWebpageBookmarkService.ts";
import router from "@/router";

const useListWebpageBookmarkService = () =>
  new ListWebpageBookmarkService(supabasePort, useToastService());

const useCreateWebpageBookmarkService = () =>
  new CreateWebpageBookmarkService(
    supabasePort,
    useToastService(),
    useListWebpageBookmarkService(),
  );

const useWebpageBookmarkDetailService = () =>
  new WebpageBookmarkDetailService(
    supabasePort,
    useToastService(),
    useMasterNavigationService(),
    useListWebpageBookmarkService(),
  );

const useDeleteWebpageBookmarkService = () =>
  new DeleteWebpageBookmarkService(
    supabasePort,
    useToastService(),
    router,
    useModalService(),
  );

export {
  useCreateWebpageBookmarkService,
  useWebpageBookmarkDetailService,
  useDeleteWebpageBookmarkService,
};
