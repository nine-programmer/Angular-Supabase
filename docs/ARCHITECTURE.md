# ARCHITECTURE — โครงสร้างมาตรฐานของ template `Angular-Supabase`

> เวอร์ชัน template: 1.11 | อัปเดต: 2026-09-06
> ไฟล์นี้เป็นของ **template** ใช้เหมือนกันทุกโปรเจกต์ที่ clone ไป
> ห้ามแก้ในโปรเจกต์ลูกค้า ถ้าต้องเปลี่ยน ให้แก้ที่ template แล้วค่อยนำมาใช้
> กติกาการเขียนโค้ดอยู่ใน `AGENTS.md` (root) · สิ่งที่ระบบนี้ต้องทำอยู่ใน `docs/SYSTEM_SPEC.md`

## 1. เทคโนโลยี

| ส่วน           | ใช้                                                             | หมายเหตุ                                                            |
| -------------- | --------------------------------------------------------------- | ------------------------------------------------------------------- |
| Frontend + SSR | Angular 22 + `@angular/ssr`                                     | standalone, signals, zoneless                                       |
| API            | Express ใน process เดียวกับ SSR                                 | ทุก endpoint อยู่ใต้ `/api/*`                                       |
| ฐานข้อมูล      | Supabase (PostgreSQL) หรือ PostgreSQL + PostgREST ที่ติดตั้งเอง | `@supabase/supabase-js` **ฝั่ง server เท่านั้น** (คุยกับ PostgREST) |
| UI             | Tailwind CSS v4 (CSS-first)                                     | ต้องรองรับมือถือ (375px)                                            |
| ภาษา           | TypeScript strict                                               |                                                                     |
| Validation     | zod                                                             | schema ใน `src/shared/dto/` ใช้ร่วมกันทั้ง API และ UI               |
| Test           | Vitest (`npm test`)                                             | jsdom                                                               |
| Deploy         | Node web service (Render / Vercel / เซิร์ฟเวอร์ตัวเอง)          | ระบุใน SYSTEM_SPEC                                                  |

## 2. การไหลของข้อมูล

```
Browser (Angular) ──HttpClient / httpResource──▶ /api/* (Express, src/server/) ──service_role key──▶ PostgREST (Supabase cloud หรือติดตั้งเอง) ──▶ PostgreSQL
```

- Browser **ไม่** เชื่อม Supabase โดยตรง ไม่มี anon key ฝั่ง browser
- ตอน SSR หน้าเดียวกันเรียก `/api/*` เหมือนกัน ผ่าน interceptor ใน `src/app/core/` ที่เปลี่ยน `/api/*` เป็น origin แบบ loopback `http://localhost:<port>` (port ของ request ที่เข้ามาตอน `ng serve`, ไม่งั้นใช้ `PORT`) — ไม่วิ่งออกโดเมนจริง จึงไม่ผ่าน proxy/TLS/redirect — และส่ง cookie ของผู้ใช้ต่อไปให้เฉพาะ origin นั้น จึงใช้ได้ทั้ง `ng serve` (4200) และ production
- สิทธิ์ทั้งหมดตัดสินที่ API (`src/server/`) ไม่ใช่ที่ browser และไม่ใช่ที่ RLS policy

## 3. โครงสร้างโฟลเดอร์

