# [ชื่อฟีเจอร์] — feature ของ [ชื่อระบบ]

> ไฟล์: `docs/features/[name]/SPEC.md` | ทำงานตาม `docs/features/[name]/TASKS.md`
> ต่อยอดจาก `docs/SYSTEM_SPEC.md` v[X.Y] — Section 0 (คำสั่งสำหรับ AI) ใช้ของ SYSTEM_SPEC ทุกข้อ **โดยแทน `docs/TASKS.md` ด้วย `docs/features/[name]/TASKS.md`** และแทน prompt ปิดท้ายด้วย `อ่าน docs/features/[name]/SPEC.md แล้วเริ่มตาม Section 0 ของ docs/SYSTEM_SPEC.md` (เลข section ที่ LOCKED — 1.5, 1.7, 2.2 — ตรงกับ SYSTEM_SPEC)
> หน้าจอใหม่ทุกหน้าใช้ token/pattern จาก `docs/DESIGN.md` เดิมของระบบ — ถ้าฟีเจอร์นี้ต้องมี pattern ใหม่ ให้เพิ่มใน `docs/DESIGN.md` พร้อม bump เวอร์ชันของไฟล์นั้น ใน Task ที่ใช้ pattern นั้นครั้งแรก
> เวอร์ชัน: 1.0 | วันที่: [YYYY-MM-DD] | สถานะ: [ร่าง (รอ review) / พร้อมสร้าง]

## 1. ฟีเจอร์นี้ทำอะไร

### 1.1 ปัญหา / เหตุผลที่เพิ่ม
[1–2 ประโยค]

### 1.2 ผู้ใช้ที่เกี่ยว
[อ้าง SYSTEM_SPEC 1.2 หรือระบุบทบาทใหม่]

### 1.3 สิ่งที่ทำได้
| # | ฟีเจอร์ | ผู้ใช้สามารถ... |
|---|---|---|
| F[n] | [ ] | [ ] |

### 1.4 ไม่ทำในรอบนี้
- [ ]

### 1.5 ข้อมูล [LOCKED]
- **ตารางเดิมที่ใช้** (จาก SYSTEM_SPEC 1.5): `[table]` — [ใช้ยังไง]
- **ฟิลด์ใหม่ในตารางเดิม** (ต้อง bump เวอร์ชัน SYSTEM_SPEC): `[table].[field] [type]` — [ ]
- **ตารางใหม่**: [ตารางแบบเดียวกับ SYSTEM_SPEC 1.5 หรือ "ไม่มี"]

### 1.6 ขั้นตอนการใช้งาน
1. [ ]

### 1.7 กติกาธุรกิจ [LOCKED]
| # | กติกา | บังคับที่ |
|---|---|---|
| R[n] | [ ] | [DB constraint / Postgres function / conditional update / API — ตัวเลือกเดียวกับ SYSTEM_SPEC 1.7] |

### 1.8 เงื่อนไขว่า "ใช้ได้แล้ว"
- [ ]

### 1.9 สมมติฐาน
- [ ]

## 2. Architecture — เฉพาะส่วนของฟีเจอร์นี้

### 2.1 Stack และ deploy
- ตาม SYSTEM_SPEC 2.1 [หรือระบุสิ่งที่ต่างเฉพาะฟีเจอร์นี้]

### 2.2 API ที่เพิ่ม/เปลี่ยน [LOCKED]
| Method | Path | ทำอะไร | กติกาที่เกี่ยว |
|---|---|---|---|
| [ ] | /api/[ ] | [ ] | [ ] |

### 2.3 ไฟล์ที่จะเกิด
- `src/app/features/[name]/` หน้า: [ ]
- `src/server/routes/[name].routes.ts`, `src/server/services/[name]-server.service.ts`
- `src/shared/dto/[name].dto.ts`, `src/shared/enums/[name].enums.ts` (ถ้ามีสถานะ)
- `supabase/migrations/<timestamp>_[name].sql` (จาก `npm run db:migration -- [name]`)

### 2.4 การตัดสินใจทางเทคนิค
- [ ]
