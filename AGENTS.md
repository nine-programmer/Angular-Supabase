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
- Relative `/api/...` URLs do not resolve during server-side rendering. Provide a server-only `HttpInterceptorFn` (registered in `app.config.server.ts`) that prefixes the local origin (`http://localhost:${PORT}`) so the same `httpResource()` call works in both the browser and the SSR pass.
- Keep `src/server.ts` free of application logic; it is only the Express host. It mounts the API router from `src/server/` and then hands every other request to the Angular engine.

## API Layer (Angular SSR + Express)

The same Angular SSR process serves BOTH the frontend and the backend API. The browser never talks to Supabase; it only calls `/api/*`.

- All API code lives under `src/server/` and runs on Node only:
  - `src/server/routes/` — one `express.Router` per resource (e.g. `items.routes.ts`), mounted under `/api` from `src/server.ts`.
  - `src/server/services/` — business logic per resource; the only place that calls Supabase.
  - `src/server/supabase.ts` — the ONE Supabase client (see Supabase section).
  - `src/server/env.ts` — reads and validates `process.env` once; every other server file imports config from here.
- Code under `src/app/` MUST NOT import anything from `src/server/`. Doing so pulls Node-only code and secrets into the browser bundle.
- Code shared by both sides (generated `Database` types, request/response DTOs) lives in `src/shared/` and must be plain TypeScript with no Node or browser globals.
- Browser-side Angular services call `/api/*` via `HttpClient` / `httpResource()` and expose signals or Promises to components. Components must not call `HttpClient` directly.
- Every API route validates its input, returns JSON, and maps errors to an HTTP status plus a `{ error: string }` body. Never leak raw Supabase/Postgres errors to the browser.
- Business rules that must be atomic (stock counters, sequential numbers, status transitions) are enforced in a single Postgres function called with `.rpc()` or in a DB constraint, never by read-then-write in the API handler.
- Authentication and authorization, when a project needs them, are enforced in `src/server/` middleware. Never rely on browser-side checks.

## Supabase

- Create exactly ONE Supabase client, in `src/server/supabase.ts`, with `createClient<Database>(...)`, `persistSession: false`, and `autoRefreshToken: false`. Never call `createClient()` anywhere else, and never import `@supabase/supabase-js` under `src/app/` or `src/shared/`.
- The server uses the `service_role` key, read from `process.env` (via `src/server/env.ts`, loaded from `.env`). It is a secret: never put it in `environment*.ts`, never commit `.env`, and always keep `.env.example` up to date with the variable names.
- Use a typed client: generate `Database` types with `supabase gen types typescript` into `src/shared/types/database.types.ts`. Do NOT hand-write table types; derive row types with `Tables<'table_name'>`.
- Every table MUST have Row Level Security enabled. Because the browser has no Supabase access, tables normally have NO policies for `anon`/`authenticated` (deny-all); only the server's `service_role` key can reach them. Authorization lives in the API layer.
- Handle the `{ data, error }` result explicitly in `src/server/services/`. Never ignore `error`; map it to an API error response.
- Keep schema changes as Supabase CLI migration files in `supabase/migrations/` (one file per schema change, named `NNN_description.sql`). Do not edit the database schema manually through the dashboard without a matching migration.

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
- Browser-side services: mock HTTP with `provideHttpClient()` + `provideHttpClientTesting()` and assert on the `/api/*` calls. Server-side services under `src/server/`: mock the Supabase client module with `vi.mock('./supabase')`. Never hit a real Supabase project from unit tests.
- Co-locate spec files with the code under test (`foo.ts` → `foo.spec.ts`).
- Every new service and non-trivial component MUST ship with a spec.

## Project Structure

This repository is a template: each customer mini app is cloned from it into its own repo. The canonical layout is:

```
src/
├── app/                      Angular app (browser + SSR render)
│   ├── pages/                one folder per routed page
│   ├── components/           reusable UI pieces
│   ├── services/             HttpClient / httpResource wrappers for /api/*
│   ├── app.routes.ts
│   └── app.routes.server.ts  per-route RenderMode
├── server/                   API layer, Node only (see API Layer section)
│   ├── env.ts
│   ├── supabase.ts
│   ├── routes/
│   └── services/
├── shared/                   imported by BOTH app/ and server/
│   ├── types/database.types.ts   generated by `supabase gen types`
│   └── dto/                  request/response types for /api/*
├── server.ts                 Express host only
└── environments/             non-secret browser config only
supabase/migrations/          SQL migrations
.env / .env.example           server secrets (never commit .env)
```

- Before creating or moving any file, check the layout above and any `SYSTEM_SPEC.md` / `docs/` the project ships with, and follow them. An existing project's structure takes precedence over the defaults here.
- Do NOT introduce a new top-level folder or naming convention without asking the user first.

## Working Rules

- Always communicate with the user in Thai. Code, comments, identifiers, and commit messages stay in English.
- Do NOT guess. If any part of a request is unclear or you are not confident, ask the user clarifying questions first and wait for answers before proceeding.
- Keep every file under 300 lines unless truly unavoidable. If a file grows beyond that, split it into smaller components, services, or modules and import them.
- Write unit tests for any code that is complex or expected to change frequently.
- Any variable, constant, or function used more than once MUST be extracted into the project's designated shared location and imported, never duplicated.
