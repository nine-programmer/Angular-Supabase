# TASKS — [ชื่อระบบ หรือ ชื่อฟีเจอร์]

> จาก `docs/SYSTEM_SPEC.md` v1.0 [รอบ feature: `docs/features/<name>/SPEC.md` v1.0] | ผ่านแล้ว 0/[N] | Task ปัจจุบัน: 1 | อัปเดต: [YYYY-MM-DD]

สถานะ: `[ ]` รอทำ · `[~]` กำลังทำ · `[x]` ผ่าน (บรรทัด "ผล:" ตาม Section 0 ข้อ 5) · `[!]` ติดปัญหา (เขียนเหตุผลในบรรทัด "ผล:")

กฎ: 1 Task = 1 หน้าจอ หรือ 1 resource API พร้อมหน้าที่ใช้มัน — ไม่ใหญ่กว่านี้; รอบแรกปกติ 7–13 Task (ระบบเล็กมากน้อยกว่าได้ เกิน 15 ให้เสนอผู้ใช้ย้ายฟีเจอร์ไปรอบถัดไป); ลำดับ Task สลับได้ถ้าเขียนเหตุผลไว้ใต้บรรทัดนี้; ทุก Task ที่มีหน้าจอทำตาม `docs/DESIGN.md` (เกิดจาก Task 2); รอบ feature 2–6 Task: ข้าม 3 Task ตัวอย่างด้านล่าง (ชื่อโปรเจกต์, Design, ฐานข้อมูล) — Task 1 ของรอบ feature คือ migration (`npm run db:migration -- <name>`) + `npm run db:push` + `npm run db:types` + enums และหน้าจอใหม่ใช้ `docs/DESIGN.md` เดิม; ทำทีละ Task ผ่านก่อนค่อยไปต่อ; เขียน spec เฉพาะไฟล์ที่มีการคำนวณ / logic ซับซ้อน / ต้องแก้บ่อย (ตาม AGENTS.md → Testing) — CRUD ธรรมดาไม่ต้องมี spec

---

### [ ] Task 1: ตั้งชื่อโปรเจกต์ + หน้าแรก
- ทำ: **ตรวจความพร้อมก่อนเริ่ม** — (1) `node -v` ต้องเข้าเงื่อนไข `engines` ใน `package.json` ถ้าไม่ผ่านให้บอกผู้ใช้สลับเวอร์ชัน (เช่น `nvm use <version>`) ก่อน (2) `npm start` แล้วเปิด `/api/health` ต้องได้ `{ ok: true }` ถ้าไม่ได้ ให้ agent อ่านข้อความ error แล้ว**พาผู้ใช้แก้ทีละขั้น**ตาม README → "ปัญหาที่พบบ่อยตอนตั้งค่า" (ยังไม่มี `.env` / ยังไม่ `npx supabase login` / ใส่ anon key แทน service_role / ยังไม่ `db:push`) จนได้ `{ ok: true }` ก่อนจึงเริ่มงานของ Task; จากนั้นตั้งชื่อ `[project-name]` (แก้ `name` ใน package.json, เปลี่ยน **key ของ project** ใน angular.json จาก `angular-supabase` เป็น `[project-name]` เพราะ `outputPath` อิงชื่อนั้น, เปลี่ยน script `serve:ssr:angular-supabase` เป็น `serve:ssr:[project-name]` และ path `dist/[project-name]/...`, และ `project_id` ใน `supabase/config.toml`); หน้า `/` แสดงชื่อระบบเฉยๆ (แก้ `title` ใน `src/app/app.ts`, ข้อความใน `src/app/app.html` ซึ่งเป็น placeholder ของ template และ `<title>` ใน `src/index.html`) — การเชื่อม Supabase (`.env`, login, link, `db:push` migration `health`) ทำไปแล้วตอน clone template ตาม README ไม่ใช่งานของ Task นี้; โครง server (`src/server/env.ts`, `supabase.ts`, `api.ts`, `routes/health.routes.ts`, `services/health-server.service.ts`), interceptor ตอน SSR ทั้ง 2 ตัว (`src/app/core/api-origin.interceptor.ts`, `ssr-cookie.interceptor.ts`), `api-error.ts`, `thai-date.ts` และ `provideHttpClient` ทั้งสองฝั่งมากับ template แล้ว ไม่ต้องสร้างใหม่
- ทดสอบ: `npm start` เปิด http://localhost:4200 เห็นชื่อระบบ; เปิด `/api/health` เห็น `{ ok: true }` (ถ้าได้ `ok: false` agent พาผู้ใช้แก้ตาม README → "ปัญหาที่พบบ่อยตอนตั้งค่า" จนผ่าน — การเชื่อม Supabase เป็นงาน setup ของ README ไม่ใช่ของ Task นี้ แต่ต้องผ่านก่อนไป Task ถัดไป); `npm test` ผ่าน
- ผล: —

### [ ] Task 2: Design UX/UI

