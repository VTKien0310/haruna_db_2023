# Haruna UI

App-owned Vue components, types, styles, and services in [src/libs/ui](../../src/libs/ui).
Maintain source directly against this guide and behavior tests; there is no external
implementation, compatibility layer, synchronization, or package publication.

## Ownership and supported scope

The public API serves application models, slots, events, and accessibility.
Surfaces, corners, and visual states are fixed: application classes control layout,
native attributes, media dimensions, and documented sizes, not component colors,
borders, or radii. Appearance changes must update this contract and all consumers;
palettes share geometry/APIs, without component-specific styling modes.

## Setup and component APIs

Import explicitly from `@/libs/ui`; do not register components globally.
Bootstrap installs `createHarunaUI()` once per Vue app and loads styles through
`../../src/main.css`. See [public exports](../src/libs/ui/index.ts) and component source
for full types/props. Use typed `HFormHandle` refs and inject `useHarunaUiService()`
into application notification service constructors.

- **Forms:** `HForm` renders a native form; its handle exposes reactive `isValid`,
  `validate()`, `reset()`, `resetValidation()`, and `focus()`. Synchronous string
  validators show errors on blur/validation; validity tracks values, reset clears
  values/feedback, and fields unregister on unmount.
- **Fields:** `HInput`/`HTextarea` forward native IDs, descriptions, attributes,
  and focus/blur events to controls; layout styles apply to their frame.
  Textareas retain counters/handles, use `rows` (default 2, minimum 1), and do not
  resize manually. Readonly fields use the muted surface.
- **Selection:** `HSelect` supports string models, typed options, `textBy`,
  `valueBy`, search/loading/disabled states. Enter/arrows open; arrows/Home/End
  navigate; Enter selects; Escape/Tab dismiss.
- **Overlays:** `HModal` teleports to body, traps/restores focus, and locks scrolling.
  Only the top overlay handles Escape. `noDismiss` blocks backdrop/Escape/close-icon,
  but explicit Cancel/OK still work. `HDrawer` opens from the right with `v-model`,
  optional `id`, `label` (default Navigation), and CSS `topOffset` (default 0);
  Escape/backdrop/Close dismiss the top overlay, restoring focus/scrolling on
  close/unmount. The app supplies its header offset and background inertness.
- **Notifications:** Per-app `useHarunaUiService()` provides plain-text `toast()`
  (5 seconds by default; 0 for manual dismissal) and boolean `confirm()`.
  App unmount clears timers and resolves pending confirmations as false.
- **Uploads:** `HFileUpload` always shows drop area/picker, emits updated `File[]`
  before `file-added`, resets input for same-file reselection, and supports removal.
  MIME/extension filters never replace service/server validation.
- **Feedback/media:** `HProgressBar` has an 8px cyan track, with a default `value`
  slot or `showPercent` below; indeterminate progress hides unknown percentages.
  Circular progress retains size presets, defaults to primary, and inherits button
  foregrounds. `HSkeleton` uses shared radius/reduced-motion-aware pulse, exposing
  only width/height. `HImage` supports cover (default)/contain, aspect ratio,
  and loader/error slots.

## Design language

Use solid fills, borders, and spacing, without gradients or decorative shadows.
[Shared styles](../../src/libs/ui/styles/ui.css) define palette values, sizing, corners,
layers, and motion; use their tokens rather than one-off colors, fonts, or dimensions.

- Color props map explicit tokens; arbitrary CSS colors are unsupported and invalid
  values fall back to primary. `HActionColor`: primary, secondary, success, info,
  danger, warning; `HStatusColor` excludes secondary. Icons accept `HColor` and
  otherwise inherit foreground. Use camelCase in props (`backgroundElement`),
  kebab-case in CSS/Tailwind (`--color-background-element`, `bg-background-element`).
- `HButton` variants are solid (default), outlined, and quiet; all use shared
  control radius, including icon actions. No round buttons, border overrides,
  tinted/gradient variants. Segments use a fixed frame with solid selected/quiet
  unselected actions. Cards/dialogs use backgroundSecondary, navigation
  backgroundPrimary, readonly controls backgroundElement. Brand raspberry is
  decorative CSS only; use danger for errors.

