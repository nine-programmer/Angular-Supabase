# ระบบจองคิวร้านตัดผม

> เอกสารหลักของระบบนี้ อ่านคู่กับ `AGENTS.md`, `docs/ARCHITECTURE.md` และทำงานตาม `docs/TASKS.md`
> เวอร์ชัน: 1.0 | วันที่: 2026-08-26 | สถานะ: พร้อมสร้าง

---

## 0. คำสั่งสำหรับ AI Agent (อ่านก่อนทำอะไรทั้งสิ้น)

คุณคือผู้ช่วยสร้างซอฟต์แวร์ ผู้ใช้ไม่ใช่โปรแกรมเมอร์ ทำตามกติกานี้อย่างเคร่งครัด:

**ลำดับการทำงาน**
1. อ่านให้ครบก่อน: `AGENTS.md` (กติกาโค้ด) → `docs/ARCHITECTURE.md` (โครงสร้าง) → เอกสารนี้ → `docs/TASKS.md` (ความคืบหน้า)
2. สรุปสิ่งที่เข้าใจกลับมาเป็นภาษาไทยสั้นๆ พร้อมบอกว่า Task ถัดไปคืออะไร แล้วรอให้ผู้ใช้ยืนยัน ยังไม่เขียนโค้ด
3. เมื่อผู้ใช้สั่ง "เริ่ม" ทำ Task แรกใน `docs/TASKS.md` ที่ยังเป็น `[ ]` **เพียง Task เดียว** แล้วหยุด
4. ทุกครั้งที่ส่งงาน บอกให้ครบ: แก้ไฟล์ไหน / รันคำสั่งอะไร / ทดสอบอย่างไร
5. รอผู้ใช้ทดสอบ ถ้า "ผ่าน" → ใน `docs/TASKS.md` เปลี่ยนเป็น `[x]` ใส่ commit + วันที่ในบรรทัด "ผล:" และอัปเดตบรรทัด header แล้วทำ Task ถัดไป; ถ้าไม่ผ่านให้แก้จนผ่านก่อน; ถ้าติดปัญหาให้ใส่ `[!]` พร้อมเหตุผล
6. ห้ามทำหลาย Task พร้อมกัน ห้ามเพิ่มฟีเจอร์นอกเหนือจาก Section 1
7. ถ้าเอกสารไม่ชัด ให้ถามก่อน (ไม่เกิน 3 คำถามต่อครั้ง) ห้ามเดา
8. เมื่อ Task สุดท้ายผ่าน เขียน README.md ที่บอกวิธีรันและ deploy

**สิ่งที่ LOCKED**
- ตาราง/ฟิลด์ใน 1.5, กติกาธุรกิจใน 1.7, และ API path ใน 2.2 ถือว่า **LOCKED**
- ถ้าจำเป็นต้องเปลี่ยน: แก้เอกสารนี้ก่อน + เพิ่มเวอร์ชัน (1.0 → 1.1) + บอกผู้ใช้ว่าเปลี่ยนอะไรเพราะอะไร แล้วค่อยแก้โค้ด ห้ามแก้โค้ดให้ต่างจากเอกสารเงียบๆ
- `docs/ARCHITECTURE.md` เป็นของ template ห้ามแก้ในโปรเจกต์นี้

**รูปแบบคำตอบ**
- อธิบายเป็นภาษาไทยง่ายๆ
- agent ที่แก้ไฟล์ใน repo ได้ (Claude Code, Cursor) ให้แก้ตรงและ commit 1 ครั้งต่อ Task; ถ้าเป็นเว็บแชทที่ไม่เห็น repo ผู้ใช้ต้องวางไฟล์ 4 ไฟล์ (`AGENTS.md`, `docs/ARCHITECTURE.md`, เอกสารนี้, `docs/TASKS.md`) และ agent ส่งไฟล์เต็มทุกครั้ง
- โค้ดทุกไฟล์ต้องมี comment สั้นๆ บอกว่าไฟล์นี้ทำอะไร

---

## 1. Spec — ระบบนี้ทำอะไร

### 1.1 ปัญหาที่ต้องการแก้
ลูกค้ามารอหน้าร้านโดยไม่รู้ว่าอีกกี่คิว ทำให้ร้านแออัดและลูกค้าบางคนเดินหนี ต้องการให้ลูกค้ารับคิวจากมือถือแล้วไปทำธุระอื่นได้ และช่างเห็นลำดับคิวชัดเจน

