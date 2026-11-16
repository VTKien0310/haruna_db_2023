import type { InjectionKey } from "vue";
import type { FormService } from "../services/FormService";

export type HSize = "small" | "medium" | "large";
export type HButtonVariant =
  "filled" | "tonal" | "outlined" | "text" | "elevated";
export type HButtonSize = "xsmall" | "small" | "medium" | "large" | "xlarge";
export type HButtonShape = "round" | "square";
export type HCardVariant = "elevated" | "filled" | "outlined";
export type HStatusColor =
  "primary" | "tertiary" | "error" | "success" | "warning";
export type HActionColor = HStatusColor | "secondary";
export type HColor =
  | HActionColor
  | `on${Capitalize<HActionColor>}`
  | `${HActionColor}Container`
  | `on${Capitalize<HActionColor>}Container`
  | "surface"
  | "onSurface"
  | "onSurfaceVariant"
  | "outline"
  | "outlineVariant"
  | "inverseSurface"
  | "inverseOnSurface"
  | "inversePrimary";
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

const COLOR_ROLES: readonly HColor[] = [
  "primary",
  "secondary",
  "tertiary",
  "error",
  "success",
  "warning",
  "onPrimary",
  "onSecondary",
  "onTertiary",
  "onError",
  "onSuccess",
  "onWarning",
  "primaryContainer",
  "secondaryContainer",
  "tertiaryContainer",
  "errorContainer",
  "successContainer",
  "warningContainer",
  "onPrimaryContainer",
  "onSecondaryContainer",
  "onTertiaryContainer",
  "onErrorContainer",
  "onSuccessContainer",
  "onWarningContainer",
  "surface",
  "onSurface",
  "onSurfaceVariant",
  "outline",
  "outlineVariant",
  "inverseSurface",
  "inverseOnSurface",
  "inversePrimary",
];
const COLORS = Object.fromEntries(
  COLOR_ROLES.map((color) => [
    color,
    `var(--color-${color.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)})`,
  ]),
) as Record<HColor, string>;
const STATUS_COLORS: readonly HStatusColor[] = [
  "primary",
  "tertiary",
  "error",
  "success",
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
