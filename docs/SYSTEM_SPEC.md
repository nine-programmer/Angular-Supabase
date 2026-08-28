# ระบบยืม-คืนอุปกรณ์

> เอกสารหลักของระบบนี้ อ่านคู่กับ `AGENTS.md`, `docs/ARCHITECTURE.md` และทำงานตาม `docs/TASKS.md`
> เวอร์ชัน: 1.1 | วันที่: 2026-08-28 | สถานะ: พร้อมสร้าง
> v1.1: เพิ่มขั้น Design UX/UI (Task 2 ใน TASKS.md) และเอกสาร `docs/DESIGN.md`; Section 0 ข้อ 6 ระบุว่ารายละเอียดคุณภาพ UX ไม่นับเป็นฟีเจอร์ และข้อ 7 แยก "ถาม" (พฤติกรรมระบบ) กับ "ตัดสินเอง" (เทคนิค) — ไม่มีการเปลี่ยนตาราง/กติกา/API

---

## 0. คำสั่งสำหรับ AI Agent (อ่านก่อนทำอะไรทั้งสิ้น)

คุณคือผู้ช่วยสร้างซอฟต์แวร์ ผู้ใช้ไม่ใช่โปรแกรมเมอร์ ทำตามกติกานี้อย่างเคร่งครัด:

**ลำดับการทำงาน**

1. อ่านให้ครบก่อน: `AGENTS.md` (กติกาโค้ด) → `docs/ARCHITECTURE.md` (โครงสร้าง) → เอกสารนี้ → `docs/DESIGN.md` (ระบบออกแบบ — มีหลัง Task 2 ผ่าน; ถ้ามีแล้ว ทุก Task ที่มีหน้าจอต้องทำตาม) → `docs/TASKS.md` (ความคืบหน้า) → บันทึกล่าสุดใน `.sessions/` (ถ้ามี — สิ่งที่ AI คนก่อนทำและตัดสินใจไว้)
2. สรุปสิ่งที่เข้าใจกลับมาเป็นภาษาไทยสั้นๆ พร้อมบอกว่า Task ถัดไปคืออะไร แล้วรอให้ผู้ใช้ยืนยัน ยังไม่เขียนโค้ด
3. เมื่อผู้ใช้สั่ง "เริ่ม" ทำ Task แรกใน `docs/TASKS.md` ที่ยังเป็น `[ ]` **เพียง Task เดียว** แล้วหยุด
4. ทุกครั้งที่ส่งงาน บอกให้ครบ: แก้ไฟล์ไหน / รันคำสั่งอะไร / ทดสอบอย่างไร
5. รอผู้ใช้ทดสอบ ถ้า "ผ่าน" → ใน `docs/TASKS.md` เปลี่ยนเป็น `[x]` ใส่วันที่ในบรรทัด "ผล:" และอัปเดตบรรทัด header จากนั้น (1) ถามผู้ใช้ว่าจะบันทึกงานลง `.sessions/YYYY-MM-DD-HHmm-<task-slug>.md` ไหม (สร้างโฟลเดอร์เองถ้ายังไม่มี) ถ้าตอบว่าบันทึก ให้เขียน: ทำอะไร แก้ไฟล์ไหน ตัดสินใจอะไรเพราะอะไร ทดสอบอย่างไร Task ถัดไปคืออะไร แล้วเติมชื่อไฟล์ต่อท้ายบรรทัด "ผล:" — เพื่อให้ AI เจ้าอื่นอ่านแล้วทำต่อได้ (2) ปิดท้ายว่า "Task นี้เสร็จสิ้นแล้วครับ จะทำ Task ถัดไปที่ session นี้เลย หรือจะเปิด session ใหม่? ถ้าเปิดใหม่ ใช้ prompt นี้ได้: `อ่าน docs/SYSTEM_SPEC.md แล้วเริ่มตาม Section 0`" แล้ว**หยุดรอ** — ห้ามเริ่ม Task ถัดไปเอง และไม่ต้องแนะนำว่าควรเลือกแบบไหน; ถ้าไม่ผ่านให้แก้จนผ่านก่อน; ถ้าติดปัญหาให้ใส่ `[!]` พร้อมเหตุผล
6. ห้ามทำหลาย Task พร้อมกัน ห้ามเพิ่มฟีเจอร์นอกเหนือจาก Section 1 — แต่รายละเอียดคุณภาพที่ไม่เพิ่มข้อมูล/API/หน้าใหม่ (สถานะกำลังโหลด, empty state, ยืนยันก่อนทำรายการ, ข้อความ validation, ข้อความ error ที่อ่านรู้เรื่อง) ไม่นับเป็นฟีเจอร์ ทำได้เลยโดยไม่ต้องถาม
7. ถ้าเอกสารไม่ชัด แยก 2 แบบ: เรื่อง**พฤติกรรมของระบบ** (ใครทำอะไรได้ คิดยอดยังไง สถานะหมายความว่าอะไร หน้าจอต้องแสดงอะไร) ให้ถามก่อน (ไม่เกิน 3 คำถามต่อครั้ง) ห้ามเดา; เรื่อง**เทคนิค**ที่ทางเลือกไหนก็ไม่ขัด spec / `docs/ARCHITECTURE.md` / `AGENTS.md` (แบ่งไฟล์ยังไง จัด component ยังไง ข้อความ error) ให้ตัดสินใจเองแล้วจดเหตุผลสั้นๆ ในบรรทัด "ผล:" ของ Task หรือ `.sessions/` — ไม่ต้องถามผู้ใช้ในเรื่องที่ผู้ใช้ตอบไม่ได้
8. เมื่อ Task สุดท้ายผ่าน เขียน README.md ที่บอกวิธีรันและ deploy

