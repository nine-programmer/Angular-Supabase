# ระบบจองคิวร้านตัดผม

> เอกสารนี้เป็นเอกสารเดียวที่ AI agent ต้องใช้ในการสร้างระบบนี้
> เวอร์ชัน: 1.0 | วันที่: 2026-08-26 | สถานะ: พร้อมสร้าง

---

## 0. คำสั่งสำหรับ AI Agent (อ่านก่อนทำอะไรทั้งสิ้น)

คุณคือผู้ช่วยสร้างซอฟต์แวร์ ผู้ใช้ไม่ใช่โปรแกรมเมอร์ ทำตามกติกานี้อย่างเคร่งครัด:

**ลำดับการทำงาน**
1. อ่านเอกสารนี้ทั้งหมด และอ่าน `AGENTS.md` ใน repo ก่อน
2. สรุปสิ่งที่เข้าใจกลับมาเป็นภาษาไทยสั้นๆ แล้วรอให้ผู้ใช้ยืนยัน ยังไม่เขียนโค้ด
3. เมื่อผู้ใช้สั่ง "เริ่ม" ทำ Task แรกใน Section 3 **เพียง Task เดียว** แล้วหยุด
4. ทุกครั้งที่ส่งงาน บอกให้ครบ: แก้ไฟล์ไหน / รันคำสั่งอะไร / ทดสอบอย่างไร
5. รอผู้ใช้ทดสอบ ถ้าผู้ใช้บอก "ผ่าน" ให้ติ๊ก `[x]` ใน Section 3 แล้วทำ Task ถัดไป ถ้าไม่ผ่านให้แก้จนผ่านก่อน
6. ห้ามทำหลาย Task พร้อมกัน ห้ามเพิ่มฟีเจอร์นอกเหนือจาก Section 1
7. ถ้าเอกสารไม่ชัด ให้ถามก่อน (ไม่เกิน 3 คำถามต่อครั้ง) ห้ามเดา
8. เมื่อ Task สุดท้ายผ่าน เขียน README.md ที่บอกวิธีรันและ deploy

**สิ่งที่ LOCKED**
- ชื่อตาราง/ฟิลด์ใน 1.5, กติกาธุรกิจใน 1.7, และ API path ใน 2.4 ถือว่า **LOCKED**
- ถ้าจำเป็นต้องเปลี่ยน: แก้เอกสารนี้ก่อน + เพิ่มเวอร์ชัน (1.0 → 1.1) + บอกผู้ใช้ว่าเปลี่ยนอะไรเพราะอะไร แล้วค่อยแก้โค้ด ห้ามแก้โค้ดให้ต่างจากเอกสารเงียบๆ

**รูปแบบคำตอบ**
- อธิบายเป็นภาษาไทยง่ายๆ
- ถ้า agent แก้ไฟล์ใน repo ได้ (Claude Code, Cursor) ให้แก้ตรงและ commit 1 ครั้งต่อ Task; ถ้าเป็นเว็บแชทที่แก้ไฟล์ไม่ได้ ให้ส่งไฟล์เต็มทุกครั้ง ไม่ส่งเป็นชิ้นๆ
- โค้ดทุกไฟล์ต้องมี comment สั้นๆ บอกว่าไฟล์นี้ทำอะไร

---

## 1. Spec — ระบบนี้ทำอะไร

### 1.1 ปัญหาที่ต้องการแก้
ลูกค้ามารอหน้าร้านโดยไม่รู้ว่าอีกกี่คิว ทำให้ร้านแออัดและลูกค้าบางคนเดินหนี ต้องการให้ลูกค้ารับคิวจากมือถือแล้วไปทำธุระอื่นได้ และช่างเห็นลำดับคิวชัดเจน

