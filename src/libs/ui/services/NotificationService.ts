import type { ShallowRef } from "vue";
import type {
  HModalOptions,
  HNotifications,
  HToastOptions,
} from "../types/UiTypes";
import { statusColor } from "../types/UiTypes";

export interface ToastEntry extends HToastOptions {
  id: string;
}
export interface ConfirmationEntry extends HModalOptions {
  id: string;
  resolve: (confirmed: boolean) => void;
}

/** App-scoped notifications; text is rendered through Vue interpolation only. */
export class NotificationService implements HNotifications {
  private nextId = 0;
  private disposed = false;
  private readonly timers = new Map<string, ReturnType<typeof setTimeout>>();
  constructor(
    readonly toasts: ShallowRef<readonly ToastEntry[]>,
    readonly confirmations: ShallowRef<readonly ConfirmationEntry[]>,
    private readonly ensureHost: () => void,
    private readonly idPrefix: string,
  ) {}
  toast(options: string | HToastOptions): string | null {
    if (this.disposed) return null;
    this.ensureHost();
    const id = `${this.idPrefix}-toast-${++this.nextId}`;
    const normalized =
      typeof options === "string" ? { message: options } : options;
    this.toasts.value = [
      ...this.toasts.value,
      { ...normalized, color: statusColor(normalized.color), id },
    ];
    const duration = normalized.duration ?? 5000;
    if (duration > 0)
      this.timers.set(
        id,
        setTimeout(() => this.dismissToast(id), duration),
      );
    return id;
  }
  dismissToast(id: string): void {
    clearTimeout(this.timers.get(id));
    this.timers.delete(id);
    this.toasts.value = this.toasts.value.filter((toast) => toast.id !== id);
  }
  confirm(options: string | HModalOptions): Promise<boolean> {
    if (this.disposed) return Promise.resolve(false);
    this.ensureHost();
    const normalized =
      typeof options === "string" ? { message: options } : options;
    return new Promise((resolve) => {
      this.confirmations.value = [
        ...this.confirmations.value,
        {
          ...normalized,
          id: `${this.idPrefix}-confirm-${++this.nextId}`,
          resolve,
        },
      ];
    });
  }
  settle(id: string, confirmed: boolean): void {
    const entry = this.confirmations.value.find((item) => item.id === id);
    if (!entry) return;
    this.confirmations.value = this.confirmations.value.filter(
      (item) => item.id !== id,
    );
    entry.resolve(confirmed);
  }
  dispose(): void {
    this.disposed = true;
    this.timers.forEach(clearTimeout);
    this.timers.clear();
    this.toasts.value = [];
    this.confirmations.value.forEach((entry) => entry.resolve(false));
    this.confirmations.value = [];
  }
}
