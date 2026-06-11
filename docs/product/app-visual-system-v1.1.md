# Mandy's Bike Finder App Visual System v1.1

Status: Approved for incremental implementation

Date: 2026-06-10

Applies to: App Store mode on `app.mandysbikefinder.com` and the hosted Capacitor iOS shell

Related PRD: `docs/prd/versions/v1.1.md`

## 1. Design Direction

Version 1.1 should feel calm, practical, trustworthy, and parent-friendly. The interface should resemble a focused consumer utility rather than a marketing website or technical analysis dashboard.

The visual system should:

- Keep the existing Mandy's Bike Finder blue as the primary brand color.
- Use warm, quiet neutrals rather than a cold all-gray interface.
- Make recommendation and next-action content visually dominant.
- Use color as reinforcement, never as the only status signal.
- Prefer fewer, more consistent card and button styles.
- Preserve fast loading, system fonts, and dependency-free icons.
- Support the hosted Capacitor strategy without native-only UI assumptions.

The system should not:

- Introduce gradients, illustrations, or shadows on every surface.
- Resemble a marketplace feed.
- Use playful styling that weakens safety or privacy messaging.
- Add a third-party component library, font download, or icon package.
- Restyle the public `www` web MVP as part of v1.1.

## 2. Current-State Findings

The v1.0 app already has useful foundations:

- Brand blue `#2f6fed`.
- System font inheritance.
- Minimum 16-pixel form control text to prevent iOS focus zoom.
- Safe-area helpers and fixed bottom navigation.
- Reusable native-app group and row patterns.
- Semantic green, amber, and red result treatments.

The main inconsistencies to resolve incrementally are:

- Multiple page background colors.
- Overlapping radius values across `md`, `xl`, `2xl`, and custom tokens.
- Multiple unrelated card shadows.
- Primary buttons implemented through both a shared class and repeated utility strings.
- Uppercase eyebrow labels used more often than necessary.
- Inconsistent focus, pressed, disabled, loading, and success feedback.
- Status colors sometimes carrying more meaning than the accompanying text hierarchy.

## 3. System Font And Typography

Use the Apple/system UI font stack already supplied by the browser. Do not add a remote font in v1.1.

Recommended stack:

```css
font-family:
  -apple-system,
  BlinkMacSystemFont,
  "SF Pro Text",
  "Segoe UI",
  sans-serif;
```

The explicit `SF Pro Text` name is a fallback hint only; do not bundle Apple font files.

### Type Scale

| Token | Size / line height | Weight | Use |
| --- | --- | --- | --- |
| `display-sm` | 30px / 36px | 750 or 700 | Primary result verdict only |
| `title-lg` | 28px / 34px | 750 or 700 | Screen title |
| `title-md` | 22px / 28px | 700 | Primary card title |
| `title-sm` | 18px / 24px | 700 | Section title |
| `body-lg` | 16px / 24px | 400-600 | Important explanation |
| `body-md` | 15px / 22px | 400-600 | Default mobile body |
| `body-sm` | 14px / 20px | 400-600 | Supporting copy |
| `label-md` | 14px / 20px | 650 or 700 | Form and button label |
| `label-sm` | 12px / 16px | 650 or 700 | Metadata and status label |
| `caption` | 12px / 18px | 400-600 | Disclosure and helper copy |

Implementation notes:

- Use available weights `400`, `600`, and `700`; do not require custom font loading for weight `750`.
- Keep body copy left-aligned.
- Keep screen titles to two lines or fewer on a 320-pixel viewport.
- Reserve uppercase text for short metadata labels. Do not uppercase sentences.
- Use letter spacing only for compact metadata labels, no more than `0.08em`.
- Form controls remain at least `16px`, even when nearby labels use smaller tokens.

## 4. Spacing And Layout

Use a 4-point base grid. Prefer the following spacing tokens:

| Token | Value | Use |
| --- | --- | --- |
| `space-1` | 4px | Tight icon/text relationship |
| `space-2` | 8px | Related labels and controls |
| `space-3` | 12px | Compact component padding |
| `space-4` | 16px | Default card/row padding |
| `space-5` | 20px | Section separation |
| `space-6` | 24px | Major internal grouping |
| `space-8` | 32px | Major screen separation |

### Screen Layout

