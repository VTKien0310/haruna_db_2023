import {ToastService} from '@/modules/master/services/ToastService';
import {ModalService} from '@/modules/master/services/ModalService';
import {
  MasterNavigationService,
} from '@/modules/master/services/MasterNavigationService';
import router from '@/router';

const useToastService = () => new ToastService();

const useModalService = () => new ModalService();

const useMasterNavigationService = () => new MasterNavigationService(router);

export {
  useToastService,
  useModalService,
  useMasterNavigationService,
};
