# TASKS — ระบบจองคิวร้านตัดผม

> จาก `docs/SYSTEM_SPEC.md` v1.0 | ผ่านแล้ว 2/7 | Task ปัจจุบัน: 3 | อัปเดต: 2026-08-27

(ไฟล์ตัวอย่างนี้จงใจแสดงสภาพ "ระหว่างทำ" — ไฟล์ที่ skill ส่งมอบจริงเริ่มที่ ผ่านแล้ว 0/N)

สถานะ: `[ ]` รอทำ · `[~]` กำลังทำ · `[x]` ผ่าน · `[!]` ติดปัญหา (เขียนเหตุผลในบรรทัด "ผล:")

กฎ: 1 Task = 1 หน้าจอ หรือ 1 resource API พร้อมหน้าที่ใช้มัน — ไม่ใหญ่กว่านี้; รอบแรก 6–12 Task; รอบ feature 2–6 Task ไม่มี Task 1–2 ด้านล่าง เริ่มที่ migration `NNN_<name>.sql` + gen types + enums; ทำทีละ Task ผ่านก่อนค่อยไปต่อ; ทุก Task ที่เพิ่ม service ต้องมี spec ผ่าน `npm test`

---

### [x] Task 1: ตั้งโปรเจกต์ + เชื่อม Supabase
- ทำ: clone template `Angular-Supabase` → ตั้งชื่อ `barber-queue` (package.json, angular.json, script `serve:ssr:barber-queue` + path `dist/barber-queue/...`) → `npm install`; สร้าง `.env` จาก `.env.example` ใส่ `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`; หน้า `/` แสดงข้อความ "ระบบจองคิว" เฉยๆ — โครง server, interceptor, `provideHttpClient` มากับ template แล้ว
- ทดสอบ: `npm start` เปิด http://localhost:4200 เห็นข้อความ; เปิด `/api/health` เห็น `{ ok: true }`; `npm test` ผ่าน (ยังตรวจ `.env` ไม่ได้ที่ Task นี้ — ไม่มีจุดใดเรียก Supabase จริงจนกว่าจะถึง Task 2)
- ผล: commit 3f9a1c2 (2026-08-26)

### [x] Task 2: ฐานข้อมูล
- ทำ: `supabase init`; `supabase/migrations/001_init.sql` ตาราง `services`, `bookings` ตาม SPEC 1.5 (FK `ON DELETE RESTRICT`) + `UNIQUE (queue_date, queue_no)` + `CHECK` status + function `create_booking()` และ `set_booking_status()` ตาม R1, R2 + เปิด RLS ทั้งสองตาราง; seed บริการ 3 รายการตาม 1.9; `supabase gen types` → `src/shared/types/database.types.ts`; `shared/enums/bookings.enums.ts` มี `BOOKING_STATUS` 4 ค่า; `/api/health` เปลี่ยนเป็นตอบ `{ ok: true, count: 3 }`
- ทดสอบ: รัน migration สำเร็จ; `/api/health` เห็น `{ ok: true, count: 3 }`; ลบ `.env` แล้วเปิด `/api/health` ต้อง error บอกชื่อตัวแปรที่ขาด; เรียก `create_booking()` 3 ครั้งได้ 1,2,3; `set_booking_status` จาก done → waiting ต้อง error
- ผล: commit 8b2d4e7 (2026-08-27) — หมายเหตุ: ใช้ advisory lock ตาม R1 แทน `FOR UPDATE` เพราะคิวแรกของวันยังไม่มีแถวให้ล็อก

### [~] Task 3: F1 จัดการบริการ
- ทำ: API GET/POST/PUT `/api/services` (`src/server/routes/services.routes.ts` + `services/services-server.service.ts`, dto ใน `src/shared/dto/services.dto.ts`); หน้า `/staff/services` ใน `src/app/features/services/` (`service-manager.page.ts`, `services-client.service.ts`): ตารางบริการ + ฟอร์มเพิ่ม/แก้ + สวิตช์เปิด/ปิดใช้; route lazy-load + `RenderMode.Server`
- ทดสอบ: เพิ่มบริการใหม่ → รีเฟรช → ยังอยู่; ปิดใช้ → `GET /api/services?active=true` ไม่มีรายการนั้น; spec ทั้งสองฝั่งผ่าน `npm test`
- ผล: —

### [ ] Task 4: F2 รับคิว (ฝั่งลูกค้า)
- ทำ: API `POST /api/bookings` (ตรวจ R3 → `create_booking()`), `GET /api/bookings/:id` (+ `service_name`, `ahead` ตามนิยามใน 2.2) ใน `bookings.routes.ts` + `bookings-server.service.ts`, dto ใน `bookings.dto.ts`; หน้า `/` (`booking-form.page.ts`): รายการบริการที่เปิด → ฟอร์มชื่อ/เบอร์ → "รับคิว" → ไป `/ticket/:id`; หน้า `/ticket/:id` (`ticket.page.ts`): เลขคิว, บริการ, "อีก N คิวถึงคุณ", polling 10 วินาที; `bookings-client.service.ts`
- ทดสอบ: รับคิว 3 ครั้งได้เลข 1,2,3; เปิด ticket ของคิว 3 เห็น "อีก 2 คิว"; รับคิวบริการที่ปิดอยู่ได้ error ภาษาไทย (400); spec ผ่าน
- ผล: —

### [ ] Task 5: F3 จัดการคิว (ฝั่งช่าง)
- ทำ: API `GET /api/bookings/today` (+ `service_name`), `PATCH /api/bookings/:id/status` → `set_booking_status()`; หน้า `/staff` (`queue-board.page.ts`): 3 กลุ่มตาม 1.6 ข้อ 4; ปุ่ม เรียก/เสร็จ/ยกเลิก; polling 10 วินาที; ลำดับ route ตาม 2.3
- ทดสอบ: กดเรียกคิว 1 → status = called, called_at มีค่า; กดเสร็จ → done; PATCH done → waiting ได้ 400; ticket ของคิว 3 ตอนคิว 1 เป็น called ยังเห็น "อีก 2 คิว" และหลัง done เห็น "อีก 1 คิว"; spec ผ่าน
- ผล: —

### [ ] Task 6: F4 จอแสดงคิว
- ทำ: หน้า `/display` (`display.page.ts`, `RenderMode.Client`): ตัวหนังสือใหญ่ "กำลังเรียก: [ทุกเลขที่ status = called]" + "คิวถัดไป: [3 เลขแรกที่ waiting]"; polling 5 วินาที; ไม่มีปุ่ม
- ทดสอบ: เปิด `/display` บนคอม เปิด `/staff` บนมือถือ กดเรียก → จอเปลี่ยนภายใน 5 วินาที
- ผล: —

### [ ] Task 7: ปิดงาน
- ทำ: ยืนยันว่า `queue_no` เริ่ม 1 ใหม่เมื่อ `queue_date` เปลี่ยน (แก้วันที่ในฐานข้อมูลเพื่อทดสอบ); ไล่เช็ค SPEC 1.8 ทุกข้อ; ทุกหน้าที่ 375px; error ทุกจุดแสดงข้อความไทย; เขียน README.md (วิธีตั้ง Supabase, วิธีรัน, วิธี deploy ขึ้น Render, รายการ env)
- ทดสอบ: คนอื่นอ่าน README แล้วรันได้โดยไม่ต้องถาม
- ผล: —
