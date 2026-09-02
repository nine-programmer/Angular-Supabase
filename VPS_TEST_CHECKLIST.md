# VPS_TEST_CHECKLIST — ทดสอบเส้นทาง "ไม่มี Supabase cloud" ให้ตรงกับความเป็นจริง

> **ไฟล์ชั่วคราว** — ไม่มีไฟล์ไหนอ้างถึง ใช้เป็นไกด์ให้ session ถัดไป (คนหรือ AI) ทดสอบสิ่งที่ template v1.9 อ้างไว้แต่ยังไม่เคยรันจริง แล้วปรับเอกสารให้ตรงผลที่ได้ **ทดสอบครบแล้วให้ลบไฟล์นี้ทิ้ง** (ไม่ต้องบันทึกไว้ที่ไหน ความรู้ที่ได้ไปอยู่ในเอกสารจริงแทน)
>
> สิ่งที่ template v1.9 (2026-09-02) อ้างแต่ยังไม่เคยพิสูจน์: (1) migration `supabase/migrations/*_roles.sql` รันผ่านบน Postgres เปล่า **และ** ไม่พังบน Supabase cloud (2) สคริปต์ `db:push:url` / `db:types:url` ใช้ได้จริง (3) ขั้นตอนใน `README.md` → "Deploy บน VPS ของตัวเอง" ทำตามแล้วได้ `/api/health` = `{ ok: true }` (4) error mapping ใน `src/server/api-error.ts` ยังถูกต้องเมื่อ PostgREST ไม่ใช่ของ Supabase

## 0. กติกาตอนทดสอบ

- ทำในฐานข้อมูล **ทิ้งได้** (Docker) เท่านั้น ห้ามใช้โปรเจกต์ Supabase ของลูกค้า
- migration ทดสอบที่สร้างใน `supabase/migrations/` ระหว่างทำข้อ 3 **ต้องลบทิ้งก่อนจบ** (กติกา "ห้ามลบ migration หลัง push" ใช้กับฐานข้อมูลจริง ไม่ใช่ Docker ที่จะ `docker compose down -v` อยู่แล้ว) — เช็คด้วย `git status` ว่าเหลือแค่ `*_roles.sql` และ `*_health.sql`
- ถ้าผลต่างจากที่เอกสารเขียน **แก้เอกสารให้ตรงผล ไม่ใช่แก้ผลให้ตรงเอกสาร** ตารางในข้อ 6 บอกว่าแต่ละอาการต้องไปแก้ไฟล์ไหน
- `*_roles.sql` ยังไม่เคยถูก push ไปโปรเจกต์ไหน จึง**แก้ไฟล์เดิมได้**ตราบใดที่ยังไม่ push ขึ้น Supabase จริง (หลังจากนั้นต้องเพิ่มไฟล์ใหม่แทนตาม hard rule 7)
- AI agent: ห้ามอ่าน `.env` เหมือนเดิม ให้ผู้ใช้เป็นคนใส่ค่า; สั่ง `docker`, `psql`, `curl` ได้

## 1. เตรียม stack ทดสอบ (นอก repo)

สร้างโฟลเดอร์นอก repo เช่น `~/pgrst-test/` ใส่ 2 ไฟล์นี้ (ค่าทั้งหมดเป็นค่าทดสอบ):

`docker-compose.yml`

```yaml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: app
    ports: ['5432:5432']
  postgrest:
    image: postgrest/postgrest:latest # จดเวอร์ชันที่ทดสอบจริงไว้ในผล
    environment:
      PGRST_DB_URI: postgres://authenticator:authpass@db:5432/app
      PGRST_DB_SCHEMAS: public
      PGRST_DB_ANON_ROLE: anon
      PGRST_JWT_SECRET: 0123456789abcdef0123456789abcdef
      PGRST_DB_POOL: 10
    depends_on: [db]
    restart: unless-stopped # จะ restart วนจนกว่า role authenticator จะมี (ข้อ 2)
  proxy:
    image: caddy:2
    ports: ['8080:80']
    volumes: ['./Caddyfile:/etc/caddy/Caddyfile']
    depends_on: [postgrest]
```

`Caddyfile` (จำลอง reverse proxy ที่ตัด prefix `/rest/v1` ตาม README ข้อ 5)

```
:80 {
  handle_path /rest/v1/* {
    reverse_proxy postgrest:3000
  }
}
```

รัน `docker compose up -d db` ก่อน (ยังไม่ต้องขึ้น postgrest/proxy)

## 2. Migration และ role — พิสูจน์ `*_roles.sql` และ `db:push:url`

ใน repo ใส่ `.env` (ผู้ใช้ใส่เอง):

```
DATABASE_URL=postgres://postgres:postgres@localhost:5432/app
SUPABASE_URL=http://localhost:8080
SUPABASE_SERVICE_ROLE_KEY=<ได้จากข้อ 4>
```

