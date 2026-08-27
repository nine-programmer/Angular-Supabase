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
- Declare singleton services with the `@Service()` decorator (Angular v22+). It provides the class in the root injector on its own — there is no `providedIn` option on it, and `@Injectable({providedIn: 'root'})` is the old spelling of the same thing. Pass `{ autoProvided: false }` only for a service that a `providers` array must supply instead.
- Use the `inject()` function instead of constructor injection

## Server-Side Rendering (SSR)

Applies when the project has `@angular/ssr` enabled (hydration via `provideClientHydration()` and an Express host, by default `src/server.ts`). Check `angular.json` / `app.config.ts` to confirm before applying these rules.

- Never access `window`, `document`, `localStorage`, `sessionStorage`, or `navigator` at class-field initialization, in constructors, or inside `computed()`/`effect()` without a browser guard. They do not exist on the server.
- For browser-only code, prefer `afterNextRender()` / `afterRenderEffect()` over `isPlatformBrowser(inject(PLATFORM_ID))`. Use the platform check only when you need to branch logic at injection time.
- Define per-route render modes in `src/app/app.routes.server.ts`. Public/static pages: `RenderMode.Prerender`. Pages that depend on the logged-in user or dynamic data: `RenderMode.Server` or `RenderMode.Client`. Do NOT prerender pages that require authentication.
- Use `httpResource()` / `resource()` for data fetching so results are transferred to the client via hydration and not re-fetched on bootstrap.
- Relative `/api/...` URLs do not resolve during server-side rendering. Register `provideHttpClient()` in `app.config.ts` (no `withFetch()` — `FetchBackend` is already the default `HttpBackend`; `withFetch()` is deprecated), and in `app.config.server.ts` add a server-only `HttpInterceptorFn` that prefixes the origin of the incoming request (`new URL(inject(REQUEST).url).origin`, falling back to `http://localhost:${PORT}`) so the same `httpResource()` call works in the browser, in `ng serve` (port 4200), and in production (port 4000).
- Keep `src/server.ts` free of application logic; it is only the Express host. It mounts the API router from `src/server/` and then hands every other request to the Angular engine.
- `AngularNodeAppEngine` rejects every SSR request with a 400 unless its `Host` header is in an allowlist (SSRF prevention). The template reads this from `NG_ALLOWED_HOSTS` (comma-separated, set in `src/server/env.ts` with a `localhost` default for local dev) — before deploying a project, set `NG_ALLOWED_HOSTS` to its real domain(s) via the hosting platform's env vars, or every page will 400 in production. The engine unions that env var with `security.allowedHosts` in `angular.json`, which is left empty on purpose: baking a domain into the build would tie one bundle to one deployment.

## API Layer (Angular SSR + Express)

The same Angular SSR process serves BOTH the frontend and the backend API. The browser never talks to Supabase; it only calls `/api/*`.

- All API code lives under `src/server/` and runs on Node only. File layout and naming are defined in `docs/ARCHITECTURE.md` (sections 3 and 5); follow it exactly.
- Import direction is one-way: `src/app/` → `src/shared/` ← `src/server/` (see `docs/ARCHITECTURE.md` section 4). `src/app/` MUST NOT import from `src/server/`; `src/server/` MUST NOT import from `src/app/`; `src/shared/` imports only from within `src/shared/`.
- `src/server/services/` is the ONLY place that calls Supabase. Route files validate input and call a service; they never query the database themselves.
- `src/server/env.ts` reads and validates `process.env` once; every other server file imports config from there. Never read `process.env` elsewhere — the single exception is `src/app/core/api-origin.interceptor.ts`, which cannot import from `src/server/` and therefore reads `PORT` directly for its SSR-only fallback.
- `src/shared/` is plain TypeScript with no Node or browser globals: generated `Database` types, request/response DTOs, and enums/constants. Write enums as `as const` objects plus a derived union type, not TypeScript `enum`, and keep their values identical to the DB `CHECK` constraints.
- Browser-side Angular services (`<feature>-client.service.ts`) call `/api/*` via `HttpClient` / `httpResource()` and expose signals or Promises to components. Components must not call `HttpClient` directly.
- Every API route validates its input with a `zod` schema (`schema.safeParse(req.body)`; on failure respond `400`), returns JSON, and maps errors to an HTTP status plus a `{ error: string }` body. Never leak raw Supabase/Postgres errors to the browser.
- Declare request/response schemas in `src/shared/dto/<feature>.dto.ts` as `zod` schemas and derive the TypeScript types with `z.infer<typeof schema>`; never write a separate interface for the same shape. `zod` is plain TypeScript, so it is allowed in `src/shared/` and may be reused by browser-side forms.
- Business rules that must be atomic (stock counters, sequential numbers, status transitions) are enforced in a single Postgres function called with `.rpc()` or in a DB constraint, never by read-then-write in the API handler.
- Authentication and authorization, when a project needs them, are enforced in `src/server/` middleware. Never rely on browser-side checks.

## Supabase

