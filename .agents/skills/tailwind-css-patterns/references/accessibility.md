# Accessibility

This project targets **WCAG AA** and must pass **AXE** checks. Tailwind's Preflight actively
removes several native affordances, so some of what follows is repair work, not enhancement.

## Focus

Never remove a focus indicator without replacing it.

```html
<!-- Correct: visible ring for keyboard users, nothing for mouse clicks -->
<button
  class="rounded-lg bg-brand-600 px-4 py-2 text-white
         focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
>
  Borrow
</button>
```

`focus-visible:` is the right variant for buttons and links: the browser decides whether the focus
was keyboard-driven. Use plain `focus:` for text inputs, where a visible focus state is expected
regardless of how it was reached.

Two utilities are easy to confuse:

| Utility | CSS | Use when |
| --- | --- | --- |
| `outline-hidden` | `outline: 2px solid transparent; outline-offset: 2px` | replacing the outline with your own indicator — the transparent outline stays visible in forced-colors mode |
| `outline-none` | `outline-style: none` | genuinely no outline at all |

`outline-hidden` is what v3's `outline-none` did. Prefer it, and always pair it with a replacement
indicator.

```html
<!-- Acceptable: outline suppressed, ring supplied -->
<input class="outline-hidden focus:ring-2 focus:ring-brand-600" />

<!-- Not acceptable: no indicator at all -->
<input class="outline-none" />
```

### Skip link

```html
<a
  href="#main-content"
  class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50
         focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-gray-900"
>
  Skip to main content
</a>
```

The target needs `tabindex="-1"` so focus can land on it:

```html
<main id="main-content" tabindex="-1"><router-outlet /></main>
```

### Focus after navigation

Angular does not move focus on route change; it stays where it was, or falls to `<body>`. Move it
to the new page's heading or main region so keyboard and screen reader users are not stranded.

```ts
import { Component, ElementRef, inject, viewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({ /* ... */ })
export class AppShell {
  private readonly router = inject(Router);
  private readonly main = viewChild.required<ElementRef<HTMLElement>>('main');

  constructor() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.main().nativeElement.focus());
  }
}
```

## What Preflight breaks, and the fix

| Preflight does | Consequence | Fix |
| --- | --- | --- |
| `list-style: none` on `ul`/`ol`/`menu` | VoiceOver no longer announces lists | add `role="list"` |
| headings inherit size and weight | `<h1>` looks like body text | always set `text-*` and `font-*` |
| buttons get `cursor: default` | no pointer affordance | base rule in `styles.css` (see `configuration.md`) |
| `<dialog>` margins removed | dialog pins to top-left | `m-auto` on the dialog |
| placeholder = text color at 50% | may fall below contrast | check contrast, or set an explicit color |

```html
<ul role="list" class="divide-y divide-gray-200">
  <li class="py-4">Item</li>
</ul>
```

## Screen reader support

```html
<!-- Icon-only control needs an accessible name -->
<button type="button" aria-label="Close dialog" class="rounded-md p-2">
  <svg class="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
  </svg>
</button>

<!-- Visible label on wide screens, still announced on narrow ones -->
<a routerLink="/settings">
  <svg class="size-5" aria-hidden="true"><!-- ... --></svg>
  <span class="sr-only sm:not-sr-only">Settings</span>
</a>

<!-- Announce async results -->
<div aria-live="polite" class="sr-only">{{ statusMessage() }}</div>
```

Decorative SVGs always take `aria-hidden="true"`. Without it, screen readers may announce a
meaningless graphic node.

`sr-only` hides visually while keeping the element in the accessibility tree; `hidden` removes it
from both. They are not interchangeable.

## Color contrast

| Content | Minimum ratio |
| --- | --- |
| Normal text (< 18.66px bold / < 24px) | 4.5:1 |
| Large text | 3:1 |
| UI components and graphical objects | 3:1 |

Reliable pairs from the default palette:

```html
<div class="bg-white text-gray-700">Body text on white — 4.5:1+</div>
<div class="bg-white text-gray-900">Headings on white</div>
<div class="bg-brand-600 text-white">Primary button</div>
<div class="bg-red-600 text-white">Destructive button</div>
<div class="bg-gray-950 text-gray-300">Body text in dark mode</div>
```

Combinations to avoid:

```html
<!-- Fails AA: light text on a mid-tone background -->
<div class="bg-blue-500 text-blue-100">Insufficient contrast</div>

<!-- Fails AA at normal sizes -->
<p class="text-gray-400">Too light on white</p>
```

`text-gray-500` is the lightest gray that clears 4.5:1 on white. Anything lighter is for large text
or non-essential content only.

Support high-contrast preferences:

```html
<div class="border border-gray-200 contrast-more:border-gray-900 contrast-more:border-2">
  Card
</div>
```

`forced-colors:` handles Windows High Contrast Mode, where the OS overrides your palette:

```html
<div class="bg-brand-600 forced-colors:bg-[ButtonFace] forced-colors:text-[ButtonText]"></div>
```

