# TASKS — ระบบจองคิวร้านตัดผม

> จาก `docs/SYSTEM_SPEC.md` v1.0 | ผ่านแล้ว 3/8 | Task ปัจจุบัน: 4 | อัปเดต: 2026-08-27

(ไฟล์ตัวอย่างนี้จงใจแสดงสภาพ "ระหว่างทำ" — ไฟล์ที่ skill ส่งมอบจริงเริ่มที่ ผ่านแล้ว 0/N)

สถานะ: `[ ]` รอทำ · `[~]` กำลังทำ · `[x]` ผ่าน (บรรทัด "ผล:" ตาม Section 0 ข้อ 5) · `[!]` ติดปัญหา (เขียนเหตุผลในบรรทัด "ผล:")

กฎ: 1 Task = 1 หน้าจอ หรือ 1 resource API พร้อมหน้าที่ใช้มัน — ไม่ใหญ่กว่านี้; รอบแรกปกติ 7–13 Task (ระบบเล็กมากน้อยกว่าได้ เกิน 15 ให้เสนอผู้ใช้ย้ายฟีเจอร์ไปรอบถัดไป); ลำดับ Task สลับได้ถ้าเขียนเหตุผลไว้ใต้บรรทัดนี้; ทุก Task ที่มีหน้าจอทำตาม `docs/DESIGN.md` (เกิดจาก Task 2); รอบ feature 2–6 Task: ข้าม 3 Task แรกด้านล่าง (ชื่อโปรเจกต์, Design, ฐานข้อมูล) — Task 1 ของรอบ feature คือ migration (`npm run db:migration -- <name>`) + `npm run db:push` + `npm run db:types` + enums และหน้าจอใหม่ใช้ `docs/DESIGN.md` เดิม; ทำทีละ Task ผ่านก่อนค่อยไปต่อ; เขียน spec เฉพาะไฟล์ที่มีการคำนวณ / logic ซับซ้อน / ต้องแก้บ่อย (ตาม AGENTS.md → Testing) — CRUD ธรรมดาไม่ต้องมี spec

---

### [x] Task 1: ตั้งชื่อโปรเจกต์ + หน้าแรก
- ทำ: ตั้งชื่อ `barber-queue` (package.json, angular.json, script `serve:ssr:barber-queue` + path `dist/barber-queue/...`, `project_id` ใน `supabase/config.toml`); หน้า `/` แสดงข้อความ "ระบบจองคิว" เฉยๆ (แก้ `title` ใน `src/app/app.ts`, ข้อความใน `src/app/app.html` และ `<title>` ใน `src/index.html`) — Supabase เชื่อมไว้แล้วตอน clone template (README ข้อ 2); โครง server, interceptor, `provideHttpClient` มากับ template แล้ว
- ทดสอบ: `npm start` เปิด http://localhost:4200 เห็นข้อความ; เปิด `/api/health` เห็น `{ ok: true }`; `npm test` ผ่าน
- ผล: ผ่าน 2026-08-26 — `.sessions/2026-08-26-1540-task-1-setup.md`

### [x] Task 2: Design UX/UI

- ทำ: อ่าน SPEC 1.2, 1.3, 1.6, 1.9 → mockup 4 หน้า (`/` รับคิว, `/ticket/:id`, `/staff`, `/display`) ใน `docs/design/mockup.html` (มือถือ 375px, Tailwind Play CDN — ห้ามเพิ่มเข้า `@source`) ฟอนต์ไทยจาก Google Fonts เสนอ 2–3 ตัวเลือก + ไอคอน Material Symbols ห้ามใช้ emoji → ผู้ใช้ติชมจนพอใจ → เขียน `docs/DESIGN.md` ตามโครง `.claude/skills/system-spec-builder/templates/DESIGN.md` → ลง token ใน `@theme` ของ `src/styles.css` + โหลดฟอนต์/ไอคอนใน `src/index.html`
- ทดสอบ: ผู้ใช้เปิด mockup แล้วยืนยันว่าตรงที่ต้องการ; ทุกคู่สีใน DESIGN.md ระบุ ratio และผ่าน WCAG AA; `npm test` ผ่าน — ผ่านแล้ว `docs/DESIGN.md` ถือว่า LOCKED
- ผล: ผ่าน 2026-08-26 — `.sessions/2026-08-26-1730-task-2-design.md` — ผู้ใช้ขอเลขคิวใหญ่ขึ้นบนหน้า ticket (แก้ใน mockup รอบ 2 แล้วจดเป็น pattern "เลขคิว display" ใน DESIGN.md ข้อ 3)

