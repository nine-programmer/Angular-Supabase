# ระบบจองคิวตัดผมออนไลน์

> เอกสารหลักของระบบนี้ อ่านคู่กับ `AGENTS.md`, `docs/ARCHITECTURE.md` และทำงานตาม `docs/TASKS.md`
> เวอร์ชัน: 1.1 | วันที่: 2026-09-05 | สถานะ: พร้อมสร้าง

---

## 0. คำสั่งสำหรับ AI Agent (อ่านก่อนทำอะไรทั้งสิ้น)

คุณคือผู้ช่วยสร้างซอฟต์แวร์ ผู้ใช้ไม่ใช่โปรแกรมเมอร์ ทำตามกติกานี้อย่างเคร่งครัด:

**ลำดับการทำงาน**

1. อ่านให้ครบก่อน: `AGENTS.md` (กติกาโค้ด) → `docs/ARCHITECTURE.md` (โครงสร้าง) → เอกสารนี้ → `docs/DESIGN.md` (ระบบออกแบบ — มีหลัง Task Design UX/UI ผ่าน; ถ้ามีแล้ว ทุก Task ที่มีหน้าจอต้องทำตาม) → `docs/TASKS.md` (ความคืบหน้า) → บันทึกล่าสุดใน `.sessions/` (ถ้ามี — สิ่งที่ AI คนก่อนทำและตัดสินใจไว้; log ที่มีบรรทัด "ล้าสมัยบางส่วน" ให้เชื่อ SPEC/TASKS ปัจจุบันก่อน) — เครื่องมือที่โหลด `AGENTS.md`/`docs/ARCHITECTURE.md` ให้อัตโนมัติอยู่แล้ว (เช่น Claude Code ผ่าน `CLAUDE.md`) ไม่ต้องอ่านสองไฟล์นั้นซ้ำ
2. สรุปสิ่งที่เข้าใจกลับมาเป็นภาษาไทยไม่เกิน 5 บรรทัด พร้อมบอกว่า Task ถัดไปคืออะไร — ถ้าข้อความของผู้ใช้มีคำว่า "เริ่ม" อยู่แล้ว (เช่น prompt มาตรฐานด้านล่าง) ให้ทำ Task ถัดไปต่อทันทีหลังสรุป ไม่ต้องรอยืนยันอีกรอบ; ถ้าไม่มี ให้รอผู้ใช้สั่ง
3. Task ถัดไป = Task แรกใน `docs/TASKS.md` ที่เป็น `[~]` (ค้างจาก session ก่อน — อ่าน log ล่าสุดใน `.sessions/` ก่อนทำต่อ) ถ้าไม่มีจึงเป็น `[ ]` แรก; ถ้าเจอ `[!]` ให้ถามผู้ใช้ก่อนว่าจะแก้หรือข้าม; เปลี่ยนเป็น `[~]` ก่อนแก้ไฟล์แรก ทำ**เพียง Task เดียว**แล้วหยุด; ถ้าต้องหยุดกลางทาง (ผู้ใช้สั่งหยุด/ติดปัญหา) เขียนสั้นๆ ในบรรทัด "ผล:" ว่าทำถึงไหน ไฟล์ไหนยังไม่เสร็จ — agent ถัดไปอ่านบรรทัดนี้แทน log
4. ทุกครั้งที่ส่งงาน บอกให้ครบ: แก้ไฟล์ไหน / รันคำสั่งอะไร / ทดสอบอย่างไร — วิธีทดสอบต้องเป็นสิ่งที่ผู้ใช้กดในเบราว์เซอร์แล้วเห็นได้ หรือสิ่งที่ agent รันให้เอง (`npm test`); ห้ามให้ผู้ใช้ใช้ curl/SQL/เครื่องมือของโปรแกรมเมอร์เอง — ถ้าจำเป็นต้องตรวจที่ฐานข้อมูล agent เขียน SQL block ให้ผู้ใช้วางใน Supabase Dashboard → SQL Editor แล้วกด Run พร้อมบอกผลที่ต้องเห็น
5. รอผู้ใช้ทดสอบ ถ้า "ผ่าน" → ใน `docs/TASKS.md` เปลี่ยนเป็น `[x]` ใส่วันที่ในบรรทัด "ผล:" อัปเดตบรรทัด header แล้วปิดท้ายด้วย**ข้อความเดียว**: "Task นี้เสร็จสิ้นแล้วครับ — (1) จะบันทึกงานลง `.sessions/` ไหม (2) จะทำ Task ถัดไปที่ session นี้เลย หรือเปิด session ใหม่? ตอบสั้นๆ ได้ เช่น 'บันทึก, ต่อเลย' — ถ้าเปิดใหม่ ใช้ prompt นี้: `อ่าน docs/SYSTEM_SPEC.md แล้วเริ่มตาม Section 0`" แล้ว**หยุดรอ** ห้ามเริ่ม Task ถัดไปเอง และไม่ต้องแนะนำว่าควรเลือกแบบไหน
   - ถ้าผู้ใช้ให้บันทึก: เขียน `.sessions/YYYY-MM-DD-HHmm-<task-slug>.md` (สร้างโฟลเดอร์เองถ้ายังไม่มี) ตามโครง `.claude/skills/system-spec-builder/templates/SESSION_LOG.md`: ทำอะไร แก้ไฟล์ไหน ตัดสินใจอะไรเพราะอะไร **ปัญหาที่เจอ+วิธีแก้** ทดสอบอย่างไร Task ถัดไปคืออะไร แล้วเติมชื่อไฟล์ต่อท้ายบรรทัด "ผล:" — เพื่อให้ AI เจ้าอื่นอ่านแล้วทำต่อได้; ปัญหาข้อไหนเป็นความรู้ระดับ template (เช่น Dashboard UI เปลี่ยน, เวอร์ชันเครื่องมือ) ให้แจ้งผู้ใช้ว่าควรนำกลับไปแก้ที่ template ด้วย
   - ถ้าไม่ผ่าน: แก้จนผ่านก่อน; ถ้าติดปัญหาที่แก้เองไม่ได้: ใส่ `[!]` พร้อมเหตุผลในบรรทัด "ผล:" แล้วถามผู้ใช้
