# Default Stack (Section 2 ของทุกเอกสาร)

คัดลอกบล็อกด้านล่างไปใส่ Section 2 ได้ทันที ปรับเฉพาะเมื่อผู้ใช้ระบุว่าโปรเจกต์นี้ต่างออกไป

ทุกโปรเจกต์เริ่มจาก clone repo template `Angular-Supabase` ซึ่งมี `AGENTS.md` (กติกาโค้ดฉบับเต็ม) ติดมาด้วย
Section 2 นี้สรุปเฉพาะส่วนที่กระทบการออกแบบ **ถ้าขัดกัน ให้ยึด `AGENTS.md` ของ repo**

---

## 2. Architecture — สร้างด้วยอะไร

### 2.1 เทคโนโลยี
| ส่วน | ใช้ | หมายเหตุ |
|---|---|---|
| Frontend + SSR | Angular 22 + Angular SSR | standalone components, signals, zoneless |
| API | Express ใน process เดียวกับ SSR (`src/server/`) | endpoint อยู่ใต้ `/api/*` |
| ฐานข้อมูล | Supabase (PostgreSQL) | `@supabase/supabase-js` **ฝั่ง server เท่านั้น** |
| UI | Tailwind CSS v4 (CSS-first, ไม่มี tailwind.config.js) | ต้องรองรับมือถือ |
| ภาษา | TypeScript | strict mode |
| Test | Vitest (`ng test`) | |
| Deploy | [ระบุตอนกรอก เช่น Render / Vercel / เซิร์ฟเวอร์ตัวเอง] | Node web service |

### 2.2 การไหลของข้อมูล
```
Browser (Angular) ──HttpClient/httpResource──▶ /api/* (Express, src/server/) ──service_role key──▶ Supabase
```
Browser **ไม่** เชื่อม Supabase โดยตรง ไม่มี anon key ในฝั่ง browser

### 2.3 โครงสร้างโฟลเดอร์มาตรฐาน
```
src/
├── app/                      Angular app
│   ├── pages/                หน้าจอ (1 โฟลเดอร์ต่อ 1 หน้า)
│   ├── components/           ชิ้นส่วน UI ใช้ซ้ำ
│   ├── services/             เรียก /api/* ด้วย HttpClient / httpResource
│   ├── app.routes.ts
│   └── app.routes.server.ts  กำหนด RenderMode ต่อหน้า
├── server/                   API (รันบน Node เท่านั้น)
│   ├── env.ts                อ่าน/ตรวจ process.env ที่เดียว
│   ├── supabase.ts           Supabase client ตัวเดียวของทั้งระบบ
│   ├── routes/               1 ไฟล์ต่อ 1 resource เช่น items.routes.ts
│   └── services/             business logic ต่อ resource (ที่เดียวที่เรียก Supabase)
├── shared/                   ใช้ร่วมทั้ง app/ และ server/
│   ├── types/database.types.ts   สร้างจาก `supabase gen types` ห้ามเขียนมือ
│   └── dto/                  type ของ request/response ของ /api/*
├── server.ts                 Express host เท่านั้น (mount /api + Angular engine)
└── environments/             config ฝั่ง browser ที่ไม่ใช่ความลับ
supabase/
└── migrations/               SQL สร้างตาราง (1 ไฟล์ต่อ 1 Task ฐานข้อมูล, ชื่อ NNN_description.sql)
.env.example                  รายชื่อตัวแปรที่ต้องตั้ง (commit ได้)
.env                          ค่าจริง (ห้าม commit)
README.md
```

### 2.4 API ที่ต้องมี [LOCKED]
[เติมตามระบบ: 1 แถวต่อ 1 endpoint ต้องมี `GET /api/health` เสมอ และทุก path ต้องถูกอ้างในอย่างน้อย 1 Task]
| Method | Path | ทำอะไร |
|---|---|---|
| GET | /api/health | นับจำนวนแถวในตารางหลัก (ใช้ตรวจว่าเชื่อม DB ได้) |
| GET | /api/[resource] | [ ] |

### 2.5 กติกาการเขียนโค้ด (สรุปจาก AGENTS.md)
- **ข้อมูลผ่าน API เท่านั้น**: `src/app/` เรียก `/api/*` → `src/server/services/` เรียก Supabase; `src/app/` ห้าม import อะไรจาก `src/server/` และห้าม import `@supabase/supabase-js`
- **Supabase client มีตัวเดียว** ที่ `src/server/supabase.ts` ใช้ `service_role` key จาก `.env`
- **ทุกตารางเปิด RLS** โดยไม่มี policy ให้ `anon`/`authenticated` (ปิดตาย) — สิทธิ์ทั้งหมดตัดสินที่ API
- **กติกาธุรกิจที่ต้อง atomic** (นับสต็อก, เลขคิวรันต่อเนื่อง, เปลี่ยนสถานะ) ทำใน Postgres function เรียกผ่าน `.rpc()` หรือ DB constraint ห้ามอ่านแล้วค่อยเขียนใน API
- **ชื่อฟิลด์ในฐานข้อมูล**: snake_case ภาษาอังกฤษ ตรงกับ Section 1.5 ทุกตัวอักษร
- **ทุกตารางมี** `id uuid default gen_random_uuid() primary key` และ `created_at timestamptz default now()`
- **type ของตาราง** มาจาก `supabase gen types` → `src/shared/types/database.types.ts` เท่านั้น
- **API ทุกเส้น** ตรวจ input, ตอบ JSON, error ตอบเป็น HTTP status + `{ error: "ข้อความไทย" }` ห้ามส่ง error ดิบของ Supabase ออกไป
- **หน้าที่ดึงข้อมูล** ใช้ `httpResource()` และตั้ง `RenderMode.Server` ใน `app.routes.server.ts` (Prerender เฉพาะหน้า static)
- **ข้อความใน UI**: ภาษาไทย; error ต้องแสดงให้ผู้ใช้เห็น ไม่ใช่ console อย่างเดียว
- **ทุกหน้าต้องใช้ได้บนมือถือ** (ทดสอบที่ความกว้าง 375px)
- **ทุกรายการต้องมี เพิ่ม / แก้ / ลบ** เว้นแต่ Spec ระบุว่าไม่ต้อง
- **ทุก service** (ทั้ง `src/app/services/` และ `src/server/services/`) ต้องมี `*.spec.ts` ผ่าน `ng test`
- **ทำทีละ Task** รันผ่านก่อนค่อยไปต่อ

### 2.6 ตัวแปร .env ที่ต้องมีเสมอ
```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=   # ใช้ฝั่ง server เท่านั้น ห้าม commit
PORT=4000
```

### 2.7 คำสั่งมาตรฐาน
```
npm install
npm start                              # dev server (SSR) ที่ http://localhost:4200
npm test                               # Vitest
npm run build
npm run serve:ssr:angular-supabase     # รัน build จริงที่ http://localhost:4000
```
(ชื่อ script `serve:ssr:<project>` ตามชื่อโปรเจกต์ใน `angular.json` — agent ปรับ README ให้ตรง)
