# Angular-Supabase

Template ตั้งต้นสำหรับสร้าง mini app ต่อลูกค้า 1 repo — Angular SSR ทำหน้าที่ทั้ง frontend และ API (`/api/*`) โดยมีแค่ server เท่านั้นที่เชื่อม Supabase (ดูรายละเอียดสถาปัตยกรรมที่ [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) และกติกาการเขียนโค้ดที่ [AGENTS.md](AGENTS.md))

## เริ่มใช้งานระบบใหม่

### 1. Clone template ไปเป็นโปรเจกต์ของลูกค้า

คัดลอก template ไปเป็นโฟลเดอร์ใหม่ (ดาวน์โหลด ZIP แล้วแตกไฟล์ หรือ `git clone` ถ้ามี git) แล้วติดตั้ง:

```bash
cd <ชื่อโปรเจกต์ลูกค้า>
npm install
```

### 2. เขียน spec ด้วย skill `system-spec-builder`

เปิดโปรเจกต์ด้วย Claude Code (หรือ AI agent ที่รองรับ skill นี้) แล้วพิมพ์ไอเดียของระบบเป็นประโยคเดียว เช่น "อยากได้ระบบยืมคืนอุปกรณ์ในออฟฟิศ" — skill จะ:

1. เช็คว่าไอเดียอยู่ในขอบเขตของ template ไหม (ตาราง 3 ระดับอยู่ใน `.claude/skills/system-spec-builder/references/template-scope.md`; [ARCHITECTURE.md ข้อ 10](docs/ARCHITECTURE.md) มีเกณฑ์ตัดสินเร็ว)
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

ใส่ค่า `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` ให้ครบ (ไฟล์ `.env` อยู่เครื่องนี้เท่านั้น ห้ามส่งต่อหรืออัปโหลด) แล้วเชื่อม Supabase CLI กับโปรเจกต์ครั้งเดียว — ไม่ต้องมี Docker:

```bash
npx supabase login                       # เปิด browser ให้ล็อกอิน
npm run db:link -- --project-ref <ref>   # <ref> คือรหัสใน URL: supabase.com/dashboard/project/<ref> (ถ้าถามรหัสผ่านฐานข้อมูล ใส่รหัสที่ตั้งตอนสร้างโปรเจกต์)
```

### 4. สั่งให้ agent เริ่มสร้างทีละ Task

เปิดแชทใหม่กับ agent แล้วพิมพ์:

```
อ่าน docs/SYSTEM_SPEC.md แล้วเริ่มตาม Section 0
```

Agent จะอ่าน `AGENTS.md` → `docs/ARCHITECTURE.md` → `docs/SYSTEM_SPEC.md` → `docs/TASKS.md` แล้วทำทีละ Task เท่านั้น รอให้คุณทดสอบแล้วบอก "ผ่าน" จากนั้น agent จะถามว่าจะบันทึกงานลง `.sessions/` ไหม และถามว่าจะทำ Task ถัดไปใน session นี้หรือเปิดใหม่ (agent ไม่เริ่ม Task ถัดไปเอง) — ความคืบหน้าทั้งหมดถูกบันทึกไว้ใน `docs/TASKS.md` เปิดแชทใหม่กี่ครั้งก็ทำต่อจากเดิมได้

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
npm run db:link -- --project-ref <ref> # เชื่อม CLI กับโปรเจกต์ Supabase (ครั้งเดียว)
npm run db:migration -- <description>  # สร้างไฟล์ migration ใหม่ใน supabase/migrations/
npm run db:push                        # apply migration ขึ้นโปรเจกต์ Supabase
npm run db:types                       # สร้าง src/shared/types/database.types.ts จากโปรเจกต์ที่ link ไว้ (ต้อง login + link ก่อน ไม่งั้นคำสั่งจะล้มเหลวโดยไม่แตะไฟล์เดิม)
```

Supabase CLI ติดมากับ `devDependencies` แล้ว ไม่ต้องติดตั้ง global — เรียกผ่าน `npx supabase <cmd>` หรือ script ด้านบนได้เลย

## เอกสารของ template

| ไฟล์                                         | เนื้อหา                                                                                                           |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| [AGENTS.md](AGENTS.md)                       | กติกาการเขียนโค้ดทั้งหมด (Angular, SSR, API layer, Supabase, testing)                                             |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | โครงสร้างโฟลเดอร์, การไหลของข้อมูล, ทิศทาง import, ขอบเขตของ template                                             |
| `.claude/skills/system-spec-builder/`        | skill สำหรับสัมภาษณ์และเขียน spec ระบบใหม่                                                                        |
| `.agents/skills/`                            | สำเนาของ `.claude/skills/` สำหรับ AI agent เจ้าอื่น — ต้องเหมือนกันทุกไฟล์ ถ้าแก้ฝั่งหนึ่งให้คัดลอกทับอีกฝั่งเสมอ |

Skill ภายนอก (`supabase-postgres-best-practices`, `angular-developer`, `angular-new-app` — บันทึกไว้ใน `skills-lock.json`) เป็นความรู้ทั่วไป ส่วน `tailwind-css-patterns` (แก้จากของเดิมให้รองรับ Angular โดยตรง) และ `system-spec-builder` ดูแลเองในเทมเพลตนี้ จึงไม่อยู่ใน lock file ทั้งหมดนี้ถ้าขัดกับ `AGENTS.md` ให้ยึด `AGENTS.md` (เช่น template นี้ไม่ใช้ local database / Docker และไม่เขียน RLS policy) — skill `supabase` ของ Supabase ถูกเอาออกโดยตั้งใจ เพราะเนื้อหาส่วนใหญ่เป็น Auth/Realtime/Storage ฝั่ง client และ workflow แบบ local ที่ template นี้ไม่ใช้ ไม่ต้องติดตั้งกลับ
