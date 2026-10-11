import { describe, expect, it, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { VaForm, VaInput } from "vuestic-ui";
import WebpageBookmarkDirectoryForm from "@/modules/webpage-bookmark/components/WebpageBookmarkDirectoryForm.vue";
import { CreateWebpageBookmarkService } from "@/modules/webpage-bookmark/services/CreateWebpageBookmarkService";
import { ListWebpageBookmarkService } from "@/modules/webpage-bookmark/services/ListWebpageBookmarkService";
import { useWebpageBookmarkDetailStore } from "@/modules/webpage-bookmark/stores/WebpageBookmarkDetailStore";
import { makeVirtualWebBookmarkRootDirectory } from "@/modules/webpage-bookmark/WebpageBookmarkEntities";
import { appMountOptions } from "../../../support/mountApp";
import { makeBackendFake, queryResult } from "../../../fakes/BackendFake";
import { makeToast } from "../../../fakes/Collaborators";
import { makeBookmark } from "../../../factories/Records";

describe("WebpageBookmarkDirectoryForm", () => {
  it.each(["", "x".repeat(31)])(
    "rejects invalid directory name %j",
    async (name) => {
      const submit = vi.fn(async () => true);
      const wrapper = mount(WebpageBookmarkDirectoryForm, {
        ...appMountOptions(),
        props: {
          initialFormData: { name: "", description: "" },
          onSubmit: submit,
          resetFormOnSubmitSuccess: true,
        },
      });
      await wrapper.get("button").trigger("click");
      await flushPromises();
      await wrapper.getComponent(VaInput).get("input").setValue(name);
      expect(await wrapper.getComponent(VaForm).vm.validate()).toBe(false);
      expect(submit).not.toHaveBeenCalled();
    },
  );

  it("creates a directory through real services and refreshes the store", async () => {
    const backend = makeBackendFake();
    const toast = makeToast();
    const list = new ListWebpageBookmarkService(backend.port, toast.service);
    const service = new CreateWebpageBookmarkService(
      backend.port,
      toast.service,
      list,
    );
    const store = useWebpageBookmarkDetailStore();
    store.webpageBookmark = makeVirtualWebBookmarkRootDirectory("user-1");
    const insert = backend.query(queryResult());
    backend.query(queryResult([makeBookmark({ name: "New directory" })]));
    const wrapper = mount(WebpageBookmarkDirectoryForm, {
      ...appMountOptions(),
      props: {
        initialFormData: { name: "", description: "" },
        onSubmit: service.createDirectory.bind(service),
        resetFormOnSubmitSuccess: true,
      },
    });
    await wrapper.get("button").trigger("click");
    await flushPromises();
    await wrapper.getComponent(VaInput).get("input").setValue("New directory");
    await wrapper.getComponent(VaForm).vm.validate();
    await flushPromises();
    await wrapper
      .findAll("button")
      .find((button) => button.text() === "Submit")!
      .trigger("click");
    await flushPromises();
    expect(insert.insert).toHaveBeenCalledWith({
      name: "New directory",
      description: "",
      url: "",
      type: 0,
      root_id: null,
      parent_id: null,
      level: 1,
    });
    expect(store.webpageBookmarkChildren[0].name).toBe("New directory");
    expect(store.isFetchingData).toBe(false);
  });
});
