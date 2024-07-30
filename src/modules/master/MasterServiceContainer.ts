import {ToastService} from '@/modules/master/services/ToastService';
import {ModalService} from '@/modules/master/services/ModalService';

const useToastService = () => new ToastService();

const useModalService = () => new ModalService();

export {
  useToastService,
  useModalService,
};