| #   | ทำ                                                                                                                                                                                                                                                | ต้องได้                                                                                                                                                         |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2.1 | `npm run db:push:url` บน DB ว่าง                                                                                                                                                                                                                  | CLI สร้าง `supabase_migrations.schema_migrations` เอง แล้ว apply `*_roles.sql` ก่อน `*_health.sql` โดยไม่มี error (ไม่ต้อง `supabase login`)                    |
| 2.2 | `psql "$DATABASE_URL" -c "\du"`                                                                                                                                                                                                                   | มี `anon`, `authenticated`, `service_role` (มี **Bypass RLS**), `authenticator` (Login, สมาชิกของ 3 role แรก)                                                   |
| 2.3 | `psql ... -c "select evtname from pg_event_trigger"`                                                                                                                                                                                              | มี `pgrst_reload_schema`                                                                                                                                        |
| 2.4 | `psql ... -c "alter role authenticator password 'authpass'"` แล้ว `docker compose up -d`                                                                                                                                                          | container `postgrest` ขึ้นและไม่ restart วน (`docker compose logs postgrest` ไม่มี "password authentication failed")                                            |
| 2.5 | รัน `npm run db:push:url` ซ้ำอีกครั้ง                                                                                                                                                                                                             | ตอบว่าไม่มี migration ใหม่ ไม่ error (พิสูจน์ว่าสคริปต์ idempotent ในมุม CLI)                                                                                   |
| 2.6 | เปลี่ยนรหัส `postgres` เป็นค่าที่มีอักขระพิเศษ (`alter role postgres password 'p@ss%w$rd'`) แล้วตั้ง `DATABASE_URL=postgres://postgres:p%40ss%25w%24rd@localhost:5432/app` รัน `npm run db:push:url` ทั้งใน PowerShell/cmd และ Git Bash (Windows) | ต่อได้ทั้งสอง shell — พิสูจน์ว่าการเลิกใช้ `shell:true` แก้ปัญหา `%VAR%` / `$` จริง; เสร็จแล้วเปลี่ยนรหัสกลับ                                                   |
| 2.7 | `npm run db:push:url -- --include-all`                                                                                                                                                                                                            | flag ถูกส่งถึง CLI (ดูจากข้อความของ CLI ไม่ใช่ถูกกลืนหาย)                                                                                                       |
| 2.8 | ลบ `.env` ชั่วคราวแล้วรัน `npm run db:push:url`                                                                                                                                                                                                   | ได้ข้อความ `DATABASE_URL is not set in .env` ไม่ใช่ `ENOENT` (พิสูจน์ `--env-file-if-exists` กับ Node เวอร์ชันที่ติดตั้ง) — จดเวอร์ชัน Node (`node -v`) ไว้ในผล |

## 3. สิทธิ์บนตารางที่สร้างทีหลัง — พิสูจน์ default privileges และ schema reload

| #   | ทำ                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | ต้องได้                                                                                                                                                             |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 3.1 | `npm run db:migration -- test_items` แล้วเขียนใน migration นั้น: `create table test_items (id uuid default gen_random_uuid() primary key, name text not null unique, created_at timestamptz default now()); alter table test_items enable row level security;` + function `create or replace function reject_me() returns void language plpgsql as $$ begin raise exception 'ข้อความทดสอบภาษาไทย'; end $$;` + function `conflict_me() ... raise exception 'สถานะไม่ตรง' using errcode = 'P0409';` แล้ว `npm run db:push:url` | push ผ่าน                                                                                                                                                           |
| 3.2 | **ไม่ restart PostgREST** แล้ว `curl -H "Authorization: Bearer $KEY" http://localhost:8080/rest/v1/test_items`                                                                                                                                                                                                                                                                                                                                                                                                               | `200` + `[]` ทันที — พิสูจน์ event trigger `NOTIFY pgrst` ทำงาน (ถ้า `404`/`PGRST205` = ต้อง restart → แก้เอกสารตามข้อ 6)                                           |
| 3.3 | `curl -X POST ... -H "Content-Type: application/json" -d '{"name":"a"}'` แล้ว GET อีกครั้ง                                                                                                                                                                                                                                                                                                                                                                                                                                   | insert ได้และอ่านคืนได้ทั้งที่เปิด RLS ไม่มี policy — พิสูจน์ `bypassrls` + default privileges on tables/sequences                                                  |
| 3.4 | GET เดิมโดยไม่ส่ง `Authorization` (= anon)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | `401` หรือ `[]`/`403` — anon ต้องอ่านไม่ได้ (จดว่าได้ status อะไร)                                                                                                  |
| 3.5 | `npm run db:types:url`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | `src/shared/types/database.types.ts` มี `test_items` และ function ทั้งสอง; ไฟล์เดิมถูกทับเฉพาะเมื่อสำเร็จ (ลองตั้ง `DATABASE_URL` ผิดแล้วรัน → ไฟล์เดิมต้องยังอยู่) |

