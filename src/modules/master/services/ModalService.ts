import { type HNotifications } from "@/libs/ui";

export class ModalService {
  constructor(
    private readonly notifications: Pick<HNotifications, "confirm">,
  ) {}

  confirm(options: string): Promise<boolean> {
    return this.notifications.confirm(options);
  }
}
