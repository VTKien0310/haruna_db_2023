import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { HPagination, HProgressBar } from "@/libs/ui";
import TranslationPage from "@/modules/translation/pages/TranslationPage.vue";
import { TranslationService } from "@/modules/translation/TranslationService";
import { useTranslationService } from "@/modules/translation/TranslationServiceContainer";
import { useTranslationStore } from "@/modules/translation/stores/TranslationStore";
import { BackendApiResult } from "@/ports/backend/BackendPortTypes";
import { makeBackendFake, queryResult } from "../../../fakes/BackendFake";
import { makeToast } from "../../../fakes/Collaborators";
import { makeHistory } from "../../../factories/Records";
import { appMountOptions } from "../../../support/mountApp";

vi.mock("@/modules/translation/TranslationServiceContainer", () => ({
  useTranslationService: vi.fn(),
}));
vi.mock("@/modules/master/MasterServiceContainer", () => ({
  useToastService: () => ({ info: vi.fn(), error: vi.fn() }),
}));
vi.mock("vue-router", async (original) => ({
  ...(await original<typeof import("vue-router")>()),
  useRoute: () => ({ query: {} }),
}));
vi.mock("@ionic/vue", async () => {
  const { onMounted, defineComponent, h } = await import("vue");
  return {
    IonPage: defineComponent({
      setup:
        (_, { slots }) =>
        () =>
          h("div", slots.default?.()),
    }),
    onIonViewDidEnter: onMounted,
  };
});

describe("TranslationPage workflow", () => {
  let backend: ReturnType<typeof makeBackendFake>;
  beforeEach(() => {
    backend = makeBackendFake();
    const toast = makeToast();
    vi.mocked(useTranslationService).mockReturnValue(
      new TranslationService(backend.port, toast.service),
    );
    backend.get.mockResolvedValue(
      BackendApiResult.ok([
        { code: "ja", name: "Japanese" },
        { code: "en", name: "English" },
      ]),
    );
    backend.query(queryResult([], 0));
  });
  it("renders empty history and disables blank translations", async () => {
    const wrapper = mount(TranslationPage, appMountOptions());
    await flushPromises();
    expect(wrapper.text()).toContain("No translation history yet");
    expect(
      wrapper
        .findAll("button")
        .find((button) => button.text() === "Translate")
        ?.attributes("disabled"),
    ).toBeDefined();
  });
  it("translates, displays history, swaps and resets", async () => {
    const wrapper = mount(TranslationPage, appMountOptions());
    await flushPromises();
    backend.post.mockResolvedValue(
      BackendApiResult.ok({ translated_text: "Hello" }),
    );
    backend.query(queryResult([makeHistory()], 1));
    await wrapper.findAll("textarea")[0].setValue("こんにちは");
    const button = (text: string) =>
      wrapper.findAll("button").find((item) => item.text() === text)!;
    await button("Translate").trigger("click");
    await flushPromises();
    expect(
      (wrapper.findAll("textarea")[1].element as HTMLTextAreaElement).value,
    ).toBe("Hello");
    expect(wrapper.text()).toContain("Japanese → English");
    expect(
      wrapper.get('button[aria-label="Copy translation"]').classes(),
    ).toContain("h-button-icon-only");
    await button("Swap").trigger("click");
    expect(
      (wrapper.findAll("textarea")[0].element as HTMLTextAreaElement).value,
    ).toBe("Hello");
    await button("Reset").trigger("click");
    expect(
      (wrapper.findAll("textarea")[0].element as HTMLTextAreaElement).value,
    ).toBe("");
    expect(
      (wrapper.findAll("textarea")[1].element as HTMLTextAreaElement).value,
    ).toBe("");
    expect(wrapper.find('button[aria-label="Copy translation"]').exists()).toBe(
      false,
    );
  });
  it("selects a history record and shows loading/pagination", async () => {
    const wrapper = mount(TranslationPage, appMountOptions());
    await flushPromises();
    const store = useTranslationStore();
    store.histories = [makeHistory()];
    store.totalHistoriesCount = 12;
    await flushPromises();
    await wrapper
      .findAll(".cursor-pointer")
      .find((item) => item.text().includes("こんにちは"))!
      .trigger("click");
    expect(
      (wrapper.findAll("textarea")[0].element as HTMLTextAreaElement).value,
    ).toBe("こんにちは");
    expect(wrapper.findComponent(HPagination).exists()).toBe(true);
    backend.query(queryResult([], 12));
    wrapper.getComponent(HPagination).vm.$emit("update:modelValue", 2);
    await flushPromises();
    expect(store.currentHistoryPage).toBe(2);
    store.isFetchingHistories = true;
    await flushPromises();
    expect(wrapper.findComponent(HProgressBar).exists()).toBe(true);
  });
});
