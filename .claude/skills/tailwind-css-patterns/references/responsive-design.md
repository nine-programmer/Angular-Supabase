# Responsive Design, Dark Mode, and Container Queries

## Mobile-first

Unprefixed utilities apply everywhere; a prefix means "at this width **and above**". So style the
mobile case with no prefix, then layer on larger screens.

```html
<!-- WRONG: only centers at 640px and up; mobile is left-aligned -->
<div class="sm:text-center"></div>

<!-- RIGHT: centered on mobile, left-aligned from 640px up -->
<div class="text-center sm:text-left"></div>
```

## Breakpoints

| Prefix | Min width | Media query |
| --- | --- | --- |
| `sm:` | 40rem (640px) | `@media (width >= 40rem)` |
| `md:` | 48rem (768px) | `@media (width >= 48rem)` |
| `lg:` | 64rem (1024px) | `@media (width >= 64rem)` |
| `xl:` | 80rem (1280px) | `@media (width >= 80rem)` |
| `2xl:` | 96rem (1536px) | `@media (width >= 96rem)` |

### Targeting below a breakpoint

| Variant | Media query |
| --- | --- |
| `max-sm:` | `@media (width < 40rem)` |
| `max-md:` | `@media (width < 48rem)` |
| `max-lg:` | `@media (width < 64rem)` |
| `max-xl:` | `@media (width < 80rem)` |
| `max-2xl:` | `@media (width < 96rem)` |

### Ranges

Stack a min and a max variant:

```html
<!-- Applies from md up to (not including) xl -->
<div class="md:max-xl:flex"></div>

<!-- Exactly the md range -->
<div class="md:max-lg:flex"></div>
```

### Custom and arbitrary breakpoints

```css
@theme {
  --breakpoint-xs: 30rem;
  --breakpoint-3xl: 120rem;
}
```

```html
<div class="grid xs:grid-cols-2 3xl:grid-cols-6"></div>

<!-- One-off, no token needed -->
<div class="max-[600px]:bg-sky-300 min-[320px]:text-center"></div>
```

Remove a default breakpoint with `--breakpoint-2xl: initial;`, or reset the whole namespace with
`--breakpoint-*: initial;` before defining your own.

## Container queries

Breakpoints respond to the viewport; container queries respond to the parent. That is what you want
for a card that appears both in a wide main column and a narrow sidebar — the same component, laid
out according to the space it actually has.

```html
<div class="@container">
  <article class="flex flex-col gap-4 @md:flex-row">
    <img class="w-full @md:w-32" [ngSrc]="cover()" width="128" height="128" alt="" />
    <div>
      <h3 class="text-base font-bold @md:text-lg">{{ title() }}</h3>
      <p class="text-sm text-gray-600">{{ summary() }}</p>
    </div>
  </article>
</div>
```

| Variant | Min width |
| --- | --- |
| `@3xs:` | 16rem (256px) |
| `@2xs:` | 18rem (288px) |
| `@xs:` | 20rem (320px) |
| `@sm:` | 24rem (384px) |
| `@md:` | 28rem (448px) |
| `@lg:` | 32rem (512px) |
| `@xl:` | 36rem (576px) |
| `@2xl:` | 42rem (672px) |
| `@3xl:` | 48rem (768px) |
| `@4xl:` | 56rem (896px) |
| `@5xl:` | 64rem (1024px) |
| `@6xl:` | 72rem (1152px) |
| `@7xl:` | 80rem (1280px) |

```html
<!-- Below a container size -->
<div class="@container"><div class="flex flex-row @max-md:flex-col"></div></div>

<!-- Range -->
<div class="@container"><div class="flex flex-row @sm:@max-md:flex-col"></div></div>

<!-- Named containers, for nesting -->
<div class="@container/main">
  <div class="flex flex-row @sm/main:flex-col"></div>
</div>

<!-- Arbitrary -->
<div class="@container"><div class="flex flex-col @min-[475px]:flex-row"></div></div>
```

Add container sizes as tokens with `--container-8xl: 96rem;`. Note the `--container-*` namespace
also drives `max-w-*`.

`@container-size` (v4.3) creates a *size* container, which enables `cqb` / `cqh` units:

```html
<div class="@container-size"><div class="h-[50cqb]"></div></div>
```

## Dark mode

**By default, `dark:` follows the operating system** via `prefers-color-scheme: dark`. No
configuration, no service, no class on `<html>`. This is the recommended setup for this project.

```html
<div class="bg-white text-gray-900 dark:bg-gray-950 dark:text-white">
  <h1 class="text-2xl font-bold">Loans</h1>
  <p class="text-gray-600 dark:text-gray-400">Items you currently have out.</p>
</div>
```

To test, change the OS or browser theme setting. In Chrome DevTools:
**Rendering → Emulate CSS media feature prefers-color-scheme**.

### Guidelines

- Dark is not an inversion. Pick shades that keep contrast: light surfaces `white` / `gray-50`
  against dark `gray-900` / `gray-950`; body text `gray-700` light and `gray-300` dark.