### 1.2 ผู้ใช้
- ใครใช้: ลูกค้าหน้าร้าน (รับคิว) และช่าง/เจ้าของร้าน (จัดการคิว)
- บทบาท: 2 บทบาท แยกด้วย URL (ลูกค้า `/` , ช่าง `/staff`) — ไม่มี login ในรอบนี้ ใครรู้ URL ก็เปิดหน้าช่างได้ (ผู้ใช้รับความเสี่ยงนี้ในรอบแรก)
- ใช้บน: ลูกค้า = มือถือ, ช่าง = แท็บเล็ตหรือมือถือ, จอหน้าร้าน = คอม/ทีวี

### 1.3 ฟีเจอร์รอบแรก (MVP)
| # | ฟีเจอร์ | ผู้ใช้สามารถ... |
|---|---|---|
| F1 | จัดการบริการ | ช่างเพิ่ม/แก้/ปิดใช้บริการ (ชื่อ, เวลาโดยประมาณ, เปิด/ปิด) |
| F2 | รับคิว | ลูกค้าเลือกบริการ กรอกชื่อ+เบอร์ ได้เลขคิว และเห็นว่าอีกกี่คิวถึงตัวเอง |
| F3 | จัดการคิว | ช่างเห็นคิววันนี้เรียงลำดับ กด เรียก / เสร็จ / ยกเลิก |
| F4 | จอแสดงคิว | หน้าจอแสดงเลขคิวที่กำลังเรียก และคิวถัดไป 3 คิว อัปเดตอัตโนมัติ |

**ฟีเจอร์รอบถัดไป** (เพิ่มแถวเมื่อสร้าง `docs/features/<name>/`): ยังไม่มี

### 1.4 สิ่งที่ *ไม่ทำ* ในรอบนี้ (รอบถัดไป)
- Login / รหัสผ่านสำหรับหน้าช่าง
- จองล่วงหน้าตามวัน-เวลา (รอบนี้เป็นคิวเดินเข้าเรียงลำดับเท่านั้น)
- แจ้งเตือน SMS / LINE เมื่อใกล้ถึงคิว
- รายงานสถิติ
- เลือกช่างเฉพาะคน
- ลบบริการถาวร (ใช้ปิดใช้แทน)

### 1.5 ข้อมูลหลัก [LOCKED]
ช่องหมายเหตุระบุเสมอว่า `บังคับ` (ต้องกรอก) / `ห้ามซ้ำ` / `ว่างได้` และค่าเริ่มต้นถ้ามี — ทุกตารางมี `id` และ `created_at` อัตโนมัติ

**ตาราง `services`** — บริการที่ร้านมี
| ฟิลด์ | ชนิด | หมายเหตุ |
|---|---|---|
| id | uuid | primary key, สร้างอัตโนมัติ |
| name | text | บังคับ — ชื่อบริการ เช่น "ตัดผมชาย" |
| duration_min | integer | บังคับ, ต้อง > 0 — เวลาโดยประมาณ (นาที) |
| is_active | boolean | บังคับ, default true — false = ซ่อนจากหน้าลูกค้า |
| created_at | timestamptz | สร้างอัตโนมัติ |

**ตาราง `bookings`** — คิวแต่ละรายการ
| ฟิลด์ | ชนิด | หมายเหตุ |
|---|---|---|
| id | uuid | primary key, สร้างอัตโนมัติ |
| service_id | uuid | บังคับ — → services.id |
| customer_name | text | บังคับ |
| phone | text | บังคับ — ไม่ตรวจรูปแบบ ไม่บังคับซ้ำ |
| queue_no | integer | บังคับ — เลขคิว เริ่ม 1 ใหม่ทุกวัน |
| queue_date | date | บังคับ — วันที่ของคิว (เวลาไทย) ใช้คู่กับ queue_no |
| status | text | บังคับ, default `waiting` — `waiting` / `called` / `done` / `cancelled` |
| called_at | timestamptz | ว่างได้ — null จนกว่าจะถูกเรียก |
| created_at | timestamptz | สร้างอัตโนมัติ = เวลารับคิว |

**ความสัมพันธ์:** `bookings.service_id` → `services.id` (`ON DELETE RESTRICT`)

**สถานะคิว:**
```
waiting → called → done
   └──────┴──────→ cancelled
```

