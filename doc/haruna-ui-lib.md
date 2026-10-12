# Haruna UI

The reusable, app-owned UI library in [src/libs/ui](../src/libs/ui). This guide
is the shared reference for component usage, design, implementation, and
maintenance.

## Source and supported scope

Adapted
from [Vuestic UI 1.10.3](https://github.com/epicmaxco/vuestic-ui/tree/9ba04aab42f9c6c6b35b4570333293c760b62786/packages/ui/src),
commit `9ba04aab42f9c6c6b35b4570333293c760b62786`. The upstream copyright and MIT
permission notice are retained in [src/libs/ui/LICENSE](../src/libs/ui/LICENSE).
This is a selective, substantially adapted source fork with Haruna's own visual
design, rather than an upstream-compatible distribution.

The public surface contains the components used by the app. Components are renamed
from `Va*` to `H*`. Haruna UI also includes components not existing in Vuestic UI (e.g., `HDrawer`). App-used props,
models, slots, and events are
supported. Unused upstream features such as configuration transport, arbitrary
presets, icon packs, input masks, asynchronous rules, web components, and unused
components are outside the supported API. Inherited behavior has been adapted
into script-setup components, Tailwind/CSS tokens, and typed service classes.

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

- `HFormHandle` exposes reactive `isValid`, `validate()`, `reset()`,
  `resetValidation()`, and `focus()`. Rules are synchronous string validators.
  Errors appear on blur or explicit validation; validity tracks field values.
  Reset clears values and validation feedback, and fields unregister on unmount.
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
- `HFileUpload` emits the updated `File[]` before `file-added`, resets the native
  input so the same file can be selected again, and supports removal. MIME and
  extension filtering do not replace upload service or server validation.

## Design language

The flat design follows the existing [folder logo](../src/assets/logo.svg): white
surfaces, slate actions, amber selection, cyan accents, visible borders, and
rounded controls. Use solid fills, borders, and spacing for hierarchy; do not
add gradients or decorative shadows. Theme colors, shared sizing, corners,
overlay layers, and motion tokens live in `src/libs/ui/styles/ui.css` as
Haruna UI defaults.

Component color props use camelCase (`color="backgroundElement"`), mapped to
kebab-case CSS/Tailwind tokens (`--color-background-element`,
`bg-background-element`). The current palette is:

| Purpose                     | Component token / value                                                            |
| --------------------------- | ---------------------------------------------------------------------------------- |
| Primary actions             | `primary` / `#143441`, white foreground                                            |
| Body / muted text           | `textPrimary` / `#394c5b`, `secondary` / `#657786`                                 |
| Canvas / panels             | `backgroundSecondary` / white, `backgroundPrimary` / `#f7f9fa`                     |
| Dividers / field boundaries | `backgroundBorder` / `#cbd5dc`, `controlBorder` / `#7c8f9b`                        |
| Brand accents               | `brandAmber` / `#febe40`, `brandCyan` / `#2bb3cd`                                  |
| Selected navigation/options | `selection` / `#fff2ce`, slate text and amber marker                               |
| Semantic feedback           | `success` / `#276b4c`, `info` / `#2276bb`, `danger` / `#b31e48`, `warning` / amber |

`HButton` presets are default solid, `secondary` outlined, `primary` tinted, and
`plain` quiet text/icon. `round` explicitly requests a circle; other controls use
the shared corner radius. The former `gradient` prop is unsupported. Amber/cyan
filled buttons use dark foregrounds. Brand raspberry is a decorative CSS token (`--color-brand-raspberry`), not a
component color prop; use `danger` for errors.
Segmented controls share one frame; dialogs and notifications use flat bordered
surfaces.

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
  including script setup, TypeScript, and Tailwind. Inherited upstream code has
  no blanket exception. Native elements are allowed inside library primitives
  for semantics and accessibility; application code uses Haruna controls.
- Do not restore the Vuestic runtime, upstream build tooling, or state-returning
  composables.
- Preserve validation/reset behavior, field unregistration, keyboard navigation,
  focus restoration, overlay stacking, scroll locking, and notification cleanup.
  File-type filtering is a UI convenience, not a security boundary; upload
  service and server validation remain authoritative.

## Customization and maintenance

Customize the owned source directly. Review upstream fixes against the pinned
revision, adapt them manually, and record the source revision in this section.
There is no automatic upstream synchronization or package publication.
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
