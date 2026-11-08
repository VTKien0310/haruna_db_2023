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
  resize manually. Readonly fields use `surface-container-high`.
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
- **Feedback/media:** `HProgressBar` uses a 4px `secondary-container` track and
  `primary` indicator with a stop marker, with a default `value` slot or
  `showPercent` below; indeterminate progress hides unknown percentages. Circular
  progress uses the same roles and retains size presets. `HSkeleton` uses
  `surface-container-highest` with a reduced-motion-aware pulse, exposing only
  width/height. `HImage` uses `surface-container-highest` for loader/error states
  and supports cover (default)/contain, aspect ratio, and loader/error slots.

## Design language

Use Material Design 3 Expressive roles, state layers, shape, elevation, and motion.
The [shared stylesheet](../../src/libs/ui/styles/ui.css) imports the generated
scheme and defines design tokens; use them instead of one-off colors, fonts, or
dimensions.

- **Color roles:** use role classes such as `bg-primary`, `text-on-surface`,
  `bg-surface-container-low`, and `border-outline-variant`. Every scheme includes
  primary, secondary, tertiary, error, success, and warning foreground/container
  pairs, plus surface/container, inverse, outline, scrim, and shadow roles.
  Status semantics map `info` to `tertiary` and `danger` to `error`; success and
  warning are harmonized custom colors. `HActionColor` includes primary, secondary,
  tertiary, error, success, and warning; `HStatusColor` excludes secondary. `HColor`
  is an allow-list of roles, not arbitrary CSS. Props use camelCase (`onSurface`),
  while CSS variables/utilities use kebab-case (`--color-on-surface`,
  `text-on-surface`). Invalid runtime values fall back to primary.
- **Components:** `HButton` defaults to `filled`; supported variants are `filled`,
  `tonal`, `outlined`, `text`, and `elevated`. Sizes are `xsmall`/32px,
  `small`/40px (default), `medium`/56px, `large`/96px, and `xlarge`/136px.
  Page-level floating actions use `medium`; `large`/`xlarge` are reserved for hero
  or emphasis actions. Shapes are `round` and `square`. Icon-only controls retain
  accessible names and all buttons have a 48px minimum touch target. Pressing
  morphs the shape. `HButtonToggle`
  is a connected group with 2px gaps, secondary selected roles, and filled selected
  icons. `HCard` variants are elevated, filled, and outlined (default), with
  `rounded-medium` geometry.
- **Surfaces:** cards use `surface-container-low`, `surface-container-highest`, or
  `surface` with `outline-variant`; dialogs use `surface-container-high`,
  `rounded-extra-large`, level-3 elevation, and a 32% scrim. The navigation drawer
  uses `surface-container-low`, an inner `rounded-large` edge, and a full-radius
  `secondary-container` active indicator. Menus use `surface-container` and
  level-2 elevation. Snackbars use `inverse-surface`; their action uses
  `inverse-primary`, and error notifications include an error icon.
- **Fields and selection:** `HInput`, `HTextarea`, and `HSelect` are 56px outlined
  fields with 4px corners, floating labels, and body-small supporting/error text.
  Select menus use 48px items and `secondary-container` selection. File upload uses
  a dashed `outline-variant` border, `rounded-medium`, and a state layer.
- **Feedback/media:** `HProgressBar` and `HProgressCircle` use a `primary` indicator
  on a `secondary-container` track; the linear track is 4px with a gap and stop
  marker. `HSkeleton` and image loader/error surfaces use
  `surface-container-highest`. `HIcon` uses Material Symbols Outlined with the
  variable `FILL` axis.

### Themes

Root `data-theme` selects one of ten seed-derived M3 schemes; absence defaults to
Haruna Light. IDs remain stable for saved preferences. Haruna and Classic generate
light/dark variants; Legacy and Catppuccin Latte are light; Catppuccin Frappé,
Macchiato, Mocha, and Tokyo Night are dark. Seeds are declared in
`src/modules/master/ThemeEntities.ts`: Haruna `#1e1b4b`, Classic `#143441`, Legacy
`#154ec1`, Latte `#8839ef`, Frappé `#ca9ee6`, Macchiato `#c6a0f6`, Mocha `#cba6f7`,
and Tokyo Night `#7aa2f7`.

`scripts/generate-m3-themes.ts` uses `SchemeTonalSpot` and
`@material/material-color-utilities` at development time to generate the committed
`src/libs/ui/styles/m3-schemes.css`. It also harmonizes the success/warning custom
colors and verifies each `themeColor` matches its generated `surface`. Run
`npm run generate:m3-themes` after changing seeds or color generation. Theme
selection still updates `data-theme`, `color-scheme`, local persistence, and the
meta `theme-color`; canvas consumers re-read CSS roles after theme changes.

The app theme service initializes before mount independently of authentication,
persists per device, and updates root attributes immediately from Profile Appearance.
Canvas consumers re-read computed CSS colors on theme-store changes; Ionic mappings
remain in `../../src/main.css`.

### Layout, typography, and accessibility

- Shape tokens: `rounded-extra-small` 4px, `rounded-small` 8px,
  `rounded-medium` 12px, `rounded-large` 16px, `rounded-large-increased` 20px,
  `rounded-extra-large` 28px, `rounded-extra-large-increased` 32px, and
  `rounded-extra-extra-large` 48px. Spacing follows a 4px rhythm.
- Roboto uses the M3 display/headline/title/body/label scales, each with large,
  medium, and small sizes. Use the matching Tailwind token (for example,
  `text-title-medium` or `text-body-large`) rather than arbitrary type sizes.
- Elevation uses `shadow-level-1` through `shadow-level-5`. State-layer opacities
  are 8% on hover and 10% on focus/press. Focus-visible uses a 3px secondary
  outline with 2px offset. Motion uses `ease-spatial-*` for shape/size and
  `ease-effects-*` for color/opacity; every animation and transition respects
  `prefers-reduced-motion`.
- Keep disabled controls legible; loading controls retain size, accessible names,
  and duplicate-input protection. The right drawer sits below the supplied header
  offset, is at most 360px wide and fits the viewport minus 56px, and makes
  background content inert.

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
[isolation boundaries](../conventions-and-standards/application-tests.md#network-safety-and-boundaries): format changed
files only, run affected tests/consumers, type-check TypeScript/Vue changes, and
run coverage for harness changes. Use the full suite for broad impact or explicit
requests; documentation-only edits need formatting only.
