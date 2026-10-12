import { type HNotifications } from "@/libs/ui";

export class ToastService {
  constructor(private readonly notifications: Pick<HNotifications, "toast">) {}

  error(message: string): void {
    this.notifications.toast({
      message: message,
      color: "danger",
    });
  }

  info(message: string): void {
    this.notifications.toast({
      message: message,
      color: "primary",
    });
  }
}
