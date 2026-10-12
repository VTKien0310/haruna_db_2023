// Adapted from Vuestic 1.10.3 form context and validation. See ../LICENSE.
import type { Ref, ShallowRef } from "vue";
import type { HRule } from "../types/UiTypes";

export class FieldService {
  constructor(
    private readonly value: () => string,
    private readonly rules: () => readonly HRule[],
    private readonly disabled: () => boolean,
    private readonly touched: Ref<boolean>,
    private readonly setValue: (value: string) => void,
    readonly focus: () => void,
  ) {}

  get errors(): string[] {
    if (this.disabled()) return [];
    return this.rules()
      .map((rule) => rule(this.value()))
      .filter((result) => result !== true)
      .map((result) =>
        typeof result === "string" && result ? result : "Invalid value",
      );
  }

  get isValid(): boolean {
    return this.errors.length === 0;
  }
  get visibleErrors(): string[] {
    return this.touched.value ? this.errors : [];
  }
  validate(): boolean {
    this.touched.value = true;
    return this.isValid;
  }
  resetValidation(): void {
    this.touched.value = false;
  }
  reset(): void {
    this.setValue("");
    this.resetValidation();
  }
}

export class FormService {
  constructor(private readonly fields: ShallowRef<readonly FieldService[]>) {}
  register(field: FieldService): () => void {
    this.fields.value = [...this.fields.value, field];
    return () => {
      this.fields.value = this.fields.value.filter((item) => item !== field);
    };
  }
  get isValid(): boolean {
    return this.fields.value.every((field) => field.isValid);
  }
  validate(): boolean {
    const results = this.fields.value.map((field) => field.validate());
    return results.every(Boolean);
  }
  reset(): void {
    this.fields.value.forEach((field) => field.reset());
  }
  resetValidation(): void {
    this.fields.value.forEach((field) => field.resetValidation());
  }
  focus(): void {
    this.fields.value[0]?.focus();
  }
}
