import { describe, expect, it } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { defineComponent, ref } from "vue";
import { HForm, HInput, HTextarea } from "@/libs/ui";
import { appMountOptions } from "../../support/mountApp";

describe("HForm and fields", () => {
  const Form = defineComponent({
    components: { HForm, HInput, HTextarea },
    setup() {
      return { name: ref(""), description: ref(""), show: ref(true) };
    },
    template: `<HForm><HInput v-if="show" v-model="name" label="Name" name="name" :rules="[(value) => !!value || 'Required', (value) => value.length <= 5 || 'Too long']" /><HTextarea v-model="description" label="Description" /></HForm>`,
  });
  it("tracks validity, displays errors on blur and clears values on reset", async () => {
    const wrapper = mount(Form, appMountOptions());
    const form = wrapper.getComponent(HForm);
    const input = wrapper.get("input");
    expect(form.vm.isValid).toBe(false);
    expect(wrapper.find('[role="alert"]').exists()).toBe(false);
    await input.trigger("blur");
    expect(wrapper.get('[role="alert"]').text()).toBe("Required");
    expect(input.attributes("aria-invalid")).toBe("true");
    expect(wrapper.get("label").attributes("for")).toBe(input.attributes("id"));
    await input.setValue("Valid");
    await wrapper.get("textarea").setValue("Description");
    expect(form.vm.isValid).toBe(true);
    expect(form.vm.validate()).toBe(true);
    await input.setValue("Too long");
    expect(form.vm.validate()).toBe(false);
    await flushPromises();
    expect(wrapper.text()).toContain("Too long");
    form.vm.resetValidation();
    await flushPromises();
    expect(wrapper.find('[role="alert"]').exists()).toBe(false);
    form.vm.reset();
    await flushPromises();
    expect((input.element as HTMLInputElement).value).toBe("");
    expect((wrapper.get("textarea").element as HTMLTextAreaElement).value).toBe(
      "",
    );
  });
  it("unregisters removed fields and focuses the first remaining field", async () => {
    const wrapper = mount(Form, appMountOptions());
    wrapper.vm.show = false;
    await flushPromises();
    const form = wrapper.getComponent(HForm);
    expect(form.vm.isValid).toBe(true);
    form.vm.focus();
    expect(document.activeElement).toBe(wrapper.get("textarea").element);
  });
  it("keeps instances independent and forwards native input attributes and events", async () => {
    const wrapper = mount(
      defineComponent({
        components: { HInput },
        template:
          '<div><HInput model-value="" label="First" autocomplete="email" :maxlength="10" /><HInput model-value="" label="Second" /></div>',
      }),
      appMountOptions(),
    );
    const [first, second] = wrapper.findAllComponents(HInput);
    expect(first.get("input").attributes("id")).not.toBe(
      second.get("input").attributes("id"),
    );
    expect(first.get("input").attributes("autocomplete")).toBe("email");
    expect(first.get("input").attributes("maxlength")).toBe("10");
    first.vm.focus();
    expect(document.activeElement).toBe(first.get("input").element);
    await first.get("input").setValue("hello");
    expect(first.emitted("update:modelValue")).toEqual([["hello"]]);
    expect((second.get("input").element as HTMLInputElement).value).toBe("");
  });
  it("renders readonly/disabled/loading states and textarea row constraints", async () => {
    const wrapper = mount(HTextarea, {
      ...appMountOptions(),
      props: {
        modelValue: "Hello",
        readonly: true,
        disabled: true,
        loading: true,
        counter: true,
        minRows: 5,
        maxRows: 5,
        resize: false,
      },
    });
    const textarea = wrapper.get("textarea");
    expect(textarea.attributes("readonly")).toBeDefined();
    expect(textarea.attributes("disabled")).toBeDefined();
    expect(textarea.attributes("rows")).toBe("5");
    expect((textarea.element as HTMLTextAreaElement).style.resize).toBe("none");
    expect(wrapper.find('[role="progressbar"]').exists()).toBe(true);
    expect(wrapper.get('[role="progressbar"]').attributes("aria-label")).toBe(
      "Loading",
    );
    expect(wrapper.get("[aria-busy]").attributes("aria-busy")).toBe("true");
    expect(wrapper.text()).toContain("5");
    await wrapper.setProps({ loading: false });
    expect(wrapper.find('[role="progressbar"]').exists()).toBe(false);
    expect(wrapper.get("[aria-busy]").attributes("aria-busy")).toBe("false");
    expect((textarea.element as HTMLTextAreaElement).value).toBe("Hello");
    expect(textarea.attributes("readonly")).toBeDefined();
    expect(wrapper.text()).toContain("5");
  });
});
