# Default Stack — วิธีเขียน Section 2 ของ SYSTEM_SPEC

โครงสร้าง โฟลเดอร์ ชื่อไฟล์ ทิศทาง import ฐานข้อมูล env และคำสั่ง **อยู่ที่ `docs/ARCHITECTURE.md` ของ template ที่เดียว**
กติกาการเขียนโค้ดอยู่ที่ `AGENTS.md` — **ห้ามคัดลอกสองไฟล์นี้ลง SYSTEM_SPEC** ให้อ้างถึงแทน

Section 2 ของ SYSTEM_SPEC จึงมีแค่ *สิ่งที่ต่างกันต่อโปรเจกต์* 5 หัวข้อ (ตาม `templates/SYSTEM_SPEC.md`):

| หัวข้อ | ใส่อะไร | เกณฑ์ |
|---|---|---|
| 2.1 Stack และ deploy | บรรทัด "มาตรฐานตาม docs/ARCHITECTURE.md" + **ฐานข้อมูล** (Supabase cloud หรือ PostgreSQL + PostgREST บน VPS — คำตอบ M15 ระบุแบบ A/B ของ README → "ตั้งค่าฐานข้อมูล") + **ชื่อโปรเจกต์ (slug)** ที่ผู้ใช้เคาะ + deploy target | ฐานข้อมูลกับ slug ต้องมีเสมอ (ไม่มี default — Task 1 ใช้สองค่านี้); deploy ถ้าผู้ใช้ไม่เลือก ใช้ Render และบันทึกใน 1.9 |
| 2.2 API ที่ต้องมี [LOCKED] | ทุก endpoint 1 แถว + คอลัมน์ "กติกาที่เกี่ยว" อ้าง R ใน 1.7 | ต้องมี `GET /api/health`; ทุก path ถูกอ้างในอย่างน้อย 1 Task; status/ข้อความ error ใช้ตาม AGENTS.md → API Layer ไม่นิยามใหม่ |
| 2.3 ฟีเจอร์ → ไฟล์ | map F แต่ละตัว → feature folder, routes/service, dto/enums | ใช้ชื่อไฟล์ตาม ARCHITECTURE.md ข้อ 5; 1 feature ≈ 1 resource |
| 2.4 การตัดสินใจทางเทคนิค | เฉพาะที่เลือกให้ระบบนี้ เช่น polling vs realtime, ปัดเวลา, timezone, จุดขยายที่ใช้ (ที่วางไฟล์ตาม `docs/EXTENSION_POINTS.md`), และ resource > 5 → จัดกลุ่มเป็น `src/server/features/<feature>/` | ทุกข้อที่เป็นการเดา ให้ซ้ำใน 1.9 ด้วย |
| 2.5 .env เพิ่มเติม | ตัวแปรนอกจาก `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `PORT`, `NG_ALLOWED_HOSTS`, `DATABASE_URL` (มาตรฐานใน ARCHITECTURE.md ข้อ 8 — ตัวสุดท้ายตั้งเฉพาะเมื่อฐานข้อมูลอยู่บน server ของตัวเอง) | ปกติ "ไม่มี" — แต่ 2.1 ต้องย้ำว่าตอน deploy ตั้ง `NG_ALLOWED_HOSTS` เป็นโดเมนจริง |

สิ่งที่ spec ต้องบอกให้พอเขียนโค้ดได้ (กติกาเต็มอยู่ใน `AGENTS.md` และ `docs/ARCHITECTURE.md` ที่โหลดอยู่แล้ว ไม่ทวนที่นี่): ทุกกติกาใน 1.7 ระบุชื่อ Postgres function / constraint ที่บังคับ พร้อมข้อความไทยที่ต้องการให้ `RAISE EXCEPTION` (400) หรือ `ERRCODE 'P0409'` (409); 1.5 บอกฟิลด์ไหนบังคับ ห้ามซ้ำ ช่วงค่า รูปแบบ พอให้เขียน zod schema; ค่าสถานะที่ระบุใน 1.5 คือค่าใน `CHECK` และ enum; `id uuid` + `created_at` มีให้ทุกตารางไม่ต้องเขียนซ้ำ; ถ้าใช้ Supabase Storage หรือ `pg_cron` ต้องระบุใน 2.4 พร้อมทางเลือกเมื่ออยู่บน VPS (ดิสก์/S3, ติดตั้ง extension เอง หรือ endpoint ให้ cron เรียก)

## เมื่อผู้ใช้เลือก stack อื่น

เขียน 2.1 ให้ชัดว่าต่างตรงไหน (เช่น "ไม่ใช้ SSR" หรือ "deploy บน Docker") และเพิ่มเข้า 1.9 ว่ายังไม่ได้ทดสอบกับ template — ห้ามแก้ `docs/ARCHITECTURE.md` ในโปรเจกต์ลูกค้า
