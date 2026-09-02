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
npm run db:push                          # ส่ง migration ที่มากับ template (role ของ PostgREST + function health()) ขึ้นโปรเจกต์
npm run db:types                         # สร้าง type จากโปรเจกต์ที่ link ไว้
```

ตรวจว่าเชื่อมได้จริง: `npm start` แล้วเปิด http://localhost:4200/api/health ต้องได้ `{"ok":true}` — ถ้าไม่ได้ ข้อความ `error` จะบอกว่าต้องแก้ตรงไหน (URL ผิด / key ผิดหรือเป็น anon key / ยังไม่ได้ `db:push`) และดูวิธีแก้ทีละอาการที่หัวข้อ "ปัญหาที่พบบ่อยตอนตั้งค่า" ด้านล่าง ถึงตรงนี้โปรเจกต์พร้อมรับ migration ของระบบจริงแล้ว

ไม่อยากใช้ Supabase cloud? Template ย้ายไป PostgreSQL + PostgREST บน server ของตัวเองได้โดยไม่แก้โค้ด — ดูหัวข้อ "Deploy บน VPS ของตัวเอง" ด้านล่าง (ขั้น login/link/push ข้างบนเปลี่ยนเป็น `npm run db:push:url` และ `npm run db:types:url`)

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

Agent จะอ่าน `AGENTS.md` → `docs/ARCHITECTURE.md` → `docs/SYSTEM_SPEC.md` → `docs/DESIGN.md` (เมื่อมีแล้ว) → `docs/TASKS.md` แล้วทำทีละ Task เท่านั้น ทุก Task จะบอกวิธีทดสอบที่คุณทำได้เองในเบราว์เซอร์ (ไม่ต้องใช้ curl หรือเขียน SQL เอง — ถ้าต้องตรวจฐานข้อมูล agent จะเขียน SQL ให้คุณวางใน Supabase SQL Editor หรือรันด้วย `psql` เมื่อฐานข้อมูลอยู่บน server ของตัวเอง) เมื่อคุณบอก "ผ่าน" agent จะถามคำถามเดียว: บันทึกงานลง `.sessions/` ไหม และจะทำ Task ถัดไปที่นี่หรือเปิดแชทใหม่ (ตอบสั้นๆ เช่น "บันทึก, ต่อเลย" — agent ไม่เริ่ม Task ถัดไปเอง) Task 2 คือการออกแบบหน้าตา: คุณจะได้ `docs/design/mockup.html` เปิดดูในเบราว์เซอร์แล้วติชมจนพอใจก่อนที่จะมีการสร้างหน้าจอจริง — ความคืบหน้าทั้งหมดอยู่ใน `docs/TASKS.md` เปิดแชทใหม่กี่ครั้งก็ทำต่อจากเดิมได้

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

บน server ของตัวเอง (PostgreSQL + PostgREST): แถวที่เกี่ยวกับ login และ Dashboard ไม่เกี่ยว — key คือ JWT ที่สร้างเองในข้อ 4 ของ "Deploy บน VPS ของตัวเอง" ถ้า `/api/health` บอกว่า key ไม่ถูกต้อง ให้ตรวจว่า `jwt-secret` ใน config ของ PostgREST ตรงกับที่ใช้เซ็น และถ้าบอกว่ายังไม่มี function `health()` ให้รัน `npm run db:push:url`

## คำสั่งที่ใช้บ่อย

```bash
npm install
npm start                              # dev server (SSR) ที่ http://localhost:4200
npm test                               # รัน unit test (Vitest)
npm run build                          # build production
npm run serve:ssr:<project-name>       # รัน build จริงที่ http://localhost:4000
npm run format                         # จัดรูปแบบโค้ดด้วย Prettier
npm run format:check                   # ตรวจรูปแบบโดยไม่แก้ไฟล์
npm run db:link -- --project-ref <ref> # เชื่อม CLI กับโปรเจกต์ Supabase (ครั้งเดียว)
npm run db:migration -- <description>  # สร้างไฟล์ migration ใหม่ใน supabase/migrations/
npm run db:push                        # apply migration ขึ้นโปรเจกต์ Supabase
npm run db:types                       # สร้าง src/shared/types/database.types.ts จากโปรเจกต์ที่ link ไว้ (ต้อง login + link ก่อน ไม่งั้นคำสั่งจะล้มเหลวโดยไม่แตะไฟล์เดิม)
npm run db:push:url                    # เหมือน db:push แต่ต่อตรงไปฐานข้อมูลใน DATABASE_URL (.env) — สำหรับ Postgres บน server ของตัวเอง ไม่ต้อง login/link
npm run db:types:url                   # เหมือน db:types แต่อ่านจาก DATABASE_URL
```

Supabase CLI ติดมากับ `devDependencies` แล้ว ไม่ต้องติดตั้ง global — เรียกผ่าน `npx supabase <cmd>` หรือ script ด้านบนได้เลย

Template มี migration มาให้ 2 ไฟล์ — `supabase/migrations/*_roles.sql` (role + สิทธิ์ของ PostgREST ที่ Supabase cloud มีอยู่แล้ว จึงไม่ทำอะไรบน cloud แต่จำเป็นเมื่อฐานข้อมูลอยู่บน server ของตัวเอง) และ `*_health.sql` (function `health()` ที่เรียกได้เฉพาะ `service_role`) ซึ่ง `GET /api/health` ใช้ตรวจว่า `.env` และ `db:push` ใช้ได้ — ห้ามลบหรือเปลี่ยนชื่อ migration ของระบบจริงจะต่อจากสองไฟล์นี้ไป (โปรเจกต์ที่ clone จาก template รุ่นก่อน 1.9 แล้ว push `*_health.sql` ไปแล้ว: ถ้านำ `*_roles.sql` มาเพิ่ม CLI จะเตือนว่ามี migration ที่ timestamp อยู่ก่อนตัวที่ push แล้ว ให้ตอบยืนยัน หรือรัน `npx supabase db push --include-all` ครั้งเดียว — บน server ของตัวเอง `npm run db:push:url -- --include-all`)

## Deploy

Render (หรือ host Node ใดๆ): Build command `npm ci && npm run build` · Start command `node dist/<project-name>/server/server.mjs` · Node ตาม `engines` ใน `package.json` · ตั้ง env `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NG_ALLOWED_HOSTS=<โดเมนจริง>` ใน dashboard ของ host (`PORT` host ตั้งให้เอง) · ห้ามตั้ง CDN cache หน้า HTML — รายละเอียดใน [ARCHITECTURE.md ข้อ 8](docs/ARCHITECTURE.md)

### Deploy บน VPS ของตัวเอง (PostgreSQL + PostgREST)

Template ไม่ได้ผูกกับ Supabase cloud: server คุยกับฐานข้อมูลผ่าน [PostgREST](https://postgrest.org) เท่านั้น (โปรแกรมตัวเดียวกับที่ Supabase รันให้อยู่เบื้องหลัง) จึงย้ายไป VPS ที่ติดตั้ง PostgreSQL + PostgREST เองได้โดยเปลี่ยนแค่ค่าใน `.env` — ติดตั้ง PostgreSQL เปล่าๆ อย่างเดียว**ไม่พอ** ต้องมี PostgREST ด้วย (VPS RAM 1 GB พอสำหรับแอป + PostgreSQL + PostgREST; ไม่ต้องติดตั้ง Supabase self-hosted ทั้งชุด)

1. **PostgreSQL** — ติดตั้ง สร้างฐานข้อมูล แล้วใส่ connection string ของ superuser (`postgres`) ลง `.env` เป็น `DATABASE_URL` เช่น `postgres://postgres:<รหัส>@<ip>:5432/<db>` (migration `*_roles.sql` ต้องเป็น superuser จึงสร้าง role และ event trigger ได้; ถ้ารหัสผ่านมีอักขระพิเศษต้อง percent-encode เช่น `@` → `%40`; ใช้ `DATABASE_URL` ตัวเดิมกับทุก migration ต่อจากนี้ เพราะ default privileges ผูกกับ role ที่รัน migration) เปิด port 5432 ให้เฉพาะเครื่องที่รัน migration
2. **Migration และ type** — `npm run db:push:url` แทน `db:link` + `db:push` (ไม่ต้อง `supabase login`) แล้ว `npm run db:types:url` — migration `*_roles.sql` สร้าง role `anon` / `authenticated` / `service_role` / `authenticator` ตั้ง default privileges ให้ตารางที่สร้างทีหลังมองเห็นได้ และตั้ง event trigger ให้ PostgREST reload schema เองหลังทุก migration จากนั้นตั้งรหัสผ่านให้ role ที่ PostgREST ใช้ login ด้วย `psql`:
   ```sql
   alter role authenticator password '<รหัส-authenticator>';
   ```
3. **PostgREST** — ดาวน์โหลด binary จาก [GitHub releases](https://github.com/PostgREST/postgrest/releases) แล้วรันด้วยไฟล์ config (ทำเป็น systemd service ให้รันตลอด):
   ```
   db-uri = "postgres://authenticator:<รหัส-authenticator>@localhost:5432/<db>"
   db-schemas = "public"
   db-anon-role = "anon"
   jwt-secret = "<ข้อความสุ่มยาวอย่างน้อย 32 ตัวอักษร>"
   server-port = 3000
   db-pool = 10
   ```
4. **Key ของ server** — `SUPABASE_SERVICE_ROLE_KEY` ของจริงคือ JWT ที่มี claim `role: service_role` เซ็นด้วย `jwt-secret` ข้างบน สร้างเองได้ด้วย Node (อายุ 10 ปี):
   ```bash
   node -e "const c=require('crypto');const b=o=>Buffer.from(JSON.stringify(o)).toString('base64url');const h=b({alg:'HS256',typ:'JWT'});const p=b({role:'service_role',iss:'postgrest',exp:Math.floor(Date.now()/1000)+315360000});console.log(h+'.'+p+'.'+c.createHmac('sha256',process.argv[1]).update(h+'.'+p).digest('base64url'))" '<jwt-secret>'
   ```
5. **Reverse proxy** — supabase-js ต่อ `/rest/v1` ท้าย `SUPABASE_URL` เสมอ จึงต้องให้ `https://<โดเมน>/rest/v1/` ส่งต่อไป PostgREST โดยตัด prefix ออก — Caddy: `handle_path /rest/v1/* { reverse_proxy 127.0.0.1:3000 }` · nginx: `location /rest/v1/ { proxy_pass http://127.0.0.1:3000/; }` (เครื่องหมาย `/` ท้าย `proxy_pass` คือตัวตัด prefix) แล้วตั้ง `.env` ของแอป: `SUPABASE_URL=https://<โดเมน>` กับ `SUPABASE_SERVICE_ROLE_KEY` จากข้อ 4 — เปิด `/api/health` ต้องได้ `{"ok":true}` (ถ้าแอปกับ PostgREST อยู่เครื่องเดียวกัน ใช้ `SUPABASE_URL=http://127.0.0.1:<port ของ proxy>` เพื่อไม่วิ่งออกอินเทอร์เน็ต)
6. **แอป** — เหมือน Render: `npm ci && npm run build` แล้ว `node dist/<project-name>/server/server.mjs` ภายใต้ systemd/pm2 ตั้ง `NG_ALLOWED_HOSTS` เป็นโดเมนจริง

ข้อจำกัดเมื่อไม่ได้อยู่บน Supabase cloud: ไม่มี Supabase Storage (จุดขยาย "อัปโหลดไฟล์" ต้องสลับ `storage-server.service.ts` ไปเก็บบนดิสก์หรือ S3) และ `pg_cron` ต้องติดตั้ง extension เอง — กติกาที่ทำให้ระบบย้ายได้ทุกเมื่ออยู่ใน `AGENTS.md` → Supabase ("Stay portable") และ [ARCHITECTURE.md ข้อ 6](docs/ARCHITECTURE.md)

## เอกสารของ template

| ไฟล์                                         | เนื้อหา                                                                                                           |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| [AGENTS.md](AGENTS.md)                       | กติกาการเขียนโค้ดทั้งหมด (Angular, SSR, API layer, Supabase, testing)                                             |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | โครงสร้างโฟลเดอร์, การไหลของข้อมูล, ทิศทาง import, ขอบเขตของ template                                             |
| `.claude/skills/system-spec-builder/`        | skill สำหรับสัมภาษณ์และเขียน spec ระบบใหม่                                                                        |
| `.agents/skills/`                            | สำเนาของ `.claude/skills/` สำหรับ AI agent เจ้าอื่น — ต้องเหมือนกันทุกไฟล์ ถ้าแก้ฝั่งหนึ่งให้คัดลอกทับอีกฝั่งเสมอ |

Skill ภายนอก (`supabase-postgres-best-practices`, `angular-developer`, `angular-new-app` — บันทึกไว้ใน `skills-lock.json`) เป็นความรู้ทั่วไป ส่วน `tailwind-css-patterns` (แก้จากของเดิมให้รองรับ Angular โดยตรง) และ `system-spec-builder` ดูแลเองในเทมเพลตนี้ จึงไม่อยู่ใน lock file ทั้งหมดนี้ถ้าขัดกับ `AGENTS.md` ให้ยึด `AGENTS.md` (เช่น template นี้ไม่ใช้ local database / Docker และไม่เขียน RLS policy) — skill `supabase` ของ Supabase ถูกเอาออกโดยตั้งใจ เพราะเนื้อหาส่วนใหญ่เป็น Auth/Realtime/Storage ฝั่ง client และ workflow แบบ local ที่ template นี้ไม่ใช้ ไม่ต้องติดตั้งกลับ
