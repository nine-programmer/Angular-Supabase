---
name: system-spec-builder
description: Turn a rough idea for a small app into a reviewed spec that any AI coding agent can build on the Angular-Supabase template. Interviews the user in Thai until the must-know facts are complete, then writes docs/SYSTEM_SPEC.md + docs/TASKS.md (or docs/features/<name>/SPEC.md + TASKS.md for later rounds) and gets them independently reviewed. Use whenever the user wants to build, create, or spec a system, app, feature, or ระบบ — e.g. "อยากได้ระบบยืมคืน", "ทำระบบจองคิว", "เพิ่มฟีเจอร์แจ้งเตือน", "เขียน spec ให้หน่อย" — even from a one-line idea.
---

# System Spec Builder

Turn a one-line idea into documents an AI agent can build from without guessing.

The user is not a programmer. They have many small-system ideas (borrow/return, queue booking, registration, inventory, etc.) and want to spec each one fast, in a repeatable way, then hand the spec to whichever AI agent they like. Every system starts from the `Angular-Supabase` template repo, which already ships the fixed parts: `AGENTS.md` (coding rules) and `docs/ARCHITECTURE.md` (folder layout, naming, data flow). Your job is to be the interviewer and the writer of the *project-specific* parts; their job is only to answer questions and confirm.

The quality of the spec is decided in the interview. A spec written from incomplete answers produces code that has to be thrown away, so **never write until the must-know list below is satisfied** — but never waste the user's time asking what a pattern or an earlier answer already settled.

## Output — what goes where

```
docs/
├── ARCHITECTURE.md            from the template — NEVER written or edited by this skill
├── SYSTEM_SPEC.md             round 1 / system overview  ← you write this (templates/SYSTEM_SPEC.md)
├── TASKS.md                   round 1 progress           ← you write this (templates/TASKS.md)
└── features/<name>/           later rounds only
    ├── SPEC.md                ← templates/FEATURE_SPEC.md
    └── TASKS.md               ← templates/TASKS.md
```

Round 1 is always flat. Create `docs/features/<name>/` only when a SYSTEM_SPEC already exists and the user asks for a new feature or round; then add a feature index table at the end of SYSTEM_SPEC 1.3 and bump SYSTEM_SPEC's version if the feature changes an existing table.

SPEC files are LOCKED after review and change only with a version bump. TASKS files are living: the building agent ticks tasks, records commits, and updates the header line.

If the current folder has no `docs/ARCHITECTURE.md`, the user has not cloned the template yet. Say so, offer to write into `./docs/` anyway, and note in Task 1 that the files move into the cloned repo.

## Workflow

### 1. Check the idea fits the template, then load a pattern

Read `docs/ARCHITECTURE.md` section 10 (template scope) and place the idea in one of its three levels:

- **พอดี** → continue.
- **พอดี แต่ต้องตัดสินใจ** (login, uploads, notifications, scheduled jobs, reports, faster refresh) → continue; record the chosen approach in SYSTEM_SPEC 2.4 and in 1.9 if it is a guess.
- **ไม่พอดี** (heavy realtime, native/offline, multi-tenant SaaS, third-party API product, high traffic) → STOP before interviewing. Tell the user in 2–3 Thai sentences which need falls outside the template and why. Offer two choices: trim the idea to fit (say what would be dropped or replaced) or stop and talk to the template owner. Only proceed after the user picks; never write a spec that quietly bends `docs/ARCHITECTURE.md`.

Then read `references/patterns.md`. If the idea matches a pattern, start from its tables, features, rules, statuses, and "ที่มักพลาด" list. Propose, do not ask from scratch. If nothing matches, proceed without a pattern and, after finishing, offer to add the new pattern.

If `docs/SYSTEM_SPEC.md` already exists, this is a feature round: read it first, reuse its tables and rules, and interview only about what is new (see "Feature round" below).

### 2. Interview — adaptive, until the must-know list is complete

Read `references/interview-guide.md` for the question bank and techniques. The rules:

**How to ask**
- Thai, plain words. Say "ข้อมูลที่ต้องจดต่อ 1 รายการ" not "table", "ห้ามทำอะไร" not "constraint".
- At most 3 questions per turn, numbered, each answerable in one line (the walk-through question below is the one exception — it is meant to get a story). Every question carries a proposed default: "ถ้าไม่บอก ผมจะถือว่า ___". The user can answer "ตามนั้น".
- **Propose, then ask what differs.** Start from the pattern: "ระบบยืม-คืนปกติมีของ / ผู้ยืม / รายการยืม — ของคุณต่างจากนี้ไหม?"
- **Walk one real case end to end** early ("ยกตัวอย่างครั้งล่าสุดที่มีคนมายืมของ เล่าตั้งแต่ต้นจนจบ"). This single question surfaces most fields, statuses, and rules; use its answers instead of asking field by field.
- Adapt: pick the next question from what the last answer left unclear, not from a fixed script. Skip anything the pattern or a previous answer already settled.
- Reflect back what you understood in one line before the next question when an answer was long or surprising.

**Must-know list — the gate before writing.** Each item is either answered, or covered by the pattern, or defaulted *and written into 1.9 สมมติฐาน*. Items marked ✗ cannot be defaulted. M1, M4, and M7 can never be skipped — nothing can be written without them (M1 may be inferred from the idea sentence plus the walk-through, then reflected back for confirmation in step 3). Other ✗ items may be overridden only by an explicit user command (see Budget).

| # | Must know | Default allowed? |
|---|---|---|
| M1 | The pain today, in one sentence, and what "solved" looks like | ✗ |
| M2 | Who uses it; how many roles; can everyone see everything; device (mobile/desktop) | default: 1 role, no login, both devices |
| M3 | 3–5 MVP features and an explicit not-in-this-round list | ✗ (features) / default exclusions: login, notifications, reports |
| M4 | The main entity and its fields: which are required, which must be unique, which are free text vs a fixed list | ✗ (entity + 3 core fields) |
| M5 | Quantities: is each thing one unit or many; can the same person have several at once | ✗ when the pattern involves stock, borrowing, or capacity |
| M6 | Statuses: the full list, allowed transitions, who triggers each, which timestamp is recorded per transition, and what is visible after a terminal state | default from pattern; ✗ when no pattern matched |
| M7 | The main flow, walked with one concrete example, plus what the main screen shows first (filter, sort, today-only?) | ✗ |
| M8 | Rules the system must refuse: duplicates, zero stock, backwards status, two people at once, past dates, edits after completion | pattern rules as default; ask about concurrency only when the pattern has no concurrency rule or the user's case differs from it |
| M9 | What happens to history when a master record is deleted (delete vs hide) | default: hide (`is_active`), never hard-delete referenced rows |
| M10 | Day/time boundaries: does anything reset daily, timezone, opening hours | default: `Asia/Bangkok`, no reset unless pattern says so |
| M11 | Done criteria: what the user will click to say "ใช้ได้แล้ว" | default: CRUD works, data persists, 375px |
| M12 | Existing data to import; expected volume (rough) | default: none, small |
| M13 | Deploy target | default: Render |

**Contradiction check.** After each turn, compare the new answer with the pattern and earlier answers. If they conflict ("ยืมได้ทีละชิ้น" but later "ยืมทีละหลายอย่าง"), ask which is right before moving on. Never resolve a conflict silently.

**Ambiguity signals** that mean "ask one more": ประมาณ, บางที, แล้วแต่, ปกติ, น่าจะ, คนอื่น, หลายๆ, a quantity with no number, or a feature described only by its screen ("มีหน้ารายงาน") without saying what decision it supports.

**Budget.** A small system typically needs 6–12 questions over 3–5 turns. The number is a guide, not a cap: stop as soon as the gate is satisfied, and keep going while a ✗ item is open. If the user explicitly says "พอแล้ว เขียนเลย" while a ✗ item is open: for M1/M4/M7 explain in one line why you cannot write yet and ask that single question; for any other ✗ item write the spec with it as an explicit assumption in 1.9 and tell them which one.

