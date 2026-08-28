# TASKS — ระบบยืม-คืนอุปกรณ์

> จาก `docs/SYSTEM_SPEC.md` v1.1 | ผ่านแล้ว 0/12 | Task ปัจจุบัน: 1 | อัปเดต: 2026-08-28

สถานะ: `[ ]` รอทำ · `[~]` กำลังทำ · `[x]` ผ่าน (บรรทัด "ผล:" ตาม Section 0 ข้อ 5) · `[!]` ติดปัญหา (เขียนเหตุผลในบรรทัด "ผล:")

กฎ: 1 Task = 1 หน้าจอ หรือ 1 resource API พร้อมหน้าที่ใช้มัน — ไม่ใหญ่กว่านี้; ลำดับ Task สลับได้ถ้าเขียนเหตุผลไว้ใต้บรรทัดนี้; ทุก Task ที่มีหน้าจอทำตาม `docs/DESIGN.md` (เกิดจาก Task 2); ทำทีละ Task ผ่านก่อนค่อยไปต่อ; เขียน spec เฉพาะไฟล์ที่มีการคำนวณ / logic ซับซ้อน / ต้องแก้บ่อย (ตาม AGENTS.md → Testing) — CRUD ธรรมดาไม่ต้องมี spec

---

### [ ] Task 1: ตั้งชื่อโปรเจกต์ + หน้าแรก

- ทำ: ตั้งชื่อ `borrow-return` (แก้ `name` ใน package.json, เปลี่ยน **key ของ project** ใน angular.json จาก `angular-supabase` เป็น `borrow-return` เพราะ `outputPath` ไม่ได้ตั้งไว้จึงเป็น `dist/<ชื่อ project>`, เปลี่ยน script `serve:ssr:angular-supabase` เป็น `serve:ssr:borrow-return` และ path `dist/borrow-return/...`, และ `project_id` ใน `supabase/config.toml`); หน้า `/` แสดงชื่อ "ระบบยืม-คืนอุปกรณ์" เฉยๆ (แก้ `title` ใน `src/app/app.ts`, ข้อความใน `src/app/app.html` ซึ่งเป็น placeholder ของ template และ `<title>` ใน `src/index.html`) — การเชื่อม Supabase (`.env`, login, link, `db:push` migration `health`) ทำไปแล้วตอน clone template ตาม README ไม่ใช่งานของ Task นี้; โครง server (`src/server/env.ts`, `supabase.ts`, `api.ts`, `routes/health.routes.ts`, `services/health-server.service.ts`), interceptor (`src/app/core/api-origin.interceptor.ts`) และ `provideHttpClient` ทั้งสองฝั่งมากับ template แล้ว ไม่ต้องสร้างใหม่
- ทดสอบ: `npm start` เปิด http://localhost:4200 เห็นชื่อระบบ; เปิด `/api/health` เห็น `{ ok: true }` (ถ้าได้ `ok: false` ให้ผู้ใช้กลับไปทำ README ข้อ 2 ให้ครบก่อน — ไม่ใช่ปัญหาของ Task นี้); `npm test` ผ่าน
- ผล: —

### [ ] Task 2: Design UX/UI