## 4. แอปจริงต่อ PostgREST ที่ไม่ใช่ Supabase

สร้าง key ด้วย one-liner ใน README ข้อ 4 โดยใช้ secret `0123456789abcdef0123456789abcdef` แล้วใส่ `SUPABASE_SERVICE_ROLE_KEY` ใน `.env`

| #   | ทำ                                                                                                                                                                                                                                         | ต้องได้                                                                                                                                                                                         |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 4.1 | `npm start` แล้วเปิด `http://localhost:4200/api/health`                                                                                                                                                                                    | `{"ok":true}`                                                                                                                                                                                   |
| 4.2 | เปลี่ยน key เป็น JWT ที่เซ็นด้วย secret อื่น                                                                                                                                                                                               | `ok:false` + ข้อความ "SUPABASE_SERVICE_ROLE_KEY ไม่ถูกต้อง …" (status 401 จาก PostgREST) — ถ้าได้ข้อความอื่น ดูว่า PostgREST ตอบ status อะไรแล้วแก้ `describeFailure()`                         |
| 4.3 | `docker compose stop postgrest` แล้วเปิด health                                                                                                                                                                                            | ข้อความ "เชื่อมต่อ SUPABASE_URL ไม่ได้ …" หรือข้อความทั่วไป — จดว่า Caddy ตอบ 502 แล้ว `status` ที่ supabase-js ให้มาคือค่าอะไร (0 หรือ 502)                                                    |
| 4.4 | DB ใหม่ที่ยังไม่ push (`docker compose down -v && up -d`, ตั้ง authenticator ใหม่) แล้วเปิด health                                                                                                                                         | ข้อความ "ยังไม่มี function health() … `db:push:url`" — พิสูจน์ว่า PostgREST เปล่าตอบ `PGRST202`/404 เหมือน Supabase                                                                             |
| 4.5 | เขียน route ทดลองชั่วคราว (หรือใช้ `node -e` กับ supabase-js ตรงๆ) เรียก `db.rpc('reject_me')`, `db.rpc('conflict_me')`, insert ชื่อซ้ำ, `.select().eq('id', uuid สุ่ม).single()` แล้วส่งผ่าน `toApiError()` จาก `src/server/api-error.ts` | ได้ `400 ข้อความทดสอบภาษาไทย` (ไทยไม่เพี้ยน), `409 สถานะไม่ตรง`, `409 ข้อมูลนี้มีอยู่แล้ว`, `404 ไม่พบข้อมูล` ตามลำดับ — พิสูจน์ว่า PostgREST เปล่าส่ง `code`/`message` รูปแบบเดียวกับ Supabase |
| 4.6 | `npm run build` แล้ว `PORT=4000 NG_ALLOWED_HOSTS=localhost node dist/angular-supabase/server/server.mjs` เปิด `http://localhost:4000/api/health`                                                                                           | `{"ok":true}` — พิสูจน์ production build (ไม่ใช่แค่ `ng serve`)                                                                                                                                 |

## 5. ฝั่ง Supabase cloud — พิสูจน์ว่า `*_roles.sql` ไม่พังของเดิม

ใช้โปรเจกต์ Supabase **ทดสอบ** (สร้างใหม่ฟรีก็ได้) link ตาม README ปกติ

| #   | ทำ                                                              | ต้องได้                                                                                                                                                                                              |
| --- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 5.1 | `npm run db:push` บนโปรเจกต์ใหม่                                | apply ทั้ง 2 ไฟล์ผ่าน — บล็อก `create role` ถูกข้าม, `grant usage`/`alter default privileges` ไม่ error แม้ `postgres` ไม่ใช่ superuser, บล็อก event trigger ถูกข้าม (มี `pgrst_ddl_watch` อยู่แล้ว) |
| 5.2 | `/api/health` กับ key ของ cloud                                 | `{"ok":true}`                                                                                                                                                                                        |
| 5.3 | (ถ้ามีโปรเจกต์ที่เคย push แค่ `*_health.sql`) `npm run db:push` | CLI เตือน migration ก่อนหน้า → ยืนยันหรือ `--include-all` แล้วผ่าน ตามที่ README เขียน — ถ้า CLI ทำอย่างอื่น แก้ README                                                                              |

## 6. เจออะไรแล้วต้องแก้ที่ไหน