- Minimum supported viewport width: `320px`.
- App content maximum width: `672px` (`max-w-2xl`).
- Horizontal screen gutter: `16px` on phones, `24px` on wider layouts.
- Default gap between screen-level groups: `20px`.
- Default card/row padding: `16px`.
- Bottom content padding must account for navigation and `env(safe-area-inset-bottom)`.
- Top content padding must account for `env(safe-area-inset-top)`.

Avoid adding desktop-only density to the App Store mode. Wider layouts may increase gutters but should not turn the four-tab app into a dashboard.

## 5. Color Tokens

### Core Colors

| Token | Value | Use |
| --- | --- | --- |
| `brand-600` | `#2F6FED` | Primary action, active navigation, links |
| `brand-700` | `#245BD1` | Pressed/hover primary action |
| `brand-050` | `#EEF5FF` | Active/selected background |
| `brand-100` | `#DCEAFF` | Selected border and focus support |
| `canvas` | `#F5F7FA` | App Store mode page background |
| `surface` | `#FFFFFF` | Primary cards and navigation |
| `surface-subtle` | `#F8FAFC` | Secondary rows and grouped details |
| `text-strong` | `#0F172A` | Titles and primary values |
| `text-default` | `#334155` | Body text |
| `text-muted` | `#64748B` | Supporting metadata |
| `border-default` | `#E2E8F0` | Standard borders and separators |
| `border-strong` | `#CBD5E1` | Inputs and emphasized boundaries |

### Semantic Colors

| Meaning | Strong | Surface | Border | Text requirement |
| --- | --- | --- | --- | --- |
| Positive / good | `#16834A` | `#ECFDF3` | `#B7E4C7` | Include `Good`, `Likely fit`, or equivalent text |
| Caution / review | `#A15C07` | `#FFF8E7` | `#F3D28B` | Include `Review`, `Caution`, or equivalent text |
| Negative / skip | `#B42318` | `#FEF3F2` | `#FECDCA` | Include `High risk`, `Skip`, or equivalent text |
| Information | `#245BD1` | `#EEF5FF` | `#C7DAFF` | Include a descriptive message |

Color rules:

- Preserve existing recommendation meter semantics.
- Do not use green for a generic saved state when blue or neutral is more appropriate.
- Use red only for destructive actions, errors, or genuinely negative recommendations.
- Do not place long body copy in brand blue.
- Verify meaningful text and controls for WCAG AA contrast during implementation.

## 6. Shape, Border, And Elevation

### Radius

| Token | Value | Use |
| --- | --- | --- |
| `radius-control` | 12px | Inputs, compact buttons, chips |
| `radius-button` | 14px | Primary and secondary buttons |
| `radius-card` | 18px | Standard grouped cards |
| `radius-sheet` | 24px | Modal/sheet containers only |
| `radius-pill` | 999px | Short status badges only |

Rules:

- Do not mix more than two radius levels inside one card.
- Avoid `rounded-md` for major App Store mode actions after migration.
- Do not use pill shapes for long labels or paragraphs.

### Borders

- Standard cards: `1px solid border-default`.
- Inputs: `1px solid border-strong`.
- Selected controls: brand border plus a selected background.
- Divided rows: `1px` subtle separator; do not give every row its own floating card.
- Dashed borders are reserved for upload/drop areas and empty placeholders.

### Elevation

| Token | Value | Use |
| --- | --- | --- |
| `shadow-none` | none | Nested rows and status blocks |
| `shadow-card` | `0 6px 20px rgba(15, 23, 42, 0.06)` | Primary grouped card |
| `shadow-floating` | `0 12px 32px rgba(15, 23, 42, 0.14)` | Fixed mode bar, bottom nav, sheet |

Use one elevation signal at a time. A bordered card generally needs only the subtle card shadow. Nested cards should usually have no shadow.

## 7. Icon System

Use dependency-free inline SVG icons with a consistent `24 x 24` view box.

Rules:

- Stroke style: `1.75` to `2` pixel rounded stroke.
- Default icon size: `20px`; bottom navigation: `21-22px`.
- Inherit `currentColor`.
- Include `aria-hidden="true"` when paired with a visible text label.
- Icon-only buttons require an accessible name.
- Do not use emoji as production navigation or action icons.
- Do not add a third-party icon dependency solely for v1.1.

Recommended tab metaphors:

