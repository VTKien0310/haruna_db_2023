# Haruna UI

The reusable, app-owned UI library in [src/libs/ui](../src/libs/ui). This guide
is the shared reference for component usage, design, implementation, and
maintenance.

## Ownership and supported scope

Haruna UI is maintained directly from the app's design and behavior requirements.
Components use ordinary Vue script setup, native semantic elements, Tailwind/theme
tokens, and small typed services. There is no external UI implementation or
compatibility layer behind the public `H*` components.

The public surface supports the app's models, slots, events, and accessibility
requirements. Styling is intentionally constrained: component surfaces, corners,
and visual states are fixed. Layout classes, native attributes, media dimensions,
and documented size presets remain available. Application classes and styles
should control layout, not override component colors, borders, or corner radii.

## Setup and component APIs

Import components and types explicitly from `@/libs/ui`; do not register
components globally. Install `createHarunaUI()` once per Vue app. The app
bootstrap already installs it and loads the shared styles through `src/main.css`.
Use typed `HFormHandle` template refs and inject `useHarunaUiService()` into
application notification service constructors.

See the [public exports](../src/libs/ui/index.ts) for available components and type surface.

```vue
<script setup lang="ts">
import { ref } from "vue";
import { HButton, HForm, HInput, type HFormHandle } from "@/libs/ui";

const form = ref<HFormHandle>();
const name = ref("");
</script>

<template>
  <HForm ref="form" @submit.prevent="form?.validate()">
    <HInput
      v-model="name"
      label="Name"
      :rules="[(value) => !!value || 'Required']"
    />
    <HButton type="submit">Save</HButton>
  </HForm>
</template>
```

- `HForm` always renders a native form. `HFormHandle` exposes reactive `isValid`, `validate()`, `reset()`,
  `resetValidation()`, and `focus()`. Rules are synchronous string validators.
  Errors appear on blur or explicit validation; validity tracks field values.
  Reset clears values and validation feedback, and fields unregister on unmount.
- `HInput` and `HTextarea` render native input and textarea controls through a
  shared presentation frame. Native IDs, descriptions, attributes, and focus/blur
  events are forwarded to the control; layout classes/styles apply to the frame.
  Textareas use `rows` (default two, minimum one), do not resize manually, and
  retain counters and field handles. Readonly fields use the fixed muted surface.
- `HSelect` supports string models, typed object options, `textBy`, `valueBy`,
  search, loading, and disabled states. Enter/arrow keys open the list,
  arrows/Home/End navigate, Enter selects, and Escape/Tab dismiss.
- `HModal` teleports to the body, traps/restores focus, and locks body scrolling.
  Only the top overlay handles Escape. `noDismiss` blocks outside/Escape/close-icon
  dismissal; explicit Cancel/OK actions still work.
- `HDrawer` is a right-side teleported overlay with `v-model`, optional `id`,
  `label` (default `Navigation`), and CSS `topOffset` (default `0`). Escape,
  backdrop, and Close dismiss the top overlay. Focus and scrolling are restored
  on close/unmount. The app supplies its shared header offset and makes background
  content inert while open.
- `useHarunaUiService()` returns an injected notification service for application
  service constructors. `toast()` renders plain text, defaults to five seconds,
  and accepts duration zero for manual dismissal. `confirm()` resolves a boolean.
  App unmount clears timers and settles pending confirmations as false; state is
  isolated per Vue app.
- `HFileUpload` always displays the drop area and picker action. It emits the updated `File[]` before `file-added`, resets the native
  input so the same file can be selected again, and supports removal. MIME and
  extension filtering do not replace upload service or server validation.
- `HProgressBar` uses a fixed 8px cyan track. An optional default slot (receiving
  `value`) or `showPercent` label appears below the track. Unknown percentages
  are hidden during indeterminate progress. Circular progress retains size
  presets, uses primary by default, and inherits the foreground inside buttons.
- `HSkeleton` uses the shared control radius and pulse animation, respecting
  reduced motion; only width and height are configurable. `HImage` supports
  `cover` (default) or `contain`, aspect ratio, and loader/error slots.

## Design language

The flat design offers Classic (the original slate/cyan/amber palette) and Haruna
(indigo/blue, teal, and amber from the [logo](../src/assets/logo.svg)), each with
light and dark variants. Additional palettes are Legacy (Vuestic UI light),
Catppuccin Latte, Catppuccin Frappé, Catppuccin Macchiato, Catppuccin Mocha,
and Tokyo Night.
Use solid fills, borders, and spacing for hierarchy; do not
add gradients or decorative shadows. Theme colors, shared sizing, corners,
overlay layers, and motion tokens live in `src/libs/ui/styles/ui.css` as
Haruna UI defaults.

