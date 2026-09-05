# TASKS — ระบบจองคิวตัดผมออนไลน์

> จาก `docs/SYSTEM_SPEC.md` v1.1 | ผ่านแล้ว 1/8 | Task ปัจจุบัน: 2 | อัปเดต: 2026-09-05

สถานะ: `[ ]` รอทำ · `[~]` กำลังทำ · `[x]` ผ่าน (บรรทัด "ผล:" ตาม Section 0 ข้อ 5) · `[!]` ติดปัญหา (เขียนเหตุผลในบรรทัด "ผล:")

กฎ: 1 Task = 1 หน้าจอ หรือ 1 resource API พร้อมหน้าที่ใช้มัน — ไม่ใหญ่กว่านี้; รอบแรกปกติ 7–13 Task (ระบบเล็กมากน้อยกว่าได้ เกิน 15 ให้เสนอผู้ใช้ย้ายฟีเจอร์ไปรอบถัดไป); ลำดับ Task สลับได้ถ้าเขียนเหตุผลไว้ใต้บรรทัดนี้; ทุก Task ที่มีหน้าจอทำตาม `docs/DESIGN.md` (เกิดจาก Task 2); รอบ feature 2–6 Task: ข้าม 3 Task แรกด้านล่าง (ชื่อโปรเจกต์, Design, ฐานข้อมูล) — Task 1 ของรอบ feature คือ migration (`npm run db:migration -- <name>`) + `npm run db:push` + `npm run db:types` + enums และหน้าจอใหม่ใช้ `docs/DESIGN.md` เดิม; ทำทีละ Task ผ่านก่อนค่อยไปต่อ; เขียน spec เฉพาะไฟล์ที่มีการคำนวณ / logic ซับซ้อน / ต้องแก้บ่อย (ตาม AGENTS.md → Testing) — CRUD ธรรมดาไม่ต้องมี spec

---

### [x] Task 1: ตั้งชื่อโปรเจกต์ + หน้าแรก

- ทำ: **ตรวจความพร้อมก่อนเริ่ม** — (1) `node -v` ต้องเข้าเงื่อนไข `engines` ใน `package.json` ถ้าไม่ผ่านให้บอกผู้ใช้สลับเวอร์ชัน (เช่น `nvm use <version>`) ก่อน (2) `npm start` แล้วเปิด `/api/health` ต้องได้ `{ ok: true }` ถ้าไม่ได้ ให้ agent อ่านข้อความ error แล้ว**พาผู้ใช้แก้ทีละขั้น**ตาม README → "ปัญหาที่พบบ่อยตอนตั้งค่า" (ยังไม่มี `.env` / ยังไม่ `npx supabase login` / ใส่ anon key แทน service_role / ยังไม่ `db:push` — ถ้าฐานข้อมูลอยู่บน server ของตัวเอง ข้ามเรื่อง login/link แล้วใช้ `db:push:url` ตาม README → "Deploy บน VPS ของตัวเอง") จนได้ `{ ok: true }` ก่อนจึงเริ่มงานของ Task; จากนั้นตั้งชื่อ `barber-appointment` (แก้ `name` ใน package.json, เปลี่ยน **key ของ project** ใน angular.json จาก `angular-supabase` เป็น `barber-appointment` เพราะ `outputPath` อิงชื่อนั้น, เปลี่ยน script `serve:ssr:angular-supabase` เป็น `serve:ssr:barber-appointment` และ path `dist/barber-appointment/...`, และ `project_id` ใน `supabase/config.toml`); หน้า `/` แสดงชื่อระบบ "ระบบจองคิวตัดผมออนไลน์" เฉยๆ (แก้ `title` ใน `src/app/app.ts`, ข้อความใน `src/app/app.html` ซึ่งเป็น placeholder ของ template และ `<title>` ใน `src/index.html`) — การเชื่อมฐานข้อมูล (`.env`, login, link, `db:push` migration `roles` + `health` — หรือ `db:push:url` เมื่ออยู่บน server ของตัวเอง) ทำไปแล้วตอน clone template ตาม README ไม่ใช่งานของ Task นี้; โครง server (`src/server/env.ts`, `supabase.ts`, `api.ts`, `routes/health.routes.ts`, `services/health-server.service.ts`), interceptor ตอน SSR ทั้ง 2 ตัว (`src/app/core/api-origin.interceptor.ts`, `ssr-cookie.interceptor.ts`), `api-error.ts`, `thai-date.ts` และ `provideHttpClient` ทั้งสองฝั่งมากับ template แล้ว ไม่ต้องสร้างใหม่
- ทดสอบ: `npm start` เปิด http://localhost:4200 เห็นชื่อระบบ "ระบบจองคิวตัดผมออนไลน์"; เปิด `/api/health` เห็น `{ ok: true }`; `npm test` ผ่าน
- ผล: ผ่าน 2026-09-05 — preflight `node -v` ได้ `v26.7.0`, `npm start` ทำงานได้เมื่อต้องรันนอก sandbox, หน้า `/` แสดงชื่อระบบ และ `/api/health` ตอบ `{"ok":true}`; `npm run format`, `npm test` (ผ่าน 4 ไฟล์ / 13 tests) และ `npm run build` ผ่านแล้ว; log: `.sessions/2026-09-05-1855-task-1-project-name.md`

