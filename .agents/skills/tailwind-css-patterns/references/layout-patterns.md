# Layout Patterns

Flexbox, grid, spacing, typography, and colors — written for Angular templates and Tailwind v4.

## Flexbox

```html
<!-- Space between -->
<div class="flex items-center justify-between">
  <span>Left</span>
  <span>Right</span>
</div>

<!-- Stack that becomes a row on tablet -->
<div class="flex flex-col gap-4 md:flex-row">
  <div class="flex-1">Item 1</div>
  <div class="flex-1">Item 2</div>
</div>

<!-- Full-viewport centering. Prefer min-h-dvh over min-h-screen on mobile:
     it accounts for browser chrome that shows and hides while scrolling. -->
<div class="flex min-h-dvh items-center justify-center">
  <div>Centered</div>
</div>
```

Prefer `gap-*` over `space-y-*`. In v4, `space-y-4` compiles to `& > :not(:last-child)` with a
*bottom* margin, which behaves differently than v3 around inline elements and custom child margins.
`flex flex-col gap-4` has no such edge cases.

### Safe alignment

When a flex container overflows, `justify-center` can push the first item out of reach. The `-safe`
variants fall back to `start` instead of clipping:

```html
<ul class="flex justify-center-safe gap-2 overflow-x-auto">
  <li>Available</li>
  <li>Borrowed</li>
  <li>Overdue</li>
</ul>
```

## Grid

```html
<!-- Responsive column count -->
<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
  <div>Item</div>
</div>

<!-- Auto-fit: columns are decided by available width, no breakpoints needed -->
<div class="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
  <div>Item</div>
</div>

<!-- Named track sizes. Commas are not allowed in arbitrary values — use underscores. -->
<div class="grid grid-cols-[max-content_auto] gap-x-4">
  <dt>Due date</dt>
  <dd>2026-09-01</dd>
</div>
```

## App shell

A typical authenticated layout for this project. `<router-outlet />` sits inside `<main>`, and the
`id="main-content"` target pairs with the skip link from `accessibility.md`.

```ts
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="flex min-h-dvh flex-col bg-gray-50 dark:bg-gray-950">
      <a
        href="#main-content"
        class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50
               focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-gray-900"
      >
        Skip to main content
      </a>

      <header class="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a routerLink="/" class="text-lg font-bold text-gray-900 dark:text-white">Library</a>
          <nav class="flex gap-1" aria-label="Main">
            <a
              routerLink="/items"
              routerLinkActive="bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"
              class="rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50
                     dark:text-gray-400 dark:hover:bg-gray-800"
            >
              Items
            </a>
            <a
              routerLink="/loans"
              routerLinkActive="bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"
              class="rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50
                     dark:text-gray-400 dark:hover:bg-gray-800"
            >
              Loans
            </a>
          </nav>
        </div>
      </header>

      <main id="main-content" tabindex="-1" class="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <router-outlet />
      </main>

      <footer class="border-t border-gray-200 py-6 text-center text-sm text-gray-500 dark:border-gray-800">
        &copy; 2026 Library System
      </footer>
    </div>
  `,
})
export class AppShell {}
```

### Sidebar variant

```html
<div class="flex min-h-dvh">
  <aside class="hidden w-64 shrink-0 border-r border-gray-200 p-4 lg:block">
    <!-- nav -->
  </aside>
  <main id="main-content" tabindex="-1" class="min-w-0 flex-1 p-6">
    <router-outlet />
  </main>
</div>
```

`min-w-0` on the flex child is what stops long content (tables, code, unbroken strings) from
forcing the whole page to scroll horizontally.

## Containers and max width

```html
<!-- Centered content column. In v4 `container` has no built-in centering or padding,
     so set them explicitly — or just use max-w-* directly, as here. -->
<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
  <!-- ... -->
</div>

<!-- Narrow form column -->
<div class="mx-auto w-full max-w-md">
  <!-- ... -->
</div>
```

If you want a `container` utility that centers and pads, define it once:

```css
@utility container {
  margin-inline: auto;
  padding-inline: --spacing(4);
}
```

## Spacing

```html
<div class="p-4">All sides</div>
<div class="px-4 py-8">Horizontal 1rem, vertical 2rem</div>
<div class="p-4 md:p-8 lg:p-12">Grows with the viewport</div>
```

### Sizing shorthand

`size-*` sets width and height together — preferred over `h-10 w-10`:

```html
<img class="size-10 rounded-full" [ngSrc]="avatar()" width="40" height="40" alt="" />
<svg class="size-5" aria-hidden="true"><!-- ... --></svg>
```

### Logical properties

Logical utilities follow writing direction, which matters if the UI is ever mirrored (RTL). They
also read more clearly in bilingual Thai/English interfaces.

| Physical | Logical |
| --- | --- |
| `pl-4` / `pr-4` | `ps-4` / `pe-4` |
| `ml-4` / `mr-4` | `ms-4` / `me-4` |
| `pt-4` / `pb-4` | `pbs-4` / `pbe-4` |
| `mt-4` / `mb-4` | `mbs-4` / `mbe-4` |
| `border-l` / `border-r` | `border-s` / `border-e` |
| `left-0` / `right-0` | `inset-s-0` / `inset-e-0` |

```html
<blockquote class="border-s-4 border-brand-500 ps-4 italic">
  Returned three days late.
