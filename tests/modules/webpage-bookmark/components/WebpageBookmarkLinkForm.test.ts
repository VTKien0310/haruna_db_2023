import { describe, expect, it, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { HForm, HInput } from "@/libs/ui";
import WebpageBookmarkLinkForm from "@/modules/webpage-bookmark/components/WebpageBookmarkLinkForm.vue";
import { appMountOptions } from "../../../support/mountApp";

describe("WebpageBookmarkLinkForm", () => {
  const initialFormData = { name: "", url: "", description: "" };
  it.each([
    ["", "https://example.test", false],
    ["x".repeat(31), "https://example.test", false],
    ["Docs", "invalid", false],
    ["Docs", "https://example.test", true],
  ])(
    "validates name=%s url=%s with real Haruna controls",
    async (name, url, valid) => {
      const submit = vi.fn(async () => true);
      const wrapper = mount(WebpageBookmarkLinkForm, {
        ...appMountOptions(),
        props: {
          initialFormData,
          onSubmit: submit,
          resetFormOnSubmitSuccess: true,
        },
      });
      await wrapper.get("button").trigger("click");
      await flushPromises();
      const inputs = wrapper.findAllComponents(HInput);
      await inputs[0].get("input").setValue(name);
      await inputs[1].get("input").setValue(url);
      expect(await wrapper.getComponent(HForm).vm.validate()).toBe(valid);
      await flushPromises();
      if (!valid) {
        expect(submit).not.toHaveBeenCalled();
        return;
      }
      await wrapper
        .findAll("button")
        .find((button) => button.text() === "Submit")!
        .trigger("click");
      await flushPromises();
      expect(submit).toHaveBeenCalledOnce();
      await wrapper.get("button").trigger("click");
      await flushPromises();
      expect(
        (
          wrapper.findAllComponents(HInput)[0].get("input")
            .element as HTMLInputElement
        ).value,
      ).toBe("");
    },
  );
  it("preserves data after unsuccessful submission", async () => {
    const wrapper = mount(WebpageBookmarkLinkForm, {
      ...appMountOptions(),
      props: {
        initialFormData: {
          name: "Docs",
          url: "https://example.test",
          description: "",
        },
        onSubmit: vi.fn(async () => false),
        resetFormOnSubmitSuccess: true,
      },
    });
    await wrapper.get("button").trigger("click");
    await flushPromises();
    await wrapper.findAllComponents(HInput)[0].get("input").setValue("Edited");
    await wrapper.getComponent(HForm).vm.validate();
    await flushPromises();
    await wrapper
      .findAll("button")
      .find((button) => button.text() === "Submit")!
      .trigger("click");
    await flushPromises();
    await wrapper.get("button").trigger("click");
    await flushPromises();
    expect(
      (
        wrapper.findAllComponents(HInput)[0].get("input")
          .element as HTMLInputElement
      ).value,
    ).toBe("Edited");
  });
});
