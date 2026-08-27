# Tailwind CSS v4 Configuration (CSS-First)

All configuration lives in `src/styles.css`. There is no `tailwind.config.js` in this project and
none must be created.

## Theme variables with `@theme`

`@theme` does two things: it defines a CSS custom property **and** tells Tailwind to generate the
matching utility classes. Use `:root` instead when you want a plain variable with no utilities.

```css
@import 'tailwindcss';

@theme {
  --color-brand-50: oklch(0.97 0.02 250);
  --color-brand-500: oklch(0.62 0.19 250);
  --color-brand-900: oklch(0.35 0.12 250);

  --font-display: 'Satoshi', sans-serif;
  --breakpoint-3xl: 120rem;
  --ease-fluid: cubic-bezier(0.3, 0, 0, 1);
}
```

That makes `bg-brand-500`, `text-brand-900`, `font-display`, `3xl:*`, and `ease-fluid` available.

`@theme` must be top-level — not nested inside a selector or media query.

### Namespaces

Each namespace maps to a family of utilities.

| Namespace | Generates |
| --- | --- |
| `--color-*` | `bg-*`, `text-*`, `border-*`, `ring-*`, `fill-*`, `stroke-*`, … |
| `--font-*` | `font-sans`, `font-display` |
| `--text-*` | `text-sm`, `text-xl` (font size) |
| `--font-weight-*` | `font-bold` |
| `--tracking-*` | `tracking-wide` |
| `--leading-*` | `leading-tight` |
| `--breakpoint-*` | `sm:`, `md:` responsive variants |
| `--container-*` | `@sm:` container queries and `max-w-md` |
| `--spacing-*` | `p-4`, `mt-8`, `size-10`, `max-h-16` |
| `--radius-*` | `rounded-lg` |
| `--shadow-*` / `--inset-shadow-*` / `--drop-shadow-*` | shadow utilities |
| `--blur-*` | `blur-md` |
| `--aspect-*` | `aspect-video` |
| `--ease-*` | `ease-out` |
| `--animate-*` | `animate-spin` |
| `--perspective-*`, `--zoom-*`, `--tab-size-*` | matching utilities |

### Extending, overriding, resetting

```css
/* Add to the defaults */
@theme {
  --color-brand-500: oklch(0.62 0.19 250);
}

/* Override one default */
@theme {
  --breakpoint-sm: 30rem;
}

/* Wipe a namespace and define your own */
@theme {
  --color-*: initial;
  --color-white: #fff;
  --color-brand: oklch(0.62 0.19 250);
}

/* Remove a single default */
@theme {
  --color-lime-*: initial;
  --breakpoint-2xl: initial;
}
```

### `@theme inline` and `@theme static`

Use `inline` when a token references another variable, so the utility gets the *value* rather than
a reference (important when the source variable changes per-scope, e.g. a theme attribute):

```css
:root {
  --canvas: oklch(0.967 0.003 264.542);
}

[data-theme='dark'] {
  --canvas: oklch(0.21 0.034 264.665);
}

@theme inline {
  --color-canvas: var(--canvas);
}
```

Use `static` to emit every variable even when unused (handy when reading tokens from TypeScript):

```css
@theme static {
  --color-primary: var(--color-blue-600);
}
```

## Starter `src/styles.css`

The `@theme` block holds **placeholder values — replace them per project.** The `@layer base` block
is the part worth keeping as-is: it repairs two Preflight behaviors that surprise people in every
project.

```css
@import 'tailwindcss';

@theme {
  /* PLACEHOLDER — swap in the real brand palette.
     Any --color-brand-* you define becomes bg-brand-*, text-brand-*, ring-brand-*, … */
  --color-brand-50: oklch(0.97 0.02 250);
  --color-brand-100: oklch(0.93 0.05 250);
  --color-brand-500: oklch(0.62 0.19 250);
  --color-brand-600: oklch(0.55 0.19 250);
  --color-brand-900: oklch(0.35 0.12 250);

  /* PLACEHOLDER — set the font stack for the languages the app actually serves.
     A script-specific face first keeps glyph metrics correct; below is a Thai example.
     Drop this line entirely to keep Tailwind's default sans stack. */
  --font-sans: 'Noto Sans Thai', 'Inter', system-ui, sans-serif;
}

@layer base {
  /* Keep: v4 sets buttons to cursor: default; restore the pointer. */
  button:not(:disabled),
  [role='button']:not(:disabled) {
    cursor: pointer;
  }

  /* Keep: Preflight removes dialog margins; without this a dialog pins top-left. */
  dialog {
    margin: auto;
  }
}
```

