import {type ToastOptions, useToast} from 'vuestic-ui';

export class ToastService {
  private readonly toastInit: (options: (string | ToastOptions)) => (string | null);

  constructor() {
    this.toastInit = useToast().init;
  }

  error(message: string): void {
    this.toastInit({
      message: message,
      color: 'danger',
    });
  }
}