- ทำ: อ่าน SPEC 1.2 (ผู้ใช้/อุปกรณ์), 1.3 (ฟีเจอร์), 1.6 (ขั้นตอน), 1.9 (โทนที่ผู้ใช้บอกไว้) → สร้าง mockup หน้าจอหลัก [3–5 หน้า — ระบุชื่อหน้าจาก SPEC 2.3 เช่น `/login`, `/items`, ...] เป็น HTML ไฟล์เดียว `docs/design/mockup.html` (มือถือ 375px เป็นหลัก, ใช้ Tailwind Play CDN เพื่อเปิดดูได้โดยไม่ต้อง build — ห้ามเพิ่ม path นี้เข้า `@source`) โดยใช้ฟอนต์ไทยจาก Google Fonts (เสนอ 2–3 ตัวเลือกจากรายการใน template DESIGN.md ให้ผู้ใช้เลือก) และไอคอนจริงจาก Material Symbols — **ห้ามใช้ emoji เป็นไอคอน/ของตกแต่ง** → ให้ผู้ใช้เปิดดูแล้วติชม แก้จนผู้ใช้พอใจ → สรุปเป็น `docs/DESIGN.md` ตามโครง `.claude/skills/system-spec-builder/templates/DESIGN.md` (โทน, design tokens, ฟอนต์+ไอคอน, component patterns, layout, คู่สีผ่าน AA) → ลง token ใน `@theme` ของ `src/styles.css` + โหลดฟอนต์/ไอคอนใน `src/index.html`
- ทดสอบ: ผู้ใช้เปิด `docs/design/mockup.html` แล้วยืนยันว่าหน้าตาตรงที่ต้องการ; ทุกคู่สีใน DESIGN.md ระบุ ratio และผ่าน WCAG AA; `npm test` ผ่าน — Task นี้ผ่านแล้ว `docs/DESIGN.md` ถือว่า LOCKED (แก้ = bump เวอร์ชัน) [ระบบที่มีไม่เกิน 2 หน้าจอ: AI เสนอข้าม mockup แล้วเขียน `docs/DESIGN.md` ให้ผู้ใช้ดูตรงๆ ได้ ผู้ใช้เป็นคนตัดสิน]; แก้ตามคำติชมได้ไม่จำกัด แต่ถ้าเกิน 3 รอบให้เสนอทางเลือก 2 แบบให้ผู้ใช้เลือกแทนการแก้ทีละจุด
- ผล: —

### [ ] Task 3: ฐานข้อมูล
- ทำ: `npm run db:migration -- init` → เขียนไฟล์ที่ได้ใน `supabase/migrations/` (ต่อจาก `*_health.sql` ที่มากับ template — ห้ามแก้ไฟล์นั้น) สร้างตารางตาม SPEC 1.5 + constraint/function ตาม 1.7 + เปิด RLS ทุกตาราง; ข้อมูลตัวอย่างตาม SPEC 1.9 (ถ้ามี); `npm run db:push` → `npm run db:types`; `src/shared/enums/[name].enums.ts` ค่าสถานะตรงกับ `CHECK`; `/api/health` เพิ่ม `count` ของตารางหลักต่อจากการเรียก `health()` เดิม → ตอบ `{ ok: true, count: N }`
- ทดสอบ: `npm run db:push` สำเร็จ; เปิด `/api/health` เห็น count ตรงกับข้อมูลตัวอย่าง; agent เขียน SQL block ให้ผู้ใช้วางใน Supabase Dashboard → SQL Editor แล้วกด Run [เรียก function ตาม 1.7 ด้วยค่าที่ต้องถูกปฏิเสธ — 1 block ต่อ 1 กรณี เพราะ error แรกทำให้ transaction หยุดทั้งก้อน; แต่ละ block สร้างข้อมูลทดสอบเองและ rollback ตัวเอง] แล้วต้องเห็นข้อความ error ภาษาไทยตามที่ agent ระบุ — ถ้าเห็น Success แทน error แปลว่ากติกาไม่ทำงาน ให้แจ้ง agent; `npm test` ผ่าน
- ผล: —

### [ ] Task 4: F1 [ชื่อฟีเจอร์]
- ทำ: API [ ] (`src/server/routes/[name].routes.ts` + `src/server/services/[name]-server.service.ts`, dto ใน `src/shared/dto/[name].dto.ts`); หน้า `[path]` ใน `src/app/features/[name]/` + `[name]-client.service.ts` ตาม pattern ใน `docs/DESIGN.md`; route lazy-load ใน `app.routes.ts` และ RenderMode ใน `app.routes.server.ts`
- ทดสอบ: [พฤติกรรมที่ผู้ใช้เห็น][; spec `[file].spec.ts`: [สิ่งที่ตรวจ เช่น การคำนวณ X] ผ่าน `npm test` — ใส่เฉพาะเมื่อ Task นี้มีไฟล์ที่มีการคำนวณ / logic ซับซ้อน / ต้องแก้บ่อย]
- ผล: —

[ต่อไปจนครบทุกฟีเจอร์ใน SPEC 1.3]

### [ ] Task [N]: ปิดงาน
- ทำ: ไล่เช็ค SPEC 1.8 ทุกข้อ; ทุกหน้าที่ 375px; ทุกหน้าใช้ token/pattern ตาม `docs/DESIGN.md` (ไม่มีสีหรือปุ่มนอกระบบ); error ทุกจุดแสดงข้อความไทย; เขียน README.md (วิธีตั้ง Supabase, วิธีรัน, วิธี deploy (build `npm run build`, start `npm run serve:ssr:[project-name]`, Node เวอร์ชันตาม `engines` ใน package.json), ตัวแปร .env — ย้ำว่า `NG_ALLOWED_HOSTS` ต้องเป็นโดเมนจริงก่อน deploy ไม่งั้นทุกหน้าได้ 400)
- ทดสอบ: คนอื่นอ่าน README แล้วรันได้โดยไม่ต้องถาม
- ผล: —