| อาการ                                                                        | แก้ที่                                                                                                                                                                                                                |
| ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2.1 ล้มเพราะ CLI ต้องการ superuser / สิทธิ์อื่น หรือ syntax ใน `*_roles.sql` | แก้ `supabase/migrations/20260827081500_roles.sql` (ยังไม่เคย push จริง แก้ไฟล์เดิมได้) + comment ในไฟล์                                                                                                              |
| 3.2 ต้อง restart PostgREST                                                   | `*_roles.sql` บล็อก 3 (ตรวจว่า `notify pgrst, 'reload schema'` ใช้ channel ถูก และ `PGRST_DB_CHANNEL_ENABLED` ไม่ได้ปิด) — ถ้าแก้ไม่ได้ ให้ README ข้อ 2 เพิ่ม "restart PostgREST หลัง push" และตัด event trigger ออก |
| 3.3 อ่าน/เขียนไม่ได้ (`42501 permission denied`)                             | `alter default privileges` ใน `*_roles.sql` ผูกกับ role ที่รัน — ตรวจว่า `DATABASE_URL` ใช้ role เดียวกับตอน push ครั้งแรก; ถ้าต้องระบุ `for role postgres` ให้แก้ migration + `.env.example` + README ข้อ 1          |
| 4.2–4.4 ข้อความไม่ตรงอาการ                                                   | `src/server/services/health-server.service.ts` → `describeFailure()` (+ README "ปัญหาที่พบบ่อยตอนตั้งค่า" ย่อหน้า VPS)                                                                                                |
| 4.5 code/message ต่างจาก Supabase                                            | `src/server/api-error.ts` + `src/server/api-error.spec.ts` + AGENTS.md → API Layer (ตาราง Postgres → HTTP)                                                                                                            |
| 4.1 ล้มที่ Caddy/nginx                                                       | README ข้อ 5 (config proxy) + `.env.example` comment ของ `SUPABASE_URL`                                                                                                                                               |
| one-liner JWT ใช้ไม่ได้                                                      | README ข้อ 4 + `.env.example` comment ของ `SUPABASE_SERVICE_ROLE_KEY`                                                                                                                                                 |
| 5.1 ล้มบน cloud                                                              | `*_roles.sql` ต้องเพิ่ม guard ให้บล็อกนั้น — **ห้าม** แก้ให้ผ่านโดยตัดสิ่งที่ VPS ต้องใช้                                                                                                                             |
| ขั้นตอนใน README ข้ามอะไรที่ต้องทำจริง                                       | README → "Deploy บน VPS ของตัวเอง" (แก้ขั้นตอนนั้น) และถ้าเป็นกติกาให้เพิ่มใน AGENTS.md → Supabase "Stay portable" / ARCHITECTURE.md ข้อ 6                                                                            |

เอกสารที่อ้างเรื่องนี้ทั้งหมด (ต้องตรงกันหลังแก้): `AGENTS.md` (hard rule 7, หมวด Supabase, Appendix บรรทัด connection pooling) · `docs/ARCHITECTURE.md` (ข้อ 1, 2, 3, 6, 8, 9) · `README.md` (ข้อ 2 setup, ปัญหาที่พบบ่อย, คำสั่งที่ใช้บ่อย, Deploy บน VPS) · `.env.example` · `package.json` scripts · `.claude/skills/system-spec-builder/` (`SKILL.md`, `references/default-stack.md`, `references/template-scope.md`, `templates/TASKS.md`, `templates/SYSTEM_SPEC.md`) — แก้ฝั่ง `.claude/skills/` แล้ว copy ทับ `.agents/skills/` เสมอ

## 7. ปิดงาน

1. ลบ migration ทดสอบ (`*_test_items.sql`) และ route/สคริปต์ทดลองทั้งหมด → `git status` ต้องเหลือแค่ไฟล์เอกสาร/migration ของ template ที่ตั้งใจแก้
2. `npm run db:types:url` อีกครั้งกับ DB ที่ไม่มี `test_items` **หรือ** คืน `src/shared/types/database.types.ts` เป็น placeholder เดิม (ห้ามส่ง type ของตารางทดสอบไปกับ template)
3. `npm run format` → `npm test` ผ่าน
4. ถ้าเอกสารถูกแก้ตามผลจริง bump `เวอร์ชัน template` ใน `docs/ARCHITECTURE.md` (1.9 → 1.10) พร้อมวันที่ และเปลี่ยน "ยังไม่เคยพิสูจน์" เป็นข้อเท็จจริง (เวอร์ชัน PostgREST/Postgres/Node ที่ทดสอบผ่าน) ไว้ใน README → "Deploy บน VPS ของตัวเอง" บรรทัดเดียว
5. `docker compose down -v` แล้ว**ลบไฟล์นี้** (`VPS_TEST_CHECKLIST.md`) — ถ้าอยากเก็บสิ่งที่เรียนรู้ ให้เขียน `.sessions/` log ตามกติกาปกติแทน
