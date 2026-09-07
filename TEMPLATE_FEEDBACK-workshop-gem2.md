# Feedback สำหรับ template จาก branch `workshop-gem2` (barber-queue)

> สรุปบทเรียนระดับ **template** เพื่อนำไปอัปเดต branch `development` — ไม่ใช่รายการบั๊กของ barber-queue
> วันที่: 2026-09-07 | อ้างอิง: template v1.11 (`docs/ARCHITECTURE.md`), SPEC v1.2 ของ barber-queue, TASKS ผ่าน 10/10
> **ขอบเขตรอบนี้: ปรับเอกสารเท่านั้น** (AGENTS.md, README.md, docs/, skill `system-spec-builder`) ไม่แก้โค้ดของ template — ส่วนที่ต้องรอโค้ดจดไว้ท้ายข้อว่า "รอรอบโค้ด"
> **ไฟล์นี้อ่านบน branch `development` ซึ่งไม่มีไฟล์ของ barber-queue** (`docs/SYSTEM_SPEC.md`, `docs/DESIGN.md`, `src/server/admin-auth.ts`, `.sessions/`) — ทุกข้อจึงยกตัวอย่างจากไฟล์เหล่านั้นมาไว้ในข้อเลย ไม่ต้องเปิดไฟล์ต้นทาง
> วิธีใช้: checkout `development` แล้วสั่ง "อ่าน TEMPLATE_FEEDBACK-workshop-gem2.md แล้วทำข้อ [N]" ทีละข้อ; หลังทำครบ `npm run format` เพื่อให้ Prettier จัดตาราง markdown

## หลักการที่ใช้กับทุกข้อ

1. **ไม่ผูก path/URL ตายตัว** — template ใช้กับหลายระบบ กติกาต้องอ้าง "หน้า login ของโปรเจกต์ (path ตาม SPEC 2.3)" หรือ "หน้าหลักหลังล็อกอิน" ไม่ใช่ `/login`, `/admin/login`, `/admin/*`; ผูกกับบทบาท/ความสามารถ ไม่ใช่ชื่อหน้าของโปรเจกต์ใดโปรเจกต์หนึ่ง
2. **เอกสารต้องสั้นพอให้ AI ตัวเล็กไม่สับสน** — เพิ่มกติกาเป็นประโยคเดียวเมื่อทำได้ ไม่เพิ่มตารางเงื่อนไขซ้อน ไม่เพิ่มตัวเลขใหม่ถ้ากติกาเดิมใช้ได้
3. **`.claude/skills/` กับ `.agents/skills/` ต้องเหมือนกันทุกไฟล์** (ARCHITECTURE ข้อ 3) — ทุกข้อที่แตะ skill ให้คัดลอกทับอีกฝั่งด้วย เขียนไว้ตรงนี้ครั้งเดียว ไม่ทวนในแต่ละข้อ
4. `docs/ARCHITECTURE.md` และ `docs/EXTENSION_POINTS.md` แก้ได้เพราะนี่คือ branch ของ template (ห้ามแก้เฉพาะในโปรเจกต์ลูกค้า)

## วิธีที่ได้ข้อสรุปนี้

- อ่าน `.sessions/*.md` ทั้ง 9 ไฟล์, `docs/TASKS.md`, `docs/SYSTEM_SPEC.md`, `docs/DESIGN.md`, `docs/EXTENSION_POINTS.md` ของ barber-queue
- reviewer 2 ชุดตรวจโค้ด server (`src/server/`, migration, dto) และ Angular (`src/app/`) เทียบกับ AGENTS.md / ARCHITECTURE.md / DESIGN.md
- ยืนยันข้อสำคัญบนดิสก์เอง: `npm test` ผ่าน 33/33 (ปัญหา "Access is denied" ใน log เป็นเรื่อง sandbox ของ agent ไม่ใช่ script)
- คุยกับเจ้าของ template ทีละข้อเมื่อ 2026-09-07 — ข้อที่ตัดออก: B2, B3, B4, B5 (ต้องแก้โค้ด/ยังไม่ตัดสินแนวทาง), B10, B14, B15 (สิ่งแวดล้อม/เครื่องมือ ไม่ใช่เอกสาร) เลขในวงเล็บท้ายหัวข้อคือเลขเดิมของฉบับแรก

---

## A. สิ่งที่ template ทำได้ดีแล้ว — คงไว้

- **โครง Task + `.sessions/` ใช้ได้จริง** — agent ทำครบ 10 Task โดยไม่หลุดกติกาใหญ่: RLS deny-all ทุกตาราง, business rule อยู่ใน Postgres function พร้อม advisory lock + partial unique index, zod ทุก route รวม query/`:id`, ไม่มี raw error หรือ secret column รั่ว, `process.env` อ่านที่ `env.ts` ที่เดียว
- **Auth แบบ signed stateless cookie** ที่ agent เขียนเองถูกต้อง: HMAC-SHA256, `timingSafeEqual`, `httpOnly` + `sameSite=lax` + `secure` ผ่าน `trust proxy`, มีวันหมดอายุ, logout ล้าง cookie
- **Task ฐานข้อมูลที่ให้ผู้ใช้วาง SQL block ทดสอบ function ใน SQL Editor** จับกติกาได้ก่อนมี UI — คงไว้
- **guard + interceptor + `returnUrl`** ทำงานถูกต้องบน SSR (guard เรียก `/api/auth/me` ไม่วน loop, interceptor คืน `next(req)` ตอนมี `REQUEST`)
- **spec ที่ inject `now`** ทดสอบ slot overlap และกติกาเวลาเป็น pure function ตามที่ AGENTS ต้องการ

---

## B. รายการแก้เอกสาร (เรียงตามลำดับที่ควรทำ)

### ข้อ 1. กติกา rate limit สำหรับ endpoint สาธารณะที่เขียนข้อมูล (B1)