6. ห้ามทำหลาย Task พร้อมกัน ห้ามเพิ่มฟีเจอร์นอกเหนือจาก Section 1 — แต่รายละเอียดคุณภาพที่ไม่เพิ่มข้อมูล/API/หน้าใหม่ (สถานะกำลังโหลด, empty state, ยืนยันก่อนทำรายการ, ข้อความ validation, ข้อความ error ที่อ่านรู้เรื่อง) ไม่นับเป็นฟีเจอร์ ทำได้เลยโดยไม่ต้องถาม
7. ถ้าเอกสารไม่ชัด แยก 2 แบบ: เรื่อง**พฤติกรรมของระบบ** (ใครทำอะไรได้ คิดยอดยังไง สถานะหมายความว่าอะไร หน้าจอต้องแสดงอะไร) ให้ถามก่อน (ไม่เกิน 3 คำถามต่อครั้ง) ห้ามเดา; เรื่อง**เทคนิค**ที่ทางเลือกไหนก็ไม่ขัด spec / `docs/ARCHITECTURE.md` / `AGENTS.md` (แบ่งไฟล์ยังไง จัด component ยังไง ข้อความ error) ให้ตัดสินใจเองแล้วจดเหตุผลสั้นๆ ในบรรทัด "ผล:" ของ Task หรือ `.sessions/` — ไม่ต้องถามผู้ใช้ในเรื่องที่ผู้ใช้ตอบไม่ได้
8. เมื่อ Task สุดท้ายผ่าน เขียน README.md ที่บอกวิธีรันและ deploy

**สิ่งที่ LOCKED**

- ตาราง/ฟิลด์ใน 1.5, กติกาธุรกิจใน 1.7, และ API path ใน 2.2 ถือว่า **LOCKED**
- `docs/DESIGN.md` ถือว่า LOCKED หลัง Task Design UX/UI ผ่าน — เปลี่ยน token/pattern = bump เวอร์ชันของไฟล์นั้น + บอกผู้ใช้ เช่นเดียวกับเอกสารนี้
- ถ้าจำเป็นต้องเปลี่ยน: แก้เอกสารนี้ก่อน + เพิ่มเวอร์ชัน (1.0 → 1.1) + บอกผู้ใช้ว่าเปลี่ยนอะไรเพราะอะไร แล้วค่อยแก้โค้ด ห้ามแก้โค้ดให้ต่างจากเอกสารเงียบๆ และเติมบรรทัด `> ล้าสมัยบางส่วน — ดู SPEC vX.Y` ใต้ชื่อเรื่องของ log เก่าใน `.sessions/` ที่ขัดกับเวอร์ชันใหม่
- `docs/ARCHITECTURE.md` เป็นของ template ห้ามแก้ในโปรเจกต์นี้

**รูปแบบคำตอบ**

- อธิบายเป็นภาษาไทยง่ายๆ
- การสร้างระบบต้องใช้ agent ที่แก้ไฟล์ใน repo และรันคำสั่งได้ (Claude Code, Cursor, Codex, Gemini CLI, GitHub Copilot agent ฯลฯ) — เว็บแชทที่ไม่เห็น repo ใช้ได้เฉพาะช่วยเขียน/ตรวจ spec หรือถามตอบ โดยผู้ใช้วางไฟล์ 4 ไฟล์ให้ก่อน (`AGENTS.md`, `docs/ARCHITECTURE.md`, เอกสารนี้, `docs/TASKS.md` — และ `docs/DESIGN.md` ถ้ามีแล้ว)

---

## 1. Spec — ระบบนี้ทำอะไร

### 1.1 ปัญหาที่ต้องการแก้

ปัจจุบันลูกค้านัดหมายตัดผมผ่านการโทรศัพท์ ทางร้านต้องจดลงสมุดหรืออาศัยจำเอา ทำให้เกิดปัญหาคิวชนกัน ลืมคิว และช่างคนเดียวกันถูกนัดซ้อนเวลาเดียวกัน ต้องการระบบให้ลูกค้าดูเวลาว่างของช่างแต่ละคนและกดจองคิวล่วงหน้าเองได้ พร้อมระบบจัดการตารางคิวสำหรับร้าน

