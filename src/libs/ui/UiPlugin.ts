import {
  createVNode,
  inject,
  render,
  shallowRef,
  type InjectionKey,
  type Plugin,
} from "vue";
import HNotificationHost from "./components/HNotificationHost.vue";
import {
  NotificationService,
  type ConfirmationEntry,
  type ToastEntry,
} from "./services/NotificationService";
import type { HNotifications } from "./types/UiTypes";

const NOTIFICATIONS_KEY: InjectionKey<HNotifications> = Symbol(
  "HarunaNotifications",
);
let nextAppId = 0;

export function createHarunaUI(): Plugin {
  return {
    install(app) {
      const idPrefix = `haruna-${++nextAppId}`;
      app.config.idPrefix ||= idPrefix;
      let host: HTMLDivElement | undefined;
      const service = new NotificationService(
        shallowRef<readonly ToastEntry[]>([]),
        shallowRef<readonly ConfirmationEntry[]>([]),
        () => {
          if (host) return;
          host = document.createElement("div");
          host.dataset.harunaNotifications = "";
          document.body.append(host);
          const vnode = createVNode(HNotificationHost, { service });
          vnode.appContext = app._context;
          render(vnode, host);
        },
        idPrefix,
      );
      app.provide(NOTIFICATIONS_KEY, service);
      app.onUnmount(() => {
        service.dispose();
        if (host) {
          render(null, host);
          host.remove();
          host = undefined;
        }
      });
    },
  };
}

/** Dependency lookup only: component reactive state is not returned. */
export function useHarunaUiService(): HNotifications {
  const service = inject(NOTIFICATIONS_KEY);
  if (!service)
    throw new Error(
      "Install createHarunaUI() before using notification services.",
    );
  return service;
}
