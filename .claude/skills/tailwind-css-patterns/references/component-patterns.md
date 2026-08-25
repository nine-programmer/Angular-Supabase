# Angular Component Patterns

Reusable standalone components styled with Tailwind v4, following Angular v20+ conventions:
`input()` / `output()` / `model()`, `computed()` for derived state, native control flow, no
`ngClass` / `ngStyle`, no decorators for host bindings.

Adapt names and content to the domain you are building — the components below are structural
examples, not a component library to copy verbatim.

## When to extract a component

Extract when the same class string appears in **two or more files**. A `@for` loop is not
duplication — the class list is authored once, so leave it inline.

For a single element repeated across templates where a component feels heavy, a `@utility` in
`styles.css` is the lighter option:

```css
@utility card {
  border-radius: var(--radius-xl);
  background-color: var(--color-white);
  padding: --spacing(6);
  box-shadow: var(--shadow-sm);
}
```

## Button

Variant and size maps live as object literals so every class is a complete string Tailwind can see.

```ts
import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'ui-button',
  template: `
    <button [type]="type()" [disabled]="disabled() || loading()" [class]="classes()">
      @if (loading()) {
        <svg
          class="size-4 animate-spin motion-reduce:animate-none"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      }
      <ng-content />
    </button>
  `,
  host: { class: 'contents' },
})
export class UiButton {
  readonly variant = input<'primary' | 'secondary' | 'danger' | 'ghost'>('primary');
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly disabled = input(false);
  readonly loading = input(false);

  private readonly variants = {
    primary: 'bg-brand-600 text-white hover:bg-brand-700 focus-visible:outline-brand-600',
    secondary:
      'bg-white text-gray-900 ring-1 ring-gray-300 hover:bg-gray-50 focus-visible:outline-gray-600 ' +
      'dark:bg-gray-900 dark:text-white dark:ring-gray-700 dark:hover:bg-gray-800',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-600',
    ghost:
      'text-gray-700 hover:bg-gray-100 focus-visible:outline-gray-600 ' +
      'dark:text-gray-300 dark:hover:bg-gray-800',
  } as const;

  private readonly sizes = {
    sm: 'gap-1.5 px-3 py-1.5 text-sm',
    md: 'gap-2 px-4 py-2 text-base',
    lg: 'gap-2 px-6 py-3 text-lg',
  } as const;

  protected readonly classes = computed(() =>
    [
      'inline-flex items-center justify-center rounded-lg font-semibold',
      'transition-colors focus-visible:outline-2 focus-visible:outline-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
      this.variants[this.variant()],
      this.sizes[this.size()],
    ].join(' '),
  );
}
```

`host: { class: 'contents' }` removes the wrapper element from layout so the `<button>` participates
directly in the parent's flex or grid.

Usage:

```html
<ui-button variant="danger" size="sm" [loading]="isDeleting()">Delete</ui-button>
```

## Card

```ts
import { Component } from '@angular/core';

@Component({
  selector: 'ui-card',
  template: `
    <div
      class="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200
             dark:bg-gray-900 dark:ring-gray-800"
    >
      <div class="p-6">
        <ng-content />
      </div>
      <div class="border-t border-gray-200 bg-gray-50 px-6 py-3 empty:hidden
                  dark:border-gray-800 dark:bg-gray-950">
        <ng-content select="[card-footer]" />
      </div>
    </div>
  `,
})
export class UiCard {}
```

`empty:hidden` collapses the footer when no projected content is supplied.

## Status badge

**This is the most reusable pattern in this skill.** The shape — a fixed union type, a lookup map
of complete class strings, a `computed()` that indexes it — is how you make styling depend on data
without ever constructing a class name. Reach for it any time appearance varies by state:
severity levels, order status, roles, plan tiers, sync state, categories.

The status set below is deliberately generic. Replace it with whatever states your domain has; the
structure is what carries over.