### [x] Task 3: ฐานข้อมูล
- ทำ: `npm run db:migration -- init` → ไฟล์ใน `supabase/migrations/` (ต่อจาก `*_health.sql` ของ template) ตาราง `services`, `bookings` ตาม SPEC 1.5 (FK `ON DELETE RESTRICT`) + `UNIQUE (queue_date, queue_no)` + `CHECK` status + function `create_booking()` และ `set_booking_status()` ตาม R1, R2 + เปิด RLS ทั้งสองตาราง; seed บริการ 3 รายการตาม 1.9; `npm run db:push` → `npm run db:types`; `shared/enums/bookings.enums.ts` มี `BOOKING_STATUS` 4 ค่า; `/api/health` เพิ่ม `count` ของ `services` → ตอบ `{ ok: true, count: 3 }`
- ทดสอบ: `npm run db:push` สำเร็จ; `/api/health` เห็น `{ ok: true, count: 3 }`; เรียก `create_booking()` 3 ครั้งได้ 1,2,3; `set_booking_status` จาก done → waiting ต้อง error
- ผล: ผ่าน 2026-08-27 — `.sessions/2026-08-27-0915-task-2-database.md` — หมายเหตุ: ใช้ advisory lock ตาม R1 แทน `FOR UPDATE` เพราะคิวแรกของวันยังไม่มีแถวให้ล็อก

### [~] Task 4: F1 จัดการบริการ
- ทำ: API GET/POST/PUT `/api/services` (`src/server/routes/services.routes.ts` + `services/services-server.service.ts`, dto ใน `src/shared/dto/services.dto.ts`); หน้า `/staff/services` ใน `src/app/features/services/` (`pages/service-manager.page.ts`, `services-client.service.ts`): ตารางบริการ + ฟอร์มเพิ่ม/แก้ + สวิตช์เปิด/ปิดใช้ ตาม pattern ใน `docs/DESIGN.md`; route lazy-load + `RenderMode.Server`
- ทดสอบ: เพิ่มบริการใหม่ → รีเฟรช → ยังอยู่; ปิดใช้ → `GET /api/services?active=true` ไม่มีรายการนั้น (CRUD ธรรมดา — ไม่ต้องมี spec)
- ผล: —

### [ ] Task 5: F2 รับคิว (ฝั่งลูกค้า)
- ทำ: API `POST /api/bookings` (ตรวจ R3 → `create_booking()`), `GET /api/bookings/:id` (+ `service_name`, `ahead` ตามนิยามใน 2.2) ใน `bookings.routes.ts` + `bookings-server.service.ts`, dto ใน `bookings.dto.ts`; หน้า `/` (`pages/booking-form.page.ts`): รายการบริการที่เปิด → ฟอร์มชื่อ/เบอร์ → "รับคิว" → ไป `/ticket/:id`; หน้า `/ticket/:id` (`pages/ticket.page.ts`): เลขคิว, บริการ, "อีก N คิวถึงคุณ", polling 10 วินาที; `bookings-client.service.ts`
- ทดสอบ: รับคิว 3 ครั้งได้เลข 1,2,3; เปิด ticket ของคิว 3 เห็น "อีก 2 คิว"; รับคิวบริการที่ปิดอยู่ได้ error ภาษาไทย (400); spec `bookings-server.service.spec.ts`: คำนวณ `ahead` (นับเฉพาะ waiting/called ที่ `queue_no` น้อยกว่า) ผ่าน `npm test`
- ผล: —

### [ ] Task 6: F3 จัดการคิว (ฝั่งช่าง)
- ทำ: API `GET /api/bookings/today` (+ `service_name`), `PATCH /api/bookings/:id/status` → `set_booking_status()`; หน้า `/staff` (`pages/queue-board.page.ts`): 3 กลุ่มตาม 1.6 ข้อ 4; ปุ่ม เรียก/เสร็จ/ยกเลิก; polling 10 วินาที; ลำดับ route ตาม 2.3
- ทดสอบ: กดเรียกคิว 1 → status = called, called_at มีค่า; กดเสร็จ → done; PATCH done → waiting ได้ 400; ticket ของคิว 3 ตอนคิว 1 เป็น called ยังเห็น "อีก 2 คิว" และหลัง done เห็น "อีก 1 คิว" (route ส่งต่อไป `set_booking_status()` อย่างเดียว — logic อยู่ใน DB function ตาม Task 3 ไม่ต้องมี spec)
- ผล: —

### [ ] Task 7: F4 จอแสดงคิว
- ทำ: หน้า `/display` (`pages/display.page.ts`, `RenderMode.Client`): ตัวหนังสือใหญ่ "กำลังเรียก: [ทุกเลขที่ status = called]" + "คิวถัดไป: [3 เลขแรกที่ waiting]"; polling 5 วินาที; ไม่มีปุ่ม
- ทดสอบ: เปิด `/display` บนคอม เปิด `/staff` บนมือถือ กดเรียก → จอเปลี่ยนภายใน 5 วินาที
- ผล: —

### [ ] Task 8: ปิดงาน
- ทำ: ยืนยันว่า `queue_no` เริ่ม 1 ใหม่เมื่อ `queue_date` เปลี่ยน (แก้วันที่ในฐานข้อมูลเพื่อทดสอบ); ไล่เช็ค SPEC 1.8 ทุกข้อ; ทุกหน้าที่ 375px; ทุกหน้าใช้ token/pattern ตาม `docs/DESIGN.md`; error ทุกจุดแสดงข้อความไทย; เขียน README.md (วิธีตั้ง Supabase, วิธีรัน, วิธี deploy ขึ้น Render, รายการ env รวม `NG_ALLOWED_HOSTS` = โดเมนของ Render)
- ทดสอบ: คนอื่นอ่าน README แล้วรันได้โดยไม่ต้องถาม
- ผล: —