### [ ] Task 2: Design UX/UI

- ทำ: อ่าน SPEC 1.2 (ผู้ใช้/อุปกรณ์), 1.3 (ฟีเจอร์), 1.6 (ขั้นตอน), 1.9 (โทนโมเดิร์นบาร์เบอร์ เรียบ เท่ สะอาด รองรับ Responsive ทุกหน้าจอ) → สร้าง mockup 4 หน้าจอหลัก (`/` จองคิว, `/booking/:code` ใบนัดหมาย, `/my-booking` ค้นหา/ยกเลิกคิว, `/staff` ตารางคิวหน้าร้าน) ในไฟล์เดียว `docs/design/mockup.html` (ใช้ Tailwind Play CDN, แสดงมุมมองทั้ง Mobile 375px และ Desktop layout, เสนอ 2–3 ฟอนต์ไทยจาก Google Fonts ให้ผู้ใช้เลือก และใช้ไอคอนจริงจาก Material Symbols ห้ามใช้ emoji) → ให้ผู้ใช้เปิดดูแล้วติชม แก้จนผู้ใช้พอใจ → สรุปเป็น `docs/DESIGN.md` ตามโครง template (design tokens, ฟอนต์+ไอคอน, component patterns, layout, คู่สีผ่าน AA) → ลง token ใน `@theme` ของ `src/styles.css` + โหลดฟอนต์/ไอคอนใน `src/index.html`
- ทดสอบ: ผู้ใช้เปิด `docs/design/mockup.html` แล้วยืนยันว่าตรงที่ต้องการ; ทุกคู่สีใน DESIGN.md ระบุ ratio และผ่าน WCAG AA; แสดงผลถูกต้องทั้งมือถือและเดสก์ท็อป; `npm test` ผ่าน — Task นี้ผ่านแล้ว `docs/DESIGN.md` ถือว่า LOCKED
- ผล: —

### [ ] Task 3: ฐานข้อมูล

