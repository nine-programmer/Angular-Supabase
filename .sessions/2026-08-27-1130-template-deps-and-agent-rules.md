# 2026-08-27 11:30 — Template: dependency audit + agent working rules

Context: this is the template repo itself (no `docs/SYSTEM_SPEC.md` / `docs/TASKS.md`), so this log covers the whole working session rather than one Task.

> **Read "Final state" at the bottom first.** The sections below are chronological; items marked _(superseded)_ were changed later in the same session and no longer describe the template.

## What was done

1. **Dependency audit** — all 25 existing packages are used (directly or via config/peer). Nothing removed. `@angular/forms` has no import yet but stays for Signal Forms; `zone.js` is intentionally absent (zoneless).
2. **Added** `zod` (dependencies) and `supabase` CLI (devDependencies); bumped `@types/node` ^20 → ^22.
3. **New npm scripts**: `format`, `format:check`, `db:migration`, `db:types` _(superseded — `db:types` now uses `--linked`; see 12:40 and Final state)_.
4. `tsconfig.json`: added explicit `"strict": true` (build already passed under strict).
5. `.prettierignore` created (skips `.claude/`, `.agents/`, `.cursor/`, `.vscode/`, `.sessions/`, lockfiles, `dist/`, `supabase/`, generated `database.types.ts`); ran `npm run format` once over the repo (whitespace-only changes, incl. markdown table alignment).
6. `.vscode/settings.json` (format-on-save with Prettier) + `esbenp.prettier-vscode` in `extensions.json`.
7. **AGENTS.md rules changed**
   - API routes validate with `zod`; schemas live in `src/shared/dto/<feature>.dto.ts`, types via `z.infer`.
   - Supabase types/migrations via `npm run db:types` / `npm run db:migration`.
   - 300-line limit is counted AFTER `npm run format`; never compress code to dodge it.
   - Run `npm run format` then `npm test` before reporting a task done.
   - _(superseded by 12:40)_ Agent must NOT `git commit`/`git push`; ask the user to commit — replaced by "never use or mention git at all".
   - _(superseded by 11:55)_ Write a `.sessions/` log after every passed task — now opt-in: the agent asks first. Read newest logs before starting.
8. Same rules mirrored into `docs/ARCHITECTURE.md` (§1 Validation row, §3 tree, §6, §7 table, §8 commands; version 1.0 → 1.1) and into the `system-spec-builder` skill (SKILL.md, templates + example SYSTEM_SPEC/TASKS) in BOTH `.claude/skills/` and `.agents/skills/` (they are identical copies — keep them in sync).
9. `src/styles.css`: `@source not '../.sessions'` so Tailwind does not scan session logs.

## Decisions / why

