import { describe, expect, it, vi } from "vitest";
import {
  BackendApiResult,
  isBackendApiErrorContent,
} from "@/ports/backend/BackendPortTypes";

describe("BackendApiResult", () => {
  it("maps and chains success", () => {
    const result = BackendApiResult.ok(2)
      .map((x) => x * 3)
      .flatMap((x) => BackendApiResult.ok(x + 1));
    expect(result.isOk()).toBe(true);
    expect(result.isErr()).toBe(false);
    expect(result.unwrap()).toBe(7);
    expect(result.unwrapOr(0)).toBe(7);
    expect(() => result.unwrapErr()).toThrow();
  });
  it("preserves errors without running callbacks", () => {
    const error = new Error("dummy");
    const callback = vi.fn();
    const result = BackendApiResult.err(error);
    expect(result.map(callback).unwrapErr()).toBe(error);
    expect(result.flatMap(callback).unwrapErr()).toBe(error);
    expect(callback).not.toHaveBeenCalled();
    expect(result.isErr()).toBe(true);
    expect(result.unwrapOr(undefined as never)).toBeUndefined();
    expect(() => result.unwrap()).toThrow();
  });
  it.each([null, undefined, "error", {}, { error: {} }])(
    "rejects malformed error content %j",
    (content) => expect(isBackendApiErrorContent(content)).toBe(false),
  );
  it("recognizes structured error content", () =>
    expect(
      isBackendApiErrorContent({
        error: { code: "dummy", message: "Failed", path: "/test" },
      }),
    ).toBe(true));
});
