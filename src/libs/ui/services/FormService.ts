import { ref, shallowReactive } from "vue";
import type { HFieldHandle, HRule } from "../types/UiTypes";

interface FieldBindings {
  value: () => string;
  rules: () => readonly HRule[];
  disabled: () => boolean;
  update: (value: string) => void;
  control: () => HTMLInputElement | HTMLTextAreaElement | undefined;
}

/** Synchronous validation and native control behavior for one text field. */
export class FieldService implements HFieldHandle {
  private readonly validated = ref(false);
  constructor(private readonly bindings: FieldBindings) {}

  get errors(): string[] {
    const messages: string[] = [];
    if (!this.bindings.disabled()) {
      for (const rule of this.bindings.rules()) {
        const result = rule(this.bindings.value());
        if (result !== true)
          messages.push(
            typeof result === "string" && result.length > 0
              ? result
              : "Invalid value",
          );
      }
    }
    return messages;
  }
  get isValid(): boolean {
    return this.errors.length === 0;
  }
  get visibleErrors(): string[] {
    return this.validated.value ? this.errors : [];
  }
  validate(): boolean {
    this.validated.value = true;
    return this.isValid;
  }
  resetValidation(): void {
    this.validated.value = false;
  }
  reset(): void {
    this.bindings.update("");
    this.resetValidation();
  }
  focus(): void {
    this.bindings.control()?.focus();
  }
  blur(): void {
    this.bindings.control()?.blur();
  }
}

/** Registration order determines focus order; removed fields stop contributing. */
export class FormService {
  private readonly fields = shallowReactive(new Set<FieldService>());

  register(field: FieldService): () => void {
    this.fields.add(field);
    return () => {
      this.fields.delete(field);
    };
  }
  get isValid(): boolean {
    for (const field of this.fields) if (!field.isValid) return false;
    return true;
  }
  validate(): boolean {
    let valid = true;
    for (const field of this.fields) if (!field.validate()) valid = false;
    return valid;
  }
  reset(): void {
    for (const field of this.fields) field.reset();
  }
  resetValidation(): void {
    for (const field of this.fields) field.resetValidation();
  }
  focus(): void {
    this.fields.values().next().value?.focus();
  }
}