- Kept Prettier (ships with `ng new`): near-zero cost, keeps agent-written diffs clean. Made its use explicit instead of removing it.
- No ESLint (user's choice).
- _(superseded by 12:40)_ `db:types` used `--local`; the template is now cloud-only and uses `--linked`.
- TASKS.md "ผล:" records date + session-log filename (no commit hash — the agent never uses git).

## How it was verified

`npm run build` OK · `npm test` 2/2 OK · `npm run format:check` OK · `npx supabase --version` → 2.116.0 · `diff -rq .agents/skills .claude/skills` → identical.

## Next

- Future customer projects: Task 1 of TASKS.md should now work without a global Supabase CLI.

## Update 11:55

Rules refined: the `.sessions/` log is now opt-in (agent asks first); after a task passes the agent ticks TASKS.md, asks about the log, reminds to commit (if `.git`) _(superseded by 12:40)_, then asks whether to continue in this session or a new one (offering the prompt `อ่าน docs/SYSTEM_SPEC.md แล้วเริ่มตาม Section 0`) and waits — it never starts the next task by itself. Section 0 step 1 now also reads the newest `.sessions/` log.

## Update 12:10 _(superseded by 12:40 — no commit option exists any more)_

Commit rule was made flexible via a `การ commit:` line in SYSTEM_SPEC Section 0; removed again 30 minutes later together with every other git mention.

## Update 12:40 — consistency audit applied

- ALL git/commit instructions removed from agent-facing docs (AGENTS.md, ARCHITECTURE §7, SYSTEM_SPEC Section 0, SKILL.md; README deliberately keeps one human-facing `git clone ถ้ามี git` option — it is not an agent instruction): the user is assumed to be a non-programmer who may not have git. End-of-task = tick TASKS → ask about `.sessions/` log → closing question → wait.
- Supabase workflow is cloud-only (no Docker): `npx supabase login` + `npm run db:link -- --project-ref <ref>` once, then `db:migration` → `db:push` → `db:types` (`--linked`). `supabase/config.toml` now ships with the template (ran `npx supabase init` once) so customer projects never run `supabase init`.
- Migration file names are whatever the CLI generates (`<timestamp>_description.sql`); docs no longer say `NNN_`.
- `NG_ALLOWED_HOSTS` added to the skill (default-stack 2.5, closing task README line, example deploy line).
- FEATURE_SPEC renumbered to 2.1 Stack / 2.2 API / 2.3 files / 2.4 decisions so reviewer/self-check references match; feature-round closing prompt points to `docs/features/[name]/SPEC.md`.
- SYSTEM_SPEC 1.3 next-round block is now a real index table; TASKS legend defers to Section 0 step 5; zod request validation mentioned in default-stack, SYSTEM_SPEC 2.2 note, and reviewer brief; patterns P1/P4 use `created_at`; example TASKS uses `pages/`; example pins template 1.1.
- AGENTS.md top-level-folder rule now says "not listed in ARCHITECTURE §3".

## Update 13:00 — second consistency pass (docs ↔ skills ↔ code)

Re-checked this log against AGENTS.md, ARCHITECTURE.md, README, the `system-spec-builder` skill (both copies), the third-party skills, and the code in `src/`. Fixed:

- `src/shared/types/database.types.ts` header said `gen types --local` → now says `npm run db:types`.
- `src/server/routes/health.routes.ts` comment said Task 3 adds `count` → Task 2 (matches the TASKS template).
- `src/server/env.ts` header said "fails at boot" while the getters are lazy → reworded.
- AGENTS.md: closing prompt now has the feature-round variant (matches `templates/FEATURE_SPEC.md`); Supabase section states that the `supabase` / `supabase-postgres-best-practices` skills lose to AGENTS.md (no local DB, no declarative schema, no RLS policies); comment rule now requires a one-line file header (matches SYSTEM_SPEC Section 0).
- ARCHITECTURE §3: added `supabase/config.toml` and `.claude/skills/ · .agents/skills/` (must stay identical; AGENTS.md wins on conflict). README: same note + `.agents/skills/` row.
- `db:types` writes to `database.types.tmp` then renames, so a failed CLI call (not logged in / not linked) no longer truncates the real file; `.gitignore` ignores the `.tmp`.
- TASKS template + example Task 1: also rename `project_id` in `supabase/config.toml`.

## Update 13:15 — removed the `supabase` skill

Deleted `.claude/skills/supabase/` + `.agents/skills/supabase/` and its `skills-lock.json` entry. Reason: its content is client-side Auth/Realtime/Storage/Edge Functions and a local-first migration workflow (`db query` → `db pull --local`) — none of which this template uses — and its "ANY Supabase task" trigger kept pulling agents toward local Docker. Kept `supabase-postgres-best-practices` (constraints, data types, FK indexes, advisory locks, upsert — all directly used by the template's DB-enforced rules). The only useful bit of the removed skill (no `SECURITY DEFINER` as a permission workaround; set `search_path` if one is ever needed) is now a line in AGENTS.md → Supabase. README notes the removal so nobody reinstalls it.

## Update 13:20 — third consistency pass (rules ↔ template code ↔ third-party skills)

Re-checked the log against every doc, both skill copies, all tool configs, and `src/`; also verified AGENTS.md's Angular v22 claims against `node_modules` (`@Service` decorator, OnPush default, `@angular/forms/signals` all exist in 22.1.3). Fixed:

- Every file under `src/` now starts with the one-line header comment that AGENTS.md requires (the rule was added at 13:00 but the template's own files did not follow it).
- `server.ts` no longer reads `process.env` itself: uses `env.port` and a new `env.isPm2` from `env.ts`. AGENTS.md now names `api-origin.interceptor.ts` as the one allowed exception (it cannot import from `src/server/`).
- ARCHITECTURE §5 contradicted itself (`<feature>.routes.ts` exists on both sides): the "names must differ" sentence now applies to services only. §6 states that primary keys stay `uuid` (never `bigint identity` as the Postgres skill suggests) and that `uuidv7()` may replace `gen_random_uuid()` on Postgres 18+. Version 1.1 → 1.2; the queue-booking example pins 1.2.
- AGENTS.md → Testing: `vi.mock('../supabase')` (specs live in `src/server/services/`).
- AGENTS.md → Project Structure: third-party skills lose to AGENTS.md/ARCHITECTURE with the known differences listed; `ng generate` only with `--skip-tests` + rename to ARCHITECTURE §5 names (the `angular-developer` skill's "Intent over Role" naming and spec-per-file scaffolding conflict with the template).
- Comment density (13:30): trimmed duplicate/long comments in `env.ts`, `supabase.ts`, `app.config.server.ts`, `api-origin.interceptor.ts` (68 → 54 comment lines in `src/`). The comment rule now lives ONLY in AGENTS.md (with a per-file budget and bad/good examples); the "โค้ดทุกไฟล์ต้องมี comment" bullet was removed from the SYSTEM_SPEC template and example so the skill does not duplicate a coding rule.
- Token trim (13:40): ARCHITECTURE §10 (4.3 KB, read only when writing a spec) moved to the skill as `references/template-scope.md`; §10 is now a 3-line stub (one-line criterion + pointer). SKILL.md step 1 / self-check / reviewer brief (reviewer now gets 5 files) / file list, patterns.md P3, and README point to the new file. ARCHITECTURE 1.2 → 1.3; example pins 1.3.
- Token trim (13:50): ARCHITECTURE §7 dropped its who-writes-what table (workflow rules live only in AGENTS.md + SYSTEM_SPEC Section 0; §7 keeps the docs tree, now including `.sessions/`) and §8 dropped the command list (package.json + README own it; §8 keeps the .env block and the two command facts a builder needs). ARCHITECTURE 1.3 → 1.4; example pins 1.4. File is now 16.7 KB (was 21.5 KB).
- This log's 12:40 entry wrongly listed README among the files stripped of git mentions; README keeps its human-facing `git clone ถ้ามี git` option on purpose.

## Update 14:55 — fourth consistency pass (rules ↔ template code ↔ skills)

Re-read this log against `AGENTS.md`, `docs/ARCHITECTURE.md`, `README.md`, both skill copies, every tool config, and `src/`; also re-verified the Angular v22 claims against `node_modules` (`@Service` at `@angular/core/types/core.d.ts:1268`, `@angular/forms/signals` export, `hasOnPushByDefault = major >= 22` in `compiler-cli`) and the `NG_ALLOWED_HOSTS` mechanism (`@angular/ssr/fesm2022/node.mjs:288` → unioned with `manifest.allowedHosts` in `ssr.mjs:1511`). Seven real conflicts were found and fixed:

- **`src/app/app.html` was still Angular's welcome page (353 lines)** — it broke three of AGENTS.md's own rules at once: the 300-line limit, "apply Tailwind utilities in templates" (it carried a large inline `<style>` block of raw CSS), and the AXE/WCAG rule (`alt` on `<svg>`, which is not a valid attribute). Replaced with an 11-line Tailwind placeholder whose colour pairs pass AA in both themes (`slate-900` on white ≈ 17:1, `slate-100` on `slate-900` ≈ 15:1).
- **`src/app/app.spec.ts` was pinned to the placeholder** (`toContain('Hello, angular-supabase')`) while TASKS Task 1 tells the agent to change that heading AND asserts `npm test` passes — the two could not both hold. Only the `should render title` case was removed (user's call). Deleting the whole file is NOT an option: with no spec anywhere `ng test` aborts with `No tests found matching the following patterns` (verified). AGENTS.md → Testing now names this file as a deliberate exception to the "no spec for simple display components" rule so the rule and the template agree.
- **`tsconfig.spec.json` had `"types": ["vitest/globals"]` with no `node`** → any spec that transitively touches `process` fails to compile. That silently blocks every server-side spec AGENTS.md asks for (`src/server/services/*.spec.ts` → `env.ts`), i.e. it would have hit the first customer project around Task 3–4. Now `["vitest/globals", "node"]`. Added `src/app/core/api-origin.interceptor.spec.ts` (4 cases: non-`/api` untouched, origin from `REQUEST`, `PORT` fallback, 4000 default) — the one file in the template that genuinely meets the Testing criteria, and it keeps the `node` types from being removed again.
- **AGENTS.md → Services contradicted itself** in two consecutive bullets ("use `providedIn: 'root'`" vs "prefer `@Service`"). The typings settle it: `ServiceDecorator` only accepts `{ autoProvided?, factory? }` — there is no `providedIn` on it. Now a single rule, with `{ autoProvided: false }` named as the escape hatch.
- **`src/environments/` was in ARCHITECTURE §3 but did not exist** (Angular 22 `ng new` stopped generating it). The user ran `ng generate environments`; the two files and the `development` `fileReplacements` in `angular.json` check out, so only the required one-line header comments were added, and §3 now spells out both file names.
- **`tailwind-css-patterns` was documented as third-party but is absent from `skills-lock.json`** — it is an in-house fork adapted for Angular. AGENTS.md and README now split upstream skills (lock-tracked) from the two maintained here (`tailwind-css-patterns`, `system-spec-builder`); the lock file is intentionally left alone.
- **The two exclusion lists had drifted apart**: `.prettierignore` skipped `.cursor/` but not `.codex/` / `.gemini/`, and `styles.css` `@source not` covered only `.claude`/`.agents`/`.sessions`. Both now cover the same agent/editor folders, and `@source not '../docs'` was added (templates only ever live under `src/`, so it is safe). AGENTS.md's Tailwind bullet describes the list generically instead of naming two folders.

Smaller items from the same pass:

- ARCHITECTURE §3 gained rows for `skills-lock.json`, the AI/editor config folders, and the Prettier files, plus a line stating that the top-level folders are exactly those listed — AGENTS.md forbids adding a folder "not listed in §3", and several existing ones were not listed.
- `tsconfig.json`: added `"strictTemplates": true` (missing despite AGENTS.md opening with "use strict type checking"); `npm run build` still passes.
- `angular.json`'s `security.allowedHosts: []` is no longer undocumented dead config — AGENTS.md explains it is empty on purpose because baking a domain into the build would tie one bundle to one deployment, while `NG_ALLOWED_HOSTS` keeps it per-environment.
- TASKS Task 1 (template + queue-booking example) now says to edit `src/app/app.ts` (`title`) and `src/app/app.html`, closing the gap that made the old spec fail.
- ARCHITECTURE 1.4 → 1.5; the queue-booking example pins 1.5.

Verified: `npm run format` / `npx prettier --check .` clean · `npm test` 2 files / 5 tests pass · `npm run build` passes (prerendered 1 route) · `diff -rq .agents/skills .claude/skills` identical.

## Final state (what is true now)

- Git is never used or mentioned by the agent. End of task = tick TASKS.md → ask about `.sessions/` log → closing question (feature round: prompt from that feature's SPEC.md) → wait.
- Supabase is cloud-only: `npx supabase login` + `npm run db:link -- --project-ref <ref>` once; then `db:migration` → `db:push` → `db:types` (`--linked`, via tmp file). `supabase/config.toml` ships with the template.
- `.claude/skills/` and `.agents/skills/` are identical copies; upstream skills (`supabase-postgres-best-practices`, `angular-developer`, `angular-new-app`) are tracked in `skills-lock.json`, while `tailwind-css-patterns` (in-house Angular fork) and `system-spec-builder` are maintained here and deliberately absent from it; all of them are reference only and AGENTS.md wins. The `supabase` skill was removed on purpose.
- Prettier is the only formatter (no ESLint); `npm run format` then `npm test` before reporting a task done; 300-line limit counted after formatting.
- Every source file starts with a one-line header comment; only `src/server/env.ts` reads `process.env` (exception: the SSR interceptor's `PORT` fallback). Primary keys are always `uuid` (`uuidv7()` allowed on Postgres 18+). `ng generate` only with `--skip-tests` and renamed to ARCHITECTURE §5 names. ARCHITECTURE is at version 1.5 (§10 scope table lives in the skill's `references/template-scope.md`; §7/§8 no longer duplicate AGENTS.md or README).
- Singleton services use `@Service()` (no `providedIn`). `src/app/app.html` is an 11-line Tailwind placeholder; `src/app/app.spec.ts` is a bootstrap-only smoke test kept so `ng test` never runs with zero specs. `tsconfig.spec.json` includes `node` types so server-side specs compile; `tsconfig.json` has `strictTemplates`. `src/environments/` exists again (empty, non-secret browser config).