**ปัญหาที่เจอ** — `docs/EXTENSION_POINTS.md` แถว "login / หลายบทบาท" ช่องหมายเหตุยาวมาก มี rate limit ซ่อนอยู่กลางประโยคว่า "จำกัดความพยายาม login (เช่น 10 ครั้ง/15 นาที ต่ออีเมล — เก็บใน `Map` ...)" คำว่า "เช่น" ทำให้ agent อ่านเป็นคำแนะนำแล้วข้าม ผลใน barber-queue: `POST /api/auth/login` (รหัสผ่านร้านรหัสเดียว) ไม่มี rate limit → brute-force ได้; `POST /api/bookings` เป็น endpoint สาธารณะที่เขียนข้อมูล → สคริปต์ยิงจองเต็มทุกช่องทั้ง 7 วันได้ ซึ่งแถว login ไม่ครอบคลุมอยู่แล้ว

**ข้อตัดสิน** — รอบนี้เขียน**กติกา**ลงเอกสาร agent เขียน helper เองต่อโปรเจกต์; helper กลาง `src/server/rate-limit.ts` ที่มากับ template (เหมือน `api-error.ts`) **รอรอบโค้ด** และเอกสารรอบนี้ต้องไม่อ้างไฟล์ที่ยังไม่มีใน template

**แก้ที่**

1. `AGENTS.md` → API Layer เพิ่ม bullet ใหม่ (วางถัดจาก bullet "Authentication and authorization ... are enforced in `src/server/` middleware"):

   > - Every endpoint that can be called **without login and writes data** (login, sign-up, public booking, contact forms) is rate-limited per IP and answers `429 { error: 'ลองใหม่ภายหลัง' }` when the limit is hit. The numbers are a SPEC 2.4 decision; defaults when the SPEC is silent: login 10 requests / 15 minutes, other public writes 30 requests / 15 minutes. An in-memory `Map` keyed by `req.ip` inside the process is enough — no table. Put the helper in `src/server/rate-limit.ts` and apply it as route-level middleware so the counter never sits inside a service.

   (status 429 มีในตาราง status อยู่แล้ว ไม่ต้องเพิ่ม)

2. `docs/EXTENSION_POINTS.md` — เพิ่ม**แถวใหม่**ในตาราง (วางถัดจากแถว login) และตัดประโยค rate limit ออกจากช่องหมายเหตุของแถว login เหลือแค่ "login ใช้แถว rate limit ด้วยเสมอ":

   | ความต้องการ                                                  | วางที่                                                                                                          | หมายเหตุ                                                                                                                                                                              |
   | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
   | endpoint สาธารณะที่เขียนข้อมูล (login, สมัคร, จอง, ส่งฟอร์ม) | `src/server/rate-limit.ts` (agent เขียนเองในโปรเจกต์ จนกว่า template จะส่งมาให้) ใช้เป็น middleware ระดับ route | จำกัดต่อ IP ตอบ `429 { error: 'ลองใหม่ภายหลัง' }`; ตัวเลขระบุใน SPEC 2.4 (ค่าเริ่มต้นและรูปแบบใน `AGENTS.md` → API Layer); ตัวนับเก็บใน `Map` ในหน่วยความจำของ process ไม่ต้องมีตาราง |

3. `.claude/skills/system-spec-builder/references/interview-guide.md` ข้อ 3 "คลังคำถามตามหัวข้อ" เพิ่มคำถาม: "มีหน้าไหนที่คนทั่วไปกดส่งข้อมูลได้โดยไม่ล็อกอินไหม (จอง สมัคร ส่งฟอร์ม) → ควรจำกัดกี่ครั้งต่อกี่นาทีต่อเครื่อง ถ้าผู้ใช้ไม่รู้ ใช้ค่าเริ่มต้นใน AGENTS แล้วบอกผู้ใช้"
4. `.claude/skills/system-spec-builder/templates/SYSTEM_SPEC.md` 2.4 เพิ่มบรรทัดตัวอย่าง: `- [rate limit ของ endpoint สาธารณะ: login N ครั้ง/M นาที, จอง N ครั้ง/M นาที ต่อ IP — ตามคำถาม interview; ถ้าไม่มี endpoint สาธารณะที่เขียนข้อมูล เขียนว่า "ไม่มี"]`

**รอรอบโค้ด** — สร้าง `src/server/rate-limit.ts` (`rateLimit({ windowMs, max })` คืน Express middleware) แล้วค่อยเพิ่มใน `docs/ARCHITECTURE.md` ข้อ 3 รายการไฟล์ที่มากับ template และเปลี่ยนข้อความ "agent เขียนเอง" ในแถว EXTENSION_POINTS

---

### ข้อ 2. ชื่อไฟล์ auth ชุดเดียว ชื่อกลาง ไม่ใส่บทบาทนำหน้า (B12)

**ปัญหาที่เจอ** — ชื่อไม่ตรงกัน 3 แหล่ง:

| แหล่ง                                                               | ชื่อที่ใช้                                                                                                                                                                                 |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `docs/EXTENSION_POINTS.md` แถว login + `docs/ARCHITECTURE.md` ข้อ 5 | `src/server/auth.middleware.ts` (`requireAuth`, `requireRole`, `requireAdmin`) + `src/app/core/auth.guard.ts`                                                                              |
| SPEC 2.3 ของ barber-queue ที่ skill เขียนให้                        | feature `admin-auth/`, `admin-auth.routes.ts`, `admin-auth-server.service.ts` (ทั้งที่ไม่มีตารางผู้ใช้), `admin-auth.middleware.ts`, `admin-auth.guard.ts`, `admin-auth-client.service.ts` |
| โค้ดจริงของ barber-queue                                            | `src/server/admin-auth.ts` (helper ตรวจรหัส/สร้าง-ตรวจ cookie ไม่แตะ DB), `admin-auth.middleware.ts` export `adminAuthMiddleware`; ไม่มี `-server.service`                                 |

