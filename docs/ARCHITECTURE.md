# ARCHITECTURE — โครงสร้างมาตรฐานของ template `Angular-Supabase`

> เวอร์ชัน template: 1.1 | อัปเดต: 2026-08-27
> ไฟล์นี้เป็นของ **template** ใช้เหมือนกันทุกโปรเจกต์ที่ clone ไป
> ห้ามแก้ในโปรเจกต์ลูกค้า ถ้าต้องเปลี่ยน ให้แก้ที่ template แล้วค่อยนำมาใช้
> กติกาการเขียนโค้ดอยู่ใน `AGENTS.md` (root) · สิ่งที่ระบบนี้ต้องทำอยู่ใน `docs/SYSTEM_SPEC.md`

## 1. เทคโนโลยี

| ส่วน           | ใช้                                                    | หมายเหตุ                                              |
| -------------- | ------------------------------------------------------ | ----------------------------------------------------- |
| Frontend + SSR | Angular 22 + `@angular/ssr`                            | standalone, signals, zoneless                         |
| API            | Express ใน process เดียวกับ SSR                        | ทุก endpoint อยู่ใต้ `/api/*`                         |
| ฐานข้อมูล      | Supabase (PostgreSQL)                                  | `@supabase/supabase-js` **ฝั่ง server เท่านั้น**      |
| UI             | Tailwind CSS v4 (CSS-first)                            | ต้องรองรับมือถือ (375px)                              |
| ภาษา           | TypeScript strict                                      |                                                       |
| Validation     | zod                                                    | schema ใน `src/shared/dto/` ใช้ร่วมกันทั้ง API และ UI |
| Test           | Vitest (`npm test`)                                    | jsdom                                                 |
| Deploy         | Node web service (Render / Vercel / เซิร์ฟเวอร์ตัวเอง) | ระบุใน SYSTEM_SPEC                                    |

## 2. การไหลของข้อมูล

```
Browser (Angular) ──HttpClient / httpResource──▶ /api/* (Express, src/server/) ──service_role key──▶ Supabase
```

- Browser **ไม่** เชื่อม Supabase โดยตรง ไม่มี anon key ฝั่ง browser
- ตอน SSR หน้าเดียวกันเรียก `/api/*` เหมือนกัน ผ่าน interceptor ใน `src/app/core/` ที่เติม origin ของ request ที่เข้ามา (จาก `REQUEST` token; ถ้าไม่มีใช้ `http://localhost:${PORT}`) จึงใช้ได้ทั้ง `ng serve` (4200) และ production (4000)
- สิทธิ์ทั้งหมดตัดสินที่ API (`src/server/`) ไม่ใช่ที่ browser และไม่ใช่ที่ RLS policy

## 3. โครงสร้างโฟลเดอร์