- Create exactly ONE Supabase client, in `src/server/supabase.ts`, with `createClient<Database>(...)`, `persistSession: false`, and `autoRefreshToken: false`. Never call `createClient()` anywhere else, and never import `@supabase/supabase-js` under `src/app/` or `src/shared/`.
- The server uses the `service_role` key, read from `process.env` (via `src/server/env.ts`, loaded from `.env`). It is a secret: never put it in `environment*.ts`, never share or upload `.env`, and always keep `.env.example` up to date with the variable names.
- Use a typed client: generate `Database` types with `npm run db:types` (Supabase CLI is a devDependency; do not assume a global install) into `src/shared/types/database.types.ts`. Do NOT hand-write table types; derive row types with `Tables<'table_name'>`.
- Every table MUST have Row Level Security enabled. Because the browser has no Supabase access, tables normally have NO policies for `anon`/`authenticated` (deny-all); only the server's `service_role` key can reach them. Authorization lives in the API layer.
- Handle the `{ data, error }` result explicitly in `src/server/services/`. Never ignore `error`; map it to an API error response.
- Keep schema changes as Supabase CLI migration files in `supabase/migrations/` (one file per schema change; create with `npm run db:migration -- <description>`, which names it `<timestamp>_description.sql` — never rename it). The database is the Supabase cloud project only (no local/Docker): apply migrations with `npm run db:push`, then regenerate types with `npm run db:types`. Do not edit the database schema manually through the dashboard without a matching migration.
- The installed `supabase-postgres-best-practices` skill is general Postgres reference material, and this file wins wherever they differ — in particular its RLS-policy guidance: this template keeps tables deny-all behind the API. Its primary-key advice also loses: keep `uuid` primary keys as defined in `docs/ARCHITECTURE.md` section 6 (never `bigint identity`); `uuidv7()` is allowed only when the project's Postgres is 18+. Never adopt a local-database workflow (`supabase start`, `--local`, `supabase db pull` / `db diff`, `supabase db query`) or declarative schemas (`supabase/schemas/`) from any source; each migration is hand-written and pushed to the cloud project.
- Postgres functions called via `.rpc()` default to `SECURITY INVOKER`; since the server connects as `service_role`, that is enough. Do not add `SECURITY DEFINER` to work around a permission error, and if one is ever required, set `search_path` explicitly inside it (`SET search_path = public`) so it cannot be hijacked.

## Tailwind CSS v4

- Tailwind v4 is CSS-first. There is NO `tailwind.config.js`. Configuration lives in `src/styles.css` via `@import 'tailwindcss'`, `@theme { ... }` for design tokens, and `@source` for content scanning.
- Define colors, fonts, spacing, and breakpoints as CSS variables inside `@theme`, not in JavaScript.
- Apply utility classes directly in templates. Use `@apply` sparingly and only inside component stylesheets for repeated patterns that cannot be expressed as a component.
- Use `class` bindings (`[class.active]="isActive()"`) or `computed()` signals to toggle utility classes. Do NOT concatenate class strings in templates.
- Keep the `@source not` exclusions in `src/styles.css` (agent skill folders, editor/tool config, `.sessions/`, `docs/`) so markdown that quotes class names is not scanned into the production bundle. Angular templates only live under `src/`, so add a new exclusion whenever a documentation or tool folder is added.
- Use `dark:` variants with `prefers-color-scheme`, and container queries (`@container`, `@md:`) for component-level responsiveness.
- All color pairings MUST meet WCAG AA contrast (see Accessibility Requirements).

## Testing (Vitest)

- Unit tests run on Vitest with jsdom (`ng test`). Use `describe`, `it`, `expect`, and `vi` (for mocks/spies). Do NOT use Jasmine (`jasmine.createSpy`, `spyOn` from Jasmine) or Karma APIs.
- Use `TestBed` for component and service tests. Because the app is zoneless, use `await fixture.whenStable()` instead of `fixture.detectChanges()` to flush signal updates before asserting on the DOM.
- Browser-side services: mock HTTP with `provideHttpClient()` + `provideHttpClientTesting()` and assert on the `/api/*` calls. Server-side services under `src/server/`: mock the Supabase client module with `vi.mock('../supabase')` (spec files live in `src/server/services/`). Never hit a real Supabase project from unit tests.
- Co-locate spec files with the code under test (`foo.ts` → `foo.spec.ts`).
- `ng test` errors out when a project contains no spec at all, so the template keeps `src/app/app.spec.ts` as a deliberate exception to the rule below: it only asserts that the root component bootstraps. Do not extend it — replace it once the project has real specs.
- Do NOT write a spec for every file. Write unit tests ONLY for code that meets at least one of these: (1) it performs calculations or non-trivial data transformation (totals, date/queue arithmetic, sorting/grouping rules, status-transition logic); (2) it is expected to change frequently; (3) it is complex enough that a test is needed to verify or safely modify it. Plain CRUD routes, pass-through services that only forward to Supabase/`.rpc()`, simple display components, DTOs, and enums do NOT need a spec.
- When a task does need tests, the TASKS.md test line must say which file/function is tested and why (e.g. "spec `bookings-server.service.spec.ts`: คำนวณ `ahead`"). If no file in the task meets the criteria, do not add a spec line.