**สิ่งที่ LOCKED**

- ตาราง/ฟิลด์ใน 1.5, กติกาธุรกิจใน 1.7, และ API path ใน 2.2 ถือว่า **LOCKED**
- `docs/DESIGN.md` ถือว่า LOCKED หลัง Task 2 (Design UX/UI) ผ่าน — เปลี่ยน token/pattern = bump เวอร์ชันของไฟล์นั้น + บอกผู้ใช้ เช่นเดียวกับเอกสารนี้
- ถ้าจำเป็นต้องเปลี่ยน: แก้เอกสารนี้ก่อน + เพิ่มเวอร์ชัน (1.1 → 1.2) + บอกผู้ใช้ว่าเปลี่ยนอะไรเพราะอะไร แล้วค่อยแก้โค้ด ห้ามแก้โค้ดให้ต่างจากเอกสารเงียบๆ
- `docs/ARCHITECTURE.md` เป็นของ template ห้ามแก้ในโปรเจกต์นี้

**รูปแบบคำตอบ**

- อธิบายเป็นภาษาไทยง่ายๆ
- agent ที่แก้ไฟล์ใน repo ได้ (Claude Code, Cursor) ให้แก้ไฟล์ตรง; ถ้าเป็นเว็บแชทที่ไม่เห็น repo ผู้ใช้ต้องวางไฟล์ 4 ไฟล์ (`AGENTS.md`, `docs/ARCHITECTURE.md`, เอกสารนี้, `docs/TASKS.md` — และ `docs/DESIGN.md` ด้วยถ้ามีแล้ว) และ agent ส่งไฟล์เต็มทุกครั้ง

---

## 1. Spec — ระบบนี้ทำอะไร

### 1.1 ปัญหาที่ต้องการแก้

ตอนนี้ยังไม่มีระบบยืม-คืนอุปกรณ์ขององค์กร ทำให้ไม่รู้ว่าของแต่ละอย่างเหลือกี่ชิ้น ใครถืออยู่ และเลยกำหนดคืนหรือยัง ต้องการให้พนักงานขอยืมเองผ่านเว็บ ผู้ดูแลอนุมัติก่อนจ่ายของ และเห็นยอดคงเหลือที่ตรงกับความจริงตลอดเวลา

### 1.2 ผู้ใช้

- ใครใช้: พนักงานในองค์กร (ขอยืม/คืน) และผู้ดูแลคลังอุปกรณ์ (อนุมัติ/รับคืน/จัดการของ)
- บทบาท: 2 บทบาท `employee` / `admin` มี login (อีเมล + รหัสผ่าน) — พนักงานสมัครเองได้เป็น `employee` เท่านั้น, `admin` คนแรกใส่ไว้ในไฟล์ migration และเปลี่ยนบทบาทผ่านหน้าจอไม่ได้
- ใช้บน: มือถือและคอม (พนักงานส่วนใหญ่ใช้มือถือ)

### 1.3 ฟีเจอร์รอบแรก (MVP)

| #   | ฟีเจอร์                   | ผู้ใช้สามารถ...                                                                                               |
| --- | ------------------------- | ------------------------------------------------------------------------------------------------------------- |
| F1  | บัญชีผู้ใช้และสิทธิ์      | สมัครสมาชิก เข้าสู่ระบบ ออกจากระบบ เปลี่ยนรหัสผ่านตัวเอง; หน้าของผู้ดูแลเปิดได้เฉพาะ `admin`                  |
| F2  | จัดการสิ่งของ             | ผู้ดูแลเพิ่ม/แก้สิ่งของ (ชื่อ, รหัส, ประเภท, จำนวน, หมายเหตุ) และตั้งสถานะ ใช้งานปกติ / ส่งซ่อม / ปิดใช้งาน   |
| F3  | ดูรายการสิ่งของ           | ดูรายการของ + ยอดคงเหลือ ค้นหาด้วยชื่อ/รหัส กรองด้วยประเภทและสถานะ (พนักงานไม่เห็นของที่ปิดใช้งาน)            |
| F4  | ขอยืม + คำขอของฉัน        | พนักงานกดขอยืม 1 อย่างต่อ 1 คำขอ (ระบุจำนวน + วันกำหนดคืน) ดูสถานะคำขอของตัวเอง และยกเลิกได้ตอนยังรอดำเนินการ |
| F5  | อนุมัติ / ปฏิเสธ / รับคืน | ผู้ดูแลเห็นคำขอทั้งหมด กดอนุมัติ ปฏิเสธ (พร้อมเหตุผล) ยกเลิกคำขอที่อนุมัติผิด ยืนยันรับคืน และบันทึก `remark` |

**ฟีเจอร์รอบถัดไป** (เพิ่มแถวเมื่อสร้าง `docs/features/<name>/`)

| ฟีเจอร์  | เอกสาร | เวอร์ชัน |
| -------- | ------ | -------- |
| ยังไม่มี | —      | —        |

### 1.4 สิ่งที่ _ไม่ทำ_ ในรอบนี้ (รอบถัดไป)