```
src/
├── app/                                   Angular app แบ่งตาม feature
│   ├── core/                              ของใช้ทั้งแอป: interceptor, layout shell, error handling
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
│   ├── supabase.ts                        createClient<Database>() ตัวเดียวของทั้งระบบ
│   ├── api.ts                             รวม router ทุก feature ไว้ใต้ /api (server.ts import ตัวนี้ตัวเดียว)
│   ├── routes/<feature>.routes.ts         1 ไฟล์ = 1 resource → express.Router
│   └── services/<feature>-server.service.ts   business logic; ที่เดียวที่เรียก Supabase
│
├── shared/                                ใช้ร่วมทั้ง app/ และ server/ — TypeScript ล้วน ไม่มี Node/browser global
│   ├── types/database.types.ts            สร้างจาก `npm run db:types` ห้ามเขียนมือ
│   ├── dto/<feature>.dto.ts               zod schema ของ request / response ของ /api/* + type จาก z.infer
│   └── enums/<feature>.enums.ts           ค่าสถานะ / ค่าคงที่ที่ DB, API, UI ต้องตรงกัน
│
├── server.ts                              Express host เท่านั้น: mount /api แล้วส่งที่เหลือให้ Angular
├── main.ts · main.server.ts · index.html
├── styles.css                             Tailwind: @import, @theme, @source not
└── environments/                          config ฝั่ง browser ที่ไม่ใช่ความลับ

supabase/config.toml                       มากับ template (ไม่ต้องรัน `supabase init`); `.temp/` = ข้อมูล link ของเครื่องนี้
supabase/migrations/<timestamp>_description.sql   1 ไฟล์ต่อ 1 การเปลี่ยน schema (CLI ตั้งชื่อให้ ห้ามเปลี่ยน)
docs/                                      เอกสารของโปรเจกต์ (ดูข้อ 7)
.sessions/YYYY-MM-DD-HHmm-<task-slug>.md   บันทึกงานเมื่อ Task ผ่าน (agent ถามผู้ใช้ก่อนทุกครั้ง) — ความจำร่วมให้ AI เจ้าอื่นทำต่อได้ (ดูข้อ 7)
public/                                    static assets
.env.example                               ชื่อตัวแปร (อยู่ใน template) · .env ค่าจริง (เครื่องนี้เท่านั้น ห้ามส่งต่อ)
AGENTS.md · CLAUDE.md                      กติกาโค้ด
.claude/skills/ · .agents/skills/          skill ของ AI agent (สองโฟลเดอร์ต้องเหมือนกันทุกไฟล์) — ถ้าขัดกับ AGENTS.md ให้ยึด AGENTS.md
```

## 4. ทิศทาง import (ทางเดียว)

```
src/app/  ──▶  src/shared/  ◀──  src/server/
```

- `app/` ห้าม import จาก `server/` (จะดึง Node code และ secret เข้า browser bundle)
- `server/` ห้าม import จาก `app/`
- `shared/` import ได้เฉพาะไฟล์ใน `shared/` ด้วยกัน
- `@supabase/supabase-js` import ได้ใน `src/server/supabase.ts` ที่เดียว

## 5. การตั้งชื่อไฟล์

| ชนิด                 | รูปแบบ                                      | ตัวอย่าง                          |
| -------------------- | ------------------------------------------- | --------------------------------- |
| หน้า (routed)        | `<name>.page.ts`                            | `booking-form.page.ts`            |
| service ฝั่ง browser | `<feature>-client.service.ts`               | `bookings-client.service.ts`      |
| service ฝั่ง server  | `<feature>-server.service.ts`               | `bookings-server.service.ts`      |
| router ฝั่ง server   | `<feature>.routes.ts`                       | `bookings.routes.ts`              |
| DTO                  | `<feature>.dto.ts`                          | `bookings.dto.ts`                 |
| enum                 | `<feature>.enums.ts`                        | `bookings.enums.ts`               |
| spec                 | ชื่อเดิม + `.spec.ts` วางข้างกัน            | `bookings-server.service.spec.ts` |
| migration            | `<timestamp>_description.sql` (CLI ตั้งให้) | `20260827120000_init.sql`         |

ชื่อไฟล์ browser กับ server ของ feature เดียวกันต้องไม่ซ้ำกัน (จึงมี `-client` / `-server`)

## 6. ฐานข้อมูลและสิทธิ์

- ทุกตารางมี `id uuid default gen_random_uuid() primary key` และ `created_at timestamptz default now()`
- ทุกตาราง **เปิด RLS โดยไม่มี policy** ให้ `anon` / `authenticated` (ปิดตาย) — เข้าถึงได้ทาง `service_role` ของ server เท่านั้น
- ค่าสถานะใน DB บังคับด้วย `CHECK (status IN (...))` และค่าเดียวกันประกาศใน `shared/enums/` เป็น `as const` object + union type (ไม่ใช้ TS `enum`)
- กติกาที่ต้อง atomic (นับสต็อก, เลขรันต่อเนื่อง, เปลี่ยนสถานะ) อยู่ใน Postgres function เรียกผ่าน `.rpc()` หรือ DB constraint — ไม่ทำแบบอ่านแล้วค่อยเขียนใน API
- ฐานข้อมูลอยู่บน Supabase cloud เท่านั้น (ไม่ใช้ local/Docker) — เชื่อม CLI ครั้งเดียวด้วย `npx supabase login` + `npm run db:link -- --project-ref <ref>`
- เปลี่ยน schema = เพิ่มไฟล์ migration เท่านั้น (`npm run db:migration -- <description>`) → `npm run db:push` ขึ้น cloud → `npm run db:types` ใหม่