- ทำ: อ่าน SPEC 1.2 (พนักงานส่วนใหญ่ใช้มือถือ), 1.3, 1.6, 1.9 (โทนเรียบ สะอาด น้ำเงิน-เทา แบบระบบในองค์กร) → สร้าง mockup 5 หน้า (`/items` รายการของ+ค้นหา/กรอง, `/loans/new/:itemId` ฟอร์มขอยืม, `/loans` คำขอของฉัน+ป้ายสถานะ+"เกินกำหนด", `/admin/loans` อนุมัติ/ปฏิเสธ/รับคืน+ช่องเหตุผล+remark, `/admin/items` ตาราง+ฟอร์มจัดการของ — รวม shell/เมนูในทุกหน้า) เป็น HTML ไฟล์เดียว `docs/design/mockup.html` (มือถือ 375px เป็นหลัก, Tailwind Play CDN — ห้ามเพิ่ม path นี้เข้า `@source`) ใช้ฟอนต์ไทยจาก Google Fonts (เสนอ 2–3 ตัวเลือก เช่น `Noto Sans Thai` / `IBM Plex Sans Thai` / `Anuphan` ให้ผู้ใช้เลือก) และไอคอนจริงจาก Material Symbols — **ห้ามใช้ emoji เป็นไอคอน/ของตกแต่ง** → ให้ผู้ใช้เปิดดูแล้วติชม แก้จนพอใจ → สรุปเป็น `docs/DESIGN.md` ตามโครง `.claude/skills/system-spec-builder/templates/DESIGN.md` (โทน, design tokens, ฟอนต์+ไอคอน, component patterns รวมป้ายสถานะทั้ง 5 ค่าของ loans + 4 ค่า availability, layout) → ลง token ใน `@theme` ของ `src/styles.css` + โหลดฟอนต์/ไอคอนใน `src/index.html`
- ทดสอบ: ผู้ใช้เปิด `docs/design/mockup.html` แล้วยืนยันว่าหน้าตาตรงที่ต้องการ; ทุกคู่สีใน DESIGN.md ระบุ ratio และผ่าน WCAG AA; ไม่มี emoji ในหน้าจอ; `npm test` ผ่าน — Task นี้ผ่านแล้ว `docs/DESIGN.md` ถือว่า LOCKED (แก้ = bump เวอร์ชัน)
- ผล: —

### [ ] Task 3: ฐานข้อมูล

- ทำ: `npm run db:migration -- init` → เขียนไฟล์ที่ได้ใน `supabase/migrations/` (ต่อจาก `*_health.sql` ที่มากับ template — ห้ามแก้ไฟล์นั้น): เปิด extension `pgcrypto`; สร้าง `users`, `sessions`, `items`, `loans` ตาม SPEC 1.5 พร้อม `CHECK`/`UNIQUE`/FK ตาม R1, R3, R8, R9, R10, R11; สร้าง function `create_loan_request()` (R1–R3), `set_loan_status()` (R4, R5, R13), `update_item()` (R9); เปิด RLS ทุกตาราง; ข้อมูลเริ่มต้นตาม SPEC 1.9 — admin 1 คน (`password_hash = crypt('admin1234', gen_salt('bf'))` เพื่อไม่ต้องพึ่ง `bcryptjs` ตอน migration) + สิ่งของตัวอย่าง 3 รายการ (คนละประเภท, มีชิ้นเดียวบ้าง หลายชิ้นบ้าง); `npm run db:push` → `npm run db:types`; `src/shared/enums/auth.enums.ts`, `items.enums.ts`, `loans.enums.ts` ค่าตรงกับ `CHECK`; `/api/health` เพิ่ม `count` ของ `items` ต่อจากการเรียก `health()` เดิม → ตอบ `{ ok: true, count: N }`
- ทดสอบ: `npm run db:push` สำเร็จ; เปิด `/api/health` เห็น `count: 3`; เรียก `create_loan_request()` ด้วยจำนวนมากกว่าคงเหลือ / ของที่ `maintenance` / วันกำหนดคืนย้อนหลัง → ต้อง error ทั้ง 3 กรณี; เรียก `set_loan_status()` เปลี่ยน `returned` → `pending` และ `rejected` โดยไม่ใส่เหตุผล → ต้อง error; เรียก `update_item()` ลด `total_qty` ต่ำกว่าจำนวนที่ถูกยืมอยู่ (สร้างคำขอด้วย `create_loan_request()` ก่อน) → ต้อง error
- ผล: —

### [ ] Task 4: F1 API บัญชีผู้ใช้ + ตรวจสิทธิ์