- Profile: person/rider outline.
- Evaluate: magnifier with check or bike-check document.
- History: clock/history outline.
- Settings: sliders or gear outline.

Recommended action metaphors:

- Upload, edit, remove, copy, favorite, delete, privacy, offline, retry.

## 8. Component Specifications

### Screen Header

- Optional product eyebrow, used only when it adds context.
- `title-lg` screen title.
- One `body-md` supporting sentence.
- Bottom margin is supplied by the screen grid, not embedded in every header.
- No card background.

### Grouped Card

- White `surface`.
- `radius-card`.
- Standard border.
- `shadow-card`.
- Rows use `16px` padding and subtle separators.
- Use for Profile summary, Evaluate form/review, History list, and Settings groups.

### Primary Decision Card

- Used for wheel-size recommendation and overall result.
- Strong title/value hierarchy.
- Optional restrained semantic or brand surface.
- One concise rationale before detailed rows.
- No more than one primary CTA inside the card.

### Buttons

#### Primary

- Minimum height: `48px`.
- Brand background, white label, `radius-button`.
- Full width on narrow form/action layouts.
- Pressed: `brand-700`; optional `translateY(1px)`.
- Focus: visible 3-pixel brand-tinted ring with offset.
- Disabled: neutral surface/text, no shadow, `cursor-not-allowed`.
- Loading: retain width, show action-specific label, and disable repeated input.

#### Secondary

- Minimum height: `44px`.
- White or subtle surface, strong text, standard border.
- Pressed background: `surface-subtle`.
- Use for edit, cancel, replace, and view-detail actions.

#### Quiet

- Minimum height: `44px`.
- Transparent or subtle background.
- Use for low-risk contextual actions.
- Must still have a visible pressed/focus state.

#### Destructive

- Minimum height: `44px`.
- Use red text/surface for the initial action.
- Use solid red only for the final confirmed destructive action.
- Never place as the dominant default action beside a primary CTA.

#### Icon Button

- Minimum target: `44 x 44px`.
- Icon size: `20px`.
- Always provide `aria-label`.

### Inputs

- Minimum height: `48px`.
- `16px` input text.
- `radius-control`.
- White surface and strong border.
- Focus: brand border plus visible ring.
- Invalid: red border, inline message, and `aria-invalid`.
- Disabled/read-only: subtle surface and muted text.
- Placeholder text remains visibly lighter than entered text.

### Segmented Input Method Control

- Three equal options: Screenshot, Text/link, Manual.
- Container uses white surface, border, and `radius-card`.
- Each option has a minimum `48px` target.
- Selected option uses icon, stronger text, brand surface, and selected indicator.
- Selection is communicated through `aria-pressed` and more than color.
- Long explanatory copy appears below the control, not squeezed into each segment.

### Upload Area

- Minimum height: `144px`.
- Dashed strong border, `radius-card`, subtle surface.
- Upload icon, concise label, supported formats.
- Selected state shows preview and separate replace/remove controls.
- AI disclosure remains outside or directly below the upload target.

### Status Block

- Semantic surface and border.
- Visible text label and short reasoning.
- Optional icon reinforces the status.
- Never show an unlabeled colored dot as the only status signal.

### Notice Banner

- Information, success, caution, error, or offline variant.
- Icon, concise title/message, optional relevant action.
- Avoid fixed/sticky placement unless the condition affects the entire screen.
- Offline banner remains visible without blocking the page header.

### Empty State

- Small dependency-free icon or existing brand mark.
- `title-sm` statement.
- One short explanation.
- One primary next action.
- No decorative illustration is required for v1.1.

### History Card

- Recommendation/status appears before metadata.
- Listing title uses `title-sm`.
- Price and wheel size form the primary metadata row.
- Child and date are supporting metadata.
- Favorite has icon plus text or an accessible selected state.
- Detail and delete actions remain separated.

### Bottom Navigation

- White translucent surface is acceptable when contrast remains strong.
- Four equal items.
- Icon above label.
- Minimum target height: `56px` plus safe-area padding.
- Active state uses brand color, selected background/indicator, and `aria-current`.
- Inactive state uses `text-muted`.
- Top border and `shadow-floating` separate navigation from content.

## 9. Interaction States

Every reusable control must define:

1. Default.
2. Pressed.
3. Keyboard focus-visible.
4. Disabled.
5. Loading where applicable.
6. Error where applicable.
7. Success/selected where applicable.

