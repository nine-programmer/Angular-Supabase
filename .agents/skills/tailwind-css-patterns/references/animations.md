# Animations and Transitions

Angular's recommendation is to use native CSS for animation rather than the legacy
`@angular/animations` DSL. Tailwind covers nearly all of it with utilities.

## Transitions

```html
<button class="bg-brand-600 transition-colors duration-300 hover:bg-brand-700">
  Smooth color change
</button>
```

| Class | Transitions |
| --- | --- |
| `transition` | colors, opacity, box-shadow, transform, translate, scale, rotate, filter, backdrop-filter, display, content-visibility, overlay, pointer-events |
| `transition-colors` | color, background-color, border-color, **outline-color**, text-decoration-color, fill, stroke, gradient stops |
| `transition-opacity` | opacity |
| `transition-shadow` | box-shadow |
| `transition-transform` | transform, translate, scale, rotate |
| `transition-none` | nothing |

Default duration is 150ms with `cubic-bezier(0.4, 0, 0.2, 1)`. Adjust with `duration-*` and
`ease-linear` / `ease-in` / `ease-out` / `ease-in-out`.

Note that `transition-colors` now includes `outline-color`. If you change outline width on hover,
set the outline color unconditionally so it does not animate from the initial value:

```html
<button class="outline-brand-600 transition hover:outline-2">Save</button>
```

Custom property lists:

```html
<div class="transition-[height]"></div>
<div class="transition-(--my-properties)"></div>
```

## Transforms

The v3 `transform` class is unnecessary in v4 — `scale-*`, `rotate-*`, and `translate-*` set
individual CSS properties and work on their own.

```html
<div class="transition-transform duration-300 hover:scale-105">Lift on hover</div>
<img class="transition-transform duration-300 hover:rotate-6" [ngSrc]="src()" width="200" height="200" alt="" />
<div class="transition hover:-translate-y-1 hover:scale-105">Rise and grow</div>
```

Because they are separate properties, resetting one means naming that property. `transform-none`
does not undo a scale:

```html
<!-- v3 -->
<button class="scale-150 focus:transform-none"></button>

<!-- v4 -->
<button class="scale-150 focus:scale-none"></button>
```

## Built-in animations

| Class | Effect |
| --- | --- |
| `animate-spin` | continuous rotation — loading spinners |
| `animate-ping` | expanding ring — notification dots |
| `animate-pulse` | fading opacity — skeleton placeholders |
| `animate-bounce` | vertical bounce — scroll cues |
| `animate-none` | cancels an animation |

```html
<!-- Spinner. aria-hidden because the surrounding control carries aria-busy. -->
<svg class="size-5 animate-spin motion-reduce:animate-none" viewBox="0 0 24 24" fill="none" aria-hidden="true">
  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
</svg>

<!-- Notification badge -->
<span class="relative flex size-3">
  <span class="absolute inline-flex size-full animate-ping rounded-full bg-red-400 opacity-75
               motion-reduce:animate-none"></span>
  <span class="relative inline-flex size-3 rounded-full bg-red-500"></span>
</span>
```

## Custom animations

Define keyframes **inside** `@theme` so they travel with the token:

```css
@theme {
  --animate-fade-in: fade-in 0.3s ease-out;
  --animate-slide-up: slide-up 0.3s ease-out;

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slide-up {
    from {
      opacity: 0;
      transform: translateY(0.5rem);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
}
```

```html
<div class="animate-fade-in motion-reduce:animate-none">Fades in</div>
<div class="animate-slide-up motion-reduce:animate-none">Slides up</div>
```

Arbitrary values, when a token is overkill:

```html
<div class="animate-[wiggle_1s_ease-in-out_infinite]"></div>
<div class="animate-(--my-animation)"></div>
```

## Entry animations with `@starting-style`

For elements that animate in when added to the DOM — an `@if` block, a toast — `starting:` sets the
values the transition begins from. This replaces enter-animation machinery from the animations DSL.

```html
@if (showToast()) {
  <div
    class="fixed bottom-4 right-4 rounded-lg bg-gray-900 px-4 py-3 text-white
           transition-all transition-discrete duration-300
           starting:translate-y-4 starting:opacity-0
           motion-reduce:transition-none"
    role="status"
  >
    Item returned successfully
  </div>
}
```

## Reduced motion

Some people get motion sickness from movement on screen. `prefers-reduced-motion` is how they say
so, and honoring it is a WCAG 2.3.3 requirement — non-negotiable under this project's AA target.

- `motion-reduce:` applies when reduced motion is requested.
- `motion-safe:` applies only when it is **not**.

```html
<!-- Suppress the movement, keep the element -->
<div class="transition-transform hover:scale-105 motion-reduce:transition-none motion-reduce:hover:scale-100">
  Card
</div>

<!-- Or opt in the other way: animate only when motion is welcome -->
<div class="motion-safe:animate-fade-in">Panel</div>
```

Rules of thumb:

1. Every `animate-*` gets `motion-reduce:animate-none`, unless it conveys state that has no other
   indicator (a spinner may keep spinning if nothing else signals loading — but pair it with
   `aria-busy` and prefer to keep it anyway).
2. Every transform-based transition gets a `motion-reduce:` counterpart.
3. Color and opacity transitions are generally safe to leave alone; motion is the trigger, not
   change itself.

Avoid the blunt global override:

```css
/* Discouraged: overrides every animation on the page, including ones that
   communicate state, and fights any per-element decision you make. */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

Per-element `motion-reduce:` variants express the same intent with the ability to make exceptions.
