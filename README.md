# Angular-Supabase

Template ตั้งต้นสำหรับสร้าง mini app ต่อลูกค้า 1 repo — Angular SSR ทำหน้าที่ทั้ง frontend และ API (`/api/*`) โดยมีแค่ server เท่านั้นที่เชื่อม Supabase (ดูรายละเอียดสถาปัตยกรรมที่ [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) และกติกาการเขียนโค้ดที่ [AGENTS.md](AGENTS.md))

## เริ่มใช้งานระบบใหม่

### 1. Clone template ไปเป็นโปรเจกต์ของลูกค้า

```bash
git clone <this-repo> <ชื่อโปรเจกต์ลูกค้า>
cd <ชื่อโปรเจกต์ลูกค้า>
npm install
```

### 2. เขียน spec ด้วย skill `system-spec-builder`

เปิดโปรเจกต์ด้วย Claude Code (หรือ AI agent ที่รองรับ skill นี้) แล้วพิมพ์ไอเดียของระบบเป็นประโยคเดียว เช่น "อยากได้ระบบยืมคืนอุปกรณ์ในออฟฟิศ" — skill จะ:

1. เช็คว่าไอเดียอยู่ในขอบเขตของ template ไหม (ดู [ARCHITECTURE.md ข้อ 10](docs/ARCHITECTURE.md))
2. เทียบกับ pattern สำเร็จรูป (ยืม-คืน, จองคิว, ลงทะเบียน, สต็อก, คำขอ/ใบแจ้ง, รายการทั่วไป) ถ้าตรง
3. สัมภาษณ์เป็นรอบสั้นๆ จนข้อมูลครบพอจะสร้างระบบได้จริง (ไม่ถามซ้ำสิ่งที่รู้แล้ว)
4. สรุปให้ยืนยันก่อนเขียนไฟล์
5. เขียน `docs/SYSTEM_SPEC.md` (สิ่งที่ต้องสร้าง — locked หลัง review) และ `docs/TASKS.md` (ลำดับงาน + ความคืบหน้า)
6. ส่งให้ agent อีกตัวตรวจแบบ "Tech Lead ขี้บ่น" ก่อนเปลี่ยนสถานะเป็น "พร้อมสร้าง"

### 3. ตั้งค่า Supabase

สร้างโปรเจกต์ใหม่ที่ [supabase.com](https://supabase.com) แล้วคัดลอก `.env.example` เป็น `.env`:

```bash
cp .env.example .env
```

ใส่ค่า `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` ให้ครบ (ห้าม commit ไฟล์ `.env`)

### 4. สั่งให้ agent เริ่มสร้างทีละ Task

เปิดแชทใหม่กับ agent แล้วพิมพ์:

```
อ่าน docs/SYSTEM_SPEC.md แล้วเริ่มตาม Section 0
```

Agent จะอ่าน `AGENTS.md` → `docs/ARCHITECTURE.md` → `docs/SYSTEM_SPEC.md` → `docs/TASKS.md` แล้วทำทีละ Task เท่านั้น รอให้คุณทดสอบแล้วบอก "ผ่าน" จากนั้น agent จะถามว่าจะบันทึกงานลง `.sessions/` ไหม เตือนให้ commit (หรือ commit ให้ ถ้าตั้งค่าไว้ใน SYSTEM_SPEC Section 0) และถามว่าจะทำ Task ถัดไปใน session นี้หรือเปิดใหม่ (agent ไม่เริ่ม Task ถัดไปเอง) — ความคืบหน้าทั้งหมดถูกบันทึกไว้ใน `docs/TASKS.md` เปิดแชทใหม่กี่ครั้งก็ทำต่อจากเดิมได้

### 5. เมื่อมีฟีเจอร์ใหม่ในรอบถัดไป

เรียก skill `system-spec-builder` อีกครั้งพร้อมบอกฟีเจอร์ที่ต้องการ — จะได้ `docs/features/<name>/SPEC.md` + `TASKS.md` แยกต่างหาก โดยอ้างอิงตารางเดิมจาก `docs/SYSTEM_SPEC.md`

## คำสั่งที่ใช้บ่อย

```bash
npm install
npm start                              # dev server (SSR) ที่ http://localhost:4200
npm test                               # รัน unit test (Vitest)
npm run build                          # build production
npm run serve:ssr:<project-name>       # รัน build จริงที่ http://localhost:4000
npm run format                         # จัดรูปแบบโค้ดด้วย Prettier
npm run db:migration -- <description>  # สร้างไฟล์ migration ใหม่ใน supabase/migrations/
npm run db:types                       # สร้าง src/shared/types/database.types.ts จาก schema (ต้องมี supabase start รันอยู่)
```

Supabase CLI ติดมากับ `devDependencies` แล้ว ไม่ต้องติดตั้ง global — เรียกผ่าน `npx supabase <cmd>` หรือ script ด้านบนได้เลย

## เอกสารของ template

| ไฟล์                                         | เนื้อหา                                                               |
| -------------------------------------------- | --------------------------------------------------------------------- |
| [AGENTS.md](AGENTS.md)                       | กติกาการเขียนโค้ดทั้งหมด (Angular, SSR, API layer, Supabase, testing) |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | โครงสร้างโฟลเดอร์, การไหลของข้อมูล, ทิศทาง import, ขอบเขตของ template |
| `.claude/skills/system-spec-builder/`        | skill สำหรับสัมภาษณ์และเขียน spec ระบบใหม่                            |