ต้นเหตุ: (1) ตาราง 2.3 ใน `templates/SYSTEM_SPEC.md` มีแต่แถว "ฟีเจอร์ = resource" login ไม่ใช่ resource skill จึงคิดชื่อเอง (2) EXTENSION_POINTS สมมติว่ามีตารางผู้ใช้เสมอ (bcrypt, `user_id`) แบบ "รหัสผ่านเดียว ไม่มีตารางผู้ใช้" ไม่มีที่วาง helper ที่ไม่แตะ DB เพราะ `services/` สงวนให้ไฟล์ที่เรียก Supabase (3) ไม่มีกติกาเรื่องคำนำหน้าบทบาท

**ข้อตัดสิน** — ชุดชื่อเดียวใช้ทุกโปรเจกต์ ไม่ใส่บทบาทนำหน้า (บทบาทอยู่ใน session + `requireRole` ไม่ใช่ในชื่อไฟล์); รูปแบบเข้าสู่ระบบ (รหัสเดียว / ผู้ใช้+รหัสผ่าน / OTP / ลิงก์อีเมล / OAuth) เป็นเรื่องของ SPEC แต่ละโปรเจกต์ **ไม่ใส่ตารางรูปแบบลงเอกสาร template**; ทางแยกเดียวที่เอกสารบอกคือ "มีตารางผู้ใช้หรือไม่"; กติกาชื่อ `<audience>-auth.*` สำหรับ session แยกกันจริง **ไม่ใส่** (หายาก ค่อยเพิ่มเมื่อเจอ)

**ชุดชื่อ**

| ฝั่ง    | ไฟล์                                                       | หน้าที่                                                      |
| ------- | ---------------------------------------------------------- | ------------------------------------------------------------ |
| server  | `src/server/auth.ts`                                       | ตรวจรหัส/สร้าง-ตรวจ session cookie — ไม่แตะ DB               |
| server  | `src/server/auth.middleware.ts`                            | `requireAuth`, `requireRole(...roles)`                       |
| server  | `src/server/routes/auth.routes.ts`                         | `/api/auth/*` (login, me, logout และวิธีอื่นของโปรเจกต์)     |
| server  | `src/server/services/auth-server.service.ts`               | **เฉพาะเมื่อมีตารางผู้ใช้** — ไฟล์เดียวที่แตะ DB เรื่อง auth |
| browser | `src/app/core/auth.guard.ts`                               | guard (UX เท่านั้น สิทธิ์จริงอยู่ที่ middleware)             |
| browser | `src/app/features/auth/pages/login.page.ts` + `.page.html` | หน้า login — path เป็นของโปรเจกต์ (SPEC 2.3)                 |
| browser | `src/app/features/auth/auth-client.service.ts`             | เรียก `/api/auth/*`                                          |
| shared  | `src/shared/dto/auth.dto.ts`                               | zod ของ request/response                                     |

**แก้ที่**

1. `docs/EXTENSION_POINTS.md` แถว "login / หลายบทบาท" เขียนใหม่ให้เหลือ 4 ประโยค (ย้าย rate limit ไปแถวใหม่ตามข้อ 1; bcrypt cost 10–12, cookie `httpOnly`+`sameSite=lax`+`secure`, `ssr-cookie.interceptor.ts` และ `trust proxy` มากับ template คงไว้แต่ย่อ):

   > **วางที่**: `src/server/auth.ts` (ตรวจรหัส/สร้าง-ตรวจ cookie ไม่แตะ DB) · `auth.middleware.ts` (`requireAuth`, `requireRole(...roles)`) · `routes/auth.routes.ts` · `src/app/core/auth.guard.ts` · feature `auth/` (`pages/login.page.ts`, `auth-client.service.ts`) · `dto/auth.dto.ts`
   > **หมายเหตุ**: มีตารางผู้ใช้ → เพิ่ม `services/auth-server.service.ts` เป็นไฟล์เดียวที่แตะ DB (รหัสผ่าน bcrypt cost 10–12); ต้องส่ง OTP/ลิงก์ → ใช้แถว "ส่ง LINE / อีเมล / SMS"; วิธีเข้าสู่ระบบและวิธีเก็บ session (cookie `httpOnly` + `sameSite=lax` + `secure`) ระบุใน SPEC 2.4; ใช้แถว "endpoint สาธารณะที่เขียนข้อมูล" กับ login เสมอ; guard เป็นแค่ UX สิทธิ์จริงตัดสินที่ middleware "เจ้าของแถวเท่านั้น" ตรวจใน service; `ssr-cookie.interceptor.ts` และ `trust proxy` มากับ template แล้ว

2. `docs/ARCHITECTURE.md` ข้อ 5 ตาราง "การตั้งชื่อไฟล์" — แถว helper เพิ่มตัวอย่าง `auth.ts` ในช่อง `src/server/<name>.ts` (server เท่านั้น) ให้เห็นว่า helper ที่ไม่แตะ DB ไม่อยู่ใน `services/`
3. `.claude/skills/system-spec-builder/templates/SYSTEM_SPEC.md` 2.3 เพิ่มแถวตายตัวใต้ตาราง F1 (skill คัดลอกไม่ต้องคิดชื่อเอง):

   ```markdown
   | login (ถ้ามี) | `auth/` หน้า `[path ของหน้า login]` (`pages/login.page.ts`) | `/api/auth/login`, `/api/auth/me`, `/api/auth/logout` [+ วิธีอื่นของระบบนี้] | `auth.routes.ts` [+ `auth-server.service.ts` เมื่อมีตารางผู้ใช้] + `auth.middleware.ts`, `src/app/core/auth.guard.ts` (ชื่อชุดเดียวตาม `docs/EXTENSION_POINTS.md` แถว login ห้ามเปลี่ยน) | `auth.dto.ts` |
   ```

