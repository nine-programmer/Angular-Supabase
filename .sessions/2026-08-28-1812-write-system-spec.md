# 2026-08-28 18:12 — เขียน SYSTEM_SPEC + TASKS ของระบบยืม-คืนอุปกรณ์

> ล้าสมัยบางส่วน — ดู SPEC v1.1: ตอนนี้มี 12 Task (Task 2 = Design UX/UI, ฐานข้อมูลเลื่อนเป็น Task 3, cookie interceptor อยู่ Task 5)

## ทำอะไร

สัมภาษณ์ผู้ใช้ด้วย skill `system-spec-builder` (3 รอบ 9 คำถาม) แล้วเขียนเอกสารรอบแรกของโปรเจกต์ จากนั้นให้ subagent อิสระตรวจ 2 รอบจนได้ APPROVED ยังไม่มีการเขียนโค้ดใดๆ — Task 1 ยังไม่เริ่ม

## ไฟล์ที่แตะ

- `docs/SYSTEM_SPEC.md` (ใหม่) — v1.0 สถานะ `พร้อมสร้าง`
- `docs/TASKS.md` (ใหม่) — 11 Task, ผ่านแล้ว 0/11
- ไม่ได้แก้ไฟล์อื่นในระบบเลย (รัน `npm run format` ซึ่งจัดรูปแบบตาราง markdown ของสองไฟล์นี้)

## สิ่งที่ผู้ใช้ตัดสินใจในการสัมภาษณ์ (ห้ามเปลี่ยนเองภายหลัง)

- มี login 2 บทบาท `employee` / `admin`; พนักงานสมัครเองได้เป็น employee เท่านั้น; admin คนแรกมาจาก migration
- การยืมต้องผ่านการอนุมัติของผู้ดูแล และ **"อนุมัติแล้ว = รับของไปแล้ว"** ไม่มีขั้น "รับของ" แยก
- **คงเหลือถูกหักตอนพนักงานกดขอยืม** (ไม่ใช่ตอนอนุมัติ) — ปฏิเสธ/ยกเลิก/รับคืน = คืนยอด
- 1 คำขอ = ของ 1 อย่าง (ระบุจำนวนได้) ไม่มีตะกร้า
- ไม่มีคืนบางส่วน; คืนไม่ครบให้ผู้ดูแลจดในช่อง `remark` แล้วคำขอยังไม่ปิด (ผู้ใช้ขอฟิลด์นี้เอง)
- สถานะสิ่งของมี `ส่งซ่อม` ที่ผู้ดูแลกดตั้งเองด้วย

## การตัดสินใจ/ทางแก้ ที่มาจากรอบตรวจ (เหตุผลสำคัญ)

1. **SSR ไม่ส่ง cookie** — `src/app/core/api-origin.interceptor.ts` ที่มากับ template เติมแค่ origin ทุกหน้าเป็น `RenderMode.Server` จึงจะได้ 401 จาก `/api/auth/me` ตอนรีเฟรชและถูกเด้งไป `/login` → spec สั่งเพิ่ม `src/app/core/ssr-cookie.interceptor.ts` (server-only, อ่าน header `cookie` จาก `REQUEST`) ลงทะเบียนใน `app.config.server.ts` ต่อจาก interceptor เดิม — อยู่ใน Task 4 และมีข้อทดสอบ "กด F5 แล้วยังล็อกอินอยู่"
2. **`available_qty` ห้ามแก้แบบอ่าน-แล้ว-เขียน** — ตอนแรกให้ `PUT /api/items/:id` คำนวณส่วนต่างใน service ซึ่งชนกับ `create_loan_request()` ที่รันพร้อมกัน → เปลี่ยนเป็น Postgres function `update_item()` ที่ `FOR UPDATE` แถว item (ตรงกับ AGENTS.md → API Layer เรื่องตัวนับสต็อก)
3. **`remark` ต้องมีทางแก้ทางเดียว** — ตัดออกจาก parameter ของ `set_loan_status()` และจาก body ของ `PATCH /status` เหลือ `PATCH /api/loans/:id/remark` แบบ conditional update (`.eq('status','approved')`, 0 แถว = 409) ตาม R7
4. **`PATCH /api/loans/:id/status` ห้ามครอบ `requireAdmin` ทั้ง route** — เพราะ `cancelled` จากคำขอ `pending` เป็นสิทธิ์ของพนักงานเจ้าของคำขอ ต้องตรวจสิทธิ์ใน handler ตามค่า `status` ที่ส่งมา (เขียนย้ำไว้ทั้ง R6, 2.2 และ Task 9)
5. **เพิ่ม transition `approved → cancelled` โดยผู้ดูแล (ต้องมีเหตุผล)** — เดิมคำขอที่อนุมัติผิดหรือพนักงานไม่มารับของจะล็อกของไว้ตลอดไป ทางออกเดียวคือกด "รับคืน" ทั้งที่ไม่เคยจ่ายของ
6. **เพิ่ม `POST /api/auth/change-password` + หน้า `/account`** — เพราะรหัส admin เริ่มต้นฝังอยู่ใน migration (อยู่ใน git ตลอดไป) และรอบนี้ไม่มีหน้าจัดการผู้ใช้
7. seed admin ใช้ `crypt('admin1234', gen_salt('bf'))` ของ `pgcrypto` (schema `extensions`) เพราะ migration เรียก `bcryptjs` ไม่ได้ — hash `$2a$` ที่ได้ `bcryptjs` อ่านได้
8. `handled_by` ตั้งเฉพาะเมื่อผู้ดำเนินการเป็น admin ไม่งั้นชื่อพนักงานจะไปโผล่เป็น "ผู้ดำเนินการ"
9. cookie `secure` ต้องพึ่ง `app.set('trust proxy', 1)` ใน `src/server.ts` เพราะ Render อยู่หลัง proxy (ถือเป็น config ของ host ไม่ใช่ logic จึงไม่ผิดกฎ server.ts)
10. `availability` กำหนดค่าอังกฤษ 4 ค่า (`available` / `out_of_stock` / `maintenance` / `inactive`) เพราะเป็นทั้งค่าตอบกลับและ query param ต้องเขียน zod/enums ได้

## ทดสอบอย่างไร

ยังไม่มีโค้ดให้ทดสอบ — ตรวจด้วย subagent อิสระ 2 รอบตาม step 6 ของ skill (รอบแรกเจอ blocker 4 ข้อ, รอบสองไม่มี blocker → APPROVED) และรัน `npm run format` ผ่าน

## Task ถัดไป

Task 1 ใน `docs/TASKS.md` — ตั้งชื่อโปรเจกต์เป็น `borrow-return` + หน้าแรกแสดงชื่อระบบ (ต้องแก้ **key ของ project** ใน `angular.json` ด้วย ไม่ใช่แค่ `name` เพราะ `outputPath` อิงชื่อ project)

## ค้างไว้ให้ถามผู้ใช้ (ยังไม่ตอบ)

- ผู้ดูแลอนุมัติคำขอของตัวเองได้ — องค์กรรับได้ไหม
- คำขอที่จองของไว้ไม่มีวันหมดอายุอัตโนมัติ (แก้ด้วยการให้ผู้ดูแลกดยกเลิกเอง)
- ประเภทสิ่งของล็อกไว้ 4 ค่า (เพิ่มต้องทำ migration ใหม่) และไม่มีข้อมูลเดิมนำเข้า