### 1.2 ผู้ใช้
- ใครใช้: ลูกค้าหน้าร้าน (รับคิว) และช่าง/เจ้าของร้าน (จัดการคิว)
- บทบาท: 2 บทบาท แยกด้วย URL (ลูกค้า `/` , ช่าง `/staff`) — ไม่มี login ในรอบนี้
- ใช้บน: ลูกค้า = มือถือ, ช่าง = แท็บเล็ตหรือมือถือ, จอหน้าร้าน = คอม/ทีวี

### 1.3 ฟีเจอร์รอบแรก (MVP)
| # | ฟีเจอร์ | ผู้ใช้สามารถ... |
|---|---|---|
| F1 | จัดการบริการ | ช่างเพิ่ม/แก้/ลบบริการ (ชื่อ, เวลาโดยประมาณ, เปิด/ปิด) |
| F2 | รับคิว | ลูกค้าเลือกบริการ กรอกชื่อ+เบอร์ ได้เลขคิว และเห็นว่าอีกกี่คิวถึงตัวเอง |
| F3 | จัดการคิว | ช่างเห็นคิววันนี้เรียงลำดับ กด เรียก / เสร็จ / ยกเลิก |
| F4 | จอแสดงคิว | หน้าจอแสดงเลขคิวที่กำลังเรียก และคิวถัดไป 3 คิว อัปเดตอัตโนมัติ |

### 1.4 สิ่งที่ *ไม่ทำ* ในรอบนี้ (รอบถัดไป)
- Login / รหัสผ่านสำหรับหน้าช่าง
- จองล่วงหน้าตามวัน-เวลา (รอบนี้เป็นคิวเดินเข้าเรียงลำดับเท่านั้น)
- แจ้งเตือน SMS / LINE เมื่อใกล้ถึงคิว
- รายงานสถิติ
- เลือกช่างเฉพาะคน

### 1.5 ข้อมูลหลัก [LOCKED]

**ตาราง `services`** — บริการที่ร้านมี
| ฟิลด์ | ชนิด | หมายเหตุ |
|---|---|---|
| id | uuid | primary key, สร้างอัตโนมัติ |
| name | text | ชื่อบริการ เช่น "ตัดผมชาย" |
| duration_min | integer | เวลาโดยประมาณ (นาที) |
| is_active | boolean | default true; false = ซ่อนจากหน้าลูกค้า |
| created_at | timestamptz | สร้างอัตโนมัติ |

**ตาราง `bookings`** — คิวแต่ละรายการ
| ฟิลด์ | ชนิด | หมายเหตุ |
|---|---|---|
| id | uuid | primary key, สร้างอัตโนมัติ |
| service_id | uuid | → services.id |
| customer_name | text | |
| phone | text | |
| queue_no | integer | เลขคิว เริ่ม 1 ใหม่ทุกวัน |
| queue_date | date | วันที่ของคิว (ใช้คู่กับ queue_no) |
| status | text | `waiting` / `called` / `done` / `cancelled` |
| booked_at | timestamptz | สร้างอัตโนมัติ |
| called_at | timestamptz | null จนกว่าจะถูกเรียก |

**ความสัมพันธ์:** `bookings.service_id` → `services.id`

**สถานะคิว:**
```
waiting → called → done
   └──────┴──────→ cancelled
```

### 1.6 ขั้นตอนการใช้งานหลัก
1. ลูกค้าสแกน QR หน้าร้าน → เปิด `/` → เห็นรายการบริการที่เปิดอยู่
2. เลือกบริการ → กรอกชื่อ + เบอร์ → กด "รับคิว"
3. เห็นหน้า "คิวของคุณคือ 12 — อีก 3 คิวถึงคุณ" (หน้านี้รีเฟรชเองทุก 10 วินาที)
4. ช่างเปิด `/staff` → เห็นคิววันนี้เรียงตามเลข สถานะ waiting อยู่บนสุด
5. ช่างกด "เรียก" ที่คิว 12 → สถานะเป็น called → จอ `/display` โชว์ "กำลังเรียก: 12"
6. ทำเสร็จ ช่างกด "เสร็จ" → status = done → หายจากรายการรอ
7. ลูกค้าไม่มา ช่างกด "ยกเลิก" → status = cancelled

