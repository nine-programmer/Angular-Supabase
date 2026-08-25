You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Do NOT set `changeDetection: ChangeDetectionStrategy.OnPush` explicitly. `OnPush` is the default in Angular v22+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

### Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `model()` for two-way bound properties with `[(prop)]` syntax instead of pairing `input()` with `output()`
- Use `computed()` for derived state
- Use `linkedSignal()` for state derived from multiple reactive sources that must stay synchronized
- Prefer inline templates for small components
- Prefer Signal Forms (`@angular/forms/signals`) for new forms. They are stable in Angular v22+ and provide signal-based state, type-safe field access, and schema-based validation
- When not using Signal Forms, prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- When using external templates/styles, use paths relative to the component TS file.

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Prefer the `@Service` decorator over `@Injectable({providedIn: 'root'})` for new singleton services (Angular v22+)
- Use the `inject()` function instead of constructor injection

## Server-Side Rendering (SSR)

Applies when the project has `@angular/ssr` enabled (hydration via `provideClientHydration()` and an Express host, by default `src/server.ts`). Check `angular.json` / `app.config.ts` to confirm before applying these rules.

- Never access `window`, `document`, `localStorage`, `sessionStorage`, or `navigator` at class-field initialization, in constructors, or inside `computed()`/`effect()` without a browser guard. They do not exist on the server.
- For browser-only code, prefer `afterNextRender()` / `afterRenderEffect()` over `isPlatformBrowser(inject(PLATFORM_ID))`. Use the platform check only when you need to branch logic at injection time.
- Define per-route render modes in `src/app/app.routes.server.ts`. Public/static pages: `RenderMode.Prerender`. Pages that depend on the logged-in user or dynamic data: `RenderMode.Server` or `RenderMode.Client`. Do NOT prerender pages that require authentication.
- Use `httpResource()` / `resource()` for data fetching so results are transferred to the client via hydration and not re-fetched on bootstrap.
- Keep `src/server.ts` free of application logic; it is only the Express host.

## Supabase

- Create exactly ONE Supabase client, owned by a single singleton service (e.g. `SupabaseService`). All other services depend on it via `inject()`. Never call `createClient()` anywhere else.
- Read the project URL and anon key from the project's environment configuration (e.g. Angular `environment*.ts` files). Never hard-code keys and never ship the `service_role` key to the client.
- The Supabase client touches `localStorage` for auth persistence. Initialize it lazily on the browser only (see SSR section). On the server, either skip client creation or create it with `persistSession: false` and `autoRefreshToken: false`.
- Use a typed client: generate `Database` types with `supabase gen types typescript` into the location the project's architecture designates for generated/shared types, and pass them as `createClient<Database>(...)`. Do NOT hand-write table types.
- Every table MUST have Row Level Security enabled with explicit policies. Never rely on client-side checks for authorization.
- Wrap Supabase calls in services that return Promises or `resource()` signals. Components must not import `@supabase/supabase-js` directly.
- Handle the `{ data, error }` result explicitly. Never ignore `error`; surface it to the user or rethrow.
- Keep schema changes as Supabase CLI migration files (default `supabase/migrations/`, or wherever the project already keeps them). Do not edit the database schema manually through the dashboard without a matching migration.

## Tailwind CSS v4

- Tailwind v4 is CSS-first. There is NO `tailwind.config.js`. Configuration lives in `src/styles.css` via `@import 'tailwindcss'`, `@theme { ... }` for design tokens, and `@source` for content scanning.
- Define colors, fonts, spacing, and breakpoints as CSS variables inside `@theme`, not in JavaScript.
- Apply utility classes directly in templates. Use `@apply` sparingly and only inside component stylesheets for repeated patterns that cannot be expressed as a component.
- Use `class` bindings (`[class.active]="isActive()"`) or `computed()` signals to toggle utility classes. Do NOT concatenate class strings in templates.
- Keep `@source not` exclusions for agent skill directories (`.claude`, `.agents`) so their docs are not scanned into the production bundle.
- Use `dark:` variants with `prefers-color-scheme`, and container queries (`@container`, `@md:`) for component-level responsiveness.
- All color pairings MUST meet WCAG AA contrast (see Accessibility Requirements).

## Testing (Vitest)

- Unit tests run on Vitest with jsdom (`ng test`). Use `describe`, `it`, `expect`, and `vi` (for mocks/spies). Do NOT use Jasmine (`jasmine.createSpy`, `spyOn` from Jasmine) or Karma APIs.
- Use `TestBed` for component and service tests. Because the app is zoneless, use `await fixture.whenStable()` instead of `fixture.detectChanges()` to flush signal updates before asserting on the DOM.
- Mock the Supabase service at the DI boundary (`TestBed.overrideProvider` / `{ provide: SupabaseService, useValue: ... }`). Never hit a real Supabase project from unit tests.
- Co-locate spec files with the code under test (`foo.ts` → `foo.spec.ts`).
- Every new service and non-trivial component MUST ship with a spec.

## Project Structure

- Before creating or moving any file, look for an existing architecture definition (`ARCHITECTURE.md`, `README.md`, or the established folder layout) and follow it. The project's existing structure ALWAYS takes precedence over any path mentioned in this document.
- Paths in this document (`environments/`, `shared/`, `supabase/migrations/`, etc.) are defaults for a fresh Angular CLI + Supabase project only. If the project already organizes these concerns differently, use its convention instead.
- Do NOT introduce a new top-level folder or naming convention without asking the user first.

## Working Rules

- Always communicate with the user in Thai. Code, comments, identifiers, and commit messages stay in English.
- Do NOT guess. If any part of a request is unclear or you are not confident, ask the user clarifying questions first and wait for answers before proceeding.
- Keep every file under 300 lines unless truly unavoidable. If a file grows beyond that, split it into smaller components, services, or modules and import them.
- Write unit tests for any code that is complex or expected to change frequently.
- Any variable, constant, or function used more than once MUST be extracted into the project's designated shared location and imported, never duplicated.