### 1.2 ผู้ใช้

- ใครใช้: ลูกค้า (จองคิว/ค้นหา/ยกเลิกคิว) และช่าง/ผู้ดูแลร้าน (ดูตารางคิวหน้าร้าน, เปลี่ยนสถานะ, จองแทนลูกค้า, ตั้งค่าร้าน)
- บทบาท: 2 บทบาท
  - ลูกค้าทั่วไป: เข้าหน้าเว็บสาธารณะ ไม่ต้องล็อกอิน ใช้ชื่อและเบอร์โทรศัพท์
  - ร้านค้า/ช่าง: เข้าหน้าจัดการหลังร้าน โดยตรวจสอบด้วยรหัส PIN หน้าร้าน (ค่าเริ่มต้น `1234`)
- ใช้บน: รองรับ Responsive ทุกขนาดหน้าจอ ทั้งมือถือ (Smart Phone), แท็บเล็ต (iPad/Tablet) และหน้าจอคอมพิวเตอร์ (Desktop)

### 1.3 ฟีเจอร์รอบแรก (MVP)

| #   | ฟีเจอร์                      | ผู้ใช้สามารถ...                                                                                                                                                        |
| --- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F1  | จัดการร้านค้า ช่าง และบริการ | ร้านค้าตั้งค่าเวลาเปิด-ปิด (default 08:30-20:30), ความยาวรอบจอง (default 45 นาที), เวลายกเลิกล่วงหน้า (default 2 ชม.), แก้รหัส PIN; เพิ่ม/แก้ไข/เปิด-ปิดช่าง และบริการ |
| F2  | ลูกค้าจองคิวล่วงหน้า         | เลือกล่วงหน้าระบุช่าง บริการ วันที่ และเลือกรอบเวลาที่ช่างยังว่างอยู่ กรอกชื่อ เบอร์โทร ทรงผม/หมายเหตุ ยืนยันการจองและได้ใบนัดหมายพร้อมรหัสการจอง                      |
| F3  | ตรวจสอบและยกเลิกคิว          | ลูกค้าค้นหาคิวด้วยเบอร์โทรหรือรหัสการจอง ดูรายละเอียด และกดยกเลิกคิวเองได้หากก่อนเวลาเริ่มนัดหมายตามเงื่อนไขที่ร้านตั้งไว้                                             |
| F4  | กระดานตารางคิวหน้าร้าน       | ช่าง/ร้านค้าเปิดดูตารางคิวประจำวัน (เลือกวัน/เลือกช่างได้), เปลี่ยนสถานะคิว (เริ่มบริการ/เสร็จสิ้น/ยกเลิก), และกดจองคิวแทนลูกค้า walk-in หรือโทรมาจองได้               |

**ฟีเจอร์รอบถัดไป** (เพิ่มแถวเมื่อสร้าง `docs/features/<name>/`)

| ฟีเจอร์  | เอกสาร | เวอร์ชัน |
| -------- | ------ | -------- |
| ยังไม่มี | —      | —        |

### 1.4 สิ่งที่ _ไม่ทำ_ ในรอบนี้ (รอบถัดไป)

- ระบบชำระเงินออนไลน์ / มัดจำค่าบริการ
- ระบบส่ง SMS หรือ LINE Notification แจ้งเตือนอัตโนมัติ
- ระบบสมาชิกสะสมแต้ม / บันทึกประวัติส่วนตัวลูกค้าแบบล็อกอิน
- การลบช่างหรือบริการแบบถาวร (ใช้การปิดใช้งาน `is_active = false` แทน)

### 1.5 ข้อมูลหลัก [LOCKED]

ช่องหมายเหตุระบุเสมอว่า `บังคับ` (ต้องกรอก) / `ห้ามซ้ำ` / `ว่างได้` และค่าเริ่มต้นถ้ามี — ทุกตารางมี `id` และ `created_at` อัตโนมัติ

**ตาราง `shop_settings`** — ข้อมูลการตั้งค่าของร้าน (มีแถวเดียวเสมอ)

| ฟิลด์               | ชนิด        | หมายเหตุ                                                                                        |
| ------------------- | ----------- | ----------------------------------------------------------------------------------------------- |
| id                  | uuid        | primary key, สร้างอัตโนมัติ                                                                     |
| singleton           | boolean     | บังคับ, default `true`, `UNIQUE`, `CHECK (singleton = true)` — บังคับให้มีได้แถวเดียว (R9)      |
| open_time           | time        | บังคับ, default `'08:30'`, `CHECK (open_time < close_time)` — เวลาเปิดร้าน                      |
| close_time          | time        | บังคับ, default `'20:30'` — เวลาปิดร้าน                                                         |
| slot_duration_min   | integer     | บังคับ, default `45`, `CHECK (slot_duration_min > 0)` — ระยะเวลาต่อ 1 รอบคิว (นาที)             |
| cancel_before_hours | integer     | บังคับ, default `2`, `CHECK (cancel_before_hours >= 0)` — ต้องยกเลิกล่วงหน้าอย่างน้อย (ชั่วโมง) |
| staff_pin           | text        | บังคับ, default `'1234'` — รหัส PIN เข้าหน้าจัดการหลังร้าน                                      |
| updated_at          | timestamptz | ว่างได้ — เวลาที่แก้ไขล่าสุด (ตั้งด้วย trigger `set_updated_at()` ใน migration)                 |
| created_at          | timestamptz | สร้างอัตโนมัติ                                                                                  |