4. `templates/SYSTEM_SPEC.md` 1.2 ผู้ใช้ — ถัดจากบรรทัด `- บทบาท: [ ] (เช่น 1 บทบาท ไม่มี login)` เพิ่มบรรทัด `- เข้าสู่ระบบ: [ไม่มี / รหัสผ่านเดียวของร้าน (ไม่มีตารางผู้ใช้) / ชื่อผู้ใช้+รหัสผ่าน / OTP ทาง ... — ตามคำตอบ interview]`
5. `references/interview-guide.md` ข้อ 3 เพิ่มคำถาม: "ถ้ามี login: เข้าแบบไหน (รหัสเดียวของร้าน / แต่ละคนมีบัญชี / OTP) → ตัดสินว่ามีตารางผู้ใช้หรือไม่"

---

### ข้อ 3. กติกาหน้า login แบบไม่ผูก path (B16 ส่วน login)

**ปัญหาที่เจอ** — (1) `auth.interceptor.ts` ของ barber-queue redirect เมื่อได้ 401 โดยไม่พก `returnUrl` ผู้ใช้ล็อกอินแล้วไม่กลับหน้าเดิม ทั้งที่ guard ทำ (2) หน้า login ไม่ redirect ออกเมื่อล็อกอินอยู่แล้ว และ `returnUrl` ที่ชี้กลับหน้า login เองทำให้วน (3) `AGENTS.md` → API Layer ย่อหน้า `auth.interceptor.ts` เขียนว่า "redirects to `/login`" เป็น path ตายตัว ทั้งที่แต่ละโปรเจกต์ตั้ง path เอง

**แก้ที่**

1. `AGENTS.md` → API Layer ย่อหน้า "A project with login adds `src/app/core/auth.interceptor.ts` that redirects to `/login` on a `401` ..." เปลี่ยน `/login` เป็น "the project's login page (path per SPEC 2.3)" และต่อท้ายย่อหน้าว่า: "The redirect carries `returnUrl` (the current URL) exactly like the guard; the login page redirects an already-authenticated user to the project's post-login home, and ignores a `returnUrl` that points back to the login page itself."
2. `docs/EXTENSION_POINTS.md` แถว login (ที่เขียนใหม่ในข้อ 2) เพิ่มท้ายหมายเหตุ 1 ประโยค: "401 จาก interceptor และ guard ทั้งคู่ redirect ไปหน้า login พร้อม `returnUrl`; หน้า login redirect ไปหน้าหลักหลังล็อกอินเมื่อล็อกอินอยู่แล้ว (กติกาใน AGENTS → API Layer)"

---

### ข้อ 4. ชี้ขาด response type ใน dto (B9)

**ปัญหาที่เจอ** — `AGENTS.md` บอกทั้ง "Declare request/response schemas in `src/shared/dto/<feature>.dto.ts` as `zod` schemas ... never write a separate interface for the same shape" และ (Supabase section) "derive row types with `Tables<'table_name'>`" → agent ใน barber-queue เขียน 3 แบบซ้อนกับ `Tables<>`:

```ts
// barbers.dto.ts — แบบที่ 1: intersection มือ
export type Barber = z.infer<typeof createBarberSchema> & {
  id: string;
  updated_at: string;
  created_at: string;
};
// shop-settings.dto.ts — แบบที่ 2: object type เขียนมือทั้งก้อน
export type ShopSettings = { id: string; open_time: string /* ... */ };
// bookings.dto.ts — แบบที่ 3: zod schema ของแถวตารางทั้งแถว
export const bookingSchema = z.object({ id: z.string().uuid() /* ทุกคอลัมน์ */ });
export type Booking = z.infer<typeof bookingSchema>;
```

ทั้ง 3 แบบหลุดจาก `database.types.ts` ทันทีที่ migration เพิ่มคอลัมน์

**แก้ที่** — `AGENTS.md` → API Layer แทนที่ bullet "Declare request/response schemas ..." ด้วย:

> - `src/shared/dto/<feature>.dto.ts` holds three kinds of types, nothing else: (1) **request** body/query = zod schema + `z.infer` (never a separate interface for the same shape); (2) **response that is a table row** = re-export of the generated type, `export type Barber = Tables<'barbers'>` — never a zod schema or hand-written object type for a row; an endpoint that selects a subset uses `Pick<Tables<'barbers'>, 'id' | 'nickname'>` so the type matches the `.select()` exactly; (3) **response that is computed** (not a row of any table, e.g. a list of free time slots) = zod schema + `z.infer`. `zod` is plain TypeScript, so it is allowed in `src/shared/` and may be reused by browser-side forms.

ตัวอย่างที่ถูกต้องใส่ต่อท้าย bullet (หรือใน `references/patterns.md` ของ skill ถ้ามีหัวข้อ dto):

```ts
// src/shared/dto/barbers.dto.ts — what the barbers API sends and receives
import { z } from 'zod';
import type { Tables } from '../types/database.types';

export const createBarberSchema = z.object({ nickname: z.string().trim().min(1).max(50) });
export type CreateBarber = z.infer<typeof createBarberSchema>; // (1) request
export type Barber = Tables<'barbers'>; // (2) full row
export type PublicBarber = Pick<Tables<'barbers'>, 'id' | 'nickname'>; // (2) subset for a public endpoint
export const bookingSlotSchema = z.object({
  start_time: z.string(),
  end_time: z.string(),
  free_barbers: z.number(),
});
export type BookingSlot = z.infer<typeof bookingSlotSchema>; // (3) computed shape
```

`templates/SYSTEM_SPEC.md` 2.2 ย่อหน้า "รูปแบบ request/response" มีประโยค "ทุก endpoint ตอบ JSON เป็นแถวตาม `Tables<'[table]'>`" อยู่แล้ว — เติมว่า "(dto re-export type นั้น ไม่เขียน zod ซ้ำ — AGENTS → API Layer)"

---

### ข้อ 5. หน้าที่มี route แยก template เป็น `.page.html` เสมอ (B6)