- แจ้งเตือน LINE / อีเมล (ทั้งเตือนผู้ดูแลว่ามีคำขอใหม่ และเตือนพนักงานว่าใกล้ครบกำหนด)
- รายงานสรุป / ส่งออก CSV
- ลืมรหัสผ่าน (รีเซ็ตทางอีเมล) และหน้าจัดการผู้ใช้ (เพิ่ม admin, ปิดบัญชี — ทำที่ฐานข้อมูล)
- แนบรูปสิ่งของ
- ยืมหลายอย่างในคำขอเดียว (ตะกร้า)
- คืนบางส่วน (คืนไม่ครบให้ผู้ดูแลจดไว้ในช่อง `remark` แล้วคำขอยังไม่ปิด)
- ลบสิ่งของถาวร (ใช้ปิดใช้งานแทน)

### 1.5 ข้อมูลหลัก [LOCKED]

ช่องหมายเหตุระบุเสมอว่า `บังคับ` (ต้องกรอก) / `ห้ามซ้ำ` / `ว่างได้` และค่าเริ่มต้นถ้ามี — ทุกตารางมี `id` และ `created_at` อัตโนมัติ

**ตาราง `users`** — บัญชีผู้ใช้

| ฟิลด์         | ชนิด        | หมายเหตุ                                                    |
| ------------- | ----------- | ----------------------------------------------------------- |
| id            | uuid        | primary key, สร้างอัตโนมัติ                                 |
| email         | text        | บังคับ, ห้ามซ้ำ — เก็บเป็นตัวพิมพ์เล็กเสมอ, ยาว 5–120 ตัว   |
| password_hash | text        | บังคับ — bcrypt (ไม่เคยส่งออกทาง API)                       |
| full_name     | text        | บังคับ, ยาว 1–100 ตัว — ชื่อที่แสดงในรายการคำขอ             |
| role          | text        | บังคับ, default `employee` — `employee` / `admin`           |
| is_active     | boolean     | บังคับ, default true — false = เข้าสู่ระบบและใช้ API ไม่ได้ |
| created_at    | timestamptz | สร้างอัตโนมัติ                                              |

**ตาราง `sessions`** — session ของการเข้าสู่ระบบ (1 แถว = 1 เครื่อง)

| ฟิลด์      | ชนิด        | หมายเหตุ                                                      |
| ---------- | ----------- | ------------------------------------------------------------- |
| id         | uuid        | primary key, สร้างอัตโนมัติ                                   |
| user_id    | uuid        | บังคับ — → users.id                                           |
| token_hash | text        | บังคับ, ห้ามซ้ำ — sha256 ของ token ใน cookie (ไม่เก็บตัวจริง) |
| expires_at | timestamptz | บังคับ — default now() + 7 วัน                                |
| created_at | timestamptz | สร้างอัตโนมัติ                                                |

**ตาราง `items`** — สิ่งของที่ให้ยืม

| ฟิลด์         | ชนิด        | หมายเหตุ                                                                                                                                          |
| ------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| id            | uuid        | primary key, สร้างอัตโนมัติ                                                                                                                       |
| code          | text        | บังคับ, ห้ามซ้ำแบบไม่สนตัวพิมพ์เล็ก-ใหญ่ (`UNIQUE (upper(code))`), ยาว 1–30 ตัว — รหัสของ เช่น `IT-001`                                           |
| name          | text        | บังคับ, ยาว 1–120 ตัว — ชื่อของ                                                                                                                   |
| category      | text        | บังคับ — `it` / `tool` / `office` / `other`                                                                                                       |
| total_qty     | integer     | บังคับ, ต้อง >= 1 — จำนวนทั้งหมดที่มี                                                                                                             |
| available_qty | integer     | บังคับ, ต้อง >= 0 และ <= total_qty — คงเหลือให้ยืม; **แก้ได้ผ่าน Postgres function ใน 1.7 เท่านั้น** (ยกเว้นตอนสร้างแถวใหม่ที่ตั้ง = `total_qty`) |
| status        | text        | บังคับ, default `active` — `active` / `maintenance` / `inactive`                                                                                  |
| note          | text        | ว่างได้, ยาวไม่เกิน 500 ตัว — หมายเหตุของผู้ดูแล                                                                                                  |
| created_at    | timestamptz | สร้างอัตโนมัติ                                                                                                                                    |

**ตาราง `loans`** — คำขอยืม 1 คำขอ = ของ 1 อย่าง

| ฟิลด์         | ชนิด        | หมายเหตุ                                                                                                     |
| ------------- | ----------- | ------------------------------------------------------------------------------------------------------------ |
| id            | uuid        | primary key, สร้างอัตโนมัติ                                                                                  |
| item_id       | uuid        | บังคับ — → items.id                                                                                          |
| user_id       | uuid        | บังคับ — → users.id (ผู้ยืม)                                                                                 |
| qty           | integer     | บังคับ, ต้อง >= 1                                                                                            |
| due_date      | date        | บังคับ — วันกำหนดคืน ต้องไม่ก่อนวันนี้ (เวลาไทย) ตอนสร้างคำขอ                                                |
| status        | text        | บังคับ, default `pending` — `pending` / `approved` / `returned` / `rejected` / `cancelled`                   |
| reject_reason | text        | ว่างได้, ยาว 1–500 ตัว — บังคับกรอกเมื่อเปลี่ยนเป็น `rejected` (ใช้เป็นเหตุผลของ `cancelled` โดยผู้ดูแลด้วย) |
| remark        | text        | ว่างได้, ยาวไม่เกิน 500 ตัว — บันทึกของผู้ดูแล เช่น "คืนแล้ว 2/3 ชิ้น" พนักงานเจ้าของคำขอเห็นข้อความนี้      |
| approved_at   | timestamptz | ว่างได้ — เวลาที่อนุมัติ                                                                                     |
| returned_at   | timestamptz | ว่างได้ — เวลาที่ผู้ดูแลยืนยันรับคืน                                                                         |
| handled_by    | uuid        | ว่างได้ — → users.id ผู้ดูแลคนล่าสุดที่ดำเนินการ (ไม่ตั้งค่าเมื่อพนักงานยกเลิกคำขอตัวเอง)                    |
| created_at    | timestamptz | สร้างอัตโนมัติ = เวลาที่กดขอยืม                                                                              |

