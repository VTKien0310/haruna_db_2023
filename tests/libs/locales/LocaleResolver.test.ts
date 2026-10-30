import { describe, expect, it } from "vitest";
import {
  createLocaleResolver,
  type LocaleKeyOf,
  type SameLocaleShape,
} from "@/libs/locales/LocaleResolver";

const en = {
  messages: {
    greeting: "Hello",
    deletedWith: "Deleted {name} successfully",
    uploadedWith: "Uploaded {count} file(s) by {name}",
  },
  elements: {
    saveButton: "Save",
  },
};

const ja = {
  messages: {
    greeting: "こんにちは",
    deletedWith: "{name} を削除しました",
    uploadedWith: "{name} が {count} 件をアップロードしました",
  },
  elements: {
    saveButton: "保存",
  },
} as const satisfies SameLocaleShape<typeof en>;

const locales = { en, ja };
const t = createLocaleResolver<LocaleKeyOf<typeof en>, keyof typeof locales>(
  locales,
  "en",
);

describe("createLocaleResolver", () => {
  it("resolves dot-path keys across sections", () => {
    expect(t("messages.greeting")).toBe("Hello");
    expect(t("elements.saveButton")).toBe("Save");
  });

  it("interpolates params after resolving the path", () => {
    expect(t("messages.deletedWith", { name: "report.pdf" })).toBe(
      "Deleted report.pdf successfully",
    );
    expect(t("messages.uploadedWith", { count: 3, name: "Kim" })).toBe(
      "Uploaded 3 file(s) by Kim",
    );
  });

  it("resolves a non-default locale", () => {
    expect(t("messages.greeting", {}, "ja")).toBe("こんにちは");
    expect(t("messages.deletedWith", { name: "x" }, "ja")).toBe(
      "x を削除しました",
    );
  });

  it("returns the key itself for unresolvable paths", () => {
    expect(t("messages.missing" as LocaleKeyOf<typeof en>)).toBe(
      "messages.missing",
    );
  });
});