**ตาราง `barbers`** — ข้อมูลช่างตัดผม

| ฟิลด์      | ชนิด        | หมายเหตุ                                               |
| ---------- | ----------- | ------------------------------------------------------ |
| id         | uuid        | primary key, สร้างอัตโนมัติ                            |
| name       | text        | บังคับ — ชื่อจริง-นามสกุล (ไม่บังคับห้ามซ้ำ)           |
| nickname   | text        | บังคับ, ห้ามซ้ำ — ชื่อเล่นที่แสดงในระบบ เช่น "ช่างเอก" |
| phone      | text        | ว่างได้ — เบอร์โทรศัพท์ช่าง                            |
| is_active  | boolean     | บังคับ, default `true` — เปิด/ปิดรับคิว                |
| updated_at | timestamptz | ว่างได้ — เวลาที่แก้ไขล่าสุด (ตั้งด้วย trigger)        |
| created_at | timestamptz | สร้างอัตโนมัติ                                         |

**ตาราง `services`** — ข้อมูลบริการ

| ฟิลด์      | ชนิด        | หมายเหตุ                                                        |
| ---------- | ----------- | --------------------------------------------------------------- |
| id         | uuid        | primary key, สร้างอัตโนมัติ                                     |
| name       | text        | บังคับ, ห้ามซ้ำ — ชื่อบริการ เช่น "สระ-ตัดผมชาย", "โกนหนวด"     |
| price      | numeric     | บังคับ, default `0`, `CHECK (price >= 0)` — ราคาค่าบริการ (บาท) |
| is_active  | boolean     | บังคับ, default `true` — เปิด/ปิดให้บริการ                      |
| updated_at | timestamptz | ว่างได้ — เวลาที่แก้ไขล่าสุด (ตั้งด้วย trigger)                 |
| created_at | timestamptz | สร้างอัตโนมัติ                                                  |

**ตาราง `bookings`** — รายการจองคิว

| ฟิลด์          | ชนิด        | หมายเหตุ                                                                               |
| -------------- | ----------- | -------------------------------------------------------------------------------------- |
| id             | uuid        | primary key, สร้างอัตโนมัติ                                                            |
| booking_code   | text        | บังคับ, ห้ามซ้ำ — รหัสการจอง เช่น `BK-260906-001`                                      |
| barber_id      | uuid        | บังคับ — → `barbers.id`                                                                |
| service_id     | uuid        | บังคับ — → `services.id`                                                               |
| booking_date   | date        | บังคับ — วันที่นัดหมาย (เวลาไทย)                                                       |
| start_time     | time        | บังคับ — เวลาเริ่มต้นของคิว เช่น `10:00:00`                                            |
| end_time       | time        | บังคับ — เวลาสิ้นสุดของคิว เช่น `10:45:00`                                             |
| customer_name  | text        | บังคับ — ชื่อลูกค้า                                                                    |
| customer_phone | text        | บังคับ — เบอร์โทรศัพท์ลูกค้า                                                           |
| note           | text        | ว่างได้ — ทรงผมที่ต้องการ หรือหมายเหตุเพิ่มเติม                                        |
| status         | text        | บังคับ, default `'confirmed'` — `confirmed` / `in_service` / `completed` / `cancelled` |
| cancelled_at   | timestamptz | ว่างได้ — เวลาที่กดยกเลิก                                                              |
| cancel_reason  | text        | ว่างได้ — เหตุผลในการยกเลิก                                                            |
| created_at     | timestamptz | สร้างอัตโนมัติ = เวลาที่ทำรายการจอง                                                    |

**ความสัมพันธ์:**

- `bookings.barber_id` → `barbers.id` (`ON DELETE RESTRICT`)
- `bookings.service_id` → `services.id` (`ON DELETE RESTRICT`)

**สถานะคิว:**

```
confirmed ──→ in_service ──→ completed
    │              │
    └──────────────┴────────→ cancelled
```

### 1.6 ขั้นตอนการใช้งานหลัก

1. **ลูกค้าจองคิว**:
   - เปิดหน้าแรก `/` กด "จองคิว"
   - เลือกช่าง (หรือดูรอบว่างของช่างแต่ละคน) และเลือกบริการ
   - เลือกวันที่ต้องการ ระบบคำนวณและแสดงเฉพาะรอบเวลาที่ช่างคนนั้นยังว่างอยู่
   - เลือกรอบเวลา กรอกชื่อ เบอร์โทร และทรงผมที่ต้องการ กด "ยืนยันการจอง"
   - ระบบแสดงหน้าใบนัดหมาย `/booking/:code` พร้อมรหัสจอง วันเวลา และชื่อช่าง ให้ลูกค้าแคปหน้าจอไว้