**ความสัมพันธ์:** `sessions.user_id` → `users.id` (`ON DELETE CASCADE`) · `loans.item_id` → `items.id` (`ON DELETE RESTRICT`) · `loans.user_id` → `users.id` (`ON DELETE RESTRICT`) · `loans.handled_by` → `users.id` (`ON DELETE RESTRICT`)

**สถานะคำขอยืม:**

```
pending ──▶ approved ──▶ returned
   │            │  (= รับของไปแล้ว)
   │            └──▶ cancelled  (ผู้ดูแล — อนุมัติผิด/ไม่มารับของ, ต้องมีเหตุผล)
   ├──▶ rejected   (ผู้ดูแล + เหตุผล)
   └──▶ cancelled  (พนักงานเจ้าของคำขอ)
```

**สถานะที่แสดง/กรองในหน้ารายการสิ่งของ** — ฟิลด์คำนวณชื่อ `availability` (ไม่ใช่คอลัมน์ใน DB) มี 4 ค่า ใช้เป็นทั้งค่าตอบกลับและ query param:

| ค่า            | เงื่อนไข                                  | ป้ายภาษาไทย |
| -------------- | ----------------------------------------- | ----------- |
| `available`    | `status = active` และ `available_qty > 0` | พร้อมให้ยืม |
| `out_of_stock` | `status = active` และ `available_qty = 0` | ถูกยืมหมด   |
| `maintenance`  | `status = maintenance`                    | ส่งซ่อม     |
| `inactive`     | `status = inactive`                       | ปิดใช้งาน   |

**เกินกำหนด** (คำนวณ ไม่ใช่คอลัมน์): คำขอสถานะ `approved` ที่ `due_date` < วันนี้ (เวลาไทย)

### 1.6 ขั้นตอนการใช้งานหลัก

1. พนักงานเปิดเว็บ → ยังไม่มีบัญชี กด "สมัครสมาชิก" (อีเมล + ชื่อ + รหัสผ่าน) → เข้าสู่ระบบ
2. เห็นหน้ารายการสิ่งของ + คงเหลือ → ค้นหาชื่อ/รหัส กรองประเภทและสถานะ
3. กด "ขอยืม" ที่ของที่สถานะ `พร้อมให้ยืม` → ใส่จำนวน + วันกำหนดคืน → บันทึก → **คงเหลือถูกหักทันที** คำขอเป็น `รอดำเนินการ`
4. ผู้ดูแลเข้าสู่ระบบ → หน้า "คำขอยืม" เห็นคำขอที่รอดำเนินการก่อน → กด "อนุมัติ" หรือ "ปฏิเสธ" พร้อมเหตุผล (ปฏิเสธ = คงเหลือกลับคืน)
5. พนักงานเห็นคำขอเป็น `อนุมัติแล้ว` → ไปรับของ (อนุมัติแล้ว = ถือว่ารับของไปแล้ว); ถ้าอนุมัติผิดหรือพนักงานไม่มารับ ผู้ดูแลกด "ยกเลิก" พร้อมเหตุผล คงเหลือกลับคืน
6. ระหว่างนี้ผู้ดูแลพิมพ์ `remark` ได้ เช่น "คืนแล้ว 2/3 ชิ้น" พนักงานเห็นในหน้าคำขอของฉัน
7. ถึงกำหนดคืน พนักงานเอาของมาคืน ผู้ดูแลกด "ยืนยันรับคืน" (ครบทั้งจำนวนเท่านั้น) → คำขอเป็น `คืนแล้ว` คงเหลือกลับคืน
8. คำขอ `อนุมัติแล้ว` ที่เลยวันกำหนดคืน แสดงป้าย "เกินกำหนด" ทั้งฝั่งพนักงานและผู้ดูแล

### 1.7 กติกาธุรกิจ [LOCKED]