**Feature round.** Ask only: what the feature adds (M3), which existing tables it touches and what changes (M4), new statuses or transitions (M6), new rules and their interaction with existing ones (M8), and whether existing data needs migrating. Everything else inherits from SYSTEM_SPEC. Feature-round TASKS have 2–6 tasks, no clone task: Task 1 = migration `NNN_<name>.sql` + `supabase gen types` + enums; the TASKS header cites `docs/features/<name>/SPEC.md`.

### 3. Confirm before writing

Summarize in 5–10 bullet points: problem, users, features, entities with key fields, statuses, rules, exclusions, and — separately labelled — every default you chose. Ask "ถูกต้องไหม แก้ตรงไหน?" and wait. Only write after a confirmation.

### 4. Write SYSTEM_SPEC.md and TASKS.md

Use the templates exactly — same headings, same order. Fill every section; never leave placeholders. Read `references/default-stack.md` for how to fill Section 2 (only what differs per project; never copy ARCHITECTURE.md or AGENTS.md content into the spec). See `examples/queue-booking/` for a finished pair.

Rules that make the documents buildable by any agent:

- **Section 0 is not optional.** It tells the agent the reading order, the one-task-at-a-time loop against TASKS.md, and what is LOCKED.
- **Every business rule (1.7) names where it is enforced** — DB constraint, Postgres function, or API — and names the function or constraint. A rule enforced only in the browser is not a rule. Atomic rules (counters, sequential numbers, status transitions) go in a Postgres function or constraint.
- **Every field in 1.5 is used** by a feature, a flow step, or a rule. A field nobody reads is scope creep.
- **Every API row (2.2) cites the rules it enforces** and appears in at least one task.
- **Every task has a test line** with behaviour the user can see. Add a "spec ... ผ่าน `npm test`" clause ONLY when a file in that task has calculations, complex logic, or code that will change often (see AGENTS.md → Testing); name the file and what it verifies (e.g. "spec `bookings-server.service.spec.ts`: คำนวณ `ahead`"). Plain CRUD / pass-through tasks get no spec clause.
- **Task size is fixed**: 1 task = 1 screen, or 1 API resource together with the screen that uses it (list + create + edit of one resource is one task). Round 1 has 6–12 tasks; if more, merge or move features to "รอบถัดไป"; if fewer than 6, split.
- **Tasks are ordered**: clone template + connect Supabase → database + types + enums → resource 1 → resource 2 → status flow → extras → close. Task 1 always clones the template and sets up `.env` — the server skeleton (`src/server/`, the SSR interceptor, `provideHttpClient`) already ships with the template, so it is not a task.
- **Every table is used by at least one feature.**
- **Field names in English (snake_case), labels in Thai.**
- **Keep it small.** SYSTEM_SPEC 100–180 lines, TASKS 40–80 lines. If longer, trim into "รอบถัดไป".

Save with status `ร่าง (รอ review)` and the TASKS header at `ผ่านแล้ว 0/N | Task ปัจจุบัน: 1`.

### 5. Self-check

- [ ] Every must-know item M1–M13 is answered, pattern-covered, or listed in 1.9
- [ ] SYSTEM_SPEC sections 0, 1.1–1.9, 2.1–2.5 present and non-empty
- [ ] 3–5 MVP features, each traceable to at least one task
- [ ] Every rule in 1.7 has a "บังคับที่" that is not "browser" and names the constraint/function
- [ ] Every API path in 2.2 cites a rule or "—" and appears in a task
- [ ] Every table and every field appears in a feature, flow, rule, or task; every feature has a row in 2.3
- [ ] TASKS: round 1 = 6–12 tasks with Task 1 cloning the template; feature round = 2–6 tasks with Task 1 = migration; every task has `ทดสอบ:` and `ผล: —`; header counts match
- [ ] Nothing copied from ARCHITECTURE.md / AGENTS.md; Section 2 only holds project-specific items
- [ ] Nothing requires the browser to talk to Supabase directly or falls in ARCHITECTURE.md section 10 "ไม่พอดี"

### 6. Independent review, then deliver