```ts
import { Component, computed, input } from '@angular/core';

export type Status = 'active' | 'pending' | 'success' | 'error' | 'neutral';

@Component({
  selector: 'ui-status-badge',
  template: `
    <span [class]="classes()">
      <span class="size-1.5 rounded-full bg-current" aria-hidden="true"></span>
      {{ label() }}
    </span>
  `,
})
export class UiStatusBadge {
  readonly status = input.required<Status>();
  readonly label = input.required<string>();

  // Every class is a complete literal, so Tailwind's scanner finds all of them.
  private readonly styles: Record<Status, string> = {
    active: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
    pending: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    success: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300',
    error: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
    neutral: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  };

  protected readonly classes = computed(
    () =>
      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ' +
      this.styles[this.status()],
  );
}
```

```html
<ui-status-badge status="error" label="Overdue" />
<ui-status-badge status="success" label="Paid" />
```

Two things worth copying along with the structure:

- Typing the map as `Record<Status, string>` makes a missing key a compile error, so adding a state
  to the union forces you to give it a style.
- Taking the visible text as a separate `label` input keeps the component domain-agnostic — the
  same badge serves every feature in the app.

The colored dot is decorative and marked `aria-hidden`; the text carries the meaning, so status is
never communicated by color alone (WCAG 1.4.1).

## Modal — native `<dialog>`

A native `<dialog>` gives focus trapping, `Esc` to close, and inert background for free. Do not
rebuild those with a `<div>`.

```ts
import { Component, ElementRef, effect, input, model, viewChild } from '@angular/core';

@Component({
  selector: 'ui-modal',
  template: `
    <dialog
      #dialog
      (close)="open.set(false)"
      class="m-auto w-full max-w-md rounded-xl bg-white p-0 shadow-xl
             backdrop:bg-black/50 dark:bg-gray-900"
    >
      <div class="flex items-start justify-between gap-4 p-6 pb-0">
        <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ heading() }}</h2>
        <button
          type="button"
          (click)="close()"
          aria-label="Close dialog"
          class="-m-2 rounded-md p-2 text-gray-400 transition-colors hover:bg-gray-100
                 hover:text-gray-600 focus-visible:outline-2 focus-visible:outline-offset-2
                 focus-visible:outline-gray-600 dark:hover:bg-gray-800"
        >
          <svg class="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="p-6 text-gray-700 dark:text-gray-300">
        <ng-content />
      </div>

      <div class="flex justify-end gap-3 border-t border-gray-200 px-6 py-4 dark:border-gray-800">
        <ng-content select="[modal-actions]" />
      </div>
    </dialog>
  `,
})
export class UiModal {
  readonly heading = input.required<string>();
  readonly open = model(false);

  private readonly dialogRef = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  constructor() {
    effect(() => {
      const dialog = this.dialogRef().nativeElement;
      if (this.open()) {
        if (!dialog.open) dialog.showModal();
      } else if (dialog.open) {
        dialog.close();
      }
    });
  }

  protected close(): void {
    this.open.set(false);
  }
}
```

Two details that matter:

- `m-auto` is required. Preflight removes the browser's default `<dialog>` margins, so without it
  the dialog pins to the top-left.
- `backdrop:bg-black/50` styles `::backdrop`. No separate overlay element is needed.

The `effect()` touches the DOM but only ever runs in the browser — effects do not execute during
server-side rendering — so no platform guard is needed here.

## Form field

Markup that works with Signal Forms or Reactive Forms. The label is associated by `for`/`id`, and
the error message is wired with `aria-describedby` so screen readers announce it.

