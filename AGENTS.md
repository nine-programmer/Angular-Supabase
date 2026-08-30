You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

## How to read this file

This file has two kinds of rules. Treat them differently:

- **Hard rules** — the list right below. They protect security, data integrity, and the user's control over the project. Never break one on your own judgement; the only ways past a hard rule are the version-bump path in SPEC Section 0 or a change to the template itself.
- **Guidance** — everything else in this file (wording like _use_, _prefer_, _keep_, _do not_ inside the Angular/State/Templates/Services/Tailwind/Testing sections). Follow it by default because it keeps projects consistent across AI tools, but deviate when this project has a concrete reason: pick the option that fits, record the reason in the task's `ผล:` line or the session log, and move on — do not ask the user for permission on these.
- **When this file disagrees with what you remember about Angular or Supabase, this file wins.** It is written for the exact versions installed here (Angular 22, Tailwind 4, zod 4, Express 5, Supabase JS 2). If following it makes the build or tests fail, report that to the user instead of silently reverting to the older API you know.

**Hard rules at a glance**

1. The browser never talks to Supabase. One client only, in `src/server/supabase.ts`, using the `service_role` key; `@supabase/supabase-js` is never imported under `src/app/` or `src/shared/`.
2. Import direction is one-way: `src/app/` → `src/shared/` ← `src/server/`.
3. Every table has RLS enabled and no `anon`/`authenticated` policies; authorization is decided on the server — login/role in `src/server/` middleware, row ownership and per-action rights in the service or handler — never only in the browser.
4. Atomic business rules (counters, sequential numbers, status transitions with side effects) live in a Postgres function or constraint — never read-then-write in a handler. A side-effect-free single-row transition may use the conditional-update pattern (API Layer section).
5. Every API route validates its input (body, query, `:id`) with `zod` schemas from `src/shared/dto/`, answers `{ error: "ข้อความไทย" }` with the fixed statuses of the API Layer section, and never leaks raw DB errors.
6. Never read `.env`; secrets never go into `environment*.ts`; `.env.example` stays complete.
7. Schema changes are migration files only (`npm run db:migration` → `db:push` → `db:types`); never rename a migration, never edit one after `db:push` (add a new file), never delete `*_health.sql`, never hand-write `database.types.ts`.
8. Never change the repository with git (no commit/push/reset/checkout/stash/branch).
9. Work on one task from TASKS.md at a time and stop when it passes; LOCKED items (SPEC 1.5 / 1.7 / 2.2 and `docs/DESIGN.md`) change only through a version bump — never deviate silently.
10. Do not modify `docs/ARCHITECTURE.md` inside a customer project, and do not add a top-level folder outside its section 3 without asking (folders listed in its section 9 are pre-approved).
11. Communicate with the user in Thai; code, comments, and identifiers in English.
12. Before reporting a task done: `npm run format`, then `npm test`.
13. On every screen: tokens and patterns from `docs/DESIGN.md`, real icons (never emoji), Thai-capable fonts, a visible label on every input, `aria-label` on icon-only buttons, and only `<button>`/`<a>` for clickable things (contrast ratios are guidance the agent computes — see Accessibility Requirements).
14. Never send secret columns (`password_hash`, `token_hash`, API keys) to the browser — select explicit columns or strip them before responding.

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
- Use `NgOptimizedImage` (`ngSrc`) for content images that affect page load (photos, hero/banner images, anything above the fold). Plain `<img>` or inline SVG is fine for icons, logos, and other small decorative images where its `width`/`height` requirements would only add noise.
  - `NgOptimizedImage` does not work for inline base64 images.

## Accessibility Requirements

Target WCAG AA. There is no automated a11y tool in this repo, so a task counts as accessible when this checklist holds — verify it by reading the template, not by assuming:

- Every form control has a visible `<label for>` (or `aria-label` when a visible label is impossible); every icon-only button has `aria-label`; every content image has meaningful `alt` (decorative ones `alt=""`).
- Everything clickable is a `<button>` or `<a>` (never a `<div>` with `(click)`), keyboard-reachable, with a visible focus ring — do not remove `outline` without replacing it (`focus-visible:ring-2`).
- Text/background pairings meet AA contrast (4.5:1 body text, 3:1 large text and UI borders). Use the pairings listed as AA-checked in `docs/DESIGN.md` — that file wins over any default named here. Only when a project has no `docs/DESIGN.md` yet, stay on Tailwind's `slate-900`/`slate-600` on white and `slate-100`/`slate-400` on `slate-900`. Either way, check the ratio before introducing a new pairing or a new token, and add it to DESIGN.md.
- State is not conveyed by color alone (add text or an icon), and dynamic feedback (validation errors, "saved" messages) is announced with `role="alert"` / `aria-live`.

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
- Change signals only with `set` / `update` (a new value, never in-place mutation of an object or array held in a signal — `computed()` will not notice)

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Template expressions cannot reference globals (`Date`, `Math`, `window`, `JSON`, ...); compute such values in the component class (a `computed()` or a method) and bind the result.