- Prefer semantic tokens over repeating `dark:` on every element. Define a variable that changes
  with the theme and expose it through `@theme inline`:

  ```css
  :root {
    --surface: var(--color-white);
    --surface-fg: var(--color-gray-900);
  }

  @media (prefers-color-scheme: dark) {
    :root {
      --surface: var(--color-gray-900);
      --surface-fg: var(--color-gray-100);
    }
  }

  @theme inline {
    --color-surface: var(--surface);
    --color-surface-fg: var(--surface-fg);
  }
  ```

  Then `bg-surface text-surface-fg` works in both themes with no `dark:` variants.
- Re-check contrast in dark mode. A pair that passes AA on white often fails on `gray-950`.

### Optional: a manual toggle

Only add this if the product genuinely needs a user-facing theme switch. It costs a CSS override, a
service, and an anti-flash script.

**1. Override the `dark` variant** so it keys off a class instead of the media query:

```css
@import 'tailwindcss';
@custom-variant dark (&:where(.dark, .dark *));
```

**2. A signal-based, SSR-safe service.** This app renders on the server (and may prerender static
routes), so `document`, `window`, and `localStorage` do not exist there. Apply the theme from `afterRenderEffect()`, which
never runs on the server; keep the platform check only for the value that must be read at
construction, before the first render.

```ts
import { DOCUMENT, PLATFORM_ID, Service, afterRenderEffect, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type ThemePreference = 'light' | 'dark' | 'system';

@Service()
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  // The stored preference has to seed the signal at construction time, so this is the one place
  // a platform check is right — afterNextRender() would land too late.
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly preference = signal<ThemePreference>(this.readStoredPreference());

  constructor() {
    // Browser-only by construction: no isBrowser guard needed inside.
    afterRenderEffect(() => {
      const preference = this.preference();

      const prefersDark = this.document.defaultView?.matchMedia(
        '(prefers-color-scheme: dark)',
      ).matches;
      const isDark = preference === 'dark' || (preference === 'system' && prefersDark);

      this.document.documentElement.classList.toggle('dark', isDark);

      try {
        if (preference === 'system') {
          localStorage.removeItem('theme');
        } else {
          localStorage.setItem('theme', preference);
        }
      } catch {
        // Private browsing or blocked storage — the theme still applies for this session.
      }
    });
  }

  private readStoredPreference(): ThemePreference {
    if (!this.isBrowser) return 'system';
    try {
      const stored = localStorage.getItem('theme');
      return stored === 'light' || stored === 'dark' ? stored : 'system';
    } catch {
      return 'system';
    }
  }
}
```

**3. Prevent the flash of the wrong theme.** Server-rendered HTML ships without the `dark` class, so
the page would paint light before Angular boots. Apply the class before first paint with an inline
script in `src/index.html`:

```html
<script>
  try {
    var t = localStorage.getItem('theme');
    if (t === 'dark' || (!t && matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    }
  } catch (e) {}
</script>
```

**4. The toggle component:**

```ts
import { Component, computed, inject } from '@angular/core';
import { ThemeService, type ThemePreference } from './theme.service';

@Component({
  selector: 'ui-theme-toggle',
  template: `
    <fieldset class="inline-flex rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
      <legend class="sr-only">Color theme</legend>
      @for (option of options; track option.value) {
        <button
          type="button"
          (click)="theme.preference.set(option.value)"
          [attr.aria-pressed]="theme.preference() === option.value"
          [class.bg-white]="theme.preference() === option.value"
          [class.shadow-sm]="theme.preference() === option.value"
          [class.dark:bg-gray-950]="theme.preference() === option.value"
          class="rounded-md px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors
                 focus-visible:outline-2 focus-visible:outline-offset-2
                 focus-visible:outline-brand-600 dark:text-gray-300"
        >
          {{ option.label }}
        </button>
      }
    </fieldset>
  `,
})
export class UiThemeToggle {
  protected readonly theme = inject(ThemeService);

  protected readonly options: ReadonlyArray<{ value: ThemePreference; label: string }> = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'System' },
  ];
}
```

Do not add a global `* { transition: colors }` rule to smooth theme switching. It applies a
transition to every element on the page, which is a measurable performance cost and ignores
`prefers-reduced-motion`. Put `transition-colors` on the handful of elements that need it.

## Input modality and print

`pointer-coarse:` targets touch input, `pointer-fine:` a mouse or trackpad. Use it to give touch
users targets that meet the 44×44px minimum without inflating the desktop layout:

```html
<button class="p-2 pointer-coarse:p-3">
  <svg class="size-5 pointer-coarse:size-6" aria-hidden="true"><!-- ... --></svg>
</button>
```

`any-pointer-coarse:` matches when *any* available input is coarse (a laptop with a touchscreen),
whereas `pointer-coarse:` matches only when the *primary* input is.

```html
<!-- Hide chrome that has no meaning on paper -->
<nav class="print:hidden"><!-- ... --></nav>
<div class="hidden print:block">Printed {{ today }}</div>

<!-- Only shown when JavaScript is disabled -->
<div class="hidden noscript:block">This app requires JavaScript.</div>
```