**ปัญหาที่เจอ** — barber-queue มีหน้า routed 2 หน้ายาว 644 และ 491 บรรทัด (เกินกติกา 400 ที่ต้องแยก) เพราะ HTML อยู่ใน `.ts`; ประโยค "Prefer inline templates for small components" มาจาก Angular best practices (MCP `get_best_practices` ของ Angular CLI และ skill `angular-developer` → `references/components.md` พูดเหมือนกัน) แต่ไม่มีใครนิยาม small → agent ถือว่าทุกหน้า small; ไม่มีอะไรตรวจตอน finish step

**ข้อตัดสิน** — **ไม่ลบ**ประโยค inline ออกจาก AGENTS (จะไม่ตรงกับ MCP/skill และ agent ยังได้ประโยคนั้นจากแหล่งอื่นอยู่ดี) แต่ตัดสินด้วย**ชนิดไฟล์** ตั้งแต่ตอนสร้าง ไม่ใช่นับบรรทัดหลังเขียน: หน้าที่มี route แยกไฟล์เสมอ, component ย่อย inline ได้; ไม่มีเพดานบรรทัดใหม่ ใช้กติกา 300/400 เดิมคุมทั้ง `.ts` และ `.html`

**แก้ที่**

1. `AGENTS.md` → Components บรรทัด "Prefer inline templates for small components" ต่อท้ายว่า: "— here _small_ means a child component in `components/` or `src/app/ui/`. A routed page (`*.page.ts`) always uses `templateUrl: './<name>.page.html'` from the moment it is created; do not wait for it to grow."
2. `AGENTS.md` → Working Rules ข้อ File size เพิ่มประโยค: "`.page.html` counts as a hand-written file too — above 400 lines, move self-contained blocks (a dialog, a table, a summary card) into `components/` of that feature."
3. `docs/ARCHITECTURE.md` ข้อ 3 บรรทัด `pages/<name>.page.ts` เปลี่ยนเป็น `pages/<name>.page.ts + <name>.page.html   หน้าจอที่มี route (template แยกไฟล์เสมอ)` และข้อ 5 ตาราง เพิ่มแถว `template ของหน้า | <name>.page.html ข้าง .page.ts | booking-form.page.html`
4. `.claude/skills/system-spec-builder/templates/TASKS.md` Task 4 บรรทัด "ทำ:" ที่เขียน `หน้า [path] ใน src/app/features/[name]/` เปลี่ยนเป็น `หน้า [path] ใน src/app/features/[name]/pages/[name].page.ts + [name].page.html`
5. `templates/SYSTEM_SPEC.md` 2.3 ช่อง "feature folder + หน้า" ตัวอย่าง `([name].page.ts)` เปลี่ยนเป็น `([name].page.ts + .page.html)`
6. `AGENTS.md` → Appendix ใต้ `angular-developer` เพิ่ม: "`references/components.md` prefers inline templates for small templates — here every routed page uses `templateUrl` (Components section)."

ตัวอย่างที่ต้องการเห็น:

```ts
// src/app/features/bookings/pages/booking-form.page.ts — routed page: template lives next to it
@Component({
  selector: 'app-booking-form-page',
  imports: [ReactiveFormsModule, StatusBadgeComponent],
  templateUrl: './booking-form.page.html',
})
export class BookingFormPage {
  /* signals + handlers only */
}
```

**รอรอบโค้ด** — script `check:size` ใน package.json (นับบรรทัดไฟล์ที่เขียนมือใต้ `src/` ยกเว้น `*.spec.ts`, `database.types.ts`) แล้วให้ finish step เป็น `npm run format` → `npm run check:size` → `npm test`

---

### ข้อ 6. `.order()` รวม query ภายใน service ด้วย (B16 ส่วน `.order()`)

**ปัญหาที่เจอ** — `AGENTS.md` เขียน "Every list query calls `.order()` explicitly" agent ตีความว่าเฉพาะ endpoint ที่คืนรายการ query ภายใน service ที่ดึงหลายแถวมาคำนวณจึงไม่มี `.order()` ตัวอย่างจริงใน `bookings-server.service.ts` ของ barber-queue:

```ts
db.from('bookings')
  .select('barber_id,start_time,end_time')
  .eq('booking_date', date)
  .neq('status', 'cancelled'); // ไม่มี .order() — ผลลัพธ์ที่คำนวณต่ออาจต่างกันแต่ละครั้ง
```

**แก้ที่** — `AGENTS.md` → API Layer bullet "Every list query calls `.order()` explicitly — Postgres returns rows in no guaranteed order." เปลี่ยนเป็น "Every query that can return more than one row calls `.order()` explicitly — including internal queries inside a service whose rows are only used for a calculation — because Postgres returns rows in no guaranteed order and an unordered input makes the result non-deterministic." และ `docs/ARCHITECTURE.md` ข้อ 6 บรรทัด "ทุก query ที่คืนรายการต้องมี `.order()` เสมอ" เติม "(รวม query ภายใน service ที่ดึงมาคำนวณ)"

---

### ข้อ 7. กติกา "server ต้องตรวจซ้ำตัวเลือกที่ UI คำนวณให้" (B11)

**ปัญหาที่เจอ** — ใน barber-queue หน้าลูกค้าคำนวณรายการช่องเวลาว่างจาก `open_time`/`close_time`/`slot_duration_min` แล้วให้เลือก `create_booking()` ตรวจแค่ว่า `start_time` เป็น `HH:mm` และไม่ชนคิวอื่น แต่ไม่ตรวจว่าอยู่ในเวลาเปิด-ปิดหรือตรง grid → ส่ง `start_time: "03:07"` ผ่าน API ตรงๆ ได้; SPEC ไม่มีกติกานี้เพราะตอน interview มองว่า UI เป็นคนคำนวณรายการอยู่แล้ว จึงไม่มี R ให้ server ตรวจ

**แก้ที่**

