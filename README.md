# Angular-Supabase

Template ตั้งต้นสำหรับสร้าง mini app ต่อลูกค้า 1 repo — Angular SSR ทำหน้าที่ทั้ง frontend และ API (`/api/*`) โดยมีแค่ server เท่านั้นที่เชื่อม Supabase (ดูรายละเอียดสถาปัตยกรรมที่ [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) และกติกาการเขียนโค้ดที่ [AGENTS.md](AGENTS.md))

## เริ่มใช้งานระบบใหม่

### 1. Clone template ไปเป็นโปรเจกต์ของลูกค้า

คัดลอก template ไปเป็นโฟลเดอร์ใหม่ (ดาวน์โหลด ZIP แล้วแตกไฟล์ หรือ `git clone` ถ้ามี git) เช็คเวอร์ชัน Node ก่อน (`node -v` ต้องเข้าเงื่อนไข `engines` ใน `package.json` — Angular CLI 22 ปฏิเสธเวอร์ชันที่ต่ำกว่านั้นตอนรัน ถ้าไม่ผ่านให้สลับด้วย nvm เช่น `nvm install 26 && nvm use 26`) แล้วติดตั้ง:

```bash
cd <ชื่อโปรเจกต์ลูกค้า>
node -v        # ต้องเข้าเงื่อนไข engines ใน package.json
npm install
```

### 2. ตั้งค่า Supabase (ทำได้ทันที ไม่ต้องรอ spec)

