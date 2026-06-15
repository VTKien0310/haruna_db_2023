import { ToastService } from "@/modules/master/services/ToastService";
import { ModalService } from "@/modules/master/services/ModalService";
import { MasterNavigationService } from "@/modules/master/services/MasterNavigationService";
import { PwaUpdateService } from "@/modules/master/services/PwaUpdateService";
import router from "@/router";

const useToastService = () => new ToastService();

const useModalService = () => new ModalService();

const useMasterNavigationService = () => new MasterNavigationService(router);

const usePwaUpdateService = () => new PwaUpdateService();

export {
  useToastService,
  useModalService,
  useMasterNavigationService,
  usePwaUpdateService,
};
