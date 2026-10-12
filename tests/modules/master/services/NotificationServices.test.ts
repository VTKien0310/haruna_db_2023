import { describe, expect, it, vi } from "vitest";
import { ToastService } from "@/modules/master/services/ToastService";
import { ModalService } from "@/modules/master/services/ModalService";

const ui = vi.hoisted(() => ({
  init: vi.fn(),
  confirm: vi.fn(async () => true),
}));
describe("Notification services", () => {
  it("uses theme colors for errors and information", () => {
    const service = new ToastService({ toast: ui.init });
    service.error("Failed");
    service.info("Done");
    expect(ui.init).toHaveBeenNthCalledWith(1, {
      message: "Failed",
      color: "danger",
    });
    expect(ui.init).toHaveBeenNthCalledWith(2, {
      message: "Done",
      color: "primary",
    });
  });
  it("returns confirmation without opening a real dialog", async () => {
    expect(
      await new ModalService({ confirm: ui.confirm }).confirm("Proceed?"),
    ).toBe(true);
    expect(ui.confirm).toHaveBeenCalledWith("Proceed?");
  });
});
