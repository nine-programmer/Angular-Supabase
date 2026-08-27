# Default Stack — วิธีเขียน Section 2 ของ SYSTEM_SPEC

โครงสร้าง โฟลเดอร์ ชื่อไฟล์ ทิศทาง import ฐานข้อมูล env และคำสั่ง **อยู่ที่ `docs/ARCHITECTURE.md` ของ template ที่เดียว**
กติกาการเขียนโค้ดอยู่ที่ `AGENTS.md` — **ห้ามคัดลอกสองไฟล์นี้ลง SYSTEM_SPEC** ให้อ้างถึงแทน

Section 2 ของ SYSTEM_SPEC จึงมีแค่ *สิ่งที่ต่างกันต่อโปรเจกต์* 5 หัวข้อ (ตาม `templates/SYSTEM_SPEC.md`):

| หัวข้อ | ใส่อะไร | เกณฑ์ |
|---|---|---|
| 2.1 Stack และ deploy | บรรทัดเดียว "มาตรฐานตาม docs/ARCHITECTURE.md" + deploy target | ถ้าผู้ใช้ไม่เลือก ใช้ Render และบันทึกใน 1.9 |
| 2.2 API ที่ต้องมี [LOCKED] | ทุก endpoint 1 แถว + คอลัมน์ "กติกาที่เกี่ยว" อ้าง R ใน 1.7 | ต้องมี `GET /api/health`; ทุก path ถูกอ้างในอย่างน้อย 1 Task |
| 2.3 ฟีเจอร์ → ไฟล์ | map F แต่ละตัว → feature folder, routes/service, dto/enums | ใช้ชื่อไฟล์ตาม ARCHITECTURE.md ข้อ 5; 1 feature ≈ 1 resource |
| 2.4 การตัดสินใจทางเทคนิค | เฉพาะที่เลือกให้ระบบนี้ เช่น polling vs realtime, ปัดเวลา, timezone | ทุกข้อที่เป็นการเดา ให้ซ้ำใน 1.9 ด้วย |
| 2.5 .env เพิ่มเติม | ตัวแปรนอกจาก `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `PORT`, `NG_ALLOWED_HOSTS` (มาตรฐานใน ARCHITECTURE.md ข้อ 8) | ปกติ "ไม่มี" — แต่ 2.1 ต้องย้ำว่าตอน deploy ตั้ง `NG_ALLOWED_HOSTS` เป็นโดเมนจริง |

## สิ่งที่ต้องรู้ตอนออกแบบ (สรุปจาก ARCHITECTURE.md เพื่อไม่ต้องเปิดบ่อย)

- Browser เรียก `/api/*` เท่านั้น → server (`src/server/services/`) เรียก Supabase ด้วย `service_role` — ไม่มี anon key ฝั่ง browser
- ทุกตารางเปิด RLS ไม่มี policy (ปิดตาย) สิทธิ์ตัดสินที่ API
- กติกาที่ต้อง atomic (นับสต็อก, เลขรัน, เปลี่ยนสถานะที่มีผลข้างเคียง เช่น จด log / ตั้งเวลา) → Postgres function เรียกผ่าน `.rpc()` หรือ DB constraint; เขียนชื่อ function ไว้ในคอลัมน์ "บังคับที่" ของ 1.7 เลย — เฉพาะการเปลี่ยนสถานะแถวเดียวที่ไม่มีผลข้างเคียง ใช้ `conditional update` ใน service แทนได้ (ดู AGENTS.md → API Layer)
- ค่าสถานะ = `CHECK` ใน DB + `shared/enums/<feature>.enums.ts` ค่าเดียวกัน
- ทุก request body ตรวจด้วย zod schema ใน `shared/dto/<feature>.dto.ts` (type ได้จาก `z.infer`) → 1.5/1.7 ต้องบอกพอที่จะเขียน schema ได้: ฟิลด์ไหนบังคับ ห้ามซ้ำ ช่วงค่า รูปแบบ
- ฐานข้อมูลอยู่บน Supabase cloud เท่านั้น ไม่มี local/Docker: migration ใช้ `npm run db:migration` → `npm run db:push`, types ใช้ `npm run db:types` (ชื่อไฟล์ migration CLI ตั้งให้เป็น `<timestamp>_name.sql`)
- 1 feature = 1 โฟลเดอร์ใน `src/app/features/` + 1 คู่ `routes/services` ใน `src/server/` + 1 `dto`
- ทุกตารางมี `id uuid` + `created_at timestamptz` อัตโนมัติ ไม่ต้องเขียนใน spec ซ้ำทุกครั้ง แต่ template 1.5 แสดงไว้ให้เห็น
- ระบบเล็ก: `src/server/routes/` + `services/` แบบ flat; ARCHITECTURE.md ข้อ 9 ให้ตัดสินตอนเขียน SYSTEM_SPEC ว่าจะจัดกลุ่มเป็น `src/server/features/<feature>/` หรือไม่ — เกณฑ์ของ skill นี้คือ resource > 5 ให้ระบุใน 2.4

## เมื่อผู้ใช้เลือก stack อื่น

เขียน 2.1 ให้ชัดว่าต่างตรงไหน (เช่น "ไม่ใช้ SSR" หรือ "deploy บน Docker") และเพิ่มเข้า 1.9 ว่ายังไม่ได้ทดสอบกับ template — ห้ามแก้ `docs/ARCHITECTURE.md` ในโปรเจกต์ลูกค้า
