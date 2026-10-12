import type { InjectionKey } from "vue";
import type { FormService } from "../services/FormService";

export type HSize = "small" | "medium" | "large";
export type HColor =
  | "primary"
  | "secondary"
  | "success"
  | "info"
  | "danger"
  | "warning"
  | "brandAmber"
  | "brandCyan"
  | "selection"
  | "controlBorder"
  | "backgroundPrimary"
  | "backgroundSecondary"
  | "backgroundElement"
  | "backgroundBorder"
  | "textPrimary"
  | "textInverted"
  | "shadow"
  | "focus";
export type HRule = (value: string) => boolean | string;
export interface HInputProps {
  modelValue?: string;
  label?: string;
  name?: string;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  loading?: boolean;
  rules?: HRule[];
  background?: HColor;
  counter?: boolean;
}
export interface HTextareaProps extends HInputProps {
  minRows?: number;
  maxRows?: number;
  resize?: boolean;
}
export interface HFormHandle {
  readonly isValid: boolean;
  validate(): boolean;
  reset(): void;
  resetValidation(): void;
  focus(): void;
}
export interface HFieldHandle {
  focus(): void;
  blur(): void;
  reset(): void;
  validate(): boolean;
  resetValidation(): void;
}
export interface HButtonOption {
  value: string | number;
  label?: string;
  icon?: string;
  disabled?: boolean;
}
export interface HToastOptions {
  message: string;
  color?: HColor;
  duration?: number;
}
export interface HModalOptions {
  message: string;
  title?: string;
  okText?: string;
  cancelText?: string;
}
export interface HNotifications {
  toast(options: string | HToastOptions): string | null;
  confirm(options: string | HModalOptions): Promise<boolean>;
}
export const FORM_KEY: InjectionKey<FormService> = Symbol("HarunaForm");

/** Color names stay camelCase at component boundaries; CSS uses theme tokens. */
export function colorVariable(color: HColor): string {
  return `var(--color-${color.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)})`;
}

/** Light brand/surface fills need slate text rather than white. */
export function foregroundColor(color: HColor): HColor {
  return [
    "warning",
    "brandAmber",
    "brandCyan",
    "selection",
    "controlBorder",
    "backgroundPrimary",
    "backgroundSecondary",
    "backgroundElement",
    "backgroundBorder",
    "textInverted",
    "shadow",
  ].includes(color)
    ? "primary"
    : "textInverted";
}
