---
name: system-spec-builder
description: Turn a rough idea for a small application into a single, complete SYSTEM_SPEC.md that any AI coding agent (Claude Code, Cursor, Copilot, Codex, ChatGPT, Gemini) can pick up and build from. Runs a short interview (max ~10 questions, 3 at a time), fills gaps with sensible defaults, and outputs one Thai-language document containing instructions-for-AI, spec, architecture (Angular SSR + Express API + Supabase), and a testable task checklist, then has it reviewed by an independent reviewer before marking it ready. Use this whenever the user says they want to build, create, or spec out a system, app, or ระบบ — e.g. "อยากได้ระบบยืมคืน", "ทำระบบจองคิว", "สร้างแอปลงทะเบียน", "เขียน spec ให้หน่อย", "อยากให้ AI สร้างระบบ" — even if they only have a one-line idea and have not asked for a document explicitly.
---

# System Spec Builder

Turn a one-line idea into one document that an AI agent can build from without guessing.

The user is not a programmer. They have many small-system ideas (borrow/return, queue booking, registration, inventory, etc.) and want to spec each one fast, in a repeatable way, then hand the spec to whichever AI agent they like. Every system starts from the `Angular-Supabase` template repo (Angular SSR serving both the pages and the `/api/*` backend, Supabase reached only from the server). Your job is to be the interviewer and the writer; their job is only to answer questions and confirm.

## Why one document

Small systems fit in one file. One file is easy to paste into any chat, nothing gets lost between files, and any agent that opens it sees both *what to build* and *how to work*. The document keeps the standard four sections so it still maps to SPEC / ARCHITECTURE / TASKS conventions other tools expect.

## Workflow

### 1. Recognize the system type and load a pattern

Read `references/patterns.md`. If the user's idea matches a known pattern (borrow/return, queue booking, registration, inventory, simple CRUD list), start from that pattern's default tables, features, and statuses. This is what makes the interview short: propose, don't ask from scratch.

If nothing matches, proceed without a pattern and, after finishing, offer to add the new pattern to `references/patterns.md` so next time is faster.

### 2. Interview — short, batched, with defaults

Ask in Thai. At most 3 questions per turn, at most ~10 questions total for a small system. Every question should offer a suggested default so the user can just say "ใช่" or "ตามนั้น".

Cover these topics, in this order, skipping anything already answered or already covered by the pattern:

1. **Problem** — what is painful today, in one sentence
2. **Users** — who uses it, how many roles (default: 1 role, no login)
3. **MVP features** — confirm the pattern's 3–5 features; ask what to add or drop
4. **Not in this round** — confirm exclusions (default: no login, no notifications, no reports)
5. **Data** — confirm the pattern's tables and fields; ask for business-specific fields only
6. **Main flow** — walk through the pattern's flow; ask what differs
7. **Business rules** — what must the system *refuse* to do (e.g. borrow when stock is 0, change status backwards, duplicate phone per event)? Propose the pattern's rules; ask for additions
8. **Done criteria** — confirm what "usable" means (default: CRUD works, data persists, works on mobile)
9. **Stack** — ask only "ใช้ stack มาตรฐานไหม (Angular SSR + API + Supabase จาก template)?" — if yes, skip

When the user cannot answer, pick a sensible default, use it, and record it in the document's "สมมติฐาน" list so it can be changed later. Never stall the interview on an unanswerable question.

### 3. Confirm before writing

Summarize in 5–8 bullet points: problem, users, features, tables, business rules, exclusions, assumptions. Ask "ถูกต้องไหม แก้ตรงไหน?" and wait. Only write the document after a confirmation.

### 4. Write SYSTEM_SPEC.md

Use `templates/SYSTEM_SPEC.md` exactly — same headings, same order. Fill every section; never leave placeholders. Pull the architecture section from `references/default-stack.md` unless the user chose a different stack, and add the "API ที่ต้องมี" table for this system. See `examples/queue-booking.md` for what a finished document looks like.

Rules that make the document buildable by any agent:

- **Section 0 is not optional.** It tells the agent how to work (read all → confirm → one task at a time → wait for test) and what is LOCKED. Without it, agents build everything at once, rename tables mid-way, and things break.
- **Every business rule (1.7) names where it is enforced** — DB constraint, Postgres function, or API. A rule enforced only in the browser is not a rule. Rules that must be atomic (counters, sequential numbers, status transitions) go in a Postgres function or constraint.
- **Every task has a test line** with the behaviour the user can see, plus "spec ผ่าน `npm test`" for any task that adds a service. A task without a test is not done-able.
- **Task size is fixed**: 1 task = 1 screen, or 1 API resource together with the screen that uses it. Never larger. 6–12 tasks total for a small system; if more, merge tasks or move features to "รอบถัดไป". If fewer than 6, the tasks are too big — split.
- **Tasks are ordered**: clone template → database schema + types → main list screen → create → edit/delete → status flow → extras → close. Task 1 always clones the template repo; it never creates a project from scratch.
- **Every table is used by at least one feature.** Unused tables are a sign the spec drifted.
- **Field names in English (snake_case), labels in Thai.** Agents generate cleaner code; users see Thai UI.
- **Keep it small.** A small system's document should be 120–250 lines. If it is longer, the scope is not MVP — trim features into "รอบถัดไป".

Save the file as `SYSTEM_SPEC.md` (or `<system-name>-SPEC.md` if the user names it) with status `ร่าง (รอ review)`.

### 5. Self-check

Before sending it for review, verify:

- [ ] All 4 sections present and non-empty
- [ ] 3–5 MVP features, each traceable to at least one task
- [ ] Every business rule in 1.7 has a "บังคับที่" value that is not "browser"
- [ ] Every task has `ทดสอบ:` line; 6–12 tasks; Task 1 clones the template
- [ ] Every table appears in a feature or task; every API path appears in a task
- [ ] Assumptions listed
- [ ] Section 0 contains the work-protocol and the LOCKED list

### 6. Independent review, then deliver

The writer is bad at spotting its own contradictions, so the document is reviewed by a **separate** reader with no memory of the interview:

- In Claude Code: spawn a subagent (or ask the user to open a fresh session) with only the document and `AGENTS.md`.
- In a web chat: tell the user to paste the document into a new chat.

Give the reviewer this brief (Thai):

> นายคือ Tech Lead ขี้บ่น อ่าน SYSTEM_SPEC.md นี้ แล้วหาให้เจอ: (1) Section 1 กับ Section 2 ขัดกันตรงไหน (2) ตารางใน 1.5 พอสำหรับทุกฟีเจอร์ใน 1.3 และทุกขั้นตอนใน 1.6 ไหม (3) กติกาใน 1.7 บังคับได้จริงตามที่เขียนไหม มีกติกาที่ควรมีแต่ไม่ได้เขียนไหม (4) มี Task ไหนใหญ่เกิน 1 หน้าจอ/1 resource หรือไม่มีวิธีทดสอบ (5) ขัดกับ AGENTS.md ตรงไหน ตอบเป็นรายการสั้นๆ ถ้าไม่มีอะไรต้องแก้ ให้พิมพ์ APPROVED

Fix every finding, bump nothing (still v1.0), and re-review until APPROVED. Then change the status line to `พร้อมสร้าง` and present the file. Tell the user in one line how to use it: "วางไฟล์นี้ให้ AI agent ตัวไหนก็ได้ แล้วสั่งว่า อ่านเอกสารนี้แล้วเริ่มตาม Section 0".

## Tone

Plain Thai, no jargon without a short explanation. The user should feel like they are answering a friendly form, not being interrogated. Keep your own messages short; the document is where the detail lives.

## Files in this skill

- `templates/SYSTEM_SPEC.md` — the document skeleton. Always use it.
- `references/default-stack.md` — the user's standard architecture (mirrors the template repo's `AGENTS.md`). Read when writing Section 2.
- `references/patterns.md` — ready-made tables/features/rules/flows for common small systems. Read first, before interviewing.
- `examples/queue-booking.md` — one finished document. Read if unsure about depth or tone.