| #   | กติกา                                                                                                                                               | บังคับที่                                                                                                                                                                                                                                                                                                                                                                                 |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1  | ขอยืมเกินคงเหลือไม่ได้ แม้ 2 คนกดพร้อมกัน และคงเหลือถูกหักตอนกดขอยืม                                                                                | Postgres function `create_loan_request(p_item_id, p_user_id, p_qty, p_due_date)`: `SELECT ... FOR UPDATE` แถว item, ตรวจ `status = 'active'` และ `available_qty >= p_qty`, ลดยอด + insert loan ใน transaction เดียว; DB `CHECK (available_qty >= 0 AND available_qty <= total_qty)` เป็นด่านสุดท้าย                                                                                       |
| R2  | ยืมของที่ `maintenance` / `inactive` ไม่ได้                                                                                                         | `create_loan_request()` ตรวจ `status = 'active'` → raise error → API ตอบ 400                                                                                                                                                                                                                                                                                                              |
| R3  | วันกำหนดคืนต้องไม่ก่อนวันนี้ (เวลาไทย) และ `qty >= 1`                                                                                               | zod ใน `loans.dto.ts` (400) + `create_loan_request()` ตรวจซ้ำด้วย `(now() at time zone 'Asia/Bangkok')::date`                                                                                                                                                                                                                                                                             |
| R4  | เปลี่ยนสถานะคำขอได้ตามแผนผังใน 1.5 เท่านั้น และทุกครั้งต้องคืนยอดกับจดเวลาให้ถูก                                                                    | Postgres function `set_loan_status(p_loan_id, p_to_status, p_actor_id, p_reason)`: ล็อกแถว loan + item ด้วย `FOR UPDATE`, ตรวจสถานะเดิม ถ้าไม่ตรงแผนผัง raise error; `approved` → ตั้ง `approved_at`; `rejected`/`cancelled`/`returned` → คืน `available_qty` (+ `returned_at` เมื่อ returned); ตั้ง `handled_by = p_actor_id` เฉพาะเมื่อ actor เป็น `admin`; ทั้งหมดใน transaction เดียว |
| R5  | ปฏิเสธต้องมีเหตุผล และผู้ดูแลยกเลิกคำขอที่ `approved` ก็ต้องมีเหตุผล (เก็บใน `reject_reason`)                                                       | `set_loan_status()` raise error เมื่อ `p_to_status = 'rejected'` หรือ (`cancelled` จาก `approved`) แล้ว `p_reason` ว่าง + zod ใน `loans.dto.ts`                                                                                                                                                                                                                                           |
| R6  | เฉพาะ `admin` เท่านั้นที่อนุมัติ/ปฏิเสธ/รับคืน/ยกเลิกคำขอที่อนุมัติแล้ว/แก้ `remark`/จัดการสิ่งของ; `cancelled` จาก `pending` ทำได้เฉพาะเจ้าของคำขอ | middleware `requireAuth` / `requireAdmin` ใน `src/server/auth.middleware.ts` + handler ของ `PATCH /api/loans/:id/status` ตรวจสิทธิ์ตามค่า `status` ที่ส่งมา (ห้ามครอบทั้ง route ด้วย `requireAdmin`) → 403                                                                                                                                                                                |
| R7  | `remark` แก้ได้เฉพาะตอนคำขอยังเป็น `approved` (ปิดคำขอแล้วแก้ไม่ได้) และแก้ได้ทาง endpoint เดียวเท่านั้น                                            | conditional update ใน `loans-server.service.ts`: `update({remark}).eq('id', id).eq('status', 'approved')` — 0 แถว = 409; `set_loan_status()` ไม่รับ `remark` เป็น parameter                                                                                                                                                                                                               |
| R8  | อีเมลห้ามซ้ำ; รหัสผ่าน 8–72 ตัวอักษร; สมัครเองได้เป็น `employee` เท่านั้น                                                                           | DB `UNIQUE (email)` (บันทึกเป็นตัวพิมพ์เล็กเสมอ) → ซ้ำตอบ 409 + zod ใน `auth.dto.ts` + `POST /api/auth/register` เขียน `role = 'employee'` ตายตัว (ไม่รับ `role` จาก body)                                                                                                                                                                                                                |
| R9  | รหัสของห้ามซ้ำ; `total_qty >= 1`; ลด `total_qty` ต่ำกว่าจำนวนที่ถูกยืมอยู่ไม่ได้ แม้มีคนกดยืมพร้อมกัน                                               | DB `UNIQUE (upper(code))` → ซ้ำตอบ 409; Postgres function `update_item(p_id, p_code, p_name, p_category, p_total_qty, p_status, p_note)`: `FOR UPDATE` แถว item แล้วปรับ `available_qty` ตามส่วนต่างของ `total_qty` ใน transaction เดียว, ถ้าผลลัพธ์ติดลบ raise error → 409                                                                                                               |
| R10 | สิ่งของที่มีประวัติยืมลบไม่ได้ ให้ปิดใช้งานแทน                                                                                                      | ไม่มี `DELETE /api/items`; FK `loans.item_id ON DELETE RESTRICT`                                                                                                                                                                                                                                                                                                                          |
| R11 | ค่าสถานะและประเภททุกตัวต้องเป็นค่าในรายการ                                                                                                          | DB `CHECK (... IN (...))` ทุกคอลัมน์ + `shared/enums/items.enums.ts` (`category`, `status` และ `availability` 4 ค่าที่คำนวณ), `loans.enums.ts`, `auth.enums.ts` ค่าเดียวกัน                                                                                                                                                                                                               |
| R12 | session ที่หมดอายุ/ถูกลบ และผู้ใช้ที่ `is_active = false` ใช้งานต่อไม่ได้ทันที                                                                      | middleware `requireAuth` join `users` ตรวจ `sessions.expires_at > now()` และ `users.is_active = true` ทุก request → 401; `POST /api/auth/logout` ลบแถว session                                                                                                                                                                                                                            |
| R13 | ตั้งของเป็น `maintenance` / `inactive` ได้แม้ยังมีคำขอค้าง และคำขอที่ค้างยังคืนยอดเข้าของนั้นได้ตามปกติ                                             | `set_loan_status()` ไม่ตรวจ `items.status` (ตรวจเฉพาะตอนขอยืมใน R2) — เขียนไว้เพื่อไม่ให้ agent เผลอเพิ่มการตรวจ                                                                                                                                                                                                                                                                          |