```
src/
├── app/                                   Angular app แบ่งตาม feature
│   ├── core/                              ของใช้ทั้งแอป: interceptor, guard, layout shell, error handling (มากับ template: api-origin.interceptor.ts, ssr-cookie.interceptor.ts, api-error-message.ts)
│   ├── ui/                                component / pipe / directive ใช้ซ้ำข้าม feature (2+ feature)
│   ├── features/
│   │   └── <feature>/                     1 โฟลเดอร์ต่อ 1 feature (ปกติ = 1 resource)
│   │       ├── pages/<name>.page.ts       หน้าจอที่มี route
│   │       ├── components/                component ที่ใช้เฉพาะใน feature นี้
│   │       ├── <feature>-client.service.ts   เรียก /api/<feature> ด้วย HttpClient / httpResource
│   │       └── <feature>.routes.ts           lazy-load จาก app.routes.ts ด้วย loadChildren
│   ├── app.routes.ts
│   └── app.routes.server.ts               RenderMode ต่อหน้า (Server / Prerender / Client)
│
├── server/                                API layer — รันบน Node เท่านั้น
│   ├── env.ts                             อ่าน + ตรวจ process.env ที่เดียว
│   ├── supabase.ts                        createClient<Database>() ตัวเดียวของทั้งระบบ — lazy singleton ผ่าน getSupabase()
│   ├── api.ts                             รวม router ทุก feature ไว้ใต้ /api + 404 JSON + error handler (server.ts import ตัวนี้ตัวเดียว)
│   ├── api-error.ts                       HttpError, throwApiError(), apiErrorHandler — แปลง error ของ Supabase/Postgres เป็น status + ข้อความไทย (มากับ template ทุก feature ใช้ตัวนี้)
│   ├── routes/<feature>.routes.ts         1 ไฟล์ = 1 resource → express.Router (มากับ template: health.routes.ts)
│   └── services/<feature>-server.service.ts   business logic; ที่เดียวที่เรียก Supabase — รับ client เป็น parameter สุดท้าย `db = getSupabase()` (มากับ template: health-server.service.ts)
│
├── shared/                                ใช้ร่วมทั้ง app/ และ server/ — TypeScript ล้วน ไม่มี Node/browser global
│   ├── types/database.types.ts            สร้างจาก `npm run db:types` ห้ามเขียนมือ
│   ├── utils/<name>.ts                    helper ล้วนๆ ที่ทั้ง app/ และ server/ ใช้ (มากับ template: thai-date.ts — "วันนี้" เวลาไทย)
│   ├── dto/<feature>.dto.ts               zod schema ของ request / response ของ /api/* + type จาก z.infer
│   └── enums/<feature>.enums.ts           ค่าสถานะ / ค่าคงที่ที่ DB, API, UI ต้องตรงกัน
│
├── server.ts                              Express host เท่านั้น: mount /api แล้วส่งที่เหลือให้ Angular
├── main.ts · main.server.ts · index.html
├── styles.css                             Tailwind: @import ... source(none) + @source '../src' (สแกนเฉพาะ src/), @theme
└── environments/                          config ฝั่ง browser ที่ไม่ใช่ความลับ (`environment.ts` + `environment.development.ts` สลับด้วย fileReplacements ใน angular.json)

supabase/config.toml                       มากับ template (ไม่ต้องรัน `supabase init`) — เป็นไฟล์มาตรฐานของ CLI ส่วนที่พูดถึง local stack / studio / db diff / declarative schema ไม่ได้ใช้ อย่ายึดตาม comment ในไฟล์นั้น; `.temp/` = ข้อมูล link ของเครื่องนี้
supabase/migrations/<timestamp>_description.sql   1 ไฟล์ต่อ 1 การเปลี่ยน schema (CLI ตั้งชื่อให้ ห้ามเปลี่ยน) — มากับ template 2 ไฟล์ (ห้ามลบทั้งคู่): `*_roles.sql` สร้าง role + สิทธิ์ของ PostgREST ที่ Supabase cloud มีอยู่แล้ว (เพื่อให้ migration ชุดเดียวกันรันบน Postgres + PostgREST ที่ติดตั้งเองได้) และ `*_health.sql` สร้าง function `health()` ให้ `/api/health` ใช้ตรวจการเชื่อมต่อ
docs/                                      เอกสารของโปรเจกต์ (ดูข้อ 7) + `EXTENSION_POINTS.md` ของ template (ที่วางไฟล์ของจุดขยาย — ข้อ 9)
.sessions/YYYY-MM-DD-HHmm-<task-slug>.md   บันทึกงานเมื่อ Task ผ่าน (agent ถามผู้ใช้ก่อนทุกครั้ง) — ความจำร่วมให้ AI เจ้าอื่นทำต่อได้ (ดูข้อ 7)
public/                                    static assets
.env.example                               ชื่อตัวแปร + comment อธิบายทุกตัว (อยู่ใน template — ไฟล์เดียวที่ agent อ่านได้) · .env ค่าจริง (เครื่องนี้เท่านั้น ห้ามส่งต่อ ห้าม agent อ่าน)
AGENTS.md · CLAUDE.md                      กติกาโค้ด
.claude/skills/ · .agents/skills/          skill ของ AI agent (สองโฟลเดอร์ต้องเหมือนกันทุกไฟล์) — ถ้าขัดกับ AGENTS.md ให้ยึด AGENTS.md
skills-lock.json                           บันทึกเวอร์ชันของ skill ที่ดึงมาจากภายนอก (skill ที่ดูแลเองไม่อยู่ในนี้)
.cursor/ · .codex/ · .gemini/ · .vscode/ · .mcp.json   config ของเครื่องมือ AI/editor (ส่วนใหญ่คือ MCP server ของ Angular CLI) ไม่ใช่โค้ดของระบบ
.prettierrc · .prettierignore · .editorconfig         Prettier เป็นตัวจัดรูปแบบเดียวของ repo (ไม่มี ESLint)
```

