import {type ModalOptions, useModal} from 'vuestic-ui';

export class ModalService {
  private readonly confirmModal: (options: string | ModalOptions) => Promise<boolean>;

  constructor() {
    this.confirmModal = useModal().confirm;
  }

  confirm(options: string): Promise<boolean> {
    return this.confirmModal(options);
  }
}