```ts
import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'ui-form-field',
  template: `
    <div class="flex flex-col gap-1.5">
      <label [for]="fieldId()" class="text-sm font-medium text-gray-900 dark:text-white">
        {{ label() }}
        @if (required()) {
          <span class="text-red-600" aria-hidden="true">*</span>
        }
      </label>

      <ng-content />

      @if (error()) {
        <p [id]="errorId()" class="text-sm text-red-600 dark:text-red-400">{{ error() }}</p>
      } @else if (hint()) {
        <p [id]="hintId()" class="text-sm text-gray-500 dark:text-gray-400">{{ hint() }}</p>
      }
    </div>
  `,
})
export class UiFormField {
  readonly label = input.required<string>();
  readonly fieldId = input.required<string>();
  readonly hint = input('');
  readonly error = input('');
  readonly required = input(false);

  protected readonly errorId = computed(() => `${this.fieldId()}-error`);
  protected readonly hintId = computed(() => `${this.fieldId()}-hint`);
}
```

The input itself:

```html
<ui-form-field label="Email" fieldId="email" [error]="emailError()" [required]="true">
  <input
    id="email"
    type="email"
    required
    [attr.aria-invalid]="emailError() ? 'true' : null"
    [attr.aria-describedby]="emailError() ? 'email-error' : null"
    class="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900
           placeholder:text-gray-400
           focus-visible:border-brand-600 focus-visible:outline-2
           focus-visible:outline-offset-0 focus-visible:outline-brand-600
           user-invalid:border-red-600
           disabled:cursor-not-allowed disabled:bg-gray-50
           dark:border-gray-700 dark:bg-gray-900 dark:text-white"
  />
</ui-form-field>
```

`user-invalid:` only styles a field after the user has interacted with it — unlike `invalid:`,
which flags an empty required field the moment the page loads.

## Navbar with active link

`routerLinkActive` takes a class list, so active styling needs no bindings at all.

```html
<nav class="flex items-center gap-1" aria-label="Main">
  @for (link of links; track link.path) {
    <a
      [routerLink]="link.path"
      routerLinkActive="bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"
      [routerLinkActiveOptions]="{ exact: link.exact }"
      #rla="routerLinkActive"
      [attr.aria-current]="rla.isActive ? 'page' : null"
      class="rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition-colors
             hover:bg-gray-50 hover:text-gray-900
             focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600
             dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
    >
      {{ link.label }}
    </a>
  }
</nav>
```

`aria-current="page"` is what tells a screen reader which link is active — the background color
alone does not.

## List with `@for` and `@empty`

```html
<ul role="list" class="divide-y divide-gray-200 dark:divide-gray-800">
  @for (item of items(); track item.id) {
    <li class="flex items-center justify-between gap-4 py-4">
      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-medium text-gray-900 dark:text-white">{{ item.name }}</p>
        <p class="truncate text-sm text-gray-500 dark:text-gray-400">{{ item.category }}</p>
      </div>
      <ui-status-badge [status]="item.status" [label]="item.statusLabel" />
    </li>
  } @empty {
    <li class="py-12 text-center text-sm text-gray-500">No items found</li>
  }
</ul>
```

`role="list"` is deliberate: Preflight sets `list-style: none`, and VoiceOver stops announcing an
unstyled `<ul>` as a list without it.

## Skeleton loader

```html
<div class="flex flex-col gap-4" aria-busy="true" aria-live="polite">
  <span class="sr-only">Loading items</span>
  @for (i of [1, 2, 3]; track i) {
    <div class="animate-pulse motion-reduce:animate-none rounded-lg bg-gray-100 p-4 dark:bg-gray-900">
      <div class="h-4 w-3/4 rounded-sm bg-gray-200 dark:bg-gray-800"></div>
      <div class="mt-3 h-4 w-1/2 rounded-sm bg-gray-200 dark:bg-gray-800"></div>
    </div>
  }
</div>
```

## Empty state

```html
<div class="flex flex-col items-center gap-4 rounded-xl border-2 border-dashed border-gray-300 p-12
            text-center dark:border-gray-700">
  <svg class="size-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
  </svg>
  <div>
    <h3 class="text-base font-semibold text-gray-900 dark:text-white">No loans yet</h3>
    <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Borrowed items will appear here.</p>
  </div>
  <ui-button size="sm">Browse items</ui-button>
</div>
```
