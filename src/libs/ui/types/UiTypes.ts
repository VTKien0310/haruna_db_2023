import type { InjectionKey } from "vue";
import type { FormService } from "../services/FormService";

export type HSize = "small" | "medium" | "large";
export type HButtonVariant = "solid" | "outlined" | "quiet";
export type HStatusColor =
  | "primary"
  | "success"
  | "info"
  | "danger"
  | "warning";
export type HActionColor = HStatusColor | "secondary";
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
export interface HFieldProps {
  modelValue?: string;
  label?: string;
  name?: string;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  loading?: boolean;
  rules?: HRule[];
  counter?: boolean;
}
export interface HInputProps extends HFieldProps {
  type?: string;
}
export interface HTextareaProps extends HFieldProps {
  rows?: number;
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
  color?: HStatusColor;
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

const COLORS: Record<HColor, string> = {
  primary: "var(--color-primary)",
  secondary: "var(--color-secondary)",
  success: "var(--color-success)",
  info: "var(--color-info)",
  danger: "var(--color-danger)",
  warning: "var(--color-warning)",
  brandAmber: "var(--color-brand-amber)",
  brandCyan: "var(--color-brand-cyan)",
  selection: "var(--color-selection)",
  controlBorder: "var(--color-control-border)",
  backgroundPrimary: "var(--color-background-primary)",
  backgroundSecondary: "var(--color-background-secondary)",
  backgroundElement: "var(--color-background-element)",
  backgroundBorder: "var(--color-background-border)",
  textPrimary: "var(--color-text-primary)",
  textInverted: "var(--color-text-inverted)",
  shadow: "var(--color-shadow)",
  focus: "var(--color-focus)",
};
const STATUS_COLORS: readonly HStatusColor[] = [
  "primary",
  "success",
  "info",
  "danger",
  "warning",
];

/** Runtime boundaries never interpolate caller-provided CSS. */
export function colorVariable(color: HColor): string {
  return Object.prototype.hasOwnProperty.call(COLORS, color)
    ? COLORS[color]
    : COLORS.primary;
}
export function statusColor(color: HStatusColor = "primary"): HStatusColor {
  return STATUS_COLORS.includes(color) ? color : "primary";
}
export function actionColor(color: HActionColor = "primary"): HActionColor {
  return color === "secondary" ? color : statusColor(color);
}