สร้างโปรเจกต์ใหม่ที่ [supabase.com](https://supabase.com) แล้วคัดลอก `.env.example` เป็น `.env`:

```bash
cp .env.example .env
```

ใส่ค่า `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` ตามคำอธิบายในไฟล์ (ไฟล์ `.env` อยู่เครื่องนี้เท่านั้น ห้ามส่งต่อ อัปโหลด หรือให้ AI agent อ่าน — agent อ่าน `.env.example` แทน) แล้วเชื่อม Supabase CLI กับโปรเจกต์ครั้งเดียว — ไม่ต้องมี Docker:

```bash
npx supabase login                       # เปิด browser ให้ล็อกอิน
npm run db:link -- --project-ref <ref>   # <ref> คือรหัสใน URL: supabase.com/dashboard/project/<ref> (ถ้าถามรหัสผ่านฐานข้อมูล ใส่รหัสที่ตั้งตอนสร้างโปรเจกต์)
npm run db:push                          # ส่ง migration ที่มากับ template (function health()) ขึ้นโปรเจกต์
npm run db:types                         # สร้าง type จากโปรเจกต์ที่ link ไว้
```

ตรวจว่าเชื่อมได้จริง: `npm start` แล้วเปิด http://localhost:4200/api/health ต้องได้ `{"ok":true}` — ถ้าไม่ได้ ข้อความ `error` จะบอกว่าต้องแก้ตรงไหน (URL ผิด / key ผิดหรือเป็น anon key / ยังไม่ได้ `db:push`) และดูวิธีแก้ทีละอาการที่หัวข้อ "ปัญหาที่พบบ่อยตอนตั้งค่า" ด้านล่าง ถึงตรงนี้โปรเจกต์พร้อมรับ migration ของระบบจริงแล้ว

### 3. เขียน spec ด้วย skill `system-spec-builder`

เปิดโปรเจกต์ด้วย Claude Code (หรือ AI agent ที่รองรับ skill นี้) แล้วพิมพ์ไอเดียของระบบเป็นประโยคเดียว เช่น "อยากได้ระบบยืมคืนอุปกรณ์ในออฟฟิศ" — skill จะ:

1. เช็คว่าไอเดียอยู่ในขอบเขตของ template ไหม (ตาราง 3 ระดับอยู่ใน `.claude/skills/system-spec-builder/references/template-scope.md`; [ARCHITECTURE.md ข้อ 10](docs/ARCHITECTURE.md) มีเกณฑ์ตัดสินเร็ว)
2. เทียบกับ pattern สำเร็จรูป (ยืม-คืน, จองคิว, ลงทะเบียน, สต็อก, คำขอ/ใบแจ้ง, รายการทั่วไป) ถ้าตรง
3. สัมภาษณ์เป็นรอบสั้นๆ จนข้อมูลครบพอจะสร้างระบบได้จริง (ไม่ถามซ้ำสิ่งที่รู้แล้ว)
4. สรุปให้ยืนยันก่อนเขียนไฟล์
5. เขียน `docs/SYSTEM_SPEC.md` (สิ่งที่ต้องสร้าง — locked หลัง review) และ `docs/TASKS.md` (ลำดับงาน + ความคืบหน้า)
6. หยุดถามคุณว่าจะให้ใครตรวจแบบ "Tech Lead ขี้บ่น": ให้ skill เปิด subagent ตรวจใน session นี้เลย หรือคุณเอาไปตรวจเอง (สลับ model / เปิด session ใหม่ / ใช้ AI ตัวอื่น) — แบบหลัง skill จะพิมพ์ข้อความสำเร็จรูปให้ 2 ก้อน คือก้อนที่ส่งให้ตัวตรวจ และก้อนที่วางผลกลับมาให้แก้ (วางใน session ใหม่ก็ได้ skill จะอ่านสถานะ "ร่าง (รอ review)" ในหัว SPEC แล้วทำต่อโดยไม่สัมภาษณ์ซ้ำ) แก้จนตัวตรวจตอบ APPROVED แล้วจึงเปลี่ยนสถานะเป็น "พร้อมสร้าง"

### 4. สั่งให้ agent เริ่มสร้างทีละ Task

เปิดแชทใหม่กับ agent แล้วพิมพ์:

```
อ่าน docs/SYSTEM_SPEC.md แล้วเริ่มตาม Section 0
```

Agent จะอ่าน `AGENTS.md` → `docs/ARCHITECTURE.md` → `docs/SYSTEM_SPEC.md` → `docs/DESIGN.md` (เมื่อมีแล้ว) → `docs/TASKS.md` แล้วทำทีละ Task เท่านั้น ทุก Task จะบอกวิธีทดสอบที่คุณทำได้เองในเบราว์เซอร์ (ไม่ต้องใช้ curl หรือเขียน SQL เอง — ถ้าต้องตรวจฐานข้อมูล agent จะเขียน SQL ให้คุณวางใน Supabase SQL Editor) เมื่อคุณบอก "ผ่าน" agent จะถามคำถามเดียว: บันทึกงานลง `.sessions/` ไหม และจะทำ Task ถัดไปที่นี่หรือเปิดแชทใหม่ (ตอบสั้นๆ เช่น "บันทึก, ต่อเลย" — agent ไม่เริ่ม Task ถัดไปเอง) Task 2 คือการออกแบบหน้าตา: คุณจะได้ `docs/design/mockup.html` เปิดดูในเบราว์เซอร์แล้วติชมจนพอใจก่อนที่จะมีการสร้างหน้าจอจริง — ความคืบหน้าทั้งหมดอยู่ใน `docs/TASKS.md` เปิดแชทใหม่กี่ครั้งก็ทำต่อจากเดิมได้

ใช้ได้กับ agent ที่แก้ไฟล์ใน repo และรันคำสั่งได้ (Claude Code, Cursor, Codex, Gemini CLI, GitHub Copilot agent) — เว็บแชทที่ไม่เห็นไฟล์ใช้ช่วยเขียน/ตรวจ spec ได้ แต่ไม่ใช้สร้างระบบ

### 5. เมื่อมีฟีเจอร์ใหม่ในรอบถัดไป

เรียก skill `system-spec-builder` อีกครั้งพร้อมบอกฟีเจอร์ที่ต้องการ — จะได้ `docs/features/<name>/SPEC.md` + `TASKS.md` แยกต่างหาก โดยอ้างอิงตารางเดิมจาก `docs/SYSTEM_SPEC.md`

## ปัญหาที่พบบ่อยตอนตั้งค่า

เจอจริงจากการใช้งาน — ไล่เช็คตามนี้ก่อนถามใคร (ทุกข้อจบแล้วเปิด http://localhost:4200/api/health ต้องได้ `{"ok":true}`):

| อาการ                                                           | สาเหตุ                                                                   | วิธีแก้                                                                                                                                                                                          |
| --------------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Missing required environment variable: SUPABASE_URL`           | ยังไม่มีไฟล์ `.env` หรือยังไม่ได้ใส่ค่า                                  | `cp .env.example .env` แล้วใส่ค่า `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` ตาม comment ในไฟล์                                                                                                 |
| Supabase CLI: `Access token not provided`                       | ยังไม่ได้ล็อกอิน CLI ก่อน link/push                                      | รัน `npx supabase login` ให้เสร็จก่อน แล้วค่อย `npm run db:link -- --project-ref <ref>` และ `npm run db:push`                                                                                    |
| `/api/health` บอกว่า key ไม่ถูกต้อง หรือเป็น anon key           | คัดลอก key ผิดตัว — เอา public `anon` key มาใส่แทน `service_role` secret | Dashboard → `https://supabase.com/dashboard/project/<ref>/settings/api-keys/legacy` → แท็บ **Legacy anon, service_role API keys** → กด **Reveal** ที่ `service_role` secret แล้วคัดลอกใส่ `.env` |
| Angular CLI ปฏิเสธเวอร์ชัน Node (`does not support Node.js vX`) | Node บนเครื่องต่ำกว่าที่ Angular CLI 22 ต้องการ                          | สลับเวอร์ชันด้วย nvm ให้เข้าเงื่อนไข `engines` ใน `package.json` เช่น `nvm install 26 && nvm use 26` แล้ว `npm install` ใหม่                                                                     |

หมายเหตุ: หน้า Dashboard ของ Supabase เปลี่ยน UI ได้เรื่อยๆ — ถ้าเมนูไม่ตรงกับข้างบน ให้หาคำว่า "API keys" ใน Project Settings แล้วมองหา key ที่ระบุว่า `service_role` / `secret`

## คำสั่งที่ใช้บ่อย

```bash
npm install
npm start                              # dev server (SSR) ที่ http://localhost:4200
npm test                               # รัน unit test (Vitest)
npm run build                          # build production
npm run serve:ssr:<project-name>       # รัน build จริงที่ http://localhost:4000
npm run format                         # จัดรูปแบบโค้ดด้วย Prettier
npm run db:link -- --project-ref <ref> # เชื่อม CLI กับโปรเจกต์ Supabase (ครั้งเดียว)
npm run db:migration -- <description>  # สร้างไฟล์ migration ใหม่ใน supabase/migrations/
npm run db:push                        # apply migration ขึ้นโปรเจกต์ Supabase
npm run db:types                       # สร้าง src/shared/types/database.types.ts จากโปรเจกต์ที่ link ไว้ (ต้อง login + link ก่อน ไม่งั้นคำสั่งจะล้มเหลวโดยไม่แตะไฟล์เดิม)
```

Supabase CLI ติดมากับ `devDependencies` แล้ว ไม่ต้องติดตั้ง global — เรียกผ่าน `npx supabase <cmd>` หรือ script ด้านบนได้เลย

Template มี migration มาให้ 1 ไฟล์ (`supabase/migrations/*_health.sql` → function `health()` ที่เรียกได้เฉพาะ `service_role`) ซึ่ง `GET /api/health` ใช้ตรวจว่า `.env` และ `db:push` ใช้ได้ — ห้ามลบหรือเปลี่ยนชื่อ migration ของระบบจริงจะต่อจากไฟล์นี้ไป

## Deploy

Render (หรือ host Node ใดๆ): Build command `npm ci && npm run build` · Start command `node dist/<project-name>/server/server.mjs` · Node ตาม `engines` ใน `package.json` · ตั้ง env `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NG_ALLOWED_HOSTS=<โดเมนจริง>` ใน dashboard ของ host (`PORT` host ตั้งให้เอง) · ห้ามตั้ง CDN cache หน้า HTML — รายละเอียดใน [ARCHITECTURE.md ข้อ 8](docs/ARCHITECTURE.md)

## เอกสารของ template

| ไฟล์                                         | เนื้อหา                                                                                                           |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| [AGENTS.md](AGENTS.md)                       | กติกาการเขียนโค้ดทั้งหมด (Angular, SSR, API layer, Supabase, testing)                                             |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | โครงสร้างโฟลเดอร์, การไหลของข้อมูล, ทิศทาง import, ขอบเขตของ template                                             |
| `.claude/skills/system-spec-builder/`        | skill สำหรับสัมภาษณ์และเขียน spec ระบบใหม่                                                                        |
| `.agents/skills/`                            | สำเนาของ `.claude/skills/` สำหรับ AI agent เจ้าอื่น — ต้องเหมือนกันทุกไฟล์ ถ้าแก้ฝั่งหนึ่งให้คัดลอกทับอีกฝั่งเสมอ |

Skill ภายนอก (`supabase-postgres-best-practices`, `angular-developer`, `angular-new-app` — บันทึกไว้ใน `skills-lock.json`) เป็นความรู้ทั่วไป ส่วน `tailwind-css-patterns` (แก้จากของเดิมให้รองรับ Angular โดยตรง) และ `system-spec-builder` ดูแลเองในเทมเพลตนี้ จึงไม่อยู่ใน lock file ทั้งหมดนี้ถ้าขัดกับ `AGENTS.md` ให้ยึด `AGENTS.md` (เช่น template นี้ไม่ใช้ local database / Docker และไม่เขียน RLS policy) — skill `supabase` ของ Supabase ถูกเอาออกโดยตั้งใจ เพราะเนื้อหาส่วนใหญ่เป็น Auth/Realtime/Storage ฝั่ง client และ workflow แบบ local ที่ template นี้ไม่ใช้ ไม่ต้องติดตั้งกลับ
