import { ToastService } from "@/modules/master/services/ToastService";
import { ModalService } from "@/modules/master/services/ModalService";
import { MasterNavigationService } from "@/modules/master/services/MasterNavigationService";
import { PwaUpdateService } from "@/modules/master/services/PwaUpdateService";
import router from "@/router";
import { useHarunaUiService } from "@/libs/ui";

const useToastService = () => new ToastService(useHarunaUiService());

const useModalService = () => new ModalService(useHarunaUiService());

const useMasterNavigationService = () => new MasterNavigationService(router);

const usePwaUpdateService = () => new PwaUpdateService();

export {
  useToastService,
  useModalService,
  useMasterNavigationService,
  usePwaUpdateService,
};
