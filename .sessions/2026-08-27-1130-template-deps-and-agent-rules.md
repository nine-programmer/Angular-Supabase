# 2026-08-27 11:30 — Template: dependency audit + agent working rules

Context: this is the template repo itself (no `docs/SYSTEM_SPEC.md` / `docs/TASKS.md`), so this log covers the whole working session rather than one Task.

## What was done

1. **Dependency audit** — all 25 existing packages are used (directly or via config/peer). Nothing removed. `@angular/forms` has no import yet but stays for Signal Forms; `zone.js` is intentionally absent (zoneless).
2. **Added** `zod` (dependencies) and `supabase` CLI (devDependencies); bumped `@types/node` ^20 → ^22.
3. **New npm scripts**: `format`, `format:check`, `db:migration`, `db:types` (`--local`, needs `npx supabase start`).
4. `tsconfig.json`: added explicit `"strict": true` (build already passed under strict).
5. `.prettierignore` created (skips `.claude/`, `.agents/`, `.cursor/`, `.vscode/`, `.sessions/`, lockfiles, `dist/`, `supabase/`, generated `database.types.ts`); ran `npm run format` once over the repo (whitespace-only changes, incl. markdown table alignment).
6. `.vscode/settings.json` (format-on-save with Prettier) + `esbenp.prettier-vscode` in `extensions.json`.
7. **AGENTS.md rules changed**
   - API routes validate with `zod`; schemas live in `src/shared/dto/<feature>.dto.ts`, types via `z.infer`.
   - Supabase types/migrations via `npm run db:types` / `npm run db:migration`.
   - 300-line limit is counted AFTER `npm run format`; never compress code to dodge it.
   - Run `npm run format` then `npm test` before reporting a task done.
   - Agent must NOT `git commit`/`git push`. If `.git` exists, ask the user to commit before the next task (suggest a one-line message); if no `.git`, don't mention commits.
   - After every passed task (or substantial work), write `.sessions/YYYY-MM-DD-HHmm-<task-slug>.md` — shared memory across AI tools. Read newest logs before starting.
8. Same rules mirrored into `docs/ARCHITECTURE.md` (§1 Validation row, §3 tree, §6, §7 table, §8 commands; version 1.0 → 1.1) and into the `system-spec-builder` skill (SKILL.md, templates + example SYSTEM_SPEC/TASKS) in BOTH `.claude/skills/` and `.agents/skills/` (they are identical copies — keep them in sync).
9. `src/styles.css`: `@source not '../.sessions'` so Tailwind does not scan session logs.

## Decisions / why

- Kept Prettier (ships with `ng new`): near-zero cost, keeps agent-written diffs clean. Made its use explicit instead of removing it.
- No ESLint (user's choice).
- `db:types` uses `--local` to match the migration-first workflow; switch to `--project-id <ref>` if generating from a cloud project.
- TASKS.md "ผล:" now records date + session-log filename instead of a commit hash, because the agent no longer commits.

## How it was verified

`npm run build` OK · `npm test` 2/2 OK · `npm run format:check` OK · `npx supabase --version` → 2.116.0 · `diff -rq .agents/skills .claude/skills` → identical.

## Next

- User to commit this session's changes (≈25 files) — nothing committed by the agent.
- Future customer projects: Task 1 of TASKS.md should now work without a global Supabase CLI.

## Update 11:55

Rules refined: the `.sessions/` log is now opt-in (agent asks first); after a task passes the agent ticks TASKS.md, asks about the log, reminds to commit (if `.git`), then asks whether to continue in this session or a new one (offering the prompt `อ่าน docs/SYSTEM_SPEC.md แล้วเริ่มตาม Section 0`) and waits — it never starts the next task by itself. Section 0 step 1 now also reads the newest `.sessions/` log.

## Update 12:10

Commit rule made flexible: default is still "user commits, agent reminds", but SYSTEM_SPEC Section 0 now has `การ commit: [ผู้ใช้ commit เอง / ให้ agent commit ให้ 1 ครั้งต่อ Task]` (skill asks developers once at confirmation, never non-programmers) and a chat instruction overrides at any time. When the agent commits, it records the hash on the ผล: line.

## Update 12:40 — consistency audit applied

- ALL git/commit instructions removed from agent-facing docs (AGENTS.md, ARCHITECTURE §7, README, SYSTEM_SPEC Section 0, SKILL.md): the user is assumed to be a non-programmer who may not have git. End-of-task = tick TASKS → ask about `.sessions/` log → closing question → wait.
- Supabase workflow is cloud-only (no Docker): `npx supabase login` + `npm run db:link -- --project-ref <ref>` once, then `db:migration` → `db:push` → `db:types` (`--linked`). `supabase/config.toml` now ships with the template (ran `npx supabase init` once) so customer projects never run `supabase init`.
- Migration file names are whatever the CLI generates (`<timestamp>_description.sql`); docs no longer say `NNN_`.
- `NG_ALLOWED_HOSTS` added to the skill (default-stack 2.5, closing task README line, example deploy line).
- FEATURE_SPEC renumbered to 2.1 Stack / 2.2 API / 2.3 files / 2.4 decisions so reviewer/self-check references match; feature-round closing prompt points to `docs/features/[name]/SPEC.md`.
- SYSTEM_SPEC 1.3 next-round block is now a real index table; TASKS legend defers to Section 0 step 5; zod request validation mentioned in default-stack, SYSTEM_SPEC 2.2 note, and reviewer brief; patterns P1/P4 use `created_at`; example TASKS uses `pages/`; example pins template 1.1.
- AGENTS.md top-level-folder rule now says "not listed in ARCHITECTURE §3".