Two more Preflight effects to handle in markup rather than CSS:

- List markers are stripped (`list-style: none`). When a `<ul>` is semantically a list, add
  `role="list"` so VoiceOver still announces it. See `accessibility.md`.
- Headings are unstyled (`font-size: inherit`), so every `<h1>`–`<h6>` needs an explicit size
  utility.

## Custom utilities with `@utility`

`@utility` replaces v3's `@layer utilities`. Utilities defined this way work with every variant
(`hover:`, `md:`, `dark:`).

```css
@utility content-auto {
  content-visibility: auto;
}

/* Nesting is supported */
@utility scrollbar-hidden {
  &::-webkit-scrollbar {
    display: none;
  }
}
```

### Functional utilities

```css
@theme {
  --tab-size-2: 2;
  --tab-size-4: 4;
}

/* From theme values: tab-2, tab-4 */
@utility tab-* {
  tab-size: --value(--tab-size-*);
}

/* Bare integers: tab-3 */
@utility tab-* {
  tab-size: --value(integer);
}

/* Arbitrary values: tab-[6] */
@utility tab-* {
  tab-size: --value([integer]);
}

/* With a default (v4.3) so bare `tab` works too */
@utility tab-* {
  tab-size: --value(integer, --default(4));
}

/* With a modifier: text-lg/tight */
@utility text-* {
  font-size: --value(--text-*, [length]);
  line-height: --modifier(--leading-*, [length], [*]);
}
```

## Custom variants

```css
/* Shorthand */
@custom-variant theme-midnight (&:where([data-theme='midnight'] *));

/* Block form, for nested rules */
@custom-variant any-hover {
  @media (any-hover: hover) {
    &:hover {
      @slot;
    }
  }
}

/* Useful for Angular ARIA state */
@custom-variant aria-asc (&[aria-sort='ascending']);
@custom-variant aria-desc (&[aria-sort='descending']);
```

## Applying variants inside CSS with `@variant`

```css
.my-panel {
  background: var(--color-white);

  @variant dark {
    background: var(--color-gray-950);
  }
}
```

v4.3 adds stacked and compound variants:

```css
.button {
  @variant hover:focus {
    background: var(--color-sky-600);
  }
}
```

## Functions

```css
.doc-hit {
  /* Opacity without hardcoding a color-mix */
  background-color: --alpha(var(--color-gray-950) / 10%);

  /* Spacing scale in plain CSS */
  margin: --spacing(4);
  padding: calc(--spacing(6) - 1px);
}
```

The v3 `theme()` function is deprecated. Use the CSS variable directly:
`var(--color-red-500)`, not `theme(colors.red.500)`.

## Source detection

Tailwind scans the project automatically and treats every file as plain text — it does not parse
code. It skips:

- anything matched by `.gitignore`
- `node_modules`
- binary files (images, video, archives)
- CSS files
- common lock files

### `@source`

```css
@import 'tailwindcss';

/* Add a path Tailwind would otherwise ignore */
@source '../node_modules/@acmecorp/ui-lib';

/* Exclude a path */
@source not '../src/app/legacy';

/* Change the detection root */
@import 'tailwindcss' source('../src');

/* Turn detection off entirely and opt in explicitly */
@import 'tailwindcss' source(none);
@source '../src/app';
```

### Keep documentation and agent-skill folders out of the bundle

Markdown files are scanned like everything else, and fenced code blocks are just text to the
scanner. Any project that keeps agent skills, a design system doc, or a component gallery in-repo
will compile **those examples' classes into the production bundle**.

This is not hypothetical: leaving this very skill's `references/*.md` unexcluded added ~37 kB of
dead CSS to a 45 kB bundle — 82% of the output, none of it reachable from the app.