### 1.8 เงื่อนไขว่า "ใช้ได้แล้ว"

- [ ] สมัคร + เข้าสู่ระบบ + ออกจากระบบ + เปลี่ยนรหัสผ่านได้ทั้ง 2 บทบาท และพนักงานเปิดหน้าผู้ดูแลไม่ได้
- [ ] ขอยืมจนคงเหลือเป็น 0 แล้วขอยืมต่อไม่ได้ (ขึ้นข้อความไทย)
- [ ] อนุมัติ / ปฏิเสธ / ยกเลิก / ยืนยันรับคืน แล้วยอดคงเหลือถูกต้องทุกกรณี
- [ ] คำขอที่เลยวันกำหนดคืนแสดงป้าย "เกินกำหนด" (มีข้อความ ไม่ใช่สีอย่างเดียว)
- [ ] ผู้ดูแลพิมพ์ `remark` แล้วพนักงานเจ้าของคำขอเห็น และแก้ไม่ได้หลังปิดคำขอ
- [ ] ค้นหาชื่อ/รหัส และกรองประเภท+สถานะ ในหน้ารายการของได้ถูกต้อง
- [ ] ข้อมูลไม่หายเมื่อปิดแอปเปิดใหม่ และยัง login อยู่หลังรีเฟรช (ทั้งตอน SSR และในเบราว์เซอร์)
- [ ] ทุกหน้าใช้ได้บนมือถือความกว้าง 375px

### 1.9 สมมติฐาน (ผู้ใช้ยังไม่ได้ยืนยัน แก้ได้ภายหลัง)

- ประเภทสิ่งของเริ่มต้น 4 ค่า: `it` อุปกรณ์ไอที · `tool` เครื่องมือช่าง · `office` อุปกรณ์สำนักงาน · `other` อื่นๆ (เพิ่มประเภทต้องแก้ migration + enums)
- ไม่มีข้อมูลเดิมต้องนำเข้า เริ่มจากว่าง; migration ใส่ `admin` 1 คน (`admin@example.com` รหัสผ่านชั่วคราว `admin1234` สร้างด้วย `crypt(..., gen_salt('bf'))` ของ `pgcrypto`) และสิ่งของตัวอย่าง 3 รายการ — **README ต้องสั่งให้เปลี่ยนรหัสผ่านผู้ดูแลทันทีหลัง deploy** ผ่านหน้าเปลี่ยนรหัสผ่านใน F1
- ปริมาณเล็ก (หลักสิบคำขอต่อวัน) จึงไม่ทำ pagination และไม่ลบ session ที่หมดอายุตามเวลา (ลบของผู้ใช้คนนั้นตอน login แทน)
- session อายุ 7 วัน ไม่ต่ออายุอัตโนมัติ; cookie `httpOnly` + `sameSite=lax` + `secure` เมื่อ request เข้ามาแบบ https
- ไม่มีการอัปเดตหน้าจออัตโนมัติ (ไม่ polling) ผู้ใช้กดรีเฟรชเอง
- พนักงานคนเดียวขอยืมกี่คำขอพร้อมกันก็ได้ ไม่จำกัดจำนวนต่อคน
- ผู้ดูแลก็ขอยืมได้เหมือนพนักงาน (และอนุมัติคำขอตัวเองได้)
- เวลาไทย `Asia/Bangkok` ทุกจุดที่เทียบ "วันนี้"; ไม่มีอะไรรีเซ็ตรายวัน
- โทนหน้าตา: ยังไม่ได้ถามผู้ใช้ — เริ่มจากโทนเรียบ สะอาด น้ำเงิน-เทา แบบระบบในองค์กร; Task 2 (Design UX/UI) จะทำ mockup ให้ผู้ใช้เคาะก่อนเริ่มหน้าจอจริง
- Deploy บน Render

---

## 2. Architecture — เฉพาะส่วนของระบบนี้

โครงสร้าง โฟลเดอร์ ชื่อไฟล์ และกติกาโค้ดใช้ตาม `docs/ARCHITECTURE.md` และ `AGENTS.md` ทุกข้อ ส่วนนี้มีแค่สิ่งที่ต่างกันต่อโปรเจกต์

### 2.1 Stack และ deploy

- Stack: มาตรฐานตาม `docs/ARCHITECTURE.md` เวอร์ชัน template 1.8 + เพิ่ม `bcryptjs` และ `cookie-parser` (ใช้ใน `src/server/` เท่านั้น) และเปิด extension `pgcrypto` ใน migration ด้วย `create extension if not exists pgcrypto with schema extensions;` (ใช้ hash รหัสผ่าน admin เริ่มต้น)
- Deploy: Render (Node web service) ตั้ง env ใน dashboard รวม `NG_ALLOWED_HOSTS` = โดเมนของ Render

### 2.2 API ที่ต้องมี [LOCKED]