Color props use explicit theme-token mappings; arbitrary CSS colors are not
accepted, and unsupported runtime values fall back to primary.
`HActionColor` restricts buttons to primary, secondary, success, info, danger,
and warning. `HStatusColor` restricts notifications to primary, success, info,
danger, and warning. Icons accept the documented `HColor` palette and inherit
their foreground when no color is supplied.

Theme names use camelCase in component APIs (`color="backgroundElement"` on
an icon), and kebab-case in CSS/Tailwind (`--color-background-element`,
`bg-background-element`). The original **Classic Light** palette is:

| Purpose                     | Component token / value                                                            |
| --------------------------- | ---------------------------------------------------------------------------------- |
| Primary actions             | `primary` / `#143441`, white foreground                                            |
| Body / muted text           | `textPrimary` / `#394c5b`, `secondary` / `#657786`                                 |
| Canvas / panels             | `backgroundSecondary` / white, `backgroundPrimary` / `#f7f9fa`                     |
| Dividers / field boundaries | `backgroundBorder` / `#cbd5dc`, `controlBorder` / `#7c8f9b`                        |
| Brand accents               | `brandAmber` / `#febe40`, `brandCyan` / `#2bb3cd`                                  |
| Selected navigation/options | `selection` / `#fff2ce`, slate text and amber marker                               |
| Semantic feedback           | `success` / `#276b4c`, `info` / `#2276bb`, `danger` / `#b31e48`, `warning` / amber |

The root `data-theme` attribute selects one of ten palettes. With no attribute,
the CSS defaults to Haruna Light. Existing utilities and component color props
resolve the same runtime tokens in every palette:

| Theme ID               | Main action      | Accent         | Panel            | Body text             |
| ---------------------- | ---------------- | -------------- | ---------------- | --------------------- |
| `haruna-light`         | Indigo `#1e1b4b` | Teal `#0d9488` | White `#ffffff`  | Slate `#334155`       |
| `haruna-dark`          | Blue `#bfdbfe`   | Teal `#5eead4` | Indigo `#1e1b4b` | Light slate `#e2e8f0` |
| `classic-light`        | Slate `#143441`  | Cyan `#2bb3cd` | White `#ffffff`  | Slate `#394c5b`       |
| `classic-dark`         | Slate `#b8d9e6`  | Cyan `#67d4e8` | Slate `#1e293b`  | Light slate `#e2e8f0` |
| `legacy`               | Blue `#154ec1`   | Blue `#158de3` | White `#ffffff`  | `#262824`             |
| `catppuccin-latte`     | Mauve `#8839ef`  | Teal `#179299` | Base `#eff1f5`   | `#4c4f69`             |
| `catppuccin-frappe`    | Mauve `#ca9ee6`  | Teal `#81c8be` | Base `#303446`   | `#c6d0f5`             |
| `catppuccin-macchiato` | Mauve `#c6a0f6`  | Teal `#8bd5ca` | Base `#24273a`   | `#cad3f5`             |
| `catppuccin-mocha`     | Mauve `#cba6f7`  | Teal `#94e2d5` | Base `#1e1e2e`   | `#cdd6f4`             |
| `tokyo-night`          | Blue `#7aa2f7`   | Teal `#73daca` | `#1a1b26`        | `#c0caf5`             |