2. **ลูกค้าตรวจสอบ/ยกเลิกคิว**:
   - เปิดหน้า `/my-booking` กรอกเบอร์โทรหรือรหัสจอง เพื่อดูใบนัดหมาย
   - หากคิวเป็นสถานะ `confirmed` และเวลาปัจจุบันยังไม่ถึงกำหนด (ห่างจากเวลานัดมากกว่าหรือเท่ากับ `cancel_before_hours` ของร้าน) จะมีปุ่ม "ยกเลิกคิว" ให้ลูกค้ากดยืนยันยกเลิกได้
   - หากเหลือเวลาน้อยกว่าที่ร้านกำหนด ระบบแจ้งเตือนให้ติดต่อร้านค้าโดยตรง
3. **ช่าง/หน้าร้านจัดการคิว**:
   - เปิดหน้า `/staff` กรอกรหัส PIN หน้าร้านเพื่อเข้าสู่ระบบ
   - หน้าแรกแสดงกระดานตารางคิวประจำวัน (เลือกเปลี่ยนวัน และเลือกกรองตามช่างได้)
   - กรณีมีลูกค้า walk-in หรือโทรมาจอง หน้าร้านกดปุ่ม "เพิ่มคิว" เพื่อจองให้ลูกค้าได้
   - เมื่อลูกค้ามาถึง กดปุ่ม "เริ่มบริการ" (สถานะเปลี่ยนเป็น `in_service`)
   - เมื่อตัดผมเสร็จ กดปุ่ม "เสร็จสิ้น" (สถานะเปลี่ยนเป็น `completed`)
   - มีเมนู `/staff/settings` สำหรับแก้ไขเวลาเปิด-ปิดร้าน, ระยะเวลารอบคิว, เวลายกเลิกล่วงหน้า, PIN และเปิด-ปิดบริการ/ช่าง

### 1.7 กติกาธุรกิจ [LOCKED]

| #   | กติกา                                                                                                                      | บังคับที่                                                                                                                                                                                                                                                                                                                       |
| --- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1  | ช่างคนเดียวกันห้ามมีคิวทับซ้อนกันในวันและเวลาเดียวกัน (ตรวจทุกสถานะยกเว้นที่ยกเลิก: `status != 'cancelled'`) แม้กดพร้อมกัน | Postgres function `create_booking(...)` ใช้ advisory lock `pg_advisory_xact_lock(hashtext(barber_id::text \|\| booking_date::text))` แล้วตรวจ `(start_time, end_time) OVERLAPS` กับคิวที่ `status != 'cancelled'` ก่อนบันทึก หากซ้อน `RAISE EXCEPTION 'ช่วงเวลานี้ของช่างถูกจองแล้ว กรุณาเลือกรอบอื่น' USING ERRCODE = 'P0409'` |
| R2  | รหัสการจอง booking_code ห้ามซ้ำกัน                                                                                         | DB constraint `UNIQUE (booking_code)` + function `create_booking(...)` สร้างรหัสตามรูปแบบ `BK-YYMMDD-XXX` ภายใน transaction เดียวกัน                                                                                                                                                                                            |
| R3  | ห้ามจองวันและเวลาย้อนหลัง                                                                                                  | API และ Postgres function `create_booking(...)` ตรวจสอบ `(booking_date + start_time) > (now() at time zone 'Asia/Bangkok')` หากย้อนหลัง `RAISE EXCEPTION 'ไม่สามารถเลือกวันและเวลาย้อนหลังได้'` (→ 400)                                                                                                                         |
| R4  | ลูกค้ายกเลิกคิวได้เองเฉพาะสถานะ confirmed และต้องก่อนเวลาเริ่มบริการอย่างน้อย `cancel_before_hours` ชั่วโมง                | API `POST /api/bookings/:code/cancel` (service layer) ตรวจสอบสถานะ `confirmed` และเงื่อนไขเวลาเทียบกับ `shop_settings.cancel_before_hours` หากไม่ผ่านตอบ 400 พร้อมข้อความแจ้งเตือน; การยกเลิกจริงเรียกผ่าน `set_booking_status`                                                                                                 |
| R5  | เปลี่ยนสถานะคิวได้ตามแผนผังใน 1.5 เท่านั้น และบันทึกเวลาเมื่อยกเลิก                                                        | **Postgres function `set_booking_status(booking_id, new_status, reason)` เท่านั้น** (มี side-effect ตั้ง `cancelled_at = now()` จึงห้ามใช้ conditional-update ใน API) — ตรวจสถานะเดิม หากไม่ตรงแผนผัง `RAISE EXCEPTION 'ไม่สามารถเปลี่ยนสถานะนี้ได้' USING ERRCODE = 'P0409'`                                                   |
| R6  | จองได้เฉพาะช่างและบริการที่ `is_active = true`                                                                             | `create_booking(...)` ตรวจสอบสถานะช่างและบริการก่อนสร้างคิว หากไม่ active `RAISE EXCEPTION 'ช่างหรือบริการนี้ไม่พร้อมให้บริการ'` (→ 400)                                                                                                                                                                                        |
| R7  | สถานะต้องเป็นค่าใดค่าหนึ่งใน 4 ค่า                                                                                         | DB `CHECK (status IN ('confirmed', 'in_service', 'completed', 'cancelled'))` + `shared/enums/bookings.enums.ts` ค่าเดียวกัน                                                                                                                                                                                                     |
| R8  | ช่างและบริการที่มีประวัติการจอง ห้ามลบจริง ให้ใช้ปิดการใช้งานแทน                                                           | FK `ON DELETE RESTRICT` และไม่มี API DELETE ให้ใช้การอัปเดต `is_active = false`                                                                                                                                                                                                                                                 |
| R9  | ตาราง `shop_settings` มีข้อมูลได้เพียง 1 แถวเท่านั้น                                                                       | DB constraint: คอลัมน์ `singleton boolean NOT NULL DEFAULT TRUE UNIQUE CHECK (singleton = TRUE)` — การ INSERT แถวที่สองจะ fail ที่ UNIQUE constraint โดยอัตโนมัติ ไม่ต้องตรวจใน API                                                                                                                                             |

