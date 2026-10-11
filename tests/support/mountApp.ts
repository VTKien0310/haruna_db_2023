import { getActivePinia } from "pinia";
import { createVuestic } from "vuestic-ui";
import { defineComponent, h } from "vue";

export const SlotStub = defineComponent({
  setup:
    (_, { slots }) =>
    () =>
      h("div", slots.default?.()),
});
export const ModalStub = defineComponent({
  props: { modelValue: Boolean },
  setup:
    (props, { slots }) =>
    () =>
      props.modelValue ? h("section", slots.default?.()) : null,
});

export function appMountOptions() {
  return {
    attachTo: document.body,
    global: {
      plugins: [getActivePinia()!, createVuestic()],
      stubs: { IonPage: SlotStub, VaModal: ModalStub },
    },
  };
}