- ทำ: ติดตั้ง `bcryptjs` + `cookie-parser` (mount `cookie-parser` ใน `src/server/api.ts`, `app.set('trust proxy', 1)` ใน `src/server.ts`); API `/api/auth/register`, `/login`, `/logout`, `/me`, `/change-password` (`src/server/routes/auth.routes.ts` + `auth-server.service.ts`, dto ใน `src/shared/dto/auth.dto.ts`) — token สุ่มเก็บ sha256 ใน `sessions`, cookie `httpOnly` + `sameSite=lax` + `secure` ตาม `req.secure`, login ลบ session ที่หมดอายุของผู้ใช้คนนั้นก่อน; middleware `requireAuth` / `requireAdmin` ใน `src/server/auth.middleware.ts` ตรวจ `expires_at` + `users.is_active` (R6, R8, R12)
- ทดสอบ: ยิง API ด้วย browser/curl — สมัครแล้วได้ cookie; อีเมลซ้ำ → 409 ข้อความไทย; รหัสผ่านผิด → 401; `/me` ไม่มี cookie → 401; เปลี่ยนรหัสผ่านแล้ว session อื่นใช้ไม่ได้; ตั้ง `is_active = false` ที่ DB แล้วเรียก `/me` → 401; ไม่มี response ไหนมี `password_hash`; spec `auth-server.service.spec.ts`: รหัสผ่านผิดล็อกอินไม่ผ่าน, session หมดอายุใช้ไม่ได้, ผู้ใช้ `is_active = false` ใช้ไม่ได้ ผ่าน `npm test`
- ผล: —

### [ ] Task 5: F1 หน้าเข้าสู่ระบบ / สมัคร / เปลี่ยนรหัสผ่าน + shell

- ทำ: หน้า `/login`, `/register`, `/account` ใน `src/app/features/auth/` + `auth-client.service.ts` ตาม pattern ฟอร์มใน `docs/DESIGN.md`; shell + เมนู (เมนูผู้ดูแลแสดงเฉพาะ `admin`) + ปุ่มออกจากระบบ + `authGuard`/`adminGuard` ใน `src/app/core/`; **`src/app/core/ssr-cookie.interceptor.ts`** ส่ง header `cookie` จาก `REQUEST` ต่อไปให้ `/api/*` ตอน SSR และลงทะเบียนใน `app.config.server.ts` ต่อจาก `apiOriginInterceptor` (SPEC 2.4); route lazy-load ใน `app.routes.ts` และ RenderMode `Server` ทุกหน้าใน `app.routes.server.ts`
- ทดสอบ: สมัครแล้วเข้าสู่ระบบทันที; **กด F5 แล้วยังล็อกอินอยู่ ไม่ถูกเด้งไป `/login`** (ข้อนี้พิสูจน์ว่า cookie ถูกส่งต่อตอน SSR); ออกจากระบบแล้วเปิด `/items` ถูกเด้งไป `/login`; เปลี่ยนรหัสผ่านของ admin เริ่มต้นได้แล้วล็อกอินด้วยรหัสใหม่; พนักงานไม่เห็นเมนูผู้ดูแลและเปิด `/admin/items` ไม่ได้
- ผล: —

### [ ] Task 6: F2 จัดการสิ่งของ (ผู้ดูแล)

- ทำ: API `GET /api/items`, `GET /api/items/:id`, `POST /api/items`, `PUT /api/items/:id` (`items.routes.ts` + `items-server.service.ts`, dto ใน `src/shared/dto/items.dto.ts`) โดย POST/PUT อยู่หลัง `requireAdmin` และ PUT เรียก function `update_item()` แปลง error เป็น 409 (R6, R9, R11); หน้า `/admin/items` ใน `src/app/features/items/` + `items-client.service.ts` (ตาราง + ฟอร์มเพิ่ม/แก้ + เปลี่ยนสถานะ ใช้งานปกติ/ส่งซ่อม/ปิดใช้งาน)
- ทดสอบ: เพิ่มของใหม่แล้วเห็นในตาราง; ใส่รหัสซ้ำ (ต่างตัวพิมพ์ใหญ่-เล็กด้วย) → 409 ข้อความไทย; เพิ่ม `total_qty` แล้วคงเหลือเพิ่มตามส่วนต่าง; ลด `total_qty` ต่ำกว่าจำนวนที่ถูกยืมอยู่ (สร้างคำขอค้างไว้ที่ DB ก่อนได้) → 409 ข้อความไทยบนหน้าจอ; แก้ `:id` ที่ไม่มีจริง → 404; ตั้ง "ส่งซ่อม" แล้วสถานะเปลี่ยน; ไม่มีปุ่มลบ
- ผล: —

