---
name: tailwind-css-patterns
description: Tailwind CSS v4 (CSS-first, no tailwind.config.js) styling patterns for Angular 22 standalone components — responsive layout, flexbox/grid, spacing, typography, colors, dark mode, container queries, animations, and WCAG AA accessibility. Trigger when styling Angular templates, building responsive layouts or app shells, adding theme tokens with @theme, or reviewing/fixing Tailwind class usage.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Tailwind CSS v4 Patterns for Angular

Utility-first styling patterns for **Angular 22 standalone components** using **Tailwind CSS v4**
(CSS-first configuration). Every example in this skill is Angular — there are no React, Vue, or
Svelte snippets, and no Tailwind v3 configuration.

**Reading the examples.** Component names, labels, and sample content are illustrative — take the
structure and rename it for the domain at hand. Two conventions recur throughout and are not
built-in utilities:

- `brand-*` (as in `bg-brand-600`) assumes a `--color-brand-*` token exists. Define it in `@theme`
  first, or substitute any default palette color. Undefined color utilities produce no CSS and fail
  silently.
- `ui-*` selectors are a naming convention for shared presentational components, nothing more.

## Project setup

**Check first — do not assume either way.** A project is already wired up when all three of these
are true:

| Piece | Location | Expected content |
| --- | --- | --- |
| PostCSS plugin | `.postcssrc.json` | `{ "plugins": { "@tailwindcss/postcss": {} } }` |
| Stylesheet entry | `src/styles.css` | `@import 'tailwindcss';` |
| Registered in build | `angular.json` → `styles` | `src/styles.css` |

If all three are present, **do not re-run setup or add config files** — go straight to the patterns
below.

If any are missing, prefer the sibling skill `angular-developer` and read its
`references/tailwind-css.md`. When that skill is not installed alongside this one, the whole setup
is these three steps:

```shell
npm install tailwindcss @tailwindcss/postcss postcss
```

```json
// .postcssrc.json at the project root
{ "plugins": { "@tailwindcss/postcss": {} } }
```

```css
/* src/styles.css — the entire configuration surface */
@import 'tailwindcss';
```

Never create `tailwind.config.js`. Angular CLI already registers `src/styles.css`, so nothing else
is needed. Confirm the installed major version with
`node -p "require('tailwindcss/package.json').version"` — everything in this skill assumes **v4**
(written against v4.3) and much of it is wrong for v3.

## Hard rules (Tailwind v4)

These are build-breaking or silently-wrong if violated.

1. **Never create `tailwind.config.js`.** v4 configures through CSS. A JS config is only loaded if
   you explicitly write `@config "..."`, which this project must not do.
2. **Never write `@tailwind base; @tailwind components; @tailwind utilities;`.** Use
   `@import "tailwindcss";` — a single import.
3. **`content`, `purge`, `safelist`, `darkMode`, `corePlugins`, `jit` do not exist in v4.** Source
   files are auto-detected. Use `@source` / `@source inline(...)` when you need to add or safelist.
4. **Design tokens go in `@theme`**, custom utilities in `@utility`, custom variants in
   `@custom-variant`. Not in a JS object.
5. **Never construct class names dynamically.** Tailwind scans files as plain text; a class it
   cannot see as a complete string is never generated. Map values to complete class strings instead
   (see the button example below).
6. **No Sass/Less/Stylus.** v4 is the preprocessor: it handles `@import`, nesting, and variables.
7. **Browser floor:** Safari 16.4+, Chrome 111+, Firefox 128+.
8. **Angular CLI uses the PostCSS plugin**, not `@tailwindcss/vite`. Never install the Vite plugin,
   `autoprefixer`, or `cssnano` — v4 bundles Lightning CSS and handles prefixing and minification.

## Angular binding rules

These are Angular v20+ conventions (and the defaults in v22). Violating them fails review even when
the CSS itself is correct. If the project has a `CLAUDE.md` or `AGENTS.md`, its rules win over this
table.