### 1.8 เงื่อนไขว่า "ใช้ได้แล้ว"

- [ ] ลูกค้าสามารถเลือกช่าง วันที่ และเห็นเฉพาะรอบเวลาที่ว่างอยู่จริง แล้วกดจองสำเร็จ
- [ ] ลูกค้าค้นหาคิวด้วยเบอร์โทรหรือรหัสจอง และสามารถกดยกเลิกล่วงหน้าได้ตามเวลาที่กำหนด
- [ ] หากเหลือเวลาน้อยกว่าที่ร้านตั้งไว้ ระบบปฏิเสธการยกเลิกของลูกค้าพร้อมแสดงข้อความแจ้งเตือน
- [ ] ช่างเข้าหน้า `/staff` ด้วยรหัส PIN และเห็นตารางคิวของวันนั้นถูกต้อง สามารถกดเริ่มบริการและเสร็จสิ้นได้
- [ ] ช่างคนเดียวกัน ไม่สามารถถูกจองซ้อนในช่วงเวลาเดียวกันได้ — ผ่าน spec ของ `create_booking` ที่ mock concurrent calls และตรวจว่า call ที่สองได้รับ error 409 (ไม่ต้องทดสอบด้วยการเปิดสองหน้าจอกดพร้อมกันด้วยตนเอง)
- [ ] ร้านค้าสามารถแก้ไขเวลาเปิด-ปิด ความยาวรอบคิว และเวลายกเลิกได้ผ่านหน้าตั้งค่า และรอบเวลาคำนวณใหม่ถูกต้อง
- [ ] แสดงผลสวยงามและใช้งานได้สะดวกบนทุกขนาดหน้าจอ ทั้งมือถือ แท็บเล็ต และเดสก์ท็อป

### 1.9 สมมติฐาน (ผู้ใช้ยังไม่ได้ยืนยัน แก้ได้ภายหลัง)

- รหัส PIN หน้าร้านสำหรับพนักงานเริ่มต้นคือ `1234` เก็บใน `shop_settings` และสามารถเปลี่ยนผ่านหน้าตั้งค่าได้
- รอบเวลาคำนวณจาก `open_time` เพิ่มขึ้นทีละ `slot_duration_min` จนถึง `close_time` (เช่น 08:30, 09:15, 10:00...)
- ข้อมูลเริ่มต้น (Seed data):
  - การตั้งค่าร้าน: เปิด 08:30, ปิด 20:30, รอบละ 45 นาที, ยกเลิกล่วงหน้า 2 ชม., PIN 1234
  - ช่างตัวอย่าง 3 คน: ช่างเอก, ช่างบอล, ช่างวัฒน์
  - บริการตัวอย่าง 3 รายการ: สระ-ตัดผมชาย (250 บาท), ดัดวอลลุ่ม/ทำสี (800 บาท), โกนหนวด-เซ็ตผม (150 บาท)
- การอัปเดตตารางคิวหน้าหน้าร้านใช้ polling ทุก 10 วินาที (ตาม ARCHITECTURE.md ข้อ 9 แนะนำ 5–10 วินาที)
- Deploy บน Render
- ดีไซน์: โทนร้านตัดผมโมเดิร์น เรียบ เท่ สะอาด (Modern Barber) รองรับ Responsive ทุกขนาดหน้าจอ

---

## 2. Architecture — เฉพาะส่วนของระบบนี้

โครงสร้าง โฟลเดอร์ ชื่อไฟล์ และกติกาโค้ดใช้ตาม `docs/ARCHITECTURE.md` และ `AGENTS.md` ทุกข้อ ส่วนนี้มีแค่สิ่งที่ต่างกันต่อโปรเจกต์

### 2.1 Stack และ deploy

- Stack: มาตรฐานตาม `docs/ARCHITECTURE.md` เวอร์ชัน template 1.9 (Angular 22 + SSR + Express 5 + Supabase JS 2 + Tailwind CSS 4)
- Deploy: Render (Node web service) ตั้งค่า environment variables ใน dashboard รวม `NG_ALLOWED_HOSTS` เป็นโดเมนจริงของ Render

