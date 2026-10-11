import { vi } from "vitest";
import type { ToastService } from "@/modules/master/services/ToastService";
import type { ModalService } from "@/modules/master/services/ModalService";
import { createMemoryHistory, createRouter } from "vue-router";

export function makeToast() {
  const fake = {
    error: vi.fn<(message: string) => void>(),
    info: vi.fn<(message: string) => void>(),
  };
  return { ...fake, service: fake as unknown as ToastService };
}
export function makeModal() {
  const fake = {
    confirm: vi
      .fn<(message: string) => Promise<boolean>>()
      .mockResolvedValue(false),
  };
  return { ...fake, service: fake as unknown as ModalService };
}
export function makeRouter() {
  const router = createRouter({ history: createMemoryHistory(), routes: [] });
  vi.spyOn(router, "push").mockResolvedValue();
  vi.spyOn(router, "replace").mockResolvedValue();
  return router;
}