| Do | Don't |
| --- | --- |
| `class="rounded-lg p-4"` (static) | — |
| `[class.hidden]="isHidden()"` | `[ngClass]="{hidden: isHidden()}"` |
| `[class]="buttonClasses()"` from a `computed()` | string concatenation of class fragments |
| `[style.width.px]="width()"` | `[ngStyle]="{width: width() + 'px'}"` |
| `@if` / `@for` / `@switch` | `*ngIf` / `*ngFor` / `*ngSwitch` |
| `input()`, `output()`, `model()`, `computed()` | `@Input()`, `@Output()` decorators |
| `host: { class: '...' }` in the decorator | `@HostBinding('class')` |
| `NgOptimizedImage` (`ngSrc`) for static images | plain `<img src>` for static assets |

Static and bound classes **merge** — `class="btn" [class.btn-lg]="large()"` renders both.

## Quick reference

### Breakpoints (mobile-first, `min-width`)

| Prefix | Min width | Media query |
| --- | --- | --- |
| `sm:` | 40rem (640px) | `@media (width >= 40rem)` |
| `md:` | 48rem (768px) | `@media (width >= 48rem)` |
| `lg:` | 64rem (1024px) | `@media (width >= 64rem)` |
| `xl:` | 80rem (1280px) | `@media (width >= 80rem)` |
| `2xl:` | 96rem (1536px) | `@media (width >= 96rem)` |

Unprefixed utilities apply at every size. `max-sm:` … `max-2xl:` target *below* a breakpoint, and
they stack into ranges: `md:max-xl:flex`.

### v3 → v4 renames (common mistakes)

| Old (v3) | New (v4) |
| --- | --- |
| `bg-opacity-50`, `text-opacity-*`, `ring-opacity-*` | `bg-black/50`, `text-black/50`, `ring-black/50` |
| `bg-gradient-to-r` | `bg-linear-to-r` |
| `shadow-sm` → `shadow-xs`, `shadow` → `shadow-sm` | shifted one step down |
| `rounded-sm` → `rounded-xs`, `rounded` → `rounded-sm` | shifted one step down |
| `blur`, `drop-shadow`, `backdrop-blur` (bare) | `blur-sm`, `drop-shadow-sm`, `backdrop-blur-sm` |
| `outline-none` (invisible outline) | `outline-hidden` |
| `ring` (3px) | `ring-3` (bare `ring` is now 1px) |
| `flex-shrink-0` / `flex-grow-0` | `shrink-0` / `grow-0` |
| `overflow-ellipsis` | `text-ellipsis` |
| `!flex` | `flex!` (important goes last) |
| `bg-[--brand]` | `bg-(--brand)` |
| `grid-cols-[max-content,auto]` | `grid-cols-[max-content_auto]` |
| `first:*:pt-0` | `*:first:pt-0` (variants read left-to-right) |
| `focus:transform-none` after `scale-150` | `focus:scale-none` |

### Changed defaults you must handle

- **Border color is `currentColor`**, not `gray-200`. Always pair `border` with `border-gray-200`
  (or a token).
- **`ring` is 1px `currentColor`**, not 3px blue. Write `ring-2 ring-blue-500`.
- **Buttons get `cursor: default`.** Add a base rule if you want the pointer back (see
  `references/configuration.md`).
- **Placeholders** use current text color at 50% opacity.
- **`space-y-*` uses `:not(:last-child)`** — prefer `flex flex-col gap-*` for new layouts.
- **`hover:` only applies on devices that support hover** (`@media (hover: hover)`).

## Examples

### Variant map with `computed()` — the correct way to make classes dynamic

```ts
import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'ui-button',
  template: `
    <button
      [type]="type()"
      [disabled]="disabled()"
      [class]="classes()"
    >
      <ng-content />
    </button>
  `,
})
export class UiButton {
  readonly variant = input<'primary' | 'secondary' | 'danger'>('primary');
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly type = input<'button' | 'submit'>('button');
  readonly disabled = input(false);

  // Complete class strings — Tailwind can see every one of them in this file.
  private readonly variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:outline-blue-600',
    secondary: 'bg-white text-gray-900 ring-1 ring-gray-300 hover:bg-gray-50 focus-visible:outline-gray-600',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-600',
  } as const;

  private readonly sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  } as const;

  protected readonly classes = computed(
    () =>
      'inline-flex items-center justify-center gap-2 rounded-lg font-semibold ' +
      'transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ' +
      'disabled:cursor-not-allowed disabled:opacity-50 ' +
      `${this.variants[this.variant()]} ${this.sizes[this.size()]}`,
  );
}
```