โฟลเดอร์ระดับบนสุดมีเท่าที่อยู่ในผังนี้ ถ้าจะเพิ่มใหม่ต้องถามผู้ใช้ก่อน (AGENTS.md → Project Structure & Docs)

โฟลเดอร์ที่ template เตรียมไว้แต่ยังไม่มีไฟล์ (`src/app/ui/`, `src/app/features/`, `src/shared/dto/`, `src/shared/enums/`, `.sessions/`) มีไฟล์ `.gitkeep` ว่างไว้ตัวเดียวเพื่อให้โฟลเดอร์ติดไปกับ repo — ลบ `.gitkeep` ได้เมื่อโฟลเดอร์นั้นมีไฟล์จริงแล้ว และห้ามใช้เป็นที่เก็บอะไรอย่างอื่น

## 4. ทิศทาง import (ทางเดียว)

```
src/app/  ──▶  src/shared/  ◀──  src/server/
```

- `app/` ห้าม import จาก `server/` (จะดึง Node code และ secret เข้า browser bundle)
- `server/` ห้าม import จาก `app/`
- `shared/` import ได้เฉพาะไฟล์ใน `shared/` ด้วยกัน
- `@supabase/supabase-js` import ได้ใน `src/server/supabase.ts` ที่เดียว

## 5. การตั้งชื่อไฟล์

| ชนิด                          | รูปแบบ                                                                                                                                 | ตัวอย่าง                                     |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| หน้า (routed)                 | `<name>.page.ts`                                                                                                                       | `booking-form.page.ts`                       |
| service ฝั่ง browser          | `<feature>-client.service.ts`                                                                                                          | `bookings-client.service.ts`                 |
| service ฝั่ง server           | `<feature>-server.service.ts`                                                                                                          | `bookings-server.service.ts`                 |
| router ฝั่ง server            | `<feature>.routes.ts`                                                                                                                  | `bookings.routes.ts`                         |
| DTO                           | `<feature>.dto.ts`                                                                                                                     | `bookings.dto.ts`                            |
| enum                          | `<feature>.enums.ts`                                                                                                                   | `bookings.enums.ts`                          |
| spec                          | ชื่อเดิม + `.spec.ts` วางข้างกัน                                                                                                       | `bookings-server.service.spec.ts`            |
| guard / interceptor (Angular) | `<name>.guard.ts` / `<name>.interceptor.ts` ใน `src/app/core/`                                                                         | `auth.guard.ts`, `ssr-cookie.interceptor.ts` |
| middleware (Express)          | `<name>.middleware.ts` ใน `src/server/`                                                                                                | `auth.middleware.ts`                         |
| component เฉพาะ feature       | `components/<name>.component.ts`                                                                                                       | `loan-row.component.ts`                      |
| UI ใช้ซ้ำ (`src/app/ui/`)     | `<name>.component.ts` / `<name>.pipe.ts` / `<name>.directive.ts`                                                                       | `status-badge.component.ts`                  |
| helper                        | `src/shared/utils/<name>.ts` (ทั้งสองฝั่งใช้) · `src/server/<name>.ts` (server เท่านั้น) · `src/app/core/<name>.ts` (browser เท่านั้น) | `thai-date.ts`, `api-error.ts`               |
| migration                     | `<timestamp>_description.sql` (CLI ตั้งให้)                                                                                            | `20260827120000_init.sql`                    |

service ฝั่ง browser กับ server ของ feature เดียวกันต้องชื่อไม่ซ้ำกัน (จึงมี `-client` / `-server`) ส่วน `<feature>.routes.ts` ใช้ชื่อเดียวกันได้ทั้งสองฝั่ง เพราะอยู่คนละโฟลเดอร์ (`src/app/features/<feature>/` กับ `src/server/routes/`)

## 6. ฐานข้อมูลและสิทธิ์