### 2.2 API ที่ต้องมี [LOCKED]

| Method | Path                          | ทำอะไร                                                                                                                                                                                                                                                                                                                 | กติกาที่เกี่ยว |
| ------ | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| GET    | /api/health                   | ตอบ `{ ok: true, count: N }` — N = จำนวนคิววันนี้ (ตรวจการเชื่อมต่อ DB)                                                                                                                                                                                                                                                | —              |
| GET    | /api/settings                 | คืนค่าการตั้งค่าร้าน ตอบ `{ open_time, close_time, slot_duration_min, cancel_before_hours }` — ห้ามส่ง `staff_pin` ไปที่เบราว์เซอร์                                                                                                                                                                                    | —              |
| PUT    | /api/settings                 | body `{ current_pin: string, open_time: string, close_time: string, slot_duration_min: number, cancel_before_hours: number, staff_pin?: string }` — `current_pin` บังคับ ต้องตรงกับ `staff_pin` ปัจจุบัน; หากไม่ตรงตอบ 400; ตอบ `{ open_time, close_time, slot_duration_min, cancel_before_hours }` (ไม่ตอบ staff_pin) | R9             |
| POST   | /api/staff/verify-pin         | body `{ pin: string }` → ตอบ `{ valid: boolean }`                                                                                                                                                                                                                                                                      | —              |
| GET    | /api/barbers                  | ตอบ `{ id, name, nickname, phone, is_active, updated_at }[]` เรียงตาม `nickname`; `?active=true` กรองเฉพาะ `is_active = true`                                                                                                                                                                                          | —              |
| POST   | /api/barbers                  | body `{ name: string (บังคับ), nickname: string (บังคับ, ห้ามซ้ำ), phone?: string }` → ตอบ barber ที่สร้าง                                                                                                                                                                                                             | —              |
| PUT    | /api/barbers/:id              | body `{ name?, nickname?, phone?, is_active? }` (ส่งเฉพาะ field ที่จะแก้) → ตอบ barber ที่อัปเดต                                                                                                                                                                                                                       | R8             |
| GET    | /api/services                 | ตอบ `{ id, name, price, is_active, updated_at }[]` เรียงตาม `name`; `?active=true` กรองเฉพาะ `is_active = true`                                                                                                                                                                                                        | —              |
| POST   | /api/services                 | body `{ name: string (บังคับ, ห้ามซ้ำ), price: number (บังคับ, >= 0) }` → ตอบ service ที่สร้าง                                                                                                                                                                                                                         | —              |
| PUT    | /api/services/:id             | body `{ name?, price?, is_active? }` (ส่งเฉพาะ field ที่จะแก้) → ตอบ service ที่อัปเดต                                                                                                                                                                                                                                 | R8             |
| GET    | /api/bookings/available-slots | query `barber_id` (uuid, บังคับ), `date` (YYYY-MM-DD, บังคับ) → ตอบ `{ slots: { start_time: string, end_time: string, is_available: boolean }[] }` เรียงตาม `start_time`                                                                                                                                               | R1             |
| POST   | /api/bookings                 | body `{ barber_id, service_id, booking_date, start_time, customer_name, customer_phone, note? }` — `end_time` server คำนวณเองจาก `start_time + slot_duration_min` (ไม่ต้องส่ง) → เรียก `create_booking` → ตอบ `{ booking_code, booking_date, start_time, end_time, barber_nickname, service_name }`                    | R1, R2, R3, R6 |
| GET    | /api/bookings/search          | query `phone` หรือ `code` (ต้องส่งอย่างใดอย่างหนึ่ง) → ตอบ `{ id, booking_code, booking_date, start_time, end_time, status, barber_nickname, service_name }[]` เรียงตาม `booking_date, start_time` (อาจเป็น array ว่าง ถ้าไม่พบ — ไม่ตอบ 404)                                                                          | —              |
| GET    | /api/bookings/code/:code      | ตอบ `{ id, booking_code, booking_date, start_time, end_time, customer_name, customer_phone, note, status, cancelled_at, cancel_reason, created_at, barber: { id, nickname }, service: { id, name, price }, can_cancel: boolean }` — `can_cancel = status === 'confirmed' && เวลาห่างจาก start ≥ cancel_before_hours`   | R4             |
| POST   | /api/bookings/:code/cancel    | body `{ reason?: string }` → ตรวจเงื่อนไขตาม R4 แล้วเรียก `set_booking_status(..., 'cancelled', reason)` → ตอบ `{ booking_code, status: 'cancelled', cancelled_at }`                                                                                                                                                   | R4, R5         |
| GET    | /api/bookings/schedule        | query `date` (YYYY-MM-DD, default วันนี้เวลาไทย), `barber_id` (uuid, optional) → ตอบ `{ id, booking_code, start_time, end_time, customer_name, customer_phone, note, status, barber: { id, nickname }, service: { name } }[]` เรียงตาม `start_time`                                                                    | —              |
| PATCH  | /api/bookings/:id/status      | body `{ status: 'in_service' \| 'completed' \| 'cancelled', reason?: string }` → เรียก `set_booking_status` → ตอบ `{ id, status, cancelled_at }` สำหรับหน้าร้าน (`:id` = booking uuid, ตรวจ `z.string().uuid()`)                                                                                                       | R5, R7         |

