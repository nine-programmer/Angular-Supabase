# บันทึกงาน: Task 1 ตั้งชื่อโปรเจกต์ + หน้าแรก

- **วันที่/เวลา:** 2026-09-05 18:55
- **สถานะ:** สำเร็จ (ผ่านการทดสอบ)

## 1. สิ่งที่ทำ

- ตรวจ preflight ด้วย Node.js และตรวจการทำงานของ dev server กับ `/api/health`
- เปลี่ยนชื่อโปรเจกต์เป็น `barber-appointment`
- เปลี่ยนหน้า `/` ให้แสดงชื่อระบบ `ระบบจองคิวตัดผมออนไลน์` เท่านั้น

## 2. ไฟล์ที่แก้ไข

- `package.json`: เปลี่ยน package name และชื่อ/path ของ SSR serve script
- `angular.json`: เปลี่ยน project key และ build targets เป็น `barber-appointment`
- `supabase/config.toml`: เปลี่ยน `project_id` เป็น `barber-appointment`
- `src/app/app.ts`: เปลี่ยน title เป็นชื่อระบบภาษาไทย
- `src/app/app.html`: ลบข้อความ placeholder เหลือชื่อระบบ
- `src/index.html`: เปลี่ยน document title เป็นชื่อระบบ
- `docs/TASKS.md`: เปลี่ยนสถานะ Task 1 เป็น `[x]`, อัปเดตความคืบหน้า และอ้างอิง session log นี้

## 3. การตัดสินใจทางเทคนิค

เลือกคงโครง root component และใช้ signal `title` ที่มีอยู่แล้ว เพราะ Task 1 ต้องการเพียงหน้าแรกที่แสดงชื่อระบบ ยังไม่เพิ่ม layout หรือฟีเจอร์นอก Section 1

## 4. ปัญหาที่พบและวิธีแก้ (Troubleshooting)

- คำสั่ง `npm start` และ `npm test` ใน sandbox ล้มเหลวด้วย `Access is denied` ตอน Angular อ่านไดเรกทอรีและ dependency; รันนอก sandbox แล้ว build/test ผ่าน จึงเป็นข้อจำกัดของ environment ไม่ใช่ปัญหาของโค้ด
- preflight เดิมเคยบันทึก `/api/health` เป็น 503 แต่เมื่อตรวจซ้ำใน session นี้ dev server ตอบ `{"ok":true}` จึงดำเนิน Task 1 ต่อได้

## 5. วิธีทดสอบ

- `node -v` → `v26.7.0` ตรงตาม `engines`
- `npm run format` ผ่าน
- `npm test` ผ่าน 4 ไฟล์ / 13 tests
- `npm run build` ผ่าน และสร้าง output ที่ `dist/barber-appointment`
- เปิด dev server แล้วตรวจ `/` พบชื่อระบบ และ `/api/health` ตอบ `{"ok":true}`
- ผู้ใช้ตรวจหน้าเว็บและยืนยันว่า “ผ่าน”

## 6. Task ถัดไป

Task 2: Design UX/UI — สร้าง mockup 4 หน้าจอหลักใน `docs/design/mockup.html`, ให้ผู้ใช้ตรวจและปรับจนพอใจ จากนั้นสร้าง `docs/DESIGN.md` และลง design tokens ใน `src/styles.css`