### 1.7 กติกาธุรกิจ [LOCKED]
| # | กติกา | บังคับที่ |
|---|---|---|
| R1 | เลขคิวห้ามซ้ำในวันเดียวกัน แม้กดพร้อมกัน | DB constraint `UNIQUE (queue_date, queue_no)` + Postgres function `next_queue_no()` ออกเลขใน transaction เดียว |
| R2 | เปลี่ยนสถานะได้ตามแผนผังใน 1.5 เท่านั้น (เช่น done → waiting ไม่ได้) | Postgres function `set_booking_status()` ตรวจสถานะเดิมก่อนเปลี่ยน |
| R3 | รับคิวได้เฉพาะบริการที่ `is_active = true` | API `POST /api/bookings` ตรวจก่อนเรียก function |
| R4 | `status` ต้องเป็นค่าใดค่าหนึ่งใน 4 ค่า | DB constraint `CHECK (status IN (...))` |

### 1.8 เงื่อนไขว่า "ใช้ได้แล้ว"
- [ ] ลูกค้ารับคิวจากมือถือได้ และเห็นจำนวนคิวที่รออยู่ข้างหน้าถูกต้อง
- [ ] ช่างเปลี่ยนสถานะคิวได้ครบ 3 แบบ และลำดับบนหน้าจอถูกต้อง
- [ ] จอแสดงคิวอัปเดตภายใน 10 วินาทีหลังช่างกดเรียก โดยไม่ต้องกดรีเฟรช
- [ ] เลขคิวเริ่มที่ 1 ใหม่เมื่อขึ้นวันใหม่
- [ ] ข้อมูลไม่หายเมื่อปิดแอปเปิดใหม่
- [ ] ทุกหน้าใช้ได้บนมือถือความกว้าง 375px

### 1.9 สมมติฐาน (ผู้ใช้ยังไม่ได้ยืนยัน แก้ได้ภายหลัง)
- มีช่องบริการเดียว (เรียกได้ทีละคิว) — ถ้ามีหลายช่าง ให้เพิ่มรอบถัดไป
- ลูกค้าคนเดียวรับได้หลายคิวต่อวัน (ไม่ตรวจเบอร์ซ้ำ)
- เวลาทำการไม่จำกัด (ไม่ปิดรับคิวอัตโนมัติ) — ช่างปิดบริการเองด้วย `is_active`
- การอัปเดตอัตโนมัติใช้วิธีดึงข้อมูลทุก 10 วินาที (polling) ไม่ใช้ realtime เพื่อความง่าย

---

## 2. Architecture — สร้างด้วยอะไร

### 2.1 เทคโนโลยี
| ส่วน | ใช้ | หมายเหตุ |
|---|---|---|
| Frontend + SSR | Angular 22 + Angular SSR | standalone components, signals, zoneless |
| API | Express ใน process เดียวกับ SSR (`src/server/`) | endpoint อยู่ใต้ `/api/*` |
| ฐานข้อมูล | Supabase (PostgreSQL) | `@supabase/supabase-js` ฝั่ง server เท่านั้น |
| UI | Tailwind CSS v4 | รองรับมือถือ |
| ภาษา | TypeScript strict | |
| Test | Vitest (`npm test`) | |
| Deploy | Render (Node web service) | ตั้ง env ใน dashboard |

### 2.2 การไหลของข้อมูล
```
Browser (Angular) ──httpResource──▶ /api/* (src/server/) ──service_role key──▶ Supabase
```
Browser ไม่เชื่อม Supabase โดยตรง