## 7. เอกสารและบันทึกของโปรเจกต์

```
AGENTS.md                      กติกาโค้ด (root — เครื่องมือ AI โหลดอัตโนมัติ)
docs/
├── ARCHITECTURE.md            ไฟล์นี้ — โครงสร้าง (template, ที่เดียว, ไม่แก้ในโปรเจกต์ลูกค้า)
├── SYSTEM_SPEC.md             ภาพรวมระบบ + รอบแรก: ผู้ใช้ ฟีเจอร์ ตาราง กติกา API [LOCKED หลัง review]
├── TASKS.md                   ความคืบหน้ารอบแรก (ไฟล์ที่มีชีวิต อัปเดตทุกครั้งที่ Task ผ่าน)
└── features/<name>/           เฉพาะเมื่อมีรอบถัดไป / ฟีเจอร์ใหม่
    ├── SPEC.md                spec ระดับ feature — อ้างตารางใน SYSTEM_SPEC เพิ่มเฉพาะส่วนใหม่
    └── TASKS.md               ความคืบหน้าของ feature นั้น
```

| ไฟล์                       | ใครเขียน                    | เปลี่ยนเมื่อ                                                                                                                                                |
| -------------------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AGENTS.md, ARCHITECTURE.md | template                    | แทบไม่เปลี่ยน                                                                                                                                               |
| SYSTEM_SPEC.md, SPEC.md    | skill `system-spec-builder` | เฉพาะเมื่อ bump เวอร์ชัน (แก้เอกสารก่อนแก้โค้ดเสมอ)                                                                                                         |
| TASKS.md                   | agent ที่ทำงาน              | ทุกครั้งที่ Task ผ่าน: ติ๊ก `[x]` + วันที่ (+ ชื่อไฟล์ `.sessions/` ถ้าบันทึก) + header                                                                     |
| `.sessions/*.md`           | agent ที่ทำงาน              | เมื่อ Task ผ่านและผู้ใช้ตอบว่าให้บันทึก: ทำอะไร ไฟล์ไหน ตัดสินใจอะไรเพราะอะไร ทดสอบอย่างไร Task ถัดไป — agent **ไม่เริ่ม Task ถัดไปเอง** จนกว่าผู้ใช้จะสั่ง |

รอบแรกใช้แบบ flat (`docs/SYSTEM_SPEC.md` + `docs/TASKS.md`) ไม่สร้าง `features/` เผื่อ เมื่อมีรอบถัดไปค่อยสร้าง และเพิ่มตาราง index ใน SYSTEM_SPEC ชี้ไปแต่ละ feature; ถ้า feature ใหม่แก้ตารางเดิม ต้อง bump เวอร์ชัน SYSTEM_SPEC ด้วย

## 8. ตัวแปร .env และคำสั่ง

```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=      # server เท่านั้น ห้ามส่งต่อ
PORT=4000
NG_ALLOWED_HOSTS=localhost      # โดเมนที่ SSR ยอมเรนเดอร์ให้ (คั่นด้วย , ) ตั้งเป็นโดเมนจริงก่อน deploy มิฉะนั้นทุกหน้าจะได้ 400
```

