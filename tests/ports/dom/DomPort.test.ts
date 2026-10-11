import { describe, expect, it, vi } from "vitest";
import { domPort } from "@/ports/dom/DomPort";

describe("DomPort", () => {
  it("dispatches a download with the requested filename and removes the anchor", () => {
    const create = vi.fn(() => "blob:dummy");
    vi.stubGlobal(
      "URL",
      Object.assign(class extends URL {}, { createObjectURL: create }),
    );
    let filename: string | undefined;
    const listener = (event: MouseEvent) => {
      event.preventDefault();
      filename = (event.target as HTMLAnchorElement).download;
    };
    document.addEventListener("click", listener);
    try {
      const blob = new Blob(["dummy"]);
      domPort.triggerDownloadBlob(blob, "test.txt");
      expect(create).toHaveBeenCalledWith(blob);
      expect(filename).toBe("test.txt");
      expect(document.querySelector("a")).toBeNull();
    } finally {
      document.removeEventListener("click", listener);
    }
  });
});