1. `references/interview-guide.md` ข้อ 3 เพิ่มคำถามบังคับ: "ช่องกรอกไหนที่ระบบคำนวณตัวเลือกให้ (ช่องเวลา, ราคา, คนที่ว่าง, จำนวนคงเหลือ)? → ทุกช่องแบบนี้ต้องมี R ที่ให้ server/DB ตรวจซ้ำว่าค่าที่ส่งมาอยู่ในรายการที่คำนวณได้จริง ไม่ใช่ตรวจแค่รูปแบบ — เขียน R นั้นลง 1.7"
2. `templates/SYSTEM_SPEC.md` ส่วน 1.7 (กติกาธุรกิจ) เพิ่มบรรทัดเตือนใต้หัวข้อ: `[ทุกค่าที่ UI คำนวณให้เลือก (ช่องเวลา ราคา ตัวเลือกที่ว่าง) ต้องมี R ให้ server/DB ตรวจซ้ำ — ตัวอย่าง: "R[n]: server ปฏิเสธ start_time ที่อยู่นอกเวลาเปิด-ปิดหรือไม่ตรงรอบ slot_duration_min แม้ UI จะไม่แสดงให้เลือก"]`
3. `templates/TASKS.md` Task ฐานข้อมูล บรรทัด "ทดสอบ:" ที่ให้ผู้ใช้วาง SQL block เติม "(รวมกรณีส่งค่าที่ UI ไม่มีให้เลือก เช่น เวลานอกเวลาเปิด)"

ตัวอย่าง SQL ที่ R แบบนี้บังคับใน function (ให้ agent เห็นว่าเป็นกติกาใน DB ไม่ใช่ใน route):

```sql
if p_start_time < v_open_time or p_start_time + make_interval(mins => v_duration_min) > v_close_time then
  raise exception 'ช่วงเวลานี้อยู่นอกเวลาเปิดให้บริการ';
end if;
if extract(epoch from (p_start_time - v_open_time))::int % (v_slot_min * 60) <> 0 then
  raise exception 'เวลาเริ่มไม่ตรงรอบเวลาของร้าน';
end if;
```

---

### ข้อ 8. Task Design: pattern เขียนด้วย token + สร้าง shared UI ทันที + dialog + selected card (B7 + B16 ส่วน a11y)

**ปัญหาที่เจอ**

- `docs/DESIGN.md` ของ barber-queue ประกาศ `@theme` token ครบ (`--color-primary: #f59e0b`, `--color-bg-card: #1e293b`, ...) แต่ pattern ในข้อ 3 เขียนด้วยชื่อสี Tailwind ตรง เช่น ปุ่มหลัก `bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 ... focus-visible:ring-amber-400` → token แทบไม่มีใครใช้ เปลี่ยนสีทีหลังต้องไล่แก้ทุกหน้า
- DESIGN.md ระบุ class ของ badge/alert/button แต่ไม่บอกให้ทำเป็น component → markup alert ซ้ำ 5 หน้า, dialog ซ้ำ 3 หน้า (ไม่มี focus trap/Escape/`aria-modal`), badge สถานะพิมพ์ซ้ำ ทั้งที่ `templates/DESIGN.md` ข้อ 3 เขียนว่า "pattern ที่ใช้ซ้ำ 2+ feature ให้ทำเป็น component ใน `src/app/ui/`" — ไม่มี Task ไหนสั่งให้ทำ
- `templates/DESIGN.md` ไม่มี pattern สำหรับ dialog กลางจอ (ข้อ "กล่องยืนยัน" เปิดกว้าง) และไม่มี pattern "ตัวเลือกที่ถูกเลือก" → การ์ด/ปุ่ม slot สื่อสถานะเลือกด้วยสีอย่างเดียว ไม่มี `aria-pressed`/ไอคอน (ขัด Accessibility Requirements "state is not conveyed by color alone")

**แก้ที่**

1. `.claude/skills/system-spec-builder/templates/DESIGN.md` ข้อ 3 ย่อหน้าเปิด เติมประโยค: "class ทุกตัวในข้อนี้ต้องอ้าง token จากข้อ 2 (`bg-primary`, `text-on-primary`, `bg-card`, `border-line`, `text-danger`) ไม่ใช้ชื่อสี Tailwind ตรง (`bg-amber-500`) — Tailwind 4 สร้าง class จากชื่อ `--color-*` ใน `@theme` ให้อัตโนมัติ" และแก้ตัวอย่าง `[class เต็ม]` ในทุก pattern ให้เป็นรูปแบบ token:

   ```text
   ก่อน: bg-amber-500 hover:bg-amber-400 text-slate-950 focus-visible:ring-amber-400
   หลัง: bg-primary hover:bg-primary-hover text-on-primary focus-visible:ring-primary-hover
   ```

   ข้อ 2 (tokens) เพิ่มแถวบังคับขั้นต่ำที่ทุกโปรเจกต์ต้องมี เพื่อให้ pattern อ้างได้: `--color-primary`, `--color-primary-hover`, `--color-on-primary`, `--color-bg`, `--color-bg-card`, `--color-text`, `--color-text-muted`, `--color-line`, `--color-danger`, `--color-success`, `--color-warning` (ค่าตาม mockup)