- ทุกตารางมี `id uuid default gen_random_uuid() primary key` และ `created_at timestamptz default now()` — primary key เป็น `uuid` เสมอ ไม่ใช้ `bigint identity` ตามที่ skill Postgres แนะนำ; ถ้าโปรเจกต์ Supabase อยู่บน Postgres 18+ ใช้ `uuidv7()` (เรียงตามเวลา) แทน `gen_random_uuid()` ได้
- ทุกตาราง **เปิด RLS โดยไม่มี policy** ให้ `anon` / `authenticated` (ปิดตาย) — เข้าถึงได้ทาง `service_role` ของ server เท่านั้น
- ค่าสถานะใน DB บังคับด้วย `CHECK (status IN (...))` และค่าเดียวกันประกาศใน `shared/enums/` เป็น `as const` object + union type (ไม่ใช้ TS `enum`)
- กติกาที่ต้อง atomic (นับสต็อก, เลขรันต่อเนื่อง, เปลี่ยนสถานะ) บังคับที่ฐานข้อมูล — ไม่ทำแบบอ่านแล้วค่อยเขียนใน API: นับสต็อก เลขรัน และการเปลี่ยนสถานะที่มีผลข้างเคียง (จด log, ตั้งเวลา, แตะตารางอื่น) อยู่ใน Postgres function เรียกผ่าน `.rpc()` หรือ DB constraint; การเปลี่ยนสถานะแถวเดียวแบบไม่มีผลข้างเคียงใช้ conditional update ใน service ได้ (`update ... eq('id') eq('status', เดิม)` แล้วถือว่า 0 แถว = conflict) — รายละเอียดใน `AGENTS.md` → API Layer
- ฐานข้อมูลเป็น Supabase cloud หรือ PostgreSQL + PostgREST บน VPS ของตัวเอง — ผู้ใช้เลือกตอนเขียน spec (SYSTEM_SPEC 2.1) และตั้งค่าใน **Task 1 ของ `docs/TASKS.md`** ตามขั้นตอนใน README → "ตั้งค่าฐานข้อมูล" (แบบ A cloud / แบบ B VPS — agent ยกขั้นตอนจาก README ไม่คิดเอง) จนเปิด `/api/health` ได้ `{ ok: true }`; ไม่มี local/Docker สำหรับ dev
- เปลี่ยน schema = เพิ่มไฟล์ migration เท่านั้น (`npm run db:migration -- <description>`) → `npm run db:push` → `npm run db:types` (บน VPS: `db:push:url` / `db:types:url` ที่อ่าน `DATABASE_URL` จาก `.env`)
- **ย้ายออกจาก Supabase cloud ได้เสมอ**: server พึ่งแค่ Postgres + PostgREST (ตัวเดียวกับที่ Supabase รันให้) จึงย้ายไป PostgreSQL + PostgREST บน VPS ของตัวเองได้ด้วยการเปลี่ยนค่าใน `.env` (ขั้นตอนใน README → "ตั้งค่าฐานข้อมูล" แบบ B) — ทุก Task จึง**ห้ามพึ่งของที่มีเฉพาะบน Supabase cloud**: Auth, Realtime, Edge Functions, การอ้าง schema `auth.` / `storage.` ใน SQL, และ extension นอกชุดมาตรฐานของ Postgres; ข้อยกเว้นมี 2 อย่าง — Storage HTTP API ผ่าน `supabase-js` ใช้ได้แต่ต้องอยู่ในไฟล์เดียวเพื่อสลับเป็นดิสก์/S3 ได้ (`docs/EXTENSION_POINTS.md`) และ `pg_cron` ใช้ได้เมื่อ SPEC 2.4 ระบุว่าบน VPS ต้องติดตั้ง extension เองพร้อมแผนสำรอง (`src/server/jobs/`) (กติกาเต็มใน `AGENTS.md` → Supabase)
- คอลัมน์เสริมเมื่อ spec ต้องการ: `updated_at timestamptz` ให้ตั้งค่าด้วย trigger ใน migration เดียวกัน (`create or replace function set_updated_at() returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end $$;` + `create trigger ... before update ... execute function set_updated_at()`) ไม่ใช่ให้ API ส่งมา; การ "ลบ" ข้อมูลหลักที่ถูกอ้างถึงใช้ `is_active boolean default true` (soft delete) แทน `DELETE`
- error ที่ function ตั้งใจส่งกลับ: `RAISE EXCEPTION 'ข้อความไทย'` (= SQLSTATE `P0001`) เมื่อกติกาไม่ผ่าน → API ตอบ 400; `RAISE EXCEPTION 'ข้อความไทย' USING ERRCODE = 'P0409'` เมื่อสถานะไม่ตรงเงื่อนไข → 409 — `src/server/api-error.ts` แปลงให้ทุก route เหมือนกัน (รายละเอียด `AGENTS.md` → API Layer) จึงเขียนข้อความไทยไว้ใน function ได้เลย
- ทุก query ที่คืนรายการต้องมี `.order()` เสมอ; ระบบเล็กไม่ทำ pagination เว้นแต่ SPEC 2.4 กำหนด; "วันนี้" เทียบด้วยเวลาไทยทั้งใน SQL และ TypeScript (`src/shared/utils/thai-date.ts`)
- ข้อมูลเริ่มต้นที่ต้องมีจริง (admin คนแรก, รายการประเภท, ข้อมูลเดิมจากไฟล์ Excel/CSV ที่ผู้ใช้ส่งให้ — agent แปลงเป็น `insert`) อยู่ใน migration; ข้อมูลตัวอย่างเพื่อทดสอบใส่ใน migration ได้เฉพาะเมื่อ SPEC 1.9 ระบุ และต้องลบ/ปิดใช้งานผ่านหน้าจอได้ (ฐานข้อมูลมีชุดเดียว ไม่แยก dev/prod)