- ทำ: `npm run db:migration -- init` → เขียน migration ใน `supabase/migrations/` (ต่อจาก `*_roles.sql` และ `*_health.sql` เดิม) สร้างตาราง `shop_settings`, `barbers`, `services`, `bookings` ตาม SPEC 1.5 + DB constraint (FK ON DELETE RESTRICT, UNIQUE booking_code) + Postgres functions ตาม 1.7 (`create_booking` พร้อม advisory lock และ check overlaps, `set_booking_status` พร้อมจด `cancelled_at`) + เปิด RLS ทุกตาราง; ข้อมูล seed เริ่มต้นตาม SPEC 1.9 (การตั้งค่าร้าน, ช่าง 3 คน, บริการ 3 รายการ); `npm run db:push` → `npm run db:types`; `src/shared/enums/bookings.enums.ts` มี `BOOKING_STATUS` 4 ค่า; `/api/health` เพิ่ม `count` ของ `bookings` ของวันนี้ → ตอบ `{ ok: true, count: N }`
- ทดสอบ: `npm run db:push` สำเร็จ; เปิด `/api/health` เห็น `{ ok: true, count: 0 }`; agent เขียน SQL block ให้ผู้ใช้วางใน Supabase Dashboard → SQL Editor เพื่อทดสอบ `create_booking()` 2 ครั้งในเวลาซ้อนกันของช่างคนเดิมแล้วต้องขึ้น error ภาษาไทย (409) และทดสอบจองเวลาย้อนหลังแล้วขึ้น error ภาษาไทย (block rollback ตัวเอง); `npm test` ผ่าน
- ผล: —

### [ ] Task 4: F1 จัดการร้านค้า ช่าง และบริการ

- ทำ: API GET/PUT `/api/settings`, GET/POST/PUT `/api/barbers`, GET/POST/PUT `/api/services` (`src/server/routes/` + `services/`, dto ใน `src/shared/dto/`); หน้า `/staff/settings` ใน `src/app/features/settings/` (`settings.page.ts`, `components/barber-manager.component.ts`, `components/service-manager.component.ts`, `settings-client.service.ts`): ฟอร์มแก้ไขเวลาเปิด-ปิดร้าน/รอบเวลา/เวลายกเลิกล่วงหน้า/PIN, ตารางจัดการช่างและบริการ พร้อมสวิตช์เปิด-ปิดการใช้งาน (`is_active`) ตาม pattern ใน `docs/DESIGN.md`; route lazy-load + `RenderMode.Server`
- ทดสอบ: แก้ไขเวลาเปิด-ปิดร้านแล้วรีเฟรชค่าไม่หาย; เพิ่มช่าง/บริการใหม่ และสลับสวิตช์ปิดการใช้งานช่างแล้วค่ายังคงอยู่; `npm test` ผ่าน
- ผล: —

### [ ] Task 5: F2 จองคิวออนไลน์ (ฝั่งลูกค้า)

- ทำ: API GET `/api/bookings/available-slots` (คำนวณช่วงเวลาว่างตาม open_time, close_time, slot_duration_min และคิวที่มีอยู่), POST `/api/bookings` (เรียก `create_booking`), GET `/api/bookings/code/:code` ใน `bookings.routes.ts` + `bookings-server.service.ts`, dto ใน `bookings.dto.ts`; หน้า `/` (`booking.page.ts`): ตัวเลือกช่าง, บริการ, วันที่นัดหมาย, แสดงรอบเวลาที่ว่าง, ฟอร์มชื่อ-เบอร์-หมายเหตุ → กดยืนยัน → ไปหน้า `/booking/:code` (`booking-ticket.page.ts`): ใบนัดหมายแสดงรหัสคิว ช่าง วันเวลา สถานะ พร้อมปุ่มบันทึก/พิมพ์; `bookings-client.service.ts`
- ทดสอบ: เลือกรอบเวลาและกดจองสำเร็จ ได้รหัสคิวและแสดงหน้าใบนัดหมาย; เมื่อกลับไปหน้าจองอีกครั้งในช่างและวันเดียวกัน รอบเวลาที่เพิ่งจองไปจะไม่สามารถเลือกได้; spec `bookings-server.service.spec.ts`: การคำนวณรอบเวลาที่ว่าง (available slots) ถูกต้องตามช่วงเวลาและตัดรอบที่จองแล้วออก ผ่าน `npm test`
- ผล: —

### [ ] Task 6: F3 ตรวจสอบและยกเลิกคิว (ฝั่งลูกค้า)