2. `templates/DESIGN.md` ข้อ 3 เพิ่ม 2 pattern:

   - **Modal / Dialog**: `<dialog>` native หรือ `role="dialog" aria-modal="true" aria-labelledby`; เปิดแล้ว focus ไปที่ heading หรือปุ่มแรก; ปิดด้วย Escape และปุ่มปิดที่มี `aria-label`; ปิดแล้วคืน focus ให้ปุ่มที่เปิด; เนื้อหาหลังฉากใส่ `inert`; class ของฉากหลัง/กล่อง `[class]`
   - **Selected Option Card** (การ์ด/ปุ่มตัวเลือก เช่น บริการ ช่องเวลา ช่าง): เป็น `<button type="button">` เสมอ ใส่ `[attr.aria-pressed]="selected()"` และสถานะเลือกต้องมีไอคอน `check_circle` หรือข้อความ "เลือกแล้ว" ประกอบสี ไม่ใช่สีอย่างเดียว; class ปกติ/เลือก `[class]` / `[class]`

     ```html
     <button
       type="button"
       [attr.aria-pressed]="isSelected()"
       class="rounded-xl border border-line bg-card p-4 text-left aria-pressed:border-primary aria-pressed:bg-primary/10"
     >
       <span class="material-symbols-outlined" aria-hidden="true"
         >{{ isSelected() ? 'check_circle' : 'radio_button_unchecked' }}</span
       >
       ตัดผมชาย · 30 นาที
     </button>
     ```

3. `templates/TASKS.md` Task 2 (Design UX/UI) บรรทัด "ทำ:" ต่อท้าย "→ ลง token ใน `@theme` ของ `src/styles.css` + โหลดฟอนต์/ไอคอนใน `src/index.html`" ด้วย: "→ สร้าง component พื้นฐานใน `src/app/ui/` ตาม pattern ใน DESIGN.md ให้เสร็จใน Task นี้: `alert.component.ts` (role=alert รับ `message` + `kind`), `status-badge.component.ts` (รับค่า enum คืนป้ายไทย+สี), `dialog.component.ts` (Modal pattern: focus trap, Escape, `aria-modal`, คืน focus), `empty-state.component.ts` — Task ฟีเจอร์ห้ามเขียน markup เหล่านี้ซ้ำ" และบรรทัด "ทดสอบ:" เพิ่ม "component ทั้ง 4 แสดงในหน้าแรกชั่วคราวหรือ mockup แล้วผู้ใช้เห็นตรงกับ DESIGN.md; ปุ่มหลักในระบบมี class `bg-primary` ไม่มี `bg-amber-*`/`bg-blue-*` ตรงๆ"

---

### ข้อ 9. Task ฟีเจอร์ต้องอ้าง mockup รายหน้า + shell ร่วมสร้างทันที (B8)

**ปัญหาที่เจอ** — barber-queue Task ฟีเจอร์ 3 Task มีหัวข้อ "ปรับ UI หลังปิด Task" ใน session log เพราะรอบแรกไม่ตรง mockup (ลำดับ element, ระยะ, ปุ่มที่หาย); shell หลังบ้าน (header + เมนู) ที่ 4 หน้าใช้ร่วมกันถูกเขียนซ้ำในแต่ละหน้าแล้วค่อยแยกเป็น `src/app/ui/` ทีหลัง

**แก้ที่** — `templates/TASKS.md` Task 4 (และทุก Task ฟีเจอร์ที่คัดลอกจากมัน):

- บรรทัด "ทำ:" ขึ้นต้นด้วย "เปิด `docs/design/mockup.html` ส่วนของหน้า `[path]` ก่อน แล้วทำโครง/ลำดับ element/ข้อความปุ่มให้ตรง (mockup คือ spec ของหน้าตา ไม่ใช่แค่แรงบันดาลใจ);" และเพิ่มท้ายบรรทัด "ถ้า DESIGN.md ข้อ 4 ระบุ shell/nav ที่ใช้ 2+ หน้า และยังไม่มีใน `src/app/ui/` ให้สร้างใน Task นี้ทันที (`<name>-shell.component.ts`) ไม่เขียนซ้ำในหน้า"
- บรรทัด "ทดสอบ:" เพิ่ม "เปิดหน้าจริงกับ mockup ข้างกันที่ 375px: ลำดับ element, ข้อความปุ่ม, สถานะ empty/error ตรงกัน"

---

### ข้อ 10. ถามเรื่อง seed data ตอน interview (B16 ส่วน seed)

**ปัญหาที่เจอ** — migration ของ barber-queue ใส่ข้อมูลตัวอย่าง (ช่าง 2 คน บริการ 2 รายการ) โดย SPEC 1.9 ไม่ได้ระบุ agent ตัดสินเองว่าควรมี; ARCHITECTURE ข้อ 6 กำหนดว่าข้อมูลตัวอย่างใส่ได้เฉพาะเมื่อ SPEC 1.9 ระบุ และต้องลบผ่านหน้าจอได้ — skill ไม่เคยถามผู้ใช้ 1.9 จึงว่างเสมอ

**พบเพิ่มตอนตรวจ template** — หัวข้อ 1.9 ใน `templates/SYSTEM_SPEC.md` ชื่อว่า "สมมติฐาน (ผู้ใช้ยังไม่ได้ยืนยัน แก้ได้ภายหลัง)" มีแค่ `- [ ]` แต่ `templates/TASKS.md` Task 2 อ้าง "1.9 (โทนที่ผู้ใช้บอกไว้)" และ Task ฐานข้อมูลอ้าง "ข้อมูลตัวอย่างตาม SPEC 1.9" และ ARCHITECTURE ข้อ 6 อ้าง "SPEC 1.9 ระบุ" — 3 ที่ชี้ไปหัวข้อที่ไม่มีช่องให้กรอกเรื่องนั้น นี่คือสาเหตุตรงที่ 1.9 ว่างเสมอ

**แก้ที่**

1. `templates/SYSTEM_SPEC.md` 1.9 เปลี่ยนหัวข้อเป็น `### 1.9 สมมติฐาน, โทน และข้อมูลเริ่มต้น` แล้วใส่บรรทัดตายตัว 4 บรรทัด (แก้ที่เดียว ไม่ต้องไล่แก้ TASKS/ARCHITECTURE ที่อ้าง 1.9 อยู่แล้ว):

   ```markdown
   - สมมติฐานที่ผู้ใช้ยังไม่ได้ยืนยัน (แก้ได้ภายหลัง): [ ]
   - โทน/สไตล์ที่ผู้ใช้บอกไว้ (Task Design ใช้): [ ]
   - ข้อมูลเริ่มต้นที่ต้องมีจริง (ผู้ดูแลคนแรก, รายการประเภท, ข้อมูลจาก Excel เดิม → ใส่ใน migration): [รายการ / ไม่มี]
   - ข้อมูลตัวอย่างเพื่อทดสอบ: [ไม่มี / รายการ + ลบผ่านหน้า ... ได้]
   ```