The writer is bad at spotting its own contradictions, so both files are reviewed by a **separate** reader with no memory of the interview:

- In Claude Code: spawn a subagent (or ask the user to open a fresh session) with only `docs/SYSTEM_SPEC.md`, `docs/TASKS.md`, `docs/ARCHITECTURE.md`, and `AGENTS.md`.
- In a web chat: tell the user to paste those four files into a new chat.

Give the reviewer this brief (Thai):

> นายคือ Tech Lead ขี้บ่น ห้ามแก้ไฟล์ อ่าน SYSTEM_SPEC.md กับ TASKS.md แล้วหาให้เจอ: (1) Section 1 กับ Section 2 ขัดกันตรงไหน (2) ตารางใน 1.5 พอสำหรับทุกฟีเจอร์ใน 1.3 และทุกขั้นตอนใน 1.6 ไหม มีฟิลด์ที่ไม่มีใครใช้ หรือฟิลด์ที่ไม่ได้ระบุว่าบังคับ/ห้ามซ้ำไหม (3) กติกาใน 1.7 บังคับได้จริงตามที่เขียนไหม มีกติกาที่ควรมีแต่ไม่ได้เขียนไหม โดยเฉพาะกรณีกดพร้อมกัน ข้อมูลซ้ำ และการลบข้อมูลที่ถูกอ้างอยู่ (4) API ใน 2.2 ครบทุกขั้นตอนใน 1.6 ไหม รูปแบบตอบกลับชัดพอให้เขียน dto ได้ไหม (5) ชื่อไฟล์ใน 2.3 ตรงกับ ARCHITECTURE.md ข้อ 5 ไหม (6) ใน TASKS.md มี Task ไหนใหญ่เกิน 1 หน้าจอ/1 resource, ไม่มีวิธีทดสอบ, อ้าง API/ตารางที่ไม่มีใน SPEC, หรือ header นับไม่ตรงกับจำนวน Task (7) ขัดกับ ARCHITECTURE.md หรือ AGENTS.md ตรงไหน โดยเฉพาะข้อ 10 ขอบเขตของ template (8) สมมติฐานใน 1.9 ข้อไหนเสี่ยงพอที่ควรกลับไปถามผู้ใช้ก่อนสร้าง แยกผลเป็น 3 ระดับ: blocker (สร้างแล้วพังหรือต้องเดา) / ควรแก้ / เล็กน้อย ตอบเป็นรายการสั้นๆ ถ้าไม่มี blocker ให้พิมพ์ APPROVED ต่อท้าย (แม้จะมีข้อควรแก้ก็ตาม)

Fix every blocker and every ควรแก้ that can be fixed without asking the user (still v1.0). If the reviewer flags an assumption as risky, ask the user that one question before re-reviewing. Repeat until the reviewer prints APPROVED; at most 3 rounds — if still not approved, show the user the remaining items and let them decide. Then set SYSTEM_SPEC status to `พร้อมสร้าง` and present both files. Tell the user in one line how to use them: "เปิด repo ที่ clone จาก template แล้วสั่ง agent ว่า อ่าน docs/SYSTEM_SPEC.md แล้วเริ่มตาม Section 0".

## Tone

Plain Thai, no jargon without a short explanation. The user should feel like they are answering a friendly form, not being interrogated. Keep your own messages short; the documents are where the detail lives.

## Files in this skill

- `templates/SYSTEM_SPEC.md` — round-1 / system-level spec skeleton. Always use it.
- `templates/TASKS.md` — task + progress skeleton, used for every round.
- `templates/FEATURE_SPEC.md` — later-round feature spec skeleton (`docs/features/<name>/SPEC.md`).
- `references/interview-guide.md` — question bank, probing techniques, and a sample interview. Read before step 2.
- `references/patterns.md` — ready-made tables/features/rules/flows and "ที่มักพลาด" for common small systems. Read in step 1.
- `references/default-stack.md` — how to fill Section 2 without duplicating the template docs.
- `examples/queue-booking/` — one finished SYSTEM_SPEC.md + TASKS.md pair. Read if unsure about depth or tone.