## Services

- Design services around a single responsibility
- Declare singleton services with the `@Service()` decorator (Angular v22+). It provides the class in the root injector on its own — there is no `providedIn` option on it, and `@Injectable({providedIn: 'root'})` is the old spelling of the same thing. Pass `{ autoProvided: false }` only for a service that a `providers` array must supply instead.
- Use the `inject()` function instead of constructor injection

## Server-Side Rendering (SSR)

Applies when the project has `@angular/ssr` enabled (hydration via `provideClientHydration()` and an Express host, by default `src/server.ts`). Check `angular.json` / `app.config.ts` to confirm before applying these rules.

- Never access `window`, `document`, `localStorage`, `sessionStorage`, or `navigator` at class-field initialization, in constructors, or inside `computed()`/`effect()` without a browser guard. They do not exist on the server.
- For browser-only code, prefer `afterNextRender()` / `afterRenderEffect()` over `isPlatformBrowser(inject(PLATFORM_ID))`. Use the platform check only when you need to branch logic at injection time.
- Define per-route render modes in `src/app/app.routes.server.ts`. The template's catch-all (`**`) is `RenderMode.Server` on purpose: a prerendered page would call `/api/*` at build time when no server is running. Public/static pages: add a `RenderMode.Prerender` entry above the catch-all. Pages that depend on the logged-in user or dynamic data: `RenderMode.Server` or `RenderMode.Client`. Do NOT prerender pages that require authentication.
- Use `httpResource()` / `resource()` for data fetching so results are transferred to the client via hydration and not re-fetched on bootstrap.
- Relative `/api/...` URLs do not resolve during server-side rendering, so the template ships two server-only interceptors in `src/app/core/`, registered in `app.config.server.ts`: `apiOriginInterceptor` rewrites `/api/*` to the loopback origin `http://localhost:<port>` (the port of the incoming request under `ng serve`, else `PORT`) — never the public domain, so the call skips the proxy/TLS/redirects — and `ssrCookieInterceptor` forwards the incoming `cookie` header to that origin only, so a logged-in user stays logged in on refresh. Do not create another SSR origin/cookie interceptor; keep `provideHttpClient()` in `app.config.ts` without `withFetch()` (`FetchBackend` is already the default; `withFetch()` is deprecated). The same `httpResource()` call then works in the browser, in `ng serve` (port 4200), and in production (port 4000).
- Keep `src/server.ts` free of application logic; it is only the Express host. It mounts the API router from `src/server/` and then hands every other request to the Angular engine. Body/cookie parsers belong in `src/server/api.ts` (so their errors reach `apiErrorHandler` as JSON); `app.set('trust proxy', 1)` in `server.ts` is host configuration (Render sits behind a proxy) and already ships.
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
- Error mapping is shared, not per feature — `src/server/api-error.ts` ships with the template:
  - A service calls `if (error) throwApiError(error)` after every Supabase call (or throws `new HttpError(status, 'ข้อความไทย')`); the route handler just `await`s the service; `apiErrorHandler` in `src/server/api.ts` answers `{ error }` with the status. Body-parser failures (bad JSON, body over 1 MB) are mapped there too, which is why `express.json()` is mounted inside `api.ts`, never in `server.ts`.
  - Postgres → HTTP: our own `RAISE EXCEPTION 'ข้อความไทย'` (SQLSTATE `P0001`) → `400` with the message passed through (only messages we wrote are shown — keep user-facing rules in functions we write, a third-party trigger would leak English); `RAISE EXCEPTION 'ข้อความไทย' USING ERRCODE = 'P0409'` for a status/precondition conflict → `409`; `23505` unique → `409 ข้อมูลนี้มีอยู่แล้ว`; `23503` foreign key → `409 ข้อมูลที่อ้างถึงไม่มีอยู่ หรือยังถูกใช้งานอยู่`; `23502`/`23514`/`22xxx` → `400 ข้อมูลไม่ถูกต้อง`; `PGRST116` (`.single()` found nothing) → `404 ไม่พบข้อมูล`; anything else → `500` generic + `console.error`. A conditional update returning zero rows → `409`.
  - Status meanings are therefore fixed for every project — 400 input/rule, 401 not logged in, 403 role, 404 unknown id, 409 duplicate/conflict, 413 too large, 429 too many attempts — and a SPEC never redefines them. `GET /api/health` is the one exception (`{ ok, error }`): it is a setup diagnostic, not a resource.