2. `references/interview-guide.md` ข้อ 3 เพิ่มคำถาม: "ข้อมูลเริ่มต้นที่ต้องมีจริงตั้งแต่วันแรก (ผู้ดูแลคนแรก, รายการประเภท, ข้อมูลจาก Excel เดิม) มีอะไรบ้าง? ต้องการข้อมูลตัวอย่างไว้ทดลองใช้ไหม ถ้ามี ใครลบ และลบผ่านหน้าจอได้ไหม?" — คำตอบลง 1.9

---

### ข้อ 11. Task ปิดงาน: README ใช้เส้นแบ่งใน template, version ตั้งใน Task 1 (B13)

**ปัญหาที่เจอ** — `templates/TASKS.md` Task ปิดงานบอกแค่ "เขียน README.md (...)" ไม่บอกว่าต้อง**ลบ**อะไร → README ของ barber-queue ยังมีหัวข้อของ template ทั้งหมด ("เริ่มใช้งานระบบใหม่" 4 หัวข้อย่อย: Clone template, เขียน spec ด้วย skill, สั่ง agent, รอบถัดไป และ "เอกสารของ template"); Task 1 ข้อ (3) แก้ `name` ใน package.json แต่ไม่แตะ `version` → ค้าง `1.11.0` ของ template ขณะระบบแสดง v1.0

**ข้อตัดสิน** — (1) README: ไม่เพิ่มไฟล์โครงใหม่ ไม่ระบุชื่อหัวข้อใน Task (ล้าสมัยเมื่อหัวข้อเปลี่ยน) แต่ใส่**เส้นแบ่ง**ใน README ของ template ให้ Task ปิดงานสั่งประโยคเดียว (2) version: ตั้ง `1.0.0` ใน Task 1 ที่เดียวกับที่แก้ `name` (เวอร์ชันของ template ยังมีบันทึกที่ SPEC 2.1)

**แก้ที่**

1. `README.md` ของ template — โครงหัวข้อปัจจุบัน: ภาพรวม → เริ่มใช้งานระบบใหม่ (template) → ตั้งค่าฐานข้อมูล → ปัญหาที่พบบ่อยตอนตั้งค่า → คำสั่งที่ใช้บ่อย → Deploy → เอกสารของ template (template) — ย้าย "เอกสารของ template" ขึ้นมาต่อท้าย "เริ่มใช้งานระบบใหม่" แล้วปิดท้ายส่วน template ด้วยบรรทัด:

   ```html
   <!-- ส่วนของ template จบตรงนี้ — Task ปิดงาน: ลบตั้งแต่หัวข้อ "เริ่มใช้งานระบบใหม่" ถึงบรรทัดนี้ แล้วเก็บส่วนล่างไว้ -->
   ```

   ส่วนล่าง (ตั้งค่าฐานข้อมูล, ปัญหาที่พบบ่อย, คำสั่งที่ใช้บ่อย, Deploy) เป็นของโปรเจกต์ คงไว้ และตรวจว่าไม่มีย่อหน้าไหนใต้เส้นอ้างถึง skill/clone

2. `templates/TASKS.md` Task ปิดงาน บรรทัด "ทำ:" เปลี่ยน "เขียน README.md (ฐานข้อมูลอยู่ที่ไหน ...)" เป็น "README.md: ลบส่วนของ template ตามเครื่องหมาย `<!-- ส่วนของ template จบตรงนี้ -->` ในไฟล์ แล้วเติมส่วนของโปรเจกต์ให้ครบ (ฐานข้อมูลอยู่ที่ไหนตาม SPEC 2.1 ... — รายการเดิมทั้งหมด)"; บรรทัด "ทดสอบ:" เพิ่ม "README ไม่เหลือคำว่า template / skill / clone และคนอื่นอ่านแล้วรันได้โดยไม่ต้องถาม"
3. `templates/TASKS.md` Task 1 ข้อ (3) "แก้ `name` ใน package.json" เปลี่ยนเป็น "แก้ `name` เป็น `[project-name]` และ `version` เป็น `1.0.0` ใน package.json"

---

## C. ดัชนี: ไฟล์ → ข้อที่แตะ (ใช้ตรวจว่าทำครบ)

| ไฟล์                                                               | ข้อ                |
| ------------------------------------------------------------------ | ------------------ |
| `AGENTS.md` → API Layer                                            | 1, 3, 4, 6         |
| `AGENTS.md` → Components / Working Rules / Appendix                | 5                  |
| `README.md`                                                        | 11                 |
| `docs/ARCHITECTURE.md` ข้อ 3, 5, 6                                 | 2, 5, 6            |
| `docs/EXTENSION_POINTS.md` แถว login + แถวใหม่ rate limit          | 1, 2, 3            |
| `.claude/skills/system-spec-builder/templates/SYSTEM_SPEC.md`      | 1, 2, 4, 5, 7, 10  |
| `.claude/skills/system-spec-builder/templates/TASKS.md`            | 5, 7, 8, 9, 11     |
| `.claude/skills/system-spec-builder/templates/DESIGN.md`           | 8                  |
| `.claude/skills/system-spec-builder/references/interview-guide.md` | 1, 2, 7, 10        |
| `.agents/skills/system-spec-builder/**` (สำเนา)                    | ทุกข้อที่แตะ skill |

รอรอบโค้ด (ไม่ทำในรอบนี้): `src/server/rate-limit.ts` (ข้อ 1), script `check:size` (ข้อ 5)