### 1.6 ขั้นตอนการใช้งานหลัก
1. ลูกค้าสแกน QR หน้าร้าน → เปิด `/` → เห็นรายการบริการที่เปิดอยู่
2. เลือกบริการ → กรอกชื่อ + เบอร์ → กด "รับคิว"
3. เห็นหน้า "คิวของคุณคือ 12 — อีก 3 คิวถึงคุณ" (หน้านี้รีเฟรชเองทุก 10 วินาที)
4. ช่างเปิด `/staff` → เห็นคิววันนี้ 3 กลุ่ม: กำลังเรียก / รอ (เรียงเลขน้อยไปมาก) / เสร็จ+ยกเลิก
5. ช่างกด "เรียก" ที่คิว 12 → สถานะเป็น called → จอ `/display` โชว์ "กำลังเรียก: 12"
6. ทำเสร็จ ช่างกด "เสร็จ" → status = done → ย้ายไปกลุ่มเสร็จ
7. ลูกค้าไม่มา ช่างกด "ยกเลิก" → status = cancelled

### 1.7 กติกาธุรกิจ [LOCKED]
| # | กติกา | บังคับที่ |
|---|---|---|
| R1 | เลขคิวห้ามซ้ำในวันเดียวกัน แม้กดพร้อมกัน และเริ่ม 1 ใหม่ทุกวัน | DB `UNIQUE (queue_date, queue_no)` + Postgres function `create_booking(service_id, customer_name, phone)`: คำนวณ `queue_date = (now() at time zone 'Asia/Bangkok')::date`, ล็อกด้วย `pg_advisory_xact_lock(hashtext(queue_date::text))`, `queue_no = max+1` ของวันนั้น (เริ่ม 1), insert แล้วคืนแถว |
| R2 | เปลี่ยนสถานะได้ตามแผนผังใน 1.5 เท่านั้น และจดเวลาที่ถูกเรียก | Postgres function `set_booking_status(id, new_status)`: ตรวจสถานะเดิม ถ้าไม่ตรงแผนผังให้ raise error; ตั้ง `called_at = now()` เมื่อเข้า `called`; คืนแถว |
| R3 | รับคิวได้เฉพาะบริการที่ `is_active = true` | API `POST /api/bookings` ตรวจก่อนเรียก function → 400 |
| R4 | `status` ต้องเป็นค่าใดค่าหนึ่งใน 4 ค่า | DB `CHECK (status IN (...))` + `shared/enums/bookings.enums.ts` ค่าเดียวกัน |
| R5 | บริการที่มีคิวอ้างอยู่ลบไม่ได้ ให้ปิดใช้แทน | ไม่มี `DELETE /api/services`; FK `ON DELETE RESTRICT` |

### 1.8 เงื่อนไขว่า "ใช้ได้แล้ว"
- [ ] ลูกค้ารับคิวจากมือถือได้ และเห็นจำนวนคิวที่รออยู่ข้างหน้าถูกต้อง
- [ ] ช่างเปลี่ยนสถานะคิวได้ครบ 3 แบบ และลำดับบนหน้าจอถูกต้อง
- [ ] จอแสดงคิวอัปเดตภายใน 5 วินาทีหลังช่างกดเรียก โดยไม่ต้องกดรีเฟรช
- [ ] เลขคิวเริ่มที่ 1 ใหม่เมื่อขึ้นวันใหม่
- [ ] ข้อมูลไม่หายเมื่อปิดแอปเปิดใหม่
- [ ] ทุกหน้าใช้ได้บนมือถือความกว้าง 375px

### 1.9 สมมติฐาน (ผู้ใช้ยังไม่ได้ยืนยัน แก้ได้ภายหลัง)
- หลายคิวอาจอยู่สถานะ `called` พร้อมกันได้ (ช่างหลายคน) — จอแสดงทุกคิวที่ถูกเรียก
- ลูกค้าคนเดียวรับได้หลายคิวต่อวัน (ไม่ตรวจเบอร์ซ้ำ)
- เวลาทำการไม่จำกัด (ไม่ปิดรับคิวอัตโนมัติ) — ช่างปิดบริการเองด้วย `is_active`
- การอัปเดตอัตโนมัติใช้ polling ไม่ใช้ realtime เพื่อความง่าย
- ไม่มีข้อมูลเดิมต้องนำเข้า; ตอนตั้งระบบใส่บริการตัวอย่าง 3 รายการ (ตัดผมชาย 30 นาที, ตัดผมหญิง 45, โกนหนวด 15)
- Deploy บน Render

---

## 2. Architecture — เฉพาะส่วนของระบบนี้