รูปแบบตอบกลับ: ทุก endpoint ตอบ JSON; request body ตรวจด้วย zod schema ใน `src/shared/dto/`; query params ตรวจด้วย zod schema เช่นกัน; `:id` ที่เป็น uuid ไม่ถูก format ตอบ 404 (ไม่ตอบ 422); error ตอบ HTTP status + `{ error: "ข้อความไทย" }` ตาม `AGENTS.md` → API Layer

### 2.3 ฟีเจอร์ → ไฟล์

| ฟีเจอร์ | feature folder (`src/app/features/`) + หน้า                                                                                                                  | API ที่หน้าใช้                                                                                                                                                      | server (`routes/`, `services/`)                                                                                                                          | shared (`dto/`, `enums/`)                              |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| F1      | `settings/` หน้า `/staff/settings` (`settings.page.ts`, component ย่อย: `components/barber-manager.component.ts`, `components/service-manager.component.ts`) | GET/PUT /api/settings, GET/POST/PUT /api/barbers, GET/POST/PUT /api/services                                                                                        | `settings.routes.ts`, `settings-server.service.ts`, `barbers.routes.ts`, `barbers-server.service.ts`, `services.routes.ts`, `services-server.service.ts` | `settings.dto.ts`, `barbers.dto.ts`, `services.dto.ts` |
| F2      | `booking/` หน้า `/` (`booking.page.ts`), `/booking/:code` (`booking-ticket.page.ts`)                                                                         | GET /api/settings, GET /api/barbers?active=true, GET /api/services?active=true, GET /api/bookings/available-slots, POST /api/bookings, GET /api/bookings/code/:code | `bookings.routes.ts`, `bookings-server.service.ts`                                                                                                       | `bookings.dto.ts`, `bookings.enums.ts`                 |
| F3      | `booking/` หน้า `/my-booking` (`my-booking.page.ts`)                                                                                                         | GET /api/bookings/search, POST /api/bookings/:code/cancel                                                                                                           | `bookings.routes.ts`, `bookings-server.service.ts`                                                                                                       | `bookings.dto.ts`                                      |
| F4      | `staff/` หน้า `/staff` (`queue-board.page.ts`), `/staff/login` (`staff-login.page.ts`)                                                                       | POST /api/staff/verify-pin, GET /api/bookings/schedule, PATCH /api/bookings/:id/status, POST /api/bookings                                                          | `staff.routes.ts`, `staff-server.service.ts`, `bookings.routes.ts`, `bookings-server.service.ts`                                                         | `staff.dto.ts`, `bookings.dto.ts`                      |

ลำดับ route ใน `app.routes.ts`:

1. `/staff/settings`, `/staff/login`, `/staff` (staff features)
2. `/booking/:code`, `/my-booking`, `/` (customer booking features)

### 2.4 การตัดสินใจทางเทคนิคของระบบนี้

- **การคำนวณรอบเวลา (Slot calculation)**: ทำที่ server service โดยนำ `open_time`, `close_time`, และ `slot_duration_min` มาสร้างรายการช่วงเวลาของวันนั้น แล้วเปรียบเทียบกับรายการจองใน `bookings` ของช่างคนนั้นเพื่อส่งสถานะ `is_available` ให้หน้าเว็บ
- **โซนเวลาและการเปรียบเทียบเวลา**: ยึดถือเวลาประเทศไทย (`Asia/Bangkok`) ทั้งใน SQL และ TypeScript เสมอ โดยใช้ยูทิลิตี้ `todayInThailand()` จาก `src/shared/utils/thai-date.ts`
- **การรักษาความปลอดภัยหน้าหน้าร้าน**: ใช้ PIN หน้าร้าน ตรวจสอบผ่าน `POST /api/staff/verify-pin`; เมื่อ `{ valid: true }` หน้าจอ Angular เก็บ flag `staff_authed = "1"` ลง `sessionStorage` ฝั่ง browser เท่านั้น (ไม่มี server session / cookie) — route guard `/staff` และ `/staff/settings` อ่าน flag นี้ก่อนแสดงหน้า ถ้าไม่มี redirect ไป `/staff/login`; ทุก API หน้าร้าน (schedule, status) ไม่ต้องการ auth header เพราะสิทธิ์แยกชั้นที่ PIN แล้ว ซึ่งเหมาะกับระบบหน้าร้านที่ไม่มี multi-user session
- **การอัปเดตหน้าจออัตโนมัติ**: หน้ากระดานคิวหน้าร้าน `/staff` ใช้การ polling ข้อมูลทุก 10 วินาที (ตาม ARCHITECTURE.md ข้อ 9)
- **RenderMode**: ทุกหน้าเป็น `RenderMode.Server`

### 2.5 ตัวแปร .env เพิ่มเติม (นอกจากมาตรฐานใน ARCHITECTURE.md ข้อ 8)

- ไม่มี