### [ ] Task 7: F3 หน้ารายการสิ่งของ + ค้นหา/กรอง

- ทำ: `GET /api/items` เพิ่มฟิลด์คำนวณ `availability` (`available` / `out_of_stock` / `maintenance` / `inactive` ตามตารางใน SPEC 1.5 — ป้ายภาษาไทยแปลที่หน้าจอ) + query `q`, `category`, `availability`; ซ่อนแถว `inactive` จาก `employee` ทั้งใน list และ `:id` (R6); หน้า `/items` ใน `src/app/features/items/` (ช่องค้นหา + ตัวกรองประเภท + ตัวกรองสถานะ + ปุ่ม "ขอยืม" เปิดใช้เฉพาะสถานะพร้อมให้ยืม)
- ทดสอบ: ค้นด้วยชื่อและรหัสได้; กรองประเภทและสถานะได้ถูกต้อง; ของที่คงเหลือ 0 ขึ้น "ถูกยืมหมด" และกดขอยืมไม่ได้; พนักงานไม่เห็นของที่ปิดใช้งาน (ผู้ดูแลเห็น); spec `items-server.service.spec.ts`: การคำนวณ `availability` ครบ 4 กรณี ผ่าน `npm test`
- ผล: —

### [ ] Task 8: F4 ขอยืม

- ทำ: `POST /api/loans` เรียก `create_loan_request()` ด้วย `user_id` จาก session และแปลง error ของ function เป็น 400 ข้อความไทย (R1–R3) (`loans.routes.ts` + `loans-server.service.ts`, dto ใน `src/shared/dto/loans.dto.ts`); หน้า `/loans/new/:itemId` ใน `src/app/features/loans/` + `loans-client.service.ts` (ดึงของด้วย `GET /api/items/:id` แสดงชื่อ + คงเหลือ, ช่องจำนวน, ช่องวันกำหนดคืน, ปุ่มบันทึก disable ระหว่างส่งเพื่อกันกดซ้ำ)
- ทดสอบ: ขอยืม 1 ชิ้นแล้วคงเหลือลดทันทีในหน้ารายการ; ขอเกินคงเหลือ / เลือกวันย้อนหลัง / ใส่จำนวน 0 → ข้อความไทย ไม่บันทึก; ขอยืมของที่ส่งซ่อมผ่าน URL ตรง → 400; กดปุ่มรัวๆ ได้คำขอเดียว
- ผล: —

### [ ] Task 9: F4 คำขอของฉัน + ยกเลิก

- ทำ: `GET /api/loans` (บังคับ `employee` เห็นเฉพาะ `user_id` ตัวเอง, join `item_name`/`item_code`/`borrower_name`/`handled_by_name` ด้วย FK hint ตาม SPEC 2.4, คำนวณ `is_overdue` ด้วย `Asia/Bangkok`) และ `PATCH /api/loans/:id/status` รองรับ `cancelled` โดยเจ้าของคำขอที่ยังเป็น `pending` (R4, R6); หน้า `/loans` (รายการคำขอของฉัน + สถานะ + ป้าย "เกินกำหนด" + `remark` ของผู้ดูแล + ช่อง `reject_reason` ใช้ label กลางๆ ว่า "เหตุผลจากผู้ดูแล" เพราะใช้ทั้งตอนปฏิเสธและตอนผู้ดูแลยกเลิก + ปุ่มยกเลิกเฉพาะ `pending`)
- ทดสอบ: เห็นเฉพาะคำขอของตัวเอง (ยิง API ขอของคนอื่นก็ไม่ได้); ยกเลิกคำขอที่รอดำเนินการแล้วคงเหลือกลับคืน; คำขอที่ `due_date` เป็นเมื่อวานขึ้นป้าย "เกินกำหนด" พร้อมข้อความ; spec `loans-server.service.spec.ts`: การคำนวณ `is_overdue` (ก่อน/เท่ากับ/หลังวันนี้ และเฉพาะสถานะ `approved`) ผ่าน `npm test`
- ผล: —

### [ ] Task 10: F5 อนุมัติ / ปฏิเสธ