โครงสร้าง โฟลเดอร์ ชื่อไฟล์ และกติกาโค้ดใช้ตาม `docs/ARCHITECTURE.md` และ `AGENTS.md` ทุกข้อ ส่วนนี้มีแค่สิ่งที่ต่างกันต่อโปรเจกต์

### 2.1 Stack และ deploy
- Stack: มาตรฐานตาม `docs/ARCHITECTURE.md` เวอร์ชัน template 1.0
- Deploy: Render (Node web service) ตั้ง env ใน dashboard

### 2.2 API ที่ต้องมี [LOCKED]
| Method | Path | ทำอะไร | กติกาที่เกี่ยว |
|---|---|---|---|
| GET | /api/health | ตอบ `{ ok: true, count: N }` — N = จำนวน services | — |
| GET | /api/services | รายการบริการทั้งหมด; `?active=true` เฉพาะที่เปิด (หน้าลูกค้า) | — |
| POST | /api/services | body `{ name, duration_min }` → สร้าง (is_active = true) | — |
| PUT | /api/services/:id | body `{ name, duration_min, is_active }` → แก้/เปิด/ปิดใช้ | R5 |
| POST | /api/bookings | body `{ service_id, customer_name, phone }` → ตรวจ R3 แล้วเรียก `create_booking()` → คืนแถว bookings | R1, R3 |
| GET | /api/bookings/today | คิววันนี้ทุกสถานะ เรียงตาม queue_no; แต่ละแถว + `service_name` | — |
| GET | /api/bookings/:id | แถวเดียว + `service_name` + `ahead` (จำนวนคิววันเดียวกันที่ `queue_no` น้อยกว่า และ status เป็น `waiting` หรือ `called`; query เดียวใน `bookings-server.service.ts`) | — |
| PATCH | /api/bookings/:id/status | body `{ status }` → `set_booking_status()`; error จาก function → 400 | R2, R4 |

รูปแบบตอบกลับ: ทุก endpoint ตอบ JSON เป็นแถวตาม `Tables<'services'>` / `Tables<'bookings'>` เว้นแต่ระบุเพิ่มในช่อง "ทำอะไร"; dto ประกาศใน `shared/dto/`; error ตอบ HTTP status + `{ error: "ข้อความไทย" }`

### 2.3 ฟีเจอร์ → ไฟล์
| ฟีเจอร์ | feature folder (`src/app/features/`) + หน้า | API ที่หน้าใช้ | server (`routes/`, `services/`) | shared (`dto/`, `enums/`) |
|---|---|---|---|---|
| F1 | `services/` หน้า `/staff/services` (`pages/service-manager.page.ts`), `services-client.service.ts`, `services.routes.ts` | GET/POST/PUT /api/services | `services.routes.ts`, `services-server.service.ts` | `services.dto.ts` |
| F2 | `bookings/` หน้า `/` (`pages/booking-form.page.ts`), `/ticket/:id` (`pages/ticket.page.ts`), `bookings-client.service.ts`, `bookings.routes.ts` | GET /api/services?active=true, POST /api/bookings, GET /api/bookings/:id | `bookings.routes.ts`, `bookings-server.service.ts` | `bookings.dto.ts`, `bookings.enums.ts` |
| F3 | `bookings/` หน้า `/staff` (`pages/queue-board.page.ts`) | GET /api/bookings/today, PATCH /api/bookings/:id/status | (ใช้ของ F2) | (ใช้ของ F2) |
| F4 | `bookings/` หน้า `/display` (`pages/display.page.ts`) | GET /api/bookings/today | (ใช้ของ F2) | (ใช้ของ F2) |

ลำดับ route ใน `app.routes.ts`: `staff/services` (feature services) ต้องมาก่อน `staff` (feature bookings)

### 2.4 การตัดสินใจทางเทคนิคของระบบนี้
- polling: `/ticket/:id` และ `/staff` ทุก 10 วินาที, `/display` ทุก 5 วินาที (ดู 1.9)
- `queue_date` คำนวณฝั่ง Postgres ใน `create_booking()` ด้วย timezone `Asia/Bangkok`; `/api/bookings/today` ใช้วันเดียวกันนี้
- RenderMode: `/`, `/ticket/:id`, `/staff`, `/staff/services` = `Server`; `/display` = `Client` (รีเฟรชถี่ ไม่ได้ประโยชน์จาก SSR)

### 2.5 ตัวแปร .env เพิ่มเติม (นอกจากมาตรฐานใน ARCHITECTURE.md ข้อ 8)
- ไม่มี