### Themes

Root `data-theme` selects ten palettes; absence defaults to Haruna Light.
Haruna and Classic offer light/dark variants; Legacy is light; Catppuccin Latte
is light and Frappé/Macchiato/Mocha are dark; Tokyo Night is dark. Theme IDs and
exact values live in shared styles. Haruna draws from the [logo](../../src/assets/logo.svg);
external palette sources are [Vuestic](https://ui.vuestic.dev/styles/colors/),
[Catppuccin](https://catppuccin.com/palette/), and
[Tokyo Night](https://wixdaq.github.io/Tokyo-Night-Website/).

Keep semantic/selection/focus/backdrop colors in the palette, never feature-level
dark-mode overrides. Catppuccin uses Mantle canvas, Base panels, Surface 0 selections/
readonly controls, and Mauve actions. Preserve contrast overrides:
`--color-<action>-foreground` controls solid text and `--color-<action>-text`
quiet/outlined text, falling back to shared foreground/semantic colors.
Legacy/Latte require darker success text and black on green; Legacy also uses
black on info fills and primary blue for quiet info; Latte darkens quiet info.
Dark palettes use light fills with dark action text. Preserve
`--color-action-foreground`, warning foreground/text, and white `--color-text-inverted`.

The app theme service initializes before mount independently of authentication,
persists per device, and updates root attributes immediately from Profile Appearance.
Canvas consumers re-read computed CSS colors on theme-store changes; Ionic mappings
remain in `../../src/main.css`.

### Layout, typography, and accessibility

- Shared `--h-*` tokens: controls 44px, compact buttons 36px, large buttons 48px;
  coarse-pointer targets at least 44px. Control corners 8px, panel/dialog corners
  12px; spacing follows 4px rhythm.
- Roboto: body/fields/navigation/card titles 16px, buttons and sentence-case labels
  14px, shell wordmark 22px. Legacy font utilities serve existing non-UI content.
- Keep disabled controls legible; loading controls retain size, accessible names,
  and duplicate-input protection. Preserve 2px blue focus outlines with 2px offset
  and reduced-motion support.
- The right drawer sits below the shared 64px header, fits 288px or viewport minus
  32px, and makes background content inert.

## CSS integration

- `../../src/main.css` imports external fonts, Tailwind, Ionic, then Haruna styles;
  Ionic selectors and `--ion-*` mappings belong there.
- Import Ionic CSS once in Tailwind's `base` layer. Put global resets in the same
  layer in `../../src/libs/ui/styles/ui.css`, never unlayered in bootstrap/components.
- Haruna styles own tokens, resets, body defaults, grids, fonts/branding, scrollbar
  utilities, and component styles, without external imports or framework-specific
  selectors/variables. Prefer utilities/shared tokens; local CSS handles behavior
  utilities cannot express clearly.
- Preserve `@theme static`: runtime component colors (including white button text)
  must exist even without matching utility usage.

## Implementation boundaries

Use TypeScript, Vue `<script setup lang="ts">`, and Tailwind. Library primitives
may use native semantic elements; application code uses Haruna controls.
Keep state component-local or per-app; shared behavior uses typed service classes
with explicit dependencies and cleanup. Do not import features, application routing,
backend adapters, or credentials. Do not add generic UI configuration transport,
appearance compatibility aliases, or composables returning reactive state.
Preserve validation/reset, field unregistration, keyboard navigation, overlay
stacking, focus restoration, scroll locking, and notification cleanup.

## Verification

Use `../../tests/libs/ui` behavior tests and real controls with fake dependencies in
workflows. Modal/drawer tests use real teleports/focus; page tests may stub overlays
when irrelevant. Check visual changes at desktop/mobile sizes with isolated browser
fixtures without backend imports. jsdom does not prove layout, installability,
or server behavior.

Follow README's [test commands](../../README.md#setup-and-commands) and
[isolation boundaries](application-tests.md#network-safety-and-boundaries): format changed
files only, run affected tests/consumers, type-check TypeScript/Vue changes, and
run coverage for harness changes. Use the full suite for broad impact or explicit
requests; documentation-only edits need formatting only.