Prefer an allowlist over a list of exclusions: in an Angular app every template lives under `src/`,
and an allowlist stays correct when the next doc or tool folder appears (including root-level files
like `AGENTS.md` and `README.md`, which no `@source not '../<folder>'` line covers).

```css
@import 'tailwindcss' source(none);
@source '../src';
```

Use `@source not '../<folder>'` only when the scan root must stay wide for another reason.

Verify with a production build. If a utility you never used in `src/` appears in
`dist/**/styles-*.css`, some scanned file mentions it:

```shell
ng build --configuration production
grep -c 'scrollbar-thin' dist/*/browser/styles-*.css
```

### Safelisting with `@source inline()`

```css
@source inline('underline');

/* Brace expansion for variants */
@source inline('{hover:,focus:,}underline');

/* Ranges */
@source inline('{hover:,}bg-red-{50,{100..900..100},950}');

/* Explicitly exclude */
@source not inline('container');
```

### Dynamic class names — the most common Angular mistake

Tailwind can only generate a class it sees as a complete token.

```ts
// WRONG — `bg-red-600` never appears as a literal, so it is never generated.
protected readonly cls = computed(() => `bg-${this.color()}-600`);
```

```html
<!-- WRONG — same problem in the template -->
<div [class]="'text-' + status() + '-600'"></div>
```

```ts
// CORRECT — every possible class is a literal in this file.
private readonly statusClasses: Record<Status, string> = {
  success: 'bg-green-100 text-green-800',
  pending: 'bg-amber-100 text-amber-800',
  error: 'bg-red-100 text-red-800',
};

protected readonly cls = computed(() => this.statusClasses[this.status()]);
```

If a class genuinely can only be known at runtime (from a database column, for example), safelist
it with `@source inline(...)`.

## Component styles in Angular

Order of preference:

1. **Utilities in the template.** This is the default and needs nothing else.
2. **`var(--color-*)` inside `styles:` / `styleUrl`.** Theme variables are emitted on `:root`, so
   they resolve inside component styles with no extra imports.

   ```ts
   @Component({
     selector: 'app-panel',
     template: `<div class="panel"><ng-content /></div>`,
     styles: `
       .panel {
         background-color: var(--color-white);
         border-radius: var(--radius-lg);
         box-shadow: var(--shadow-md);
       }
     `,
   })
   export class Panel {}
   ```

3. **`@reference` only if you must use `@apply`.** `@apply` inside a component style block cannot
   see the theme unless you reference the global sheet. `@reference` imports it for lookup without
   duplicating any CSS into the output.

   ```ts
   @Component({
     selector: 'app-panel',
     template: `<div class="panel"><ng-content /></div>`,
     styles: `
       @reference '../../styles.css';

       .panel {
         @apply rounded-lg bg-white shadow-md;
       }
     `,
   })
   export class Panel {}
   ```

Angular's default emulated view encapsulation scopes component styles to the component, but global
styles — including all Tailwind utilities from `styles.css` — still reach component templates. That
is why utilities in the template work without any per-component import.

`@apply` is discouraged generally. Reach for it only when styling third-party markup you cannot put
classes on.

## Removed in v4 — do not use

| Removed | Use instead |
| --- | --- |
| `tailwind.config.js` | `@theme` in CSS |
| `@tailwind base/components/utilities` | `@import "tailwindcss"` |
| `content: [...]` | automatic detection + `@source` |
| `purge: {...}` | nothing — v4 always generates only used CSS |
| `safelist: [...]` | `@source inline(...)` |
| `darkMode: 'class' \| 'media'` | media query by default; `@custom-variant dark` to override |
| `corePlugins` | not supported |
| `jit: true` | always on |
| `theme()` function | `var(--color-*)` |
| `resolveConfig()` | `getComputedStyle(document.documentElement).getPropertyValue('--color-x')` |
| `@layer utilities { .foo {} }` | `@utility foo {}` |
| `@layer components { .btn {} }` | `@utility btn {}`, or `@layer components` for real component CSS |
| `autoprefixer`, `postcss-import`, `cssnano` | built in via Lightning CSS |
| `@tailwindcss/vite` | Angular CLI uses `@tailwindcss/postcss` |
| `container` with `center` / `padding` options | `@utility container { margin-inline: auto; padding-inline: 2rem; }` |