## 7. เอกสารและบันทึกของโปรเจกต์

```
AGENTS.md                      กติกาโค้ด (root — เครื่องมือ AI โหลดอัตโนมัติ)
docs/
├── ARCHITECTURE.md            ไฟล์นี้ — โครงสร้าง (template, ที่เดียว, ไม่แก้ในโปรเจกต์ลูกค้า)
├── EXTENSION_POINTS.md        ของ template เช่นกัน — ที่วางไฟล์ของจุดขยาย (ข้อ 9) อ่านเฉพาะเมื่อ SPEC ต้องการ
├── SYSTEM_SPEC.md             ภาพรวมระบบ + รอบแรก: ผู้ใช้ ฟีเจอร์ ตาราง กติกา API [LOCKED หลัง review]
├── TASKS.md                   ความคืบหน้ารอบแรก (ไฟล์ที่มีชีวิต อัปเดตทุกครั้งที่ Task ผ่าน)
├── DESIGN.md                  ระบบออกแบบกลาง: โทน, @theme token, component pattern — สร้างใน Task "Design UX/UI" [LOCKED หลัง Task นั้นผ่าน] ทุก Task ที่มีหน้าจอต้องทำตาม
├── design/mockup.html         mockup ที่ผู้ใช้เคาะแล้วใน Task เดียวกัน (Tailwind Play CDN เปิดดูในเบราว์เซอร์ได้เลย ไม่เข้า build — ห้ามเพิ่มเข้า @source)
└── features/<name>/           เฉพาะเมื่อมีรอบถัดไป / ฟีเจอร์ใหม่ (หน้าจอใหม่ใช้ DESIGN.md เดิม)
    ├── SPEC.md                spec ระดับ feature — อ้างตารางใน SYSTEM_SPEC เพิ่มเฉพาะส่วนใหม่
    └── TASKS.md               ความคืบหน้าของ feature นั้น
.sessions/*.md                 บันทึกงานหลัง Task ผ่าน (เฉพาะเมื่อผู้ใช้ตอบว่าให้บันทึก)
```

รอบแรกใช้แบบ flat (`docs/SYSTEM_SPEC.md` + `docs/TASKS.md`) ไม่สร้าง `features/` เผื่อ เมื่อมีรอบถัดไปค่อยสร้าง และเพิ่มตาราง index ใน SYSTEM_SPEC ชี้ไปแต่ละ feature; ถ้า feature ใหม่แก้ตารางเดิม ต้อง bump เวอร์ชัน SYSTEM_SPEC ด้วย

ใครแก้ไฟล์ไหนเมื่อไหร่ (LOCKED, การติ๊ก TASKS, การถามก่อนเขียน `.sessions/`, การหยุดรอหลัง Task ผ่าน) กำหนดไว้ที่เดียวใน `AGENTS.md` → Project Structure & Docs + Working Rules และ SYSTEM_SPEC Section 0 — ไฟล์นี้ไม่ทวนซ้ำ

## 8. ตัวแปร .env และคำสั่ง