| Method | Path                      | ทำอะไร                                                                                                                                                                                                                   | กติกาที่เกี่ยว |
| ------ | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------- |
| GET    | /api/health               | ตอบ `{ ok: true, count: N }` — N = จำนวนแถวใน `items`                                                                                                                                                                    | —              |
| POST   | /api/auth/register        | body `{ email, full_name, password }` → สร้าง user `role = 'employee'` + ล็อกอินให้เลย → คืน `{ id, email, full_name, role }`; อีเมลซ้ำ → 409                                                                            | R8             |
| POST   | /api/auth/login           | body `{ email, password }` → ตรวจ bcrypt + `is_active` → ลบ session ที่หมดอายุของผู้ใช้คนนี้, สร้าง session ใหม่, ตั้ง cookie → คืน `{ id, email, full_name, role }`; ผิด → 401                                          | R12            |
| POST   | /api/auth/logout          | ลบ session ของ cookie ปัจจุบัน + ล้าง cookie → `{ ok: true }`                                                                                                                                                            | R12            |
| GET    | /api/auth/me              | คืน `{ id, email, full_name, role }` ของผู้ใช้ปัจจุบัน; ไม่มี session → 401                                                                                                                                              | R12            |
| POST   | /api/auth/change-password | body `{ current_password, new_password }` → ตรวจรหัสเดิม แล้วเปลี่ยน + ลบ session อื่นทั้งหมดของผู้ใช้คนนี้ → `{ ok: true }`; รหัสเดิมผิด → 401                                                                          | R8, R12        |
| GET    | /api/items                | รายการของ (array) + `availability` (คำนวณตาม 1.5); query `q` (ค้นชื่อ/รหัส), `category`, `availability`; `employee` ไม่เห็นแถว `status = 'inactive'`                                                                     | R6             |
| GET    | /api/items/:id            | แถวเดียว + `availability`; `employee` ขอแถว `inactive` → 404                                                                                                                                                             | R6             |
| POST   | /api/items                | admin — body `{ code, name, category, total_qty, note? }` → สร้าง (`available_qty = total_qty`, `status = 'active'`); รหัสซ้ำ → 409                                                                                      | R6, R9, R11    |
| PUT    | /api/items/:id            | admin — body `{ code, name, category, total_qty, status, note? }` → เรียก `update_item()`; รหัสซ้ำ → 409; ลด `total_qty` จนคงเหลือติดลบ → 409                                                                            | R6, R9, R11    |
| GET    | /api/loans                | รายการคำขอ (array) + `item_name`, `item_code`, `borrower_name`, `handled_by_name`, `is_overdue`; query `status`; `employee` เห็นเฉพาะของตัวเองเสมอ (บังคับที่ server)                                                    | R6             |
| POST   | /api/loans                | body `{ item_id, qty, due_date }` → `create_loan_request()` ด้วย `user_id` จาก session → คืนแถว loan; error จาก function → 400                                                                                           | R1, R2, R3     |
| PATCH  | /api/loans/:id/status     | body `{ status, reason? }` → `set_loan_status()`; `approved`/`rejected`/`returned` และ `cancelled` จากคำขอ `approved` = admin, `cancelled` จากคำขอ `pending` = เจ้าของคำขอ; สิทธิ์ไม่ถึง → 403; error จาก function → 400 | R4, R5, R6     |
| PATCH  | /api/loans/:id/remark     | admin — body `{ remark }` → conditional update เฉพาะคำขอ `approved`; 0 แถว → 409                                                                                                                                         | R6, R7         |

ทุก endpoint ที่มี `:id` ตรวจว่าแถวนั้นมีจริงก่อน (ไม่มี → 404) แล้วค่อยเรียก function หรือ conditional update จึงจะได้ 400/409 เฉพาะกรณีกติกาไม่ผ่านจริงๆ

รูปแบบตอบกลับ: endpoint ที่เป็นรายการตอบ **array ตรงๆ** (ว่าง = `[]`); endpoint แถวเดียวตอบ object ตาม `Tables<'items'>` / `Tables<'loans'>` เว้นแต่ระบุเพิ่มในช่อง "ทำอะไร" (`users` ตอบเฉพาะ 4 ฟิลด์ที่ระบุ **ห้ามส่ง `password_hash`**); request body ตรวจด้วย zod schema และ dto ประกาศใน `shared/dto/`; error ตอบ HTTP status + `{ error: "ข้อความไทย" }` โดยใช้ 400 = ข้อมูลไม่ถูกต้อง/กติกาไม่ผ่าน, 401 = ยังไม่ล็อกอินหรือรหัสผิด, 403 = สิทธิ์ไม่ถึง, 404 = ไม่พบ `:id`, 409 = ข้อมูลซ้ำหรือสถานะไม่ตรงเงื่อนไข

### 2.3 ฟีเจอร์ → ไฟล์