</blockquote>
```

## Typography

```html
<h1 class="text-3xl font-bold text-gray-900 md:text-4xl lg:text-5xl dark:text-white">
  Borrowing history
</h1>
<h2 class="text-xl font-semibold text-gray-900 dark:text-white">This month</h2>
<p class="text-base text-gray-700 dark:text-gray-300">Body copy.</p>
<small class="text-sm text-gray-500 dark:text-gray-400">Metadata</small>
```

Preflight resets all headings to inherit their size and weight, so an `<h1>` with no utilities
looks like body text. Always set the size explicitly.

```html
<!-- Line height and tracking -->
<p class="leading-relaxed tracking-wide">Comfortable reading</p>

<!-- Truncation -->
<p class="truncate">One line, ellipsis on overflow</p>
<p class="line-clamp-2">Exactly two lines, then ellipsis</p>

<!-- Long unbroken strings (URLs, IDs) inside a narrow column -->
<p class="wrap-anywhere">https://example.com/very/long/path/that/would/otherwise/overflow</p>
```

## Colors

The v4 palette is defined in OKLCH. Color names: `red`, `orange`, `amber`, `yellow`, `lime`,
`green`, `emerald`, `teal`, `cyan`, `sky`, `blue`, `indigo`, `violet`, `purple`, `fuchsia`, `pink`,
`rose`, plus the neutrals `slate`, `gray`, `zinc`, `neutral`, `stone`, `mauve`, `olive`, `mist`,
`taupe`, and `black` / `white`. Each has shades `50`–`950`.

```html
<div class="bg-blue-600 text-white">Solid</div>
<p class="text-gray-700 dark:text-gray-300">Body text</p>
```

### Opacity

Use the `/` modifier. `bg-opacity-*` was removed in v4.

```html
<div class="bg-black/50">50% black overlay</div>
<div class="bg-sky-500/10">Subtle tint</div>
<div class="bg-pink-500/[71.37%]">Arbitrary</div>
<div class="bg-cyan-400/(--my-alpha)">From a CSS variable</div>
```

### Gradients

`bg-gradient-to-*` was renamed to `bg-linear-to-*`.

```html
<div class="h-14 bg-linear-to-r from-cyan-500 to-blue-500"></div>
<div class="h-14 bg-linear-65 from-purple-500 to-pink-500"></div>
<div class="bg-linear-to-r from-indigo-500 from-10% via-sky-500 via-30% to-emerald-500 to-90%"></div>

<!-- Radial and conic -->
<div class="size-18 rounded-full bg-radial from-pink-400 from-40% to-fuchsia-700"></div>
<div class="size-24 rounded-full bg-conic from-blue-600 to-sky-400 to-50%"></div>
```

Gradients interpolate in `oklab` by default; override with `bg-linear-to-r/srgb` or `/oklch`.

### Borders and rings

```html
<!-- v4 border color defaults to currentColor — always state the color -->
<div class="border border-gray-200 dark:border-gray-800">Card</div>

<!-- `ring` is 1px in v4; use ring-2 / ring-3 for a visible ring -->
<div class="ring-1 ring-gray-200 dark:ring-gray-800">Alternative to border</div>
```

## Data tables

Tables are the widest thing in most admin screens. Wrap them so the table scrolls, not the page.

```html
<div class="overflow-x-auto scrollbar-thin rounded-lg ring-1 ring-gray-200 dark:ring-gray-800">
  <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
    <caption class="sr-only">Current loans</caption>
    <thead class="bg-gray-50 dark:bg-gray-900">
      <tr>
        <th scope="col" class="px-4 py-3 text-start text-sm font-semibold text-gray-900 dark:text-white">
          Item
        </th>
        <th scope="col" class="px-4 py-3 text-start text-sm font-semibold text-gray-900 dark:text-white">
          Due
        </th>
      </tr>
    </thead>
    <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
      @for (loan of loans(); track loan.id) {
        <tr class="hover:bg-gray-50 dark:hover:bg-gray-900">
          <td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{{ loan.itemName }}</td>
          <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{{ loan.dueDate }}</td>
        </tr>
      } @empty {
        <tr>
          <td colspan="2" class="px-4 py-8 text-center text-sm text-gray-500">No active loans</td>
        </tr>
      }
    </tbody>
  </table>
</div>
```

`scrollbar-thin` (v4.3) pairs with `scrollbar-thumb-*` and `scrollbar-track-*` if you want to
colour the scrollbar. `scrollbar-gutter-stable` prevents layout shift when a scrollbar appears.

Use `text-start` / `text-end` rather than `text-left` / `text-right` for direction-aware alignment.

## Breakpoint reference

| Prefix | Min width | Media query |
| --- | --- | --- |
| `sm:` | 40rem (640px) | `@media (width >= 40rem)` |
| `md:` | 48rem (768px) | `@media (width >= 48rem)` |
| `lg:` | 64rem (1024px) | `@media (width >= 64rem)` |
| `xl:` | 80rem (1280px) | `@media (width >= 80rem)` |
| `2xl:` | 96rem (1536px) | `@media (width >= 96rem)` |

See `responsive-design.md` for `max-*` variants, ranges, and container queries.