ตัวแปรมาตรฐาน 5 ตัว: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (server เท่านั้น ห้ามส่งต่อ), `PORT` (ค่าเริ่มต้น 4000), `NG_ALLOWED_HOSTS` (โดเมนที่ SSR ยอมเรนเดอร์ให้ — ตั้งเป็นโดเมนจริงก่อน deploy มิฉะนั้นทุกหน้าจะได้ 400), `DATABASE_URL` (เฉพาะฐานข้อมูลบน VPS ใช้กับ `db:push:url` / `db:types:url` แอปไม่อ่าน) — คำอธิบายเต็มของแต่ละตัว (คืออะไร เอามาจากไหน ใครใช้) อยู่ใน `.env.example` agent อ่านไฟล์นั้นแทน `.env` เสมอ และตัวแปรใหม่ของโปรเจกต์ต้องเพิ่มที่นั่นพร้อม comment (AGENTS.md → Supabase)

คำสั่งเป็น npm script ใน `package.json` (ตัวที่ใช้บ่อยพร้อมคำอธิบายอยู่ใน `README.md` → คำสั่งที่ใช้บ่อย) ที่ต้องจำตอนสร้างระบบมีแค่: `npm run format` แล้ว `npm test` ก่อนส่งงานทุก Task (AGENTS.md) และลำดับ migration ในข้อ 6

Deploy: ขั้นตอน (Render หรือ host Node ใดๆ, และแอปบน VPS) อยู่ใน `README.md` → Deploy — README ปิดงานของโปรเจกต์คัดลอกย่อหน้านั้นไปใส่ชื่อจริง

## 9. จุดขยาย (extension points) — เมื่อระบบต้องการมากกว่า CRUD

ความต้องการที่ template-scope จัดเป็น "พอดี แต่ต้องตัดสินใจ" (login/หลายบทบาท, อัปโหลดไฟล์, ส่ง LINE/อีเมล, งานตามเวลา, รายงาน, หน้าจออัปเดตเอง/SSE, resource > 5, audit, พิมพ์) มีที่วางไฟล์กำหนดไว้แล้วใน **`docs/EXTENSION_POINTS.md`** — โฟลเดอร์/ชื่อไฟล์ในตารางนั้นถือว่าอยู่ในผังข้อ 3 แล้ว **ไม่ต้องถามผู้ใช้ก่อนสร้าง** แค่ระบุใน SYSTEM_SPEC 2.3/2.4 ว่าใช้ตัวไหน อ่านไฟล์นั้นเฉพาะเมื่อ SPEC ต้องการความสามารถเหล่านี้ และยังคงกติกาเดิม: browser ไม่แตะ Supabase, ทุกอย่างผ่าน `/api/*`

## 10. ขอบเขตของ template

Template นี้ออกแบบสำหรับ **mini app ต่อลูกค้า 1 repo** แบบ "กรอกข้อมูล → เก็บ → ดู → เปลี่ยนสถานะ" ที่ทุกอย่างผ่าน API ของ server ตัวเดียว

เกณฑ์ตัดสินเร็ว: ถ้าวิธีที่ "เป็นธรรมชาติ" ของความต้องการนั้นคือให้ browser คุยกับ Supabase โดยตรง (Realtime, Auth ฝั่ง client, Storage ตรง) แปลว่าอยู่นอกกรอบของ template นี้ — **ห้าม** ฝืนยัดลง SPEC 2.4 ให้คุยกับเจ้าของ template ก่อน

ตารางเต็ม (ระดับ พอดี / พอดีแต่ต้องตัดสินใจใน SPEC 2.4 / ไม่พอดี พร้อมตัวอย่าง) อยู่ที่ `.claude/skills/system-spec-builder/references/template-scope.md` — skill `system-spec-builder` ใช้ตรวจขอบเขตทุกครั้งที่เขียน spec; ระดับ "พอดีแต่ต้องตัดสินใจ" มีที่วางไฟล์ใน `docs/EXTENSION_POINTS.md` แล้ว (ข้อ 9)

เส้นทางอัปเกรดเมื่อต้องการสิ่งที่ "ไม่พอดี": ทำเป็นรอบ feature ของ **template เอง** (เช่น `docs/features/realtime/` ใน repo template ที่เพิ่มโฟลเดอร์/กติกาที่ต้องใช้ แล้ว bump เวอร์ชัน template) จากนั้นค่อยนำ template รุ่นใหม่ไปใช้กับโปรเจกต์ลูกค้า — ไม่ทำเฉพาะในโปรเจกต์ใดโปรเจกต์หนึ่ง เพื่อให้ทุกโปรเจกต์ถัดไปได้ใช้ด้วย