- ทำ: API GET `/api/bookings/search` (ค้นหาด้วย phone หรือ code), POST `/api/bookings/:code/cancel` (ตรวจสอบเงื่อนไขเวลาตาม R4 และเรียก `set_booking_status` เป็น cancelled); หน้า `/my-booking` (`my-booking.page.ts`): ช่องค้นหาด้วยเบอร์โทรหรือรหัสจอง แสดงรายการคิว พร้อมปุ่ม "ยกเลิกคิว" หากยังอยู่ในช่วงเวลาก่อนนัดหมายตามเงื่อนไข (cancel_before_hours)
- ทดสอบ: ค้นหาด้วยเบอร์โทรพบรายการคิว; กดยกเลิกคิวก่อนเวลา 2 ชม. สำเร็จ คิวเปลี่ยนสถานะเป็นยกเลิก; หากทดสอบกับคิวที่เหลือน้อยกว่าเวลาที่กำหนด ปุ่มยกเลิกจะไม่ทำงานและแสดงข้อความแจ้งเตือนให้ติดต่อร้านค้า; spec `bookings-server.service.spec.ts`: ตรวจสอบเงื่อนไขเวลายกเลิกล่วงหน้า ผ่าน `npm test`
- ผล: —

### [ ] Task 7: F4 กระดานจัดการคิวหน้าร้าน (ฝั่งร้านค้า)

- ทำ: API POST `/api/staff/verify-pin`, GET `/api/bookings/schedule`, PATCH `/api/bookings/:id/status`; หน้า `/staff/login` (`staff-login.page.ts`): กรอก PIN หน้าร้าน เมื่อผ่านเก็บ `staff_authed = "1"` ลง `sessionStorage`; route guard ใน `src/app/core/` ตรวจ `sessionStorage` ก่อนแสดงหน้า `/staff` และ `/staff/settings`; หน้า `/staff` (`queue-board.page.ts`): ตารางคิวประจำวัน (เลือกวัน/กรองช่างได้, Desktop แสดงแบบ Timeline/Column, Mobile แสดงแบบ List Card), ปุ่มเปลี่ยนสถานะ "เริ่มบริการ" / "เสร็จสิ้น" / "ยกเลิก", ปุ่ม "เพิ่มคิวหน้าร้าน" (Modal/ฟอร์มจองแทนลูกค้า walk-in); polling ทุก 10 วินาที; `staff-client.service.ts`
- ทดสอบ: กรอก PIN ถูกต้องเข้าหน้าตารางคิวได้; กดเริ่มบริการสถานะเปลี่ยนเป็น in_service; กดเสร็จสิ้นสถานะเปลี่ยนเป็น completed; เพิ่มคิว walk-in แล้วแสดงในตารางคิวทันที; spec `bookings-server.service.spec.ts`: ทดสอบ `canChangeStatus(from, to)` ครบทุก transition ที่อนุญาตและไม่อนุญาตตามแผนผังใน 1.5 (เช่น `completed → cancelled` ต้องคืน false, `confirmed → in_service` ต้องคืน true); `npm test` ผ่าน
- ผล: —

### [ ] Task 8: ปิดงาน

- ทำ: ตรวจสอบเงื่อนไข SPEC 1.8 ครบทุกข้อ; ทดสอบ Responsive ทุกหน้าจอ (Mobile 375px, Tablet, Desktop) ไม่ล้น ไม่แตก; ตรวจสอบ contrast ทุกคู่สีผ่าน WCAG AA; ข้อความ error ทุกจุดเป็นภาษาไทย; เขียน `README.md` (วิธีติดตั้ง, คำสั่งรัน, การตั้งค่า Supabase, ขั้นตอน deploy ขึ้น Render พร้อมระบุ `NG_ALLOWED_HOSTS`)
- ทดสอบ: คนอื่นอ่าน `README.md` แล้วสามารถรันและ deploy ระบบได้โดยไม่ต้องถาม; `npm run format` และ `npm test` ผ่านทั้งหมด
- ผล: —