Palette sources: [Vuestic UI colors](https://ui.vuestic.dev/styles/colors/),
[Catppuccin palette](https://catppuccin.com/palette/), and
[Tokyo Night palette](https://wixdaq.github.io/Tokyo-Night-Website/).
Catppuccin uses Mantle for the canvas, Base for panels, Surface 0 for selections
and readonly controls, and Mauve for primary actions. Legacy has only a light
variant; Latte is light, while the other new palettes are dark.
Optional `--color-<action>-foreground` and `--color-<action>-text` tokens override
solid foregrounds and quiet/outlined text, respectively. Legacy and Latte use
black text on green fills and darker success text mixed with black for contrast;
Legacy also uses black text on info fills.
Latte darkens quiet/outlined info text with black for contrast against Base.
Legacy uses its primary blue for quiet/outlined info actions. Other actions fall
back to the shared action foreground and their semantic color.

Dark palettes use light semantic colors with dark solid-action text. Separate
`--color-action-foreground`, `--color-warning-foreground`, and
`--color-warning-text` tokens keep button fills and quiet/outlined text readable.
`--color-text-inverted` remains available for content requiring white text.
Amber selection, visible field boundaries, focus outlines, and overlay backdrops
also adapt to the selected variant. Keep all color values in the shared palette;
feature code must not override colors to implement dark mode.

The application's theme service owns device-local persistence and root attributes.
Initialize it before mounting, independently of authentication. Profile's
Appearance selector applies changes immediately; canvas consumers must re-read
computed CSS colors when the theme store changes. Ionic variable mappings remain
in `src/main.css`, outside this library.

`HButton` has `variant="solid"` (default), `outlined`, or `quiet`. Every
button uses the shared control radius, including icon actions. Borders and
foregrounds follow the selected palette; warning fills use dark foregrounds.
There are no round buttons, border overrides, or tinted/gradient variants.
Segmented controls use one fixed frame with solid selected and quiet unselected
actions. Cards/dialogs use backgroundSecondary; navigation uses backgroundPrimary.
Readonly fields use backgroundElement. Brand raspberry remains a decorative CSS
token, not a component color; use danger for errors.

### Layout, typography, and accessibility

- Use shared `--h-*` tokens: 44px normal controls, 36px compact buttons, 48px large buttons, and at least 44px targets
  for coarse pointers. Controls have 8px corners, panels/dialogs 12px corners, and spacing follows a 4px rhythm. Do not
  introduce one-off colors, fonts, sizes, or corner radii in feature templates.
- Use Roboto consistently with Ionic: body/fields/navigation 16px, buttons and sentence-case field labels 14px, card
  titles 16px, and the shell wordmark 22px. Legacy font utilities remain available for existing non-UI content.
- Keep disabled controls legible and loading controls stable in size, accessible by name, and protected from duplicate
  input.
- Preserve visible keyboard focus (2px blue outline, 2px offset) and respect reduced-motion preferences. The app drawer
  opens from the right below the shared 64px header, stays within 288px or the viewport minus 32px, and makes background
  content inert while open.

## CSS integration

- Keep `src/main.css` as the import and registration point for external fonts,
  Tailwind, Ionic CSS, and Haruna UI styles. Keep Ionic selectors and `--ion-*`
  variable mappings there as application integration styles; define Haruna UI
  defaults in `src/libs/ui/styles/ui.css` without external package imports or
  framework-specific selectors and variables.
- Import Ionic CSS once into Tailwind's `base` layer in `src/main.css` and
  define global resets in the same layer in `src/libs/ui/styles/ui.css`;
  do not import resets unlayered from bootstrap or components.
  Unlayered resets override utility padding, borders, and corner radii.
- Import `src/libs/ui/styles/ui.css` after Tailwind and Ionic. It owns theme
  tokens, custom grid utilities, font and branding classes, global resets,
  body defaults, scrollbar utilities, and shared component styles.
  Component-local CSS handles behavior that utilities do not express clearly;
  feature styling uses shared tokens and utilities.
- Keep `@theme static`: component color names resolve at runtime, so tokens
  must remain available even when no utility class references them, including
  white button text.

## Implementation boundaries

- Keep state component-local or scoped to the Vue app. Shared behavior uses typed
  service classes with explicit dependencies and cleanup.
- Do not import feature modules, application routing, backend adapters, or
  credentials into the library.
- Follow the [project frontend standards](../AGENTS.md#frontend-standards),
  including script setup, TypeScript, and Tailwind. Native elements are allowed inside library primitives
  for semantics and accessibility; application code uses Haruna controls.
- Do not introduce generic UI configuration transport, appearance compatibility
  aliases, or composables returning reactive state.
- Preserve validation/reset behavior, field unregistration, keyboard navigation,
  focus restoration, overlay stacking, scroll locking, and notification cleanup.
  File-type filtering is a UI convenience, not a security boundary; upload
  service and server validation remain authoritative.

## Customization and maintenance

Maintain the owned source directly against this guide and observable behavior
tests. Changes to appearance must update the design contract and migrate all
consumers together. The documented palettes share the same geometry and
component APIs; do not add component-specific alternate styling modes.
There is no external source synchronization or package publication.
Apply the implementation boundaries above and the [project coding standards](../AGENTS.md).

## Verification

Behavior tests live in `tests/libs/ui`; existing workflow tests use real controls
with fake backend dependencies. UI modal/drawer tests use real teleports and
focus handling; page tests may retain the shared modal stub when overlay behavior
is irrelevant. Verify visual changes at desktop and mobile sizes using isolated
browser fixtures without backend imports. jsdom tests do not prove browser
layout, PWA installability, or server behavior.

Run `npm run format`, `npm run type-check`, and `npm test` after changes.
Also run `npm run test:coverage` when changing the harness or coverage
configuration. See [Application tests](../README.md#application-tests) for
commands and helpers, and [Mandatory isolation](../AGENTS.md#mandatory-isolation)
for the required test boundaries.
