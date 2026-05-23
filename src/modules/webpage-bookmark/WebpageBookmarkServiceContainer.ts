import { CreateWebpageBookmarkService } from "@/modules/webpage-bookmark/services/CreateWebpageBookmarkService.ts";
import { backendPort } from "@/ports/backend/BackendPort";
import {
  useMasterNavigationService,
  useModalService,
  useToastService,
} from "@/modules/master/MasterServiceContainer.ts";
import { WebpageBookmarkDetailService } from "@/modules/webpage-bookmark/services/WebpageBookmarkDetailService.ts";
import { ListWebpageBookmarkService } from "@/modules/webpage-bookmark/services/ListWebpageBookmarkService.ts";
import { DeleteWebpageBookmarkService } from "@/modules/webpage-bookmark/services/DeleteWebpageBookmarkService.ts";
import router from "@/router";
import { UpdateWebpageBookmarkService } from "@/modules/webpage-bookmark/services/UpdateWebpageBookmarkService.ts";

const useListWebpageBookmarkService = () =>
  new ListWebpageBookmarkService(backendPort, useToastService());

const useCreateWebpageBookmarkService = () =>
  new CreateWebpageBookmarkService(
    backendPort,
    useToastService(),
    useListWebpageBookmarkService(),
  );

const useWebpageBookmarkDetailService = () =>
  new WebpageBookmarkDetailService(
    backendPort,
    useToastService(),
    useMasterNavigationService(),
    useListWebpageBookmarkService(),
  );

const useDeleteWebpageBookmarkService = () =>
  new DeleteWebpageBookmarkService(
    backendPort,
    useToastService(),
    router,
    useModalService(),
    useWebpageBookmarkDetailService(),
  );

const useUpdateWebpageBookmarkService = () =>
  new UpdateWebpageBookmarkService(
    backendPort,
    useToastService(),
    useWebpageBookmarkDetailService(),
  );

export {
  useCreateWebpageBookmarkService,
  useWebpageBookmarkDetailService,
  useDeleteWebpageBookmarkService,
  useUpdateWebpageBookmarkService,
  useListWebpageBookmarkService,
};