### 2.3 โครงสร้างโฟลเดอร์ (ตาม template + ส่วนของระบบนี้)
```
src/
├── app/
│   ├── pages/
│   │   ├── customer/     หน้า / (รับคิว) และ /ticket/:id (ดูคิวตัวเอง)
│   │   ├── staff/        หน้า /staff และ /staff/services
│   │   └── display/      หน้า /display
│   ├── components/
│   ├── services/         services.service.ts, bookings.service.ts (เรียก /api)
│   ├── app.routes.ts
│   └── app.routes.server.ts
├── server/
│   ├── env.ts, supabase.ts
│   ├── routes/           services.routes.ts, bookings.routes.ts
│   └── services/         services.service.ts, bookings.service.ts (เรียก Supabase)
├── shared/
│   ├── types/database.types.ts
│   └── dto/              service.dto.ts, booking.dto.ts
└── server.ts
supabase/migrations/
.env.example
README.md
```

### 2.4 API ที่ต้องมี [LOCKED]
| Method | Path | ทำอะไร |
|---|---|---|
| GET | /api/health | นับจำนวน services (ใช้ตรวจว่าเชื่อม DB ได้) |
| GET | /api/services | รายการบริการ (query `?active=true` สำหรับหน้าลูกค้า) |
| POST/PUT/DELETE | /api/services[/:id] | จัดการบริการ |
| POST | /api/bookings | รับคิว → ตรวจ R3 แล้วเรียก `next_queue_no()` (R1) |
| GET | /api/bookings/today | คิววันนี้ทั้งหมด เรียงตาม queue_no |
| GET | /api/bookings/:id | คิวเดียว + `ahead` = จำนวน waiting ที่ queue_no น้อยกว่า |
| PATCH | /api/bookings/:id/status | เปลี่ยนสถานะผ่าน `set_booking_status()` (R2) |

### 2.5 กติกาการเขียนโค้ด
ตาม `AGENTS.md` ใน repo ทุกข้อ สรุปที่กระทบระบบนี้:
- `src/app/` เรียก `/api/*` เท่านั้น ห้าม import จาก `src/server/` หรือ `@supabase/supabase-js`
- ชื่อฟิลด์ตรงกับ 1.5 ทุกตัวอักษร; type มาจาก `supabase gen types` เท่านั้น
- ทุกตารางเปิด RLS โดยไม่มี policy (server ใช้ service_role)
- error จาก API ตอบเป็น `{ error: "ข้อความไทย" }` และหน้าจอแสดงให้ผู้ใช้เห็น
- ทุก service ทั้งสองฝั่งมี `*.spec.ts`
- ทำทีละ Task

### 2.6 ตัวแปร .env
```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
PORT=4000
```

### 2.7 คำสั่งมาตรฐาน
`npm start` (dev SSR ที่ :4200) · `npm test` · `npm run build` · `npm run serve:ssr:barber-queue` (build จริงที่ :4000)

---

## 3. Tasks — ลำดับงาน (ทำทีละข้อ ติ๊กเมื่อผ่าน)

กฎ: 1 Task = 1 หน้าจอ หรือ 1 resource API (พร้อมหน้าที่ใช้มัน); รวม 6–12 Task; ทุก Task มี `ทดสอบ:`

### Task 1: ตั้งโปรเจกต์
- [ ] clone template `Angular-Supabase` → ตั้งชื่อ `barber-queue` → `npm install`
- [ ] สร้าง `.env` จาก `.env.example` ใส่ค่า Supabase ของโปรเจกต์นี้
- [ ] หน้า `/` แสดงข้อความ "ระบบจองคิว" เฉยๆ
- [ ] ทดสอบ: `npm start` เปิด http://localhost:4200 เห็นข้อความ; `npm test` ผ่าน