## Never rely on color alone

WCAG 1.4.1. Pair every color-coded state with text, an icon, or a shape.

```html
<!-- Wrong: only the color says "overdue" -->
<span class="text-red-600">●</span>

<!-- Right: color reinforces text that stands on its own -->
<span class="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-0.5
             text-xs font-medium text-red-800">
  <span class="size-1.5 rounded-full bg-current" aria-hidden="true"></span>
  Overdue
</span>
```

## ARIA in Angular templates

Static ARIA uses plain attribute syntax. Dynamic ARIA needs `[attr.*]` — these are HTML attributes,
not DOM properties, so a plain `[aria-expanded]` binding fails at build time for most of them.

```html
<!-- Static -->
<button aria-label="Save document">
  <svg aria-hidden="true"><!-- ... --></svg>
</button>

<!-- Dynamic -->
<button
  [attr.aria-expanded]="isOpen()"
  [attr.aria-controls]="panelId()"
  [attr.aria-label]="isOpen() ? 'Collapse details' : 'Expand details'"
>
  Details
</button>

<!-- null removes the attribute entirely; 'false' is a *present* attribute
     with the value false, which is meaningfully different for aria-current -->
<a [attr.aria-current]="isActive() ? 'page' : null">Loans</a>

<!-- Invalid state wired to its message -->
<input
  id="email"
  [attr.aria-invalid]="hasError() ? 'true' : null"
  [attr.aria-describedby]="hasError() ? 'email-error' : null"
/>
@if (hasError()) {
  <p id="email-error" class="text-sm text-red-600">Enter a valid email address.</p>
}
```

Styling from ARIA state keeps the visual and the semantic in sync — there is no way for one to
drift from the other:

```html
<button
  role="switch"
  [attr.aria-checked]="enabled()"
  (click)="enabled.set(!enabled())"
  class="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200
         transition-colors aria-checked:bg-brand-600
         focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600
         dark:bg-gray-700"
>
  <span class="sr-only">Enable email notifications</span>
  <span
    class="inline-block size-4 translate-x-1 rounded-full bg-white transition-transform
           motion-reduce:transition-none"
    [class.translate-x-6]="enabled()"
    aria-hidden="true"
  ></span>
</button>
```

## Form accessibility

```html
<div class="flex flex-col gap-1.5">
  <label for="due-date" class="text-sm font-medium text-gray-900">
    Due date
    <span class="text-red-600" aria-hidden="true">*</span>
    <span class="sr-only">(required)</span>
  </label>
  <input
    id="due-date"
    type="date"
    required
    aria-describedby="due-date-hint"
    class="rounded-lg border border-gray-300 px-3 py-2
           focus-visible:border-brand-600 focus-visible:outline-2 focus-visible:outline-brand-600
           user-invalid:border-red-600
           disabled:cursor-not-allowed disabled:bg-gray-50"
  />
  <p id="due-date-hint" class="text-sm text-gray-500">Loans run for up to 14 days.</p>
</div>
```

- Every input has a `<label for>`. A `placeholder` is not a label — it disappears on input.
- The asterisk is decorative; `sr-only` text carries "required" to screen readers.
- `user-invalid:` styles only after interaction. `invalid:` fires on an untouched empty required
  field, flagging errors before the user has done anything.

Useful form variants: `required:`, `disabled:`, `checked:`, `indeterminate:`, `placeholder-shown:`,
`user-valid:`, `user-invalid:`, `read-only:`, `autofill:`.

## Touch targets

WCAG 2.5.8 asks for 24×24 CSS pixels minimum; 44×44 is the comfortable target.

```html
<button class="min-h-11 min-w-11 p-2 pointer-coarse:p-3">
  <svg class="size-5" aria-hidden="true"><!-- ... --></svg>
</button>
```

## Checklist

- [ ] Every interactive element has a visible `focus-visible:` indicator
- [ ] `outline-hidden`, never bare `outline-none`, and only with a replacement
- [ ] Text contrast ≥ 4.5:1 (≥ 3:1 for large text and UI boundaries) in **both** themes
- [ ] State is never conveyed by color alone
- [ ] Every `<img>` has `alt` (empty `alt=""` when decorative); decorative SVGs are `aria-hidden`
- [ ] Icon-only buttons have `aria-label` or `sr-only` text
- [ ] Every input has an associated `<label for>`
- [ ] Errors use `aria-invalid` + `aria-describedby`
- [ ] Semantic `<ul>` lists carry `role="list"` (Preflight removes list semantics)
- [ ] Headings are sized explicitly and nest without skipping levels
- [ ] Animations honor `motion-reduce:`
- [ ] Skip link present; focus moves on route change
- [ ] Landmarks used: `<header>`, `<nav aria-label>`, `<main>`, `<footer>`
- [ ] Touch targets at least 44×44px
- [ ] Keyboard-only pass: reach and operate everything, no traps, visible focus throughout
