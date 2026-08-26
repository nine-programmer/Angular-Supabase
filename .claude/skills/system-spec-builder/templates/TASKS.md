# TASKS — [ชื่อระบบ หรือ ชื่อฟีเจอร์]

> จาก `docs/SYSTEM_SPEC.md` v1.0 [รอบ feature: `docs/features/<name>/SPEC.md` v1.0] | ผ่านแล้ว 0/[N] | Task ปัจจุบัน: 1 | อัปเดต: [YYYY-MM-DD]

สถานะ: `[ ]` รอทำ · `[~]` กำลังทำ · `[x]` ผ่าน · `[!]` ติดปัญหา (เขียนเหตุผลในบรรทัด "ผล:")

กฎ: 1 Task = 1 หน้าจอ หรือ 1 resource API พร้อมหน้าที่ใช้มัน — ไม่ใหญ่กว่านี้; รอบแรก 6–12 Task; รอบ feature 2–6 Task ไม่มี Task 1–3 ด้านล่าง เริ่มที่ migration `NNN_<name>.sql` + gen types + enums; ทำทีละ Task ผ่านก่อนค่อยไปต่อ; ทุก Task ที่เพิ่ม service ต้องมี spec ผ่าน `npm test`

---

### [ ] Task 1: ตั้งโปรเจกต์
- ทำ: clone template `Angular-Supabase` → ตั้งชื่อ `[project-name]` (แก้ `name` ใน package.json และ angular.json, เปลี่ยน script `serve:ssr:angular-supabase` เป็น `serve:ssr:[project-name]` และ path `dist/[project-name]/...`) → `npm install`; หน้า `/` แสดงชื่อระบบเฉยๆ
- ทดสอบ: `npm start` เปิด http://localhost:4200 เห็นชื่อระบบ; `npm test` ผ่าน
- ผล: —

### [ ] Task 2: โครง server + เชื่อม Supabase
- ทำ: `npm i @supabase/supabase-js dotenv`; สร้าง `.env.example` (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `PORT`) และ `.env` ใส่ค่าจริง; `src/server/env.ts` (โหลด `.env` ด้วย dotenv แล้วตรวจว่าครบ); `src/server/supabase.ts` (`createClient<Database>` ตัวเดียว `persistSession: false`); `src/server/routes/health.routes.ts` ตอบ `{ ok: true }`; `src/server/api.ts` รวม router; mount `/api` ใน `src/server.ts` ก่อน handler ของ Angular; `provideHttpClient(withFetch())` ใน `app.config.ts`; `src/app/core/api-origin.interceptor.ts` เติม origin ของ request ที่เข้ามา (`new URL(inject(REQUEST).url).origin` ถ้าไม่มีใช้ `http://localhost:${PORT}`) ให้ URL `/api/*` ตอน SSR และลงทะเบียนด้วย `withInterceptors` ใน `app.config.server.ts`; `supabase gen types typescript` บนโปรเจกต์ที่ยังไม่มีตาราง → `src/shared/types/database.types.ts` (ได้ type ว่างที่ถูกต้อง)
- ทดสอบ: `npm start` แล้วเปิด `/api/health` เห็น `{ ok: true }`; หน้า `/` เรียก `/api/health` ด้วย `httpResource()` และ view-source ต้องมีผลลัพธ์ฝังมา (SSR ผ่าน interceptor สำเร็จ); ลบ `.env` แล้วรัน server ต้อง error บอกชื่อตัวแปรที่ขาด
- ผล: —

### [ ] Task 3: ฐานข้อมูล
- ทำ: `supabase init` (ถ้ายังไม่มีโฟลเดอร์ `supabase/`) → `supabase/migrations/001_init.sql` สร้างตารางตาม SPEC 1.5 + constraint/function ตาม 1.7 + เปิด RLS ทุกตาราง; ข้อมูลตัวอย่างตาม SPEC 1.9 (ถ้ามี); `supabase gen types typescript` → `src/shared/types/database.types.ts`; `src/shared/enums/[name].enums.ts` ค่าสถานะตรงกับ `CHECK`; `/api/health` เปลี่ยนเป็นตอบ `{ ok: true, count: N }`
- ทดสอบ: รัน migration สำเร็จ; เปิด `/api/health` เห็น count ตรงกับข้อมูลตัวอย่าง; [เรียก function ตาม 1.7 ด้วยค่าที่ต้องถูกปฏิเสธ → ต้อง error]
- ผล: —

### [ ] Task 4: F1 [ชื่อฟีเจอร์]
- ทำ: API [ ] (`src/server/routes/[name].routes.ts` + `src/server/services/[name]-server.service.ts`, dto ใน `src/shared/dto/[name].dto.ts`); หน้า `[path]` ใน `src/app/features/[name]/` + `[name]-client.service.ts`; route lazy-load ใน `app.routes.ts` และ RenderMode ใน `app.routes.server.ts`
- ทดสอบ: [พฤติกรรมที่ผู้ใช้เห็น]; spec ทั้งสองฝั่งผ่าน `npm test`
- ผล: —

[ต่อไปจนครบทุกฟีเจอร์ใน SPEC 1.3]

### [ ] Task [N]: ปิดงาน
- ทำ: ไล่เช็ค SPEC 1.8 ทุกข้อ; ทุกหน้าที่ 375px; error ทุกจุดแสดงข้อความไทย; เขียน README.md (วิธีตั้ง Supabase, วิธีรัน, วิธี deploy, ตัวแปร .env)
- ทดสอบ: คนอื่นอ่าน README แล้วรันได้โดยไม่ต้องถาม
- ผล: —