### Task 2: ฐานข้อมูล
- [ ] `supabase/migrations/001_init.sql`: ตาราง `services`, `bookings` ตาม 1.5 + constraint R1, R4 + function `next_queue_no(service_id, name, phone)` และ `set_booking_status(id, new_status)` ตาม R2 + เปิด RLS ทั้งสองตาราง
- [ ] ใส่ข้อมูลตัวอย่าง: บริการ 3 รายการ
- [ ] `supabase gen types` → `src/shared/types/database.types.ts`
- [ ] `src/server/env.ts`, `src/server/supabase.ts`, `GET /api/health`
- [ ] ทดสอบ: รัน migration สำเร็จ; เปิด `/api/health` เห็น `{ services: 3 }`; เรียก `set_booking_status` จาก done → waiting ต้อง error

### Task 3: F1 จัดการบริการ
- [ ] API: GET/POST/PUT/DELETE `/api/services` (`src/server/routes/services.routes.ts` + `services/services.service.ts`)
- [ ] หน้า `/staff/services`: ตารางบริการ + ฟอร์มเพิ่ม/แก้ + ปุ่มลบ + สวิตช์เปิด/ปิด
- [ ] ทดสอบ: เพิ่มบริการใหม่ → รีเฟรช → ยังอยู่; ปิดบริการ → `GET /api/services?active=true` ไม่มีรายการนั้น; spec ของ service ทั้งสองฝั่งผ่าน `npm test`

### Task 4: F2 รับคิว (ฝั่งลูกค้า)
- [ ] API: `POST /api/bookings` ตรวจ R3 แล้วเรียก `next_queue_no()`; `GET /api/bookings/:id` คืนคิว + `ahead`
- [ ] หน้า `/`: รายการบริการที่เปิด → ฟอร์มชื่อ/เบอร์ → กด "รับคิว" → ไปหน้า `/ticket/:id`
- [ ] หน้า `/ticket/:id`: แสดงเลขคิว, บริการ, "อีก N คิวถึงคุณ", รีเฟรชทุก 10 วินาที
- [ ] ทดสอบ: รับคิว 3 ครั้งได้เลข 1,2,3; เปิด ticket ของคิว 3 เห็น "อีก 2 คิว"; รับคิวบริการที่ปิดอยู่ต้องได้ error ภาษาไทย; spec ผ่าน

### Task 5: F3 จัดการคิว (ฝั่งช่าง)
- [ ] API: `GET /api/bookings/today`, `PATCH /api/bookings/:id/status` → `set_booking_status()`
- [ ] หน้า `/staff`: รายการคิววันนี้ แยกกลุ่ม กำลังเรียก / รอ / เสร็จ+ยกเลิก; ปุ่ม เรียก/เสร็จ/ยกเลิก; รีเฟรชทุก 10 วินาที
- [ ] ทดสอบ: กดเรียกคิว 1 → status = called, called_at มีค่า; กดเสร็จ → done; PATCH done → waiting ได้ 400; ticket ของคิว 3 ตอนนี้เห็น "อีก 1 คิว"; spec ผ่าน

### Task 6: F4 จอแสดงคิว
- [ ] หน้า `/display`: ตัวหนังสือใหญ่ "กำลังเรียก: [เลข]" + "คิวถัดไป: [3 เลข]"; รีเฟรชทุก 5 วินาที; ไม่มีปุ่ม
- [ ] ทดสอบ: เปิด `/display` บนคอม เปิด `/staff` บนมือถือ กดเรียก → จอเปลี่ยนภายใน 5 วินาที

### Task 7: ปิดงาน
- [ ] ยืนยันว่า `queue_no` เริ่ม 1 ใหม่เมื่อ `queue_date` เปลี่ยน (ทดสอบโดยแก้วันที่ในฐานข้อมูล)
- [ ] ไล่เช็ค 1.8 ทุกข้อ; ทุกหน้าทดสอบที่ 375px; error ทุกจุดแสดงข้อความไทย
- [ ] เขียน README.md: วิธีตั้ง Supabase, วิธีรัน, วิธี deploy ขึ้น Render, รายการ env
- [ ] ทดสอบ: คนอื่นอ่าน README แล้วรันได้โดยไม่ต้องถาม