Recommended transition:

```css
transition:
  color 140ms ease,
  background-color 140ms ease,
  border-color 140ms ease,
  box-shadow 140ms ease,
  transform 140ms ease;
```

Reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
```

Do not use motion to communicate required information.

## 10. Screen Application Rules

### Profile

- First-time explanation uses a simple grouped card, not a marketing hero.
- Required rider basics appear before optional preferences.
- Saved Profile uses a primary decision card with wheel size as the largest value.
- `Evaluate a bike` is primary; `Edit` is secondary; clear is destructive/quiet.

### Evaluate

- Active Profile appears as a compact context banner.
- Input method control is visually distinct but does not permanently cover content.
- Current stage is stated in text when progression is helpful.
- Upload and review areas use grouped cards.
- AI disclosure uses an information notice, not a promotional badge.
- Analyze is the single primary CTA once review is ready.

### Result

- Overall recommendation uses `display-sm` or `title-lg`.
- Fit, Deal, and Risk use equal status blocks.
- `What to do next` follows the recommendation before long supporting detail.
- Seller message uses a neutral copy-ready card.
- Save to History is clearly visible but not stronger than the verdict.

### History

- Empty state is centered within a grouped card.
- Saved decisions use a vertical list with row separation rather than many floating cards.
- Favorite status is clear without pushing the title into a narrow column.
- Expanded details use a separate grouped card or inline disclosure with stable spacing.

### Settings

- Privacy and AI, Local data, Support, and About are distinct groups.
- Informational rows are neutral.
- Local data counts appear before clear controls.
- Clear all is separated from routine controls and uses a confirmation step.

## 11. Implementation Mapping

Recommended CSS custom properties:

```css
:root {
  --app-brand-600: #2f6fed;
  --app-brand-700: #245bd1;
  --app-brand-050: #eef5ff;
  --app-canvas: #f5f7fa;
  --app-surface: #ffffff;
  --app-surface-subtle: #f8fafc;
  --app-text-strong: #0f172a;
  --app-text: #334155;
  --app-text-muted: #64748b;
  --app-border: #e2e8f0;
  --app-border-strong: #cbd5e1;
  --app-radius-control: 12px;
  --app-radius-button: 14px;
  --app-radius-card: 18px;
  --app-radius-sheet: 24px;
  --app-shadow-card: 0 6px 20px rgba(15, 23, 42, 0.06);
  --app-shadow-floating: 0 12px 32px rgba(15, 23, 42, 0.14);
}
```

Recommended reusable classes:

- `.app-v11-shell`
- `.app-v11-screen-header`
- `.app-v11-card`
- `.app-v11-row`
- `.app-v11-button-primary`
- `.app-v11-button-secondary`
- `.app-v11-button-quiet`
- `.app-v11-button-danger`
- `.app-v11-input`
- `.app-v11-notice`
- `.app-v11-status`
- `.app-v11-empty-state`

Naming may be simplified during implementation, but migration must stay scoped to App Store mode. Do not globally alter the public web MVP's existing Tailwind token meaning.

## 12. Incremental Migration Plan

1. Add App Store-specific tokens, focus-visible styles, and reduced-motion behavior.
2. Migrate app shell, screen header, and bottom navigation.
3. Migrate shared cards, rows, buttons, inputs, and notices as each screen is polished.
4. Migrate Profile.
5. Migrate Evaluate and Result.
6. Migrate History and Settings.
7. Remove obsolete App Store-only style variants after all references are gone.

Each implementation task should:

- Change only the components in its scope.
- Preserve behavior and local storage formats.
- Include before/after screenshots at small and large iPhone widths.
- Run lint and production build.
- Verify focus, disabled, loading, error, and offline states affected by the task.

## 13. Acceptance Criteria

The visual-system task is complete when:

- Typography, spacing, color, radius, border, shadow, and icon rules are documented.
- Primary, secondary, quiet, destructive, and icon-button states are specified.
- Inputs, cards, segmented controls, upload, notices, empty states, status blocks, History cards, and bottom navigation are specified.
- Default, pressed, focus, disabled, loading, error, success, and selected states are covered where relevant.
- The system requires no remote font, component library, animation package, or icon package.
- The migration plan protects the public web MVP and avoids a single high-risk rewrite.
- The next app-shell implementation task can reference this document without making new foundational visual decisions.