- Inputs beyond the body are validated the same way: query params get a zod schema (`z.object({ q: z.string().trim().max(100).optional(), ... })`) and `:id` params are checked with `z.string().uuid()` — an invalid id answers `404` exactly like an unknown one, never a raw `22P02`. Search (`q`) defaults to a case-insensitive substring match across the named columns (`.or('name.ilike.%q%,code.ilike.%q%')` with `%`, `,` and `(` stripped from the input) unless the SPEC says otherwise. A foreign key sent in a body (`item_id`) is checked by the database (`23503` → `409`), not by a pre-select.
- Browser side, every failed call is shown through `apiErrorMessage(err)` from `src/app/core/api-error-message.ts` (reads the `{ error }` body, falls back to a generic Thai sentence) inside an element with `role="alert"`. A project with login adds `src/app/core/auth.interceptor.ts` that redirects to `/login` on a `401` from any `/api/*` call **except `/api/auth/*`** (login and change-password must show their own message, and `/api/auth/me` on the login page must not redirect in a loop), so pages never handle 401 one by one — it must return `next(req)` untouched when `inject(REQUEST, { optional: true })` is set, because interceptors registered in `app.config.ts` also run during SSR (they are additive, not replaced) and a redirect during render is wrong.
- Every list query calls `.order()` explicitly — Postgres returns rows in no guaranteed order. Pagination is a SPEC decision (2.4): small systems return the whole list; when the SPEC expects more than ~1,000 rows it must define `page`/`limit` query params. Soft delete is the default over hard delete: an `is_active boolean default true` column, with list endpoints hiding inactive rows unless the caller is allowed to see them.
- Dates: calendar dates (due dates, queue days) are Postgres `date` columns and `YYYY-MM-DD` strings in DTOs (`<input type="date">` produces the same); instants are `timestamptz`. "Today" is always Thailand time — in SQL `(now() at time zone 'Asia/Bangkok')::date`, in TypeScript `todayInThailand()` / `isBeforeToday()` / `daysFromToday()` from `src/shared/utils/thai-date.ts` (never `new Date().toISOString().slice(0, 10)`, which is UTC). Display goes through the `DatePipe` with the `th` locale and the `+0700` default timezone that `app.config.ts` registers (the SSR server runs in UTC — without the pinned timezone server-rendered and client-rendered times differ and hydration breaks; never remove it); store Gregorian years; the default display is Gregorian, and a project whose SPEC asks for พ.ศ. adds one shared pipe (`src/app/ui/thai-year.pipe.ts`) instead of converting in each page.
- Declare request/response schemas in `src/shared/dto/<feature>.dto.ts` as `zod` schemas and derive the TypeScript types with `z.infer<typeof schema>`; never write a separate interface for the same shape. `zod` is plain TypeScript, so it is allowed in `src/shared/` and may be reused by browser-side forms.
- Business rules that must be atomic (stock counters, sequential numbers, status transitions) are enforced in the database, never by read-then-write in the API handler. Stock counters, sequential numbers, and any transition with a side effect (writing a log row, setting `called_at`, touching a second table) go in a single Postgres function called with `.rpc()` or in a DB constraint. A plain single-row status change with no side effect may instead be one conditional update in the service — `db.from('t').update({ status: to }).eq('id', id).eq('status', from).select()` — treating zero returned rows as a conflict (`409`); the `.eq('status', from)` is what makes it atomic, so never drop it.
- Authentication and authorization, when a project needs them, are enforced in `src/server/` middleware. Never rely on browser-side checks.

## Supabase