| ฟีเจอร์ | feature folder (`src/app/features/`) + หน้า                                                                                                                                     | API ที่หน้าใช้                                                                   | server (`routes/`, `services/`)              | shared (`dto/`, `enums/`)        |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------- | -------------------------------- |
| F1      | `auth/` หน้า `/login` (`pages/login.page.ts`), `/register` (`pages/register.page.ts`), `/account` (`pages/change-password.page.ts`), `auth-client.service.ts`, `auth.routes.ts` | POST /api/auth/register, /login, /logout, /change-password, GET /api/auth/me     | `auth.routes.ts`, `auth-server.service.ts`   | `auth.dto.ts`, `auth.enums.ts`   |
| F2      | `items/` หน้า `/admin/items` (`pages/item-manager.page.ts`), `items-client.service.ts`, `items.routes.ts`                                                                       | GET/POST/PUT /api/items                                                          | `items.routes.ts`, `items-server.service.ts` | `items.dto.ts`, `items.enums.ts` |
| F3      | `items/` หน้า `/items` (`pages/item-list.page.ts`)                                                                                                                              | GET /api/items                                                                   | (ใช้ของ F2)                                  | (ใช้ของ F2)                      |
| F4      | `loans/` หน้า `/loans/new/:itemId` (`pages/loan-request.page.ts`), `/loans` (`pages/my-loans.page.ts`), `loans-client.service.ts`, `loans.routes.ts`                            | GET /api/items/:id, POST /api/loans, GET /api/loans, PATCH /api/loans/:id/status | `loans.routes.ts`, `loans-server.service.ts` | `loans.dto.ts`, `loans.enums.ts` |
| F5      | `loans/` หน้า `/admin/loans` (`pages/loan-admin.page.ts`) + component ย่อยใน `loans/components/` (แถวคำขอ, กล่องใส่เหตุผล, กล่อง remark) เพื่อไม่ให้ไฟล์เกิน 300 บรรทัด         | GET /api/loans, PATCH /api/loans/:id/status, /remark                             | (ใช้ของ F4)                                  | (ใช้ของ F4)                      |

- ไฟล์ส่วนกลางเพิ่มเติม: `src/server/auth.middleware.ts` (`requireAuth`, `requireAdmin` — ไฟล์เดี่ยวข้าง `env.ts`/`api.ts` ไม่สร้างโฟลเดอร์ใหม่) · `src/app/core/auth.guard.ts` (`authGuard`, `adminGuard`) · `src/app/core/ssr-cookie.interceptor.ts` (ดู 2.4) · shell + เมนู + ปุ่มออกจากระบบใน `src/app/core/`
- ลำดับ route ใน `app.routes.ts`: `login`, `register`, `account` (feature auth) → `admin/items` (feature items) → `admin/loans` (feature loans) → `items` (feature items) → `loans` (feature loans) → `''` redirect ไป `/items`

### 2.4 การตัดสินใจทางเทคนิคของระบบนี้

- **Login ทำเองทั้งหมดฝั่ง server** ไม่ใช้ Supabase Auth: ตาราง `users` + bcrypt + session token สุ่ม เก็บ sha256 ใน `sessions` และส่ง token จริงเป็น cookie `httpOnly` — เพราะ browser ห้ามแตะ Supabase ตาม `docs/ARCHITECTURE.md` ข้อ 2
- ตรวจสิทธิ์ที่ middleware ใน `src/server/auth.middleware.ts` ก่อนเข้า route ทุกครั้ง; guard ฝั่ง Angular เป็นแค่ UX ไม่ใช่ความปลอดภัย
- **route ที่เปิดสาธารณะมีแค่ 3 ตัว**: `GET /api/health`, `POST /api/auth/register`, `POST /api/auth/login` — ที่เหลือทั้งหมดอยู่หลัง `requireAuth` และเฉพาะที่ระบุใน 2.2 ว่า admin อยู่หลัง `requireAdmin` ด้วย; ฝั่งหน้าจอ `/login` และ `/register` ต้องไม่มี guard ส่วน `/account`, `/items`, `/loans*` ใช้ `authGuard` และ `/admin/*` ใช้ `adminGuard`
- **ตอน SSR ต้องส่ง cookie ต่อไปให้ `/api/*` เอง**: เพิ่ม `src/app/core/ssr-cookie.interceptor.ts` (server-only) ที่อ่าน header `cookie` จาก `REQUEST` แล้ว clone ใส่ request — ลงทะเบียนใน `app.config.server.ts` ต่อจาก `apiOriginInterceptor` (interceptor ที่มากับ template เติมแค่ origin ไม่ได้ส่ง cookie) ถ้าไม่ทำ ทุกหน้าจะถูกเด้งไป `/login` ตอนรีเฟรช
- ทุกหน้าเป็น `RenderMode.Server` (ทุกหน้าขึ้นกับผู้ใช้ที่ล็อกอิน ห้าม prerender); HTML ที่ได้เป็นข้อมูลเฉพาะบุคคล ห้ามตั้ง CDN/proxy ให้ cache หน้า HTML
- `cookie-parser` mount ใน `src/server/api.ts` (ไม่ใช่ `src/server.ts` ซึ่งต้องเป็น host เปล่าๆ); ตั้ง `app.set('trust proxy', 1)` ใน `src/server.ts` เพื่อให้รู้ว่า request มาแบบ https ตอนอยู่หลัง proxy ของ Render แล้วตั้ง cookie `secure` ตาม `req.secure`
- `is_overdue` และ `availability` คำนวณใน `src/server/services/` (เทียบวันด้วย `Asia/Bangkok`) ไม่เก็บเป็นคอลัมน์ เพื่อไม่ต้องมีงานตามเวลา
- `loans` มี FK ไป `users` สองเส้น (`user_id`, `handled_by`) การ join ผ่าน PostgREST ต้องระบุชื่อ constraint เป็น hint เช่น `user:users!loans_user_id_fkey(full_name)`
- resource มี 3 ตัว (`auth`, `items`, `loans`) จึงใช้ `src/server/routes/` + `services/` แบบ flat ตาม ARCHITECTURE ข้อ 9

### 2.5 ตัวแปร .env เพิ่มเติม (นอกจากมาตรฐานใน ARCHITECTURE.md ข้อ 8)

- ไม่มี