Never do this — the class never reaches the stylesheet:

```ts
// WRONG: `bg-blue-600` exists nowhere in the source as a complete token.
protected readonly classes = computed(() => `bg-${this.color()}-600`);
```

### Responsive card template

```ts
import { Component, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'item-card',
  imports: [NgOptimizedImage],
  template: `
    <article
      class="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200
             sm:flex dark:bg-gray-900 dark:ring-gray-800"
    >
      <img
        [ngSrc]="image()"
        width="192"
        height="192"
        alt=""
        class="h-48 w-full object-cover sm:h-auto sm:w-48"
      />
      <div class="flex flex-col gap-2 p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ title() }}</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400">{{ description() }}</p>
      </div>
    </article>
  `,
})
export class ItemCard {
  readonly title = input.required<string>();
  readonly description = input('');
  readonly image = input.required<string>();
}
```

## Troubleshooting

**A class has no effect**
1. Is the class name a complete string in a source file? Interpolated or concatenated names are
   never generated.
2. Is the file ignored? Tailwind skips `.gitignore`d paths, `node_modules`, binary files, CSS
   files, and lock files. Add `@source "../path"` for anything outside the project tree.
3. Two utilities targeting the same property? The later one in the *stylesheet* wins, not the later
   one in the `class` attribute. Only apply the one you want.
4. Genuinely need a runtime-computed name? Safelist it: `@source inline("bg-red-500");`.

**The CSS bundle is far larger than the app's actual class usage** — something in the repo mentions
classes the app never renders. Markdown is scanned like any other file, so in-repo docs, component
galleries, and agent-skill folders (including this one) compile their examples into the bundle.
Exclude them in `styles.css`:

```css
@source not '../.claude';
@source not '../.agents';
```

**`border` shows no color / `ring` looks thin** — v4 defaults (`currentColor`, 1px). Be explicit.

**Dark mode does nothing** — by default `dark:` follows the OS setting
(`prefers-color-scheme: dark`). Change the OS/browser theme to test. A manual toggle requires
`@custom-variant` — see `references/responsive-design.md`.

**`document is not defined` during build or `ng serve`** — this app uses SSR with prerendering. Any
DOM access must be guarded with `isPlatformBrowser(inject(PLATFORM_ID))` or run inside
`afterNextRender()`.

**`@apply` fails inside a component's `styles:`** — either use `var(--color-*)` directly
(preferred) or add `@reference "../../styles.css";` at the top of that style block.

## References

- **[references/configuration.md](references/configuration.md)** — `@theme` tokens, `@utility`,
  `@custom-variant`, `@variant`, `--alpha()`/`--spacing()`, source detection, component styles,
  and the full list of removed v3 features.
- **[references/layout-patterns.md](references/layout-patterns.md)** — flexbox, grid, spacing,
  typography, colors, app shell, tables, logical properties.
- **[references/component-patterns.md](references/component-patterns.md)** — Angular standalone
  components: button, card, badge, dialog, form field, navbar, table, skeleton.
- **[references/responsive-design.md](references/responsive-design.md)** — breakpoints, ranges,
  container queries, dark mode (OS default + optional toggle service), pointer/print variants.
- **[references/animations.md](references/animations.md)** — transitions, transforms, built-in
  animations, custom keyframes, reduced-motion.
- **[references/accessibility.md](references/accessibility.md)** — focus, Preflight side effects,
  contrast, ARIA binding in Angular, WCAG AA checklist.

## External resources

- [Tailwind CSS docs](https://tailwindcss.com/docs)
- [Tailwind v4 upgrade guide](https://tailwindcss.com/docs/upgrade-guide)
- [Angular: class and style bindings](https://angular.dev/guide/templates/binding)
- [Angular: component styling](https://angular.dev/guide/components/styling)