- ทำ: `PATCH /api/loans/:id/status` รองรับ `approved` / `rejected` — ตรวจสิทธิ์ **ใน handler ตามค่า `status` ที่ส่งมา** (ห้ามครอบทั้ง route ด้วย `requireAdmin` เพราะ `cancelled` ของ Task 9 เป็นของพนักงาน) แล้วส่ง `p_actor_id`, `p_reason` เข้า `set_loan_status()` (R4, R5, R6); หน้า `/admin/loans` ใน `src/app/features/loans/` + component ย่อยใน `loans/components/` (รายการคำขอทั้งหมด, ตัวกรองสถานะ, ค่าเริ่มต้นแสดง `pending` เรียงเก่าสุดก่อน, ปุ่มอนุมัติ/ปฏิเสธ + ช่องเหตุผล)
- ทดสอบ: อนุมัติแล้วสถานะเปลี่ยนและคงเหลือไม่เปลี่ยน; ปฏิเสธโดยไม่ใส่เหตุผลไม่ได้; ปฏิเสธแล้วคงเหลือกลับคืนและพนักงานเห็นเหตุผลในหน้า `/loans`; พนักงานยิง API อนุมัติเอง → 403; พนักงานยกเลิกคำขอที่อนุมัติแล้วไม่ได้ → 403
- ผล: —

### [ ] Task 11: F5 ยืนยันรับคืน + ยกเลิกโดยผู้ดูแล + remark

- ทำ: `PATCH /api/loans/:id/status` รองรับ `returned` และ `cancelled` จากคำขอ `approved` (ต้องมีเหตุผล) ผ่าน `set_loan_status()`; `PATCH /api/loans/:id/remark` แบบ conditional update เฉพาะคำขอ `approved` → 0 แถว = 409 (R4, R5, R6, R7); หน้า `/admin/loans` เพิ่มปุ่ม "ยืนยันรับคืน", ปุ่ม "ยกเลิก (อนุมัติผิด)" พร้อมช่องเหตุผล และช่อง `remark` (แก้ได้เฉพาะสถานะอนุมัติแล้ว)
- ทดสอบ: กดยืนยันรับคืนแล้วคงเหลือกลับคืนและสถานะเป็น "คืนแล้ว"; ผู้ดูแลยกเลิกคำขอที่อนุมัติแล้วโดยไม่ใส่เหตุผลไม่ได้ ใส่แล้วคงเหลือกลับคืน; พิมพ์ `remark` แล้วพนักงานเจ้าของคำขอเห็นในหน้า `/loans`; แก้ `remark` ของคำขอที่คืนแล้ว → 409 ข้อความไทย
- ผล: —

### [ ] Task 12: ปิดงาน

- ทำ: ไล่เช็ค SPEC 1.8 ทุกข้อ; ทุกหน้าที่ 375px; ทุกหน้าใช้ token/pattern/ฟอนต์/ไอคอนตาม `docs/DESIGN.md` (ไม่มีสีนอกระบบ ไม่มี emoji); ตรวจ a11y ตาม AGENTS.md (label ทุกช่องกรอก, ปุ่มไอคอนมี `aria-label`, ข้อความ error มี `role="alert"`, สถานะไม่ใช้สีอย่างเดียว); error ทุกจุดแสดงข้อความไทย; ตรวจว่าไม่มีไฟล์ไหนเกิน 300 บรรทัดหลัง `npm run format`; เขียน README.md (วิธีตั้ง Supabase, วิธีรัน, วิธี deploy, ตัวแปร .env — ย้ำว่า `NG_ALLOWED_HOSTS` ต้องเป็นโดเมนจริงก่อน deploy ไม่งั้นทุกหน้าได้ 400, ห้ามตั้ง CDN cache หน้า HTML, และ **ต้องเปลี่ยนรหัสผ่าน `admin@example.com` ทันทีหลัง deploy** ที่หน้า `/account`)
- ทดสอบ: คนอื่นอ่าน README แล้วรันได้โดยไม่ต้องถาม; ไล่เดินครบ 1 รอบตาม SPEC 1.6 บนมือถือโดยไม่ต้องซูม
- ผล: —