```
npm install
npm start                              # dev server (SSR) http://localhost:4200
npm test                               # Vitest
npm run build
npm run serve:ssr:<project-name>       # รัน build จริง http://localhost:4000 (ชื่อตาม angular.json)
npm run format                         # Prettier (format:check สำหรับ CI)
npx supabase login                     # ครั้งเดียวต่อเครื่อง (เปิด browser)
npm run db:link -- --project-ref <ref> # ครั้งเดียวต่อโปรเจกต์ (<ref> จาก URL dashboard: supabase.com/dashboard/project/<ref>)
npm run db:migration -- <description>  # สร้างไฟล์ migration ใน supabase/migrations/
npm run db:push                        # apply migration ที่ยังไม่ได้รันขึ้นโปรเจกต์ cloud
npm run db:types                       # gen src/shared/types/database.types.ts จากโปรเจกต์ cloud (Supabase CLI อยู่ใน devDependencies)
```

## 9. เมื่อระบบใหญ่ขึ้น

- `src/server/routes/` + `services/` เริ่มแน่น → จัดกลุ่มเป็น `src/server/features/<feature>/{routes,service}.ts` ตัดสินตอนเขียน SYSTEM_SPEC ไม่ใช่กลางทาง
- ต้องมี login → เพิ่ม middleware ใน `src/server/` และ `src/app/core/` (guard) — ยังคงไม่ให้ browser แตะ Supabase
- Feature ใหม่ → `docs/features/<name>/` ตามข้อ 7 และ `src/app/features/<name>/` ตามข้อ 3

## 10. ขอบเขตของ template — ระบบแบบไหนสร้างบนนี้ได้

Template นี้ออกแบบสำหรับ **mini app ต่อลูกค้า 1 repo** ที่เป็น "กรอกข้อมูล → เก็บ → ดู → เปลี่ยนสถานะ" โดยทุกอย่างผ่าน API ที่ server ตัวเดียว

| ระดับ                                                    | ตัวอย่าง                                                                                                                                                                                                                                                                                                                                   | ทำอย่างไร                                                                                 |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| **พอดี** — ไม่ต้องคิดเพิ่ม                               | ยืม-คืน, จองคิว, ลงทะเบียน, สต็อก, ทะเบียน/รายการ, ใบขอ-อนุมัติ, แจ้งซ่อม, จองห้อง, บันทึกเข้างาน                                                                                                                                                                                                                                          | ใช้ pattern ใน skill (P1–P6) หรือ pattern ที่ใกล้เคียงที่สุดได้เลย                        |
| **พอดี แต่ต้องตัดสินใจใน SYSTEM_SPEC 2.4**               | login/หลายบทบาท (middleware ใน `src/server/`) · resource > 5 (`src/server/features/`) · อัปโหลดไฟล์ (server → Supabase Storage) · ส่ง LINE/อีเมล (server เรียก API ภายนอก) · งานตามเวลา (`pg_cron` หรือ endpoint ให้ cron เรียก) · รายงาน/CSV (server สร้างไฟล์) · หน้าจออัปเดตเอง (polling; ถ้าต้องเร็วกว่า 5 วินาที ใช้ SSE จาก Express) | เขียนวิธีที่เลือกไว้ใน SPEC 2.4 — ยังไม่ให้ browser แตะ Supabase                          |
| **ไม่พอดี** — ต้องอัปเกรด template หรือใช้ template อื่น | realtime หนัก (แชท, ติดตามตำแหน่งสด) · mobile native / offline-first · SaaS หลายลูกค้าใน DB เดียว (multi-tenant) · เปิด API ให้บุคคลที่สามเป็นหลัก · traffic สูงจน SSR + API ใน Node ตัวเดียวไม่พอ                                                                                                                                         | **ห้าม** ฝืนยัดลง SPEC 2.4 — เป็นการตัดสินใจระดับ template ให้คุยกับเจ้าของ template ก่อน |

เกณฑ์ตัดสินเร็ว: ถ้าวิธีที่ "เป็นธรรมชาติ" ของความต้องการนั้นคือให้ browser คุยกับ Supabase โดยตรง (Realtime, Auth ฝั่ง client, Storage ตรง) แปลว่าอยู่นอกกรอบของ template นี้
