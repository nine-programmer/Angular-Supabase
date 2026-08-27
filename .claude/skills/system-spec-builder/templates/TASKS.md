# TASKS — [ชื่อระบบ หรือ ชื่อฟีเจอร์]

> จาก `docs/SYSTEM_SPEC.md` v1.0 [รอบ feature: `docs/features/<name>/SPEC.md` v1.0] | ผ่านแล้ว 0/[N] | Task ปัจจุบัน: 1 | อัปเดต: [YYYY-MM-DD]

สถานะ: `[ ]` รอทำ · `[~]` กำลังทำ · `[x]` ผ่าน (บรรทัด "ผล:" ตาม Section 0 ข้อ 5) · `[!]` ติดปัญหา (เขียนเหตุผลในบรรทัด "ผล:")

กฎ: 1 Task = 1 หน้าจอ หรือ 1 resource API พร้อมหน้าที่ใช้มัน — ไม่ใหญ่กว่านี้; รอบแรก 6–12 Task; รอบ feature 2–6 Task: ข้าม 2 Task ตัวอย่างด้านล่าง — Task 1 ของรอบ feature คือ migration (`npm run db:migration -- <name>`) + `npm run db:push` + `npm run db:types` + enums; ทำทีละ Task ผ่านก่อนค่อยไปต่อ; เขียน spec เฉพาะไฟล์ที่มีการคำนวณ / logic ซับซ้อน / ต้องแก้บ่อย (ตาม AGENTS.md → Testing) — CRUD ธรรมดาไม่ต้องมี spec

---

### [ ] Task 1: ตั้งชื่อโปรเจกต์ + หน้าแรก
- ทำ: ตั้งชื่อ `[project-name]` (แก้ `name` ใน package.json และ angular.json, เปลี่ยน script `serve:ssr:angular-supabase` เป็น `serve:ssr:[project-name]` และ path `dist/[project-name]/...`, และ `project_id` ใน `supabase/config.toml`); หน้า `/` แสดงชื่อระบบเฉยๆ (แก้ `title` ใน `src/app/app.ts`, ข้อความใน `src/app/app.html` ซึ่งเป็น placeholder ของ template และ `<title>` ใน `src/index.html`) — การเชื่อม Supabase (`.env`, login, link, `db:push` migration `health`) ทำไปแล้วตอน clone template ตาม README ไม่ใช่งานของ Task นี้; โครง server (`src/server/env.ts`, `supabase.ts`, `api.ts`, `routes/health.routes.ts`, `services/health-server.service.ts`), interceptor (`src/app/core/api-origin.interceptor.ts`) และ `provideHttpClient` ทั้งสองฝั่งมากับ template แล้ว ไม่ต้องสร้างใหม่
- ทดสอบ: `npm start` เปิด http://localhost:4200 เห็นชื่อระบบ; เปิด `/api/health` เห็น `{ ok: true }` (ถ้าได้ `ok: false` ให้ผู้ใช้กลับไปทำ README ข้อ 2 ให้ครบก่อน — ไม่ใช่ปัญหาของ Task นี้); `npm test` ผ่าน
- ผล: —

### [ ] Task 2: ฐานข้อมูล
- ทำ: `npm run db:migration -- init` → เขียนไฟล์ที่ได้ใน `supabase/migrations/` (ต่อจาก `*_health.sql` ที่มากับ template — ห้ามแก้ไฟล์นั้น) สร้างตารางตาม SPEC 1.5 + constraint/function ตาม 1.7 + เปิด RLS ทุกตาราง; ข้อมูลตัวอย่างตาม SPEC 1.9 (ถ้ามี); `npm run db:push` → `npm run db:types`; `src/shared/enums/[name].enums.ts` ค่าสถานะตรงกับ `CHECK`; `/api/health` เพิ่ม `count` ของตารางหลักต่อจากการเรียก `health()` เดิม → ตอบ `{ ok: true, count: N }`
- ทดสอบ: `npm run db:push` สำเร็จ; เปิด `/api/health` เห็น count ตรงกับข้อมูลตัวอย่าง; [เรียก function ตาม 1.7 ด้วยค่าที่ต้องถูกปฏิเสธ → ต้อง error]
- ผล: —

### [ ] Task 3: F1 [ชื่อฟีเจอร์]
- ทำ: API [ ] (`src/server/routes/[name].routes.ts` + `src/server/services/[name]-server.service.ts`, dto ใน `src/shared/dto/[name].dto.ts`); หน้า `[path]` ใน `src/app/features/[name]/` + `[name]-client.service.ts`; route lazy-load ใน `app.routes.ts` และ RenderMode ใน `app.routes.server.ts`
- ทดสอบ: [พฤติกรรมที่ผู้ใช้เห็น][; spec `[file].spec.ts`: [สิ่งที่ตรวจ เช่น การคำนวณ X] ผ่าน `npm test` — ใส่เฉพาะเมื่อ Task นี้มีไฟล์ที่มีการคำนวณ / logic ซับซ้อน / ต้องแก้บ่อย]
- ผล: —

[ต่อไปจนครบทุกฟีเจอร์ใน SPEC 1.3]

### [ ] Task [N]: ปิดงาน
- ทำ: ไล่เช็ค SPEC 1.8 ทุกข้อ; ทุกหน้าที่ 375px; error ทุกจุดแสดงข้อความไทย; เขียน README.md (วิธีตั้ง Supabase, วิธีรัน, วิธี deploy, ตัวแปร .env — ย้ำว่า `NG_ALLOWED_HOSTS` ต้องเป็นโดเมนจริงก่อน deploy ไม่งั้นทุกหน้าได้ 400)
- ทดสอบ: คนอื่นอ่าน README แล้วรันได้โดยไม่ต้องถาม
- ผล: —