## Project Structure & Docs

This repository is a template: each customer mini app is cloned from it into its own repo.

- The canonical folder layout, file naming, import direction, and database conventions are defined ONCE in `docs/ARCHITECTURE.md`. Read it before creating or moving any file, and follow it exactly. Do NOT modify `docs/ARCHITECTURE.md` inside a customer project; changes belong in the template.
- A customer project ships `docs/SYSTEM_SPEC.md` (what to build; tables, business rules, and API paths are LOCKED after review) and `docs/TASKS.md` (living progress file). Later rounds add `docs/features/<name>/SPEC.md` + `TASKS.md`.
- When these docs exist: read `AGENTS.md`, `docs/ARCHITECTURE.md`, and the relevant SPEC before writing code; work on exactly ONE task from the TASKS file at a time; when a task passes, mark it `[x]` in TASKS.md with the date (plus the session-log filename if one was written), update its header line, then follow the end-of-task steps in Working Rules and STOP — never start the next task on your own. Never change code away from a LOCKED spec item without updating the spec (and bumping its version) first.
- Do NOT introduce a top-level folder or naming convention that is not listed in `docs/ARCHITECTURE.md` section 3 without asking the user first.
- The skills in `.claude/skills/` / `.agents/skills/` are reference material only; wherever they differ from this file or `docs/ARCHITECTURE.md`, this file wins. `angular-developer`, `angular-new-app`, and `supabase-postgres-best-practices` come from upstream and are tracked in `skills-lock.json`; `tailwind-css-patterns` (an in-house fork adapted for Angular) and `system-spec-builder` are maintained here, so they are deliberately absent from that lock file. Known differences: their file naming and one-spec-per-file scaffolding (next bullet), `bigint identity` primary keys and RLS policies (see Supabase), and local-database workflows.
- Do NOT scaffold feature files with plain `ng generate`: it emits Angular's default file names and a `.spec.ts` for every file. If you use it, pass `--skip-tests` and rename the output to the names in `docs/ARCHITECTURE.md` section 5.

## Working Rules

- Always communicate with the user in Thai. Code, comments, and identifiers stay in English.
- Do not use git: never run git commands and never mention commits or version control to the user (assume git may not even be installed). Progress and history live in `docs/TASKS.md` and `.sessions/`.
- After every task that passes (or any substantial piece of work when no TASKS file exists), ASK the user whether to write a session log to `.sessions/YYYY-MM-DD-HHmm-<task-slug>.md`; write it only if they say yes (create the folder if missing). It is the shared memory for whichever AI tool works next, so record: what was done, files touched, decisions and workarounds with the reason, how it was tested, and what the next task is. Read the newest logs before starting work.
- End every finished task, in this order: the session-log question, then the closing line "Task นี้เสร็จสิ้นแล้วครับ จะทำ Task ถัดไปที่ session นี้เลย หรือจะเปิด session ใหม่? ถ้าเปิดใหม่ ใช้ prompt นี้ได้: `อ่าน docs/SYSTEM_SPEC.md แล้วเริ่มตาม Section 0`" — and wait. In a feature round (working from `docs/features/<name>/TASKS.md`), replace the prompt with the one given at the top of that feature's `SPEC.md` (`อ่าน docs/features/<name>/SPEC.md แล้วเริ่มตาม Section 0 ของ docs/SYSTEM_SPEC.md`). Do not recommend one option over the other, and do not begin the next task until the user tells you to.
- Do NOT guess. If any part of a request is unclear or you are not confident, ask the user clarifying questions first and wait for answers before proceeding.
- Before reporting a task as done, run `npm run format` then `npm test`. Prettier owns code style: do not hand-align or restyle code, and do not add style rules to this file.
- Keep every file under 300 lines unless truly unavoidable, counted AFTER running `npm run format`. If a file grows beyond that, split it into smaller components, services, or modules and import them. Never compress code onto long lines or skip Prettier to stay under the limit — the limit is about one file owning too many responsibilities, not about line wrapping.
- Write unit tests only for code that has calculations, is complex, or is expected to change frequently — see the Testing section for the exact criteria. Do not add specs to simple CRUD or pass-through code.
- Any variable, constant, or function used more than once MUST be extracted into the project's designated shared location and imported, never duplicated.
- Every source file starts with a one-line comment saying what the file is for. Beyond that header, comment only what is important or non-obvious: the single Supabase client, environment validation, HTTP interceptors, provider/registration order that matters (e.g. why a server-only provider is registered after the shared one so it overrides it), business-rule enforcement (Postgres functions/constraints), workarounds, and anything a future reader could misuse without the reasoning. One short line explaining _why_ is enough — do not restate _what_ the code already says, and do not comment routine CRUD or self-explanatory code. A typical feature file (CRUD route, service, page) needs the header plus zero to three "why" comments; the template's core files (`env.ts`, `server.ts`, `app.config.server.ts`) are denser only because they are glue code with hidden ordering rules — do not copy that density. Bad: `// increment the counter`, `// call the service`. Good: `// max+1 is safe only because create_booking() holds an advisory lock`.