- Create exactly ONE Supabase client, in `src/server/supabase.ts`, with `createClient<Database>(...)`, `persistSession: false`, and `autoRefreshToken: false`. It is a lazy singleton: services call `getSupabase()` (never at module top level) so that a missing `.env` fails the API call that needed it instead of crashing the server at boot, and so specs can pass a fake client. Never call `createClient()` anywhere else, and never import `@supabase/supabase-js` under `src/app/` or `src/shared/`.
- Every exported service function takes the client as its LAST parameter with the singleton as default — `export async function listItems(db: SupabaseDb = getSupabase())` — and uses only `db` inside. Routes call it without that argument; specs pass a fake (see Testing).
- The server uses the `service_role` key, read from `process.env` (via `src/server/env.ts`, loaded from `.env`). It is a secret: never put it in `environment*.ts`, never share or upload `.env`, and always keep `.env.example` up to date.
- NEVER read `.env` (not with Read, `cat`, `Get-Content`, `grep`, or any other tool) — it holds real secrets. Read `.env.example` instead: it lists every variable with a comment saying what it is and how to use it. When a project needs a new variable, add it to `.env.example` in the same format (name + comment: what it is, where to get it, who uses it) and tell the user to set the real value in `.env` themselves.
- The template ships one migration, `supabase/migrations/*_health.sql`, which creates `public.health()` (callable only by `service_role`). `GET /api/health` calls it through `src/server/services/health-server.service.ts` to prove that `.env` and `npm run db:push` work before any project spec exists. Never delete or rename that migration; the Supabase connection is set up once during template setup (README), not as a task in `docs/TASKS.md`.
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
- Keep `src/styles.css` scanning `src/` only (`@import 'tailwindcss' source(none);` + `@source '../src';`). Tailwind reads every non-ignored file as plain text, so markdown that quotes class names (`AGENTS.md`, `README.md`, agent skills, `.sessions/`, `docs/`) would otherwise compile its examples into the production bundle. Templates only live under `src/`, so this allowlist needs no maintenance — do NOT go back to listing `@source not` exclusions, and add a second `@source` line only for a real template/class source outside `src/` — `docs/design/mockup.html` is NOT one (it loads the Tailwind Play CDN and must stay out of the build).
- Dark mode is a per-project decision recorded in `docs/DESIGN.md`: add `dark:` variants only when DESIGN.md lists dark-mode tokens and AA-checked pairs — otherwise ship light mode only. Use container queries (`@container`, `@md:`) for component-level responsiveness.
- UI icons are real icons — Material Symbols (https://fonts.google.com/icons) loaded via Google Fonts in `src/index.html`, or inline SVG. NEVER use emoji as icons or decoration in templates (⚡📊✦ read as AI output and render differently per device). UI fonts must include Thai glyphs (e.g. Noto Sans Thai, IBM Plex Sans Thai, Sarabun) with a sans-serif fallback.
- All color pairings MUST meet WCAG AA contrast (see Accessibility Requirements).

## Testing (Vitest)

- Unit tests run on Vitest with jsdom (`ng test`). Use `describe`, `it`, `expect`, and `vi` (for mocks/spies). Do NOT use Jasmine (`jasmine.createSpy`, `spyOn` from Jasmine) or Karma APIs.
- Use `TestBed` for component and service tests. Because the app is zoneless, use `await fixture.whenStable()` instead of `fixture.detectChanges()` to flush signal updates before asserting on the DOM.
- Browser-side services: mock HTTP with `provideHttpClient()` + `provideHttpClientTesting()` and assert on the `/api/*` calls. Server-side services under `src/server/`: `ng test` does NOT support `vi.mock()` for relative modules (Angular's test bundler throws), so never mock `../supabase`; instead pass a fake client to the service's `db` parameter: `const db = { rpc: vi.fn() } as unknown as SupabaseDb; await listItems(db)`. Never hit a real Supabase project from unit tests.
- Co-locate spec files with the code under test (`foo.ts` → `foo.spec.ts`).
- The template keeps `src/app/app.spec.ts` as a smoke test that the root component bootstraps (a deliberate exception to the rule below). Do not extend it — replace it once the project has real component specs. The template also ships `src/server/api-error.spec.ts` and `src/shared/utils/thai-date.spec.ts`, because those two files hold the mapping/date logic every feature relies on; the interceptors and the health service are deliberately untested because they are too simple to meet the criteria below.
- Do NOT write a spec for every file. Write unit tests ONLY for code that meets at least one of these: (1) it performs calculations or non-trivial data transformation (totals, date/queue arithmetic, sorting/grouping rules, status-transition or permission logic — write who-may-do-what tables as a pure function such as `canChangeStatus(role, isOwner, from, to)` and spec that function instead of asking the user to hit the API as the wrong role); (2) it is expected to change frequently; (3) it is complex enough that a test is needed to verify or safely modify it. Plain CRUD routes, pass-through services that only forward to Supabase/`.rpc()`, simple display components, DTOs, and enums do NOT need a spec.
- When a task does need tests, the TASKS.md test line must say which file/function is tested and why (e.g. "spec `bookings-server.service.spec.ts`: คำนวณ `ahead`"). If no file in the task meets the criteria, do not add a spec line.

## Project Structure & Docs

This repository is a template: each customer mini app is cloned from it into its own repo.

- The canonical folder layout, file naming, import direction, and database conventions are defined ONCE in `docs/ARCHITECTURE.md`. Read it before creating or moving any file, and follow it exactly. Do NOT modify `docs/ARCHITECTURE.md` inside a customer project; changes belong in the template.
- A customer project ships `docs/SYSTEM_SPEC.md` (what to build; tables, business rules, and API paths are LOCKED after review) and `docs/TASKS.md` (living progress file). Later rounds add `docs/features/<name>/SPEC.md` + `TASKS.md`. Once the "Design UX/UI" task has passed it also ships `docs/DESIGN.md` (the project's design system: tone, `@theme` tokens, component patterns — LOCKED like a spec, changes need a version bump) plus the user-approved mockup at `docs/design/mockup.html`.
- When these docs exist: read `AGENTS.md`, `docs/ARCHITECTURE.md`, and the relevant SPEC before writing code — plus `docs/DESIGN.md` before building any screen, and use its tokens and patterns exactly instead of inventing styles; work on exactly ONE task from the TASKS file at a time — mark it `[~]` before touching the first file, and if you must stop mid-way write where you got to in its `ผล:` line; when a task passes, mark it `[x]` in TASKS.md with the date (plus the session-log filename if one was written), update its header line, then follow the end-of-task steps in Working Rules and STOP — never start the next task on your own. Never change code away from a LOCKED spec item without updating the spec (and bumping its version) first.
- Do NOT introduce a top-level folder or naming convention that is not listed in `docs/ARCHITECTURE.md` section 3 without asking the user first. The extension points in its section 9 (auth middleware, storage, integrations, jobs, reports, SSE, `src/server/features/`) are pre-approved: use them when the SPEC calls for that capability, and note the choice in SPEC 2.3/2.4.
- Non-secret browser config lives in `src/environments/` only; static files live in `public/`.
- The skills in `.claude/skills/` / `.agents/skills/` are reference material only; wherever they differ from this file or `docs/ARCHITECTURE.md`, this file wins. The list of known differences is in the Appendix at the end of this file.
- Do NOT scaffold feature files with plain `ng generate`: it emits Angular's default file names and a `.spec.ts` for every file. If you use it, pass `--skip-tests` and rename the output to the names in `docs/ARCHITECTURE.md` section 5.

## Working Rules

- Always communicate with the user in Thai. Code, comments, and identifiers stay in English.
- Never change the repository with git: no `commit`, `push`, `reset`, `checkout`, `stash`, branch or tag commands, and do not ask the user to commit — committing is the user's job. Read-only commands (`git status`, `git diff`, `git log`) are fine for understanding recent changes when git happens to be available; do not depend on it, because the shared record of progress is `docs/TASKS.md` and `.sessions/`, not git history.
- After every task that passes (or any substantial piece of work when no TASKS file exists), ASK the user whether to write a session log to `.sessions/YYYY-MM-DD-HHmm-<task-slug>.md`; write it only if they say yes (create the folder if missing). It is the shared memory for whichever AI tool works next, so record (structure: `.claude/skills/system-spec-builder/templates/SESSION_LOG.md`): what was done, files touched, decisions and workarounds with the reason, problems hit and how they were fixed (especially environment/tooling issues that will recur in other projects — flag template-level knowledge to the user so it gets fixed in the template repo, not buried in the log), how it was tested, and what the next task is. Read the newest logs before starting work. When a SPEC or DESIGN version bump makes an older log inaccurate, add `> ล้าสมัยบางส่วน — ดู SPEC vX.Y` as the first line under that log's title instead of rewriting it.
- End every finished task with ONE closing message that asks both things at once: "Task นี้เสร็จสิ้นแล้วครับ — (1) จะบันทึกงานลง `.sessions/` ไหม (2) จะทำ Task ถัดไปที่ session นี้เลย หรือเปิด session ใหม่? ตอบสั้นๆ ได้ เช่น 'บันทึก, ต่อเลย' — ถ้าเปิดใหม่ ใช้ prompt นี้: `อ่าน docs/SYSTEM_SPEC.md แล้วเริ่มตาม Section 0`" — then wait. In a feature round (working from `docs/features/<name>/TASKS.md`), replace the prompt with the one given at the top of that feature's `SPEC.md` (`อ่าน docs/features/<name>/SPEC.md แล้วเริ่มตาม Section 0 ของ docs/SYSTEM_SPEC.md`). Do not recommend one option over the other, and do not begin the next task until the user answers.
- Ask vs decide — the user is not a programmer. When a **business behaviour** is unclear (who may do what, how a number is computed, what a status means, what a screen must show), ask first (at most 3 questions per turn) and wait; never guess it. When a **technical choice** is open but every option fits the SPEC, `docs/ARCHITECTURE.md`, and this file (how to split a file, component structure, an index, error wording, which helper to use), decide it yourself, record the choice and its reason in the task's `ผล:` line or the session log, and move on — do not make the user answer questions they cannot judge. Deviating from a LOCKED item is never a technical choice; that path is the version bump in SPEC Section 0.
- Before reporting a task as done, run `npm run format` then `npm test`. This is the finish step for this repo and it overrides the `ng build` step that `angular-developer/SKILL.md` calls critical; run `ng build` only when you actually need to check the production build. Prettier owns code style: do not hand-align or restyle code, and do not add style rules to this file.
- File size: aim for under 300 lines per hand-written file (counted after `npm run format`); above 400 lines you must split it into smaller components, services, or modules. Between 300 and 400, split only when the file clearly owns more than one responsibility — do not split a cohesive file just to hit a number, and never compress code onto long lines or skip Prettier to stay under it. Exempt: generated files (`src/shared/types/database.types.ts`), migration `.sql` files (one schema change may legitimately be long), `.spec.ts` files (split only when they test more than one unit), and the design mockup `docs/design/mockup.html` (several screens in one viewable file by design).
- Write unit tests only for code that has calculations, is complex, or is expected to change frequently — see the Testing section for the exact criteria. Do not add specs to simple CRUD or pass-through code.
- Do not duplicate a constant, helper, or type across files. When the same thing is needed in a second file, move it to the nearest place both can import, going no wider than necessary: the feature folder when both users are in that feature; `src/app/ui/` (components, pipes, directives) or `src/app/core/` (app-wide services, interceptors) when used across features; `src/shared/` only when both `src/app/` and `src/server/` need it (DTOs, enums, types). Reuse within a single file needs no extraction, and a value used in one place is not shared just because it might be later.
- Every source file starts with a one-line comment saying what the file is for. Beyond that, comment only the _why_ that a reader cannot see in the code — a workaround, an ordering that matters, a business rule enforced elsewhere (e.g. `// max+1 is safe only because create_booking() holds an advisory lock`). Do not narrate _what_ the code does (`// call the service`).

## Appendix: known differences from the installed skills

The skills in `.claude/skills/` / `.agents/skills/` are reference material; this file and `docs/ARCHITECTURE.md` win wherever they differ. `angular-developer`, `angular-new-app`, and `supabase-postgres-best-practices` come from upstream and are tracked in `skills-lock.json`; `tailwind-css-patterns` (an in-house fork adapted for Angular) and `system-spec-builder` are maintained here and are deliberately absent from that lock file. Known differences:

- All upstream skills: their file naming and one-spec-per-file scaffolding (see Project Structure & Docs → `ng generate`).
- `supabase-postgres-best-practices`: `bigint identity` primary keys (this template uses `uuid`); RLS policies and `auth.uid()`-based security (no client-side auth here — tables are deny-all behind the API); the `SECURITY DEFINER` recommendation with `revoke execute ... from service_role` (would make a function uncallable here); the whole connection-pooling category (`conn-*.md` — the server talks to Supabase over HTTPS through `supabase-js`, there is no pool to size).
- `angular-developer`: the `ng build` finish step in `SKILL.md` and `references/migrations.md` (this repo finishes with `npm run format` then `npm test`); the "Karma or Vitest" test runner in `references/cli.md` (Vitest only); `references/signal-forms.md` making Signal Forms mandatory and banning `FormGroup` (this file only prefers them); `references/naming-conventions.md` describing `shared/` as a UI toolkit (`src/shared/` here is plain TypeScript; reusable UI lives in `src/app/ui/`); the `src/proxy.conf.json` dev proxy in `references/cli.md` (the API is served by the same SSR process); `references/environment-configuration.md`'s runtime config pattern (fetching `/assets/config.json`) and its pre-v18 `src/assets/` location (static files live in `public/`).
- `angular-new-app`: written for `ng new` on an empty folder; does not apply to a project cloned from this template.
