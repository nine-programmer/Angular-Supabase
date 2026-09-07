# DESIGN — [ชื่อระบบ]

> ระบบออกแบบกลางของโปรเจกต์นี้ อ่านคู่กับ `docs/SYSTEM_SPEC.md` — **AI ทุกตัวที่ทำ Task ที่มีหน้าจอ ต้องใช้ token และ pattern ในไฟล์นี้** ห้ามคิดสไตล์ใหม่เอง
> เวอร์ชัน: 1.0 | วันที่: [YYYY-MM-DD] | สถานะ: [ร่าง (รอผู้ใช้เคาะ mockup) / LOCKED]
> mockup ที่ผู้ใช้เคาะแล้ว: `docs/design/mockup.html` — เปิดในเบราว์เซอร์ได้เลย (ใช้ Tailwind Play CDN จึงไม่เข้า build และ**ห้าม**เพิ่ม path นี้เข้า `@source` ใน `styles.css`)
> แก้ไฟล์นี้หลัง LOCKED = bump เวอร์ชัน + บอกผู้ใช้ว่าเปลี่ยนอะไรเพราะอะไร (กติกาเดียวกับ SYSTEM_SPEC)

## 1. โทนและบุคลิก

[2–3 ประโยค สรุปจาก mockup ที่ผู้ใช้เคาะแล้ว เช่น: เรียบ สะอาด แบบระบบภายในองค์กร เน้นอ่านง่ายบนมือถือ ใช้สีเน้นเฉพาะจุดที่ต้องกดหรือต้องตัดสินใจ]

## 2. Design tokens [LOCKED]

ประกาศจริงใน `@theme` ของ `src/styles.css` (Task Design เป็นคนลง) — หน้าจอใช้สีจากตารางนี้ + สเกลเทา ([slate]) มาตรฐานของ Tailwind เท่านั้น; 11 token สีแรกเป็นขั้นต่ำที่ทุกโปรเจกต์ต้องมี (ค่าตาม mockup) เพราะ pattern ในข้อ 3 อ้างถึง

| token                   | ค่า                                    | ใช้กับ                                 |
| ----------------------- | -------------------------------------- | -------------------------------------- |
| `--color-primary`       | [#____]                                | ปุ่มหลัก, ลิงก์, จุดเน้น               |
| `--color-primary-hover` | [#____]                                | hover/active ของปุ่มหลัก, focus ring   |
| `--color-on-primary`    | [#____]                                | ข้อความบนพื้น primary                  |
| `--color-bg`            | [#____]                                | พื้นหลังหน้า                           |
| `--color-bg-card`       | [#____]                                | พื้นหลังการ์ด/กล่อง/dialog             |
| `--color-text`          | [#____]                                | ข้อความหลัก                            |
| `--color-text-muted`    | [#____]                                | ข้อความรอง, คำอธิบาย, placeholder      |
| `--color-line`          | [#____]                                | เส้นขอบการ์ด/ช่องกรอก/ตาราง            |
| `--color-danger`        | [#____]                                | ปุ่มลบ/ยกเลิก, ข้อความ error           |
| `--color-success`       | [#____]                                | สถานะสำเร็จ                            |
| `--color-warning`       | [#____]                                | สถานะรอ/เตือน                          |
| `--font-sans`           | ['____', 'Noto Sans Thai', sans-serif] | ฟอนต์ทั้งระบบ — **ต้องรองรับภาษาไทย** |
| `--radius-[ ]`          | [ ]                                    | มุมการ์ด/ปุ่ม/ช่องกรอก                 |

[เพิ่ม token ตามที่ mockup ใช้จริง — token นอกชุดขั้นต่ำที่ไม่มีใครใช้ = ลบทิ้ง]

**ฟอนต์**: โหลดจาก Google Fonts ใน `src/index.html` — ตัวเลือกไทยที่แนะนำให้เสนอผู้ใช้ตอน mockup (เลือก 1 ตัวเป็นหลัก): `Noto Sans Thai` (กลางๆ อ่านง่าย ปลอดภัยสุด) · `IBM Plex Sans Thai` (โมเดิร์นแบบระบบองค์กร) · `Sarabun` (ทางการ) · `Prompt` (โค้งมน เป็นมิตร) · `Anuphan` (มินิมอลสมัยใหม่) — ห้ามใช้ฟอนต์ที่ไม่มี glyph ภาษาไทยแล้วปล่อยให้ fallback ปนกันคนละหน้า

**ไอคอน**: ใช้ [Material Symbols](https://fonts.google.com/icons) (โหลดฟอนต์ไอคอนจาก Google Fonts ใน `src/index.html` หรือ copy เป็น inline SVG) — ระบุชื่อไอคอนที่ใช้ต่อจุดใน mockup/DESIGN นี้ให้ตรงกันทุกหน้า; **ห้ามใช้ emoji เป็นไอคอนหรือของตกแต่งบนหน้าจอ** (⚡📊✦ ฯลฯ ทำให้ดูเป็นงาน AI และ render ต่างกันทุกเครื่อง); ปุ่มที่มีแต่ไอคอนต้องมี `aria-label` ตาม AGENTS.md

**คู่สีที่ตรวจ WCAG AA แล้ว** (≥ 4.5:1 ข้อความปกติ, ≥ 3:1 ข้อความใหญ่/ขอบ UI):

- [ขาว บน `--color-primary` = _._:1 ✓]
- [`slate-900` บน ขาว = 17.8:1 ✓ · `slate-600` บน ขาว = 7.5:1 ✓]

จะจับคู่สีใหม่ต้องคำนวณ ratio แล้วจดเพิ่มที่นี่ก่อนใช้

## 3. Component patterns [LOCKED]

เขียนเป็น Tailwind class ตายตัว copy ไปใช้ได้เลย (เปลี่ยนเฉพาะข้อความ) — class ทุกตัวในข้อนี้ต้องอ้าง token จากข้อ 2 (`bg-primary`, `text-on-primary`, `bg-bg-card`, `border-line`, `text-danger`) ไม่ใช้ชื่อสี Tailwind ตรง (`bg-amber-500`) — Tailwind 4 สร้าง class จากชื่อ `--color-*` ใน `@theme` ให้อัตโนมัติ โดย class = prefix + ชื่อ token ตรงตัว (`--color-bg-card` → `bg-bg-card`, `--color-text-muted` → `text-text-muted` — ไม่ใช่ `bg-card`); pattern ที่ใช้ซ้ำ 2+ feature ทำเป็น component ใน `src/app/ui/` (alert, status-badge, dialog, empty-state สร้างใน Task Design เลย — AGENTS.md)

### ปุ่ม

- หลัก: `[class เต็ม เช่น rounded-lg bg-primary px-4 py-2 font-medium text-on-primary hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-primary-hover]`
- รอง: `[class เต็ม เช่น rounded-lg border border-line bg-bg-card px-4 py-2 text-text hover:bg-bg ...]`
- อันตราย (ลบ/ยกเลิก/ปฏิเสธ): `[class เต็ม เช่น ... bg-danger text-on-primary ...]`
- ทุกปุ่มต้องมี focus ring (`focus-visible:ring-2 ...`) — ห้ามลบ outline โดยไม่มีตัวแทน

### ฟอร์ม

- label: `[class เช่น text-sm font-medium text-text]` — ทุกช่องกรอกมี `<label for>` มองเห็นได้เสมอ
- input/select/textarea: `[class ปกติ เช่น rounded-lg border border-line bg-bg-card ...]` / `[class ตอน error เช่น border-danger]`
- ข้อความ error ใต้ช่อง: `[class เช่น text-sm text-danger]` + `role="alert"` (= `alert.component.ts` ใน `src/app/ui/`)

### ป้ายสถานะ (badge)

สี + ข้อความไทยเสมอ ห้ามสื่อด้วยสีอย่างเดียว — ค่าตรงกับ enums ใน `src/shared/enums/` (= `status-badge.component.ts` ใน `src/app/ui/`)

| สถานะ   | class                                         | ข้อความ   |
| ------- | --------------------------------------------- | --------- |
| [value] | `[class เต็ม เช่น bg-success/10 text-success]` | [ป้ายไทย] |

### รายการข้อมูล

- มือถือ (< `md`): การ์ด `[class เช่น rounded-xl border border-line bg-bg-card p-4]` · จอกว้าง (`md:` ขึ้นไป): [ตาราง `[class]` / การ์ดเหมือนเดิม]
- empty state: `[class]` + ข้อความ [เช่น "ยังไม่มีรายการ"] (= `empty-state.component.ts` ใน `src/app/ui/`)

### กล่องยืนยัน / กล่องกรอกเหตุผล

- [pattern ที่ mockup ใช้: inline expand ใต้แถว + class, หรือใช้ Modal / Dialog ด้านล่าง]

### Modal / Dialog

- `<dialog>` native หรือ `role="dialog" aria-modal="true" aria-labelledby`; เปิดแล้ว focus ไปที่ heading หรือปุ่มแรก; ปิดด้วย Escape และปุ่มปิดที่มี `aria-label`; ปิดแล้วคืน focus ให้ปุ่มที่เปิด; เนื้อหาหลังฉากใส่ `inert` (= `dialog.component.ts` ใน `src/app/ui/`)
- ฉากหลัง: `[class เช่น fixed inset-0 bg-text/50]` · กล่อง: `[class เช่น rounded-xl bg-bg-card p-6 shadow-lg]`

### Selected Option Card (การ์ด/ปุ่มตัวเลือก เช่น บริการ ช่องเวลา ช่าง)

- เป็น `<button type="button">` เสมอ ใส่ `[attr.aria-pressed]="isSelected()"` และสถานะเลือกต้องมีไอคอน `check_circle` หรือข้อความ "เลือกแล้ว" ประกอบสี ไม่ใช่สีอย่างเดียว
- ปกติ: `[class เช่น rounded-xl border border-line bg-bg-card p-4 text-left]` · เลือก: `[class เช่น aria-pressed:border-primary aria-pressed:bg-primary/10]`

  ```html
  <button type="button" [attr.aria-pressed]="isSelected()" class="rounded-xl border border-line bg-bg-card p-4 text-left aria-pressed:border-primary aria-pressed:bg-primary/10">
    <span class="material-symbols-outlined" aria-hidden="true">{{ isSelected() ? 'check_circle' : 'radio_button_unchecked' }}</span>
    ตัดผมชาย · 30 นาที
  </button>
  ```

## 4. Layout

- Shell: [header/เมนูเป็นแบบไหนบนมือถือและจอกว้าง ปุ่มออกจากระบบอยู่ไหน — ตรงกับ mockup]
- ความกว้างเนื้อหา: `[เช่น max-w-3xl mx-auto px-4]`
- หน้า → pattern: [ไล่ทุกหน้าใน SPEC 2.3 ว่าใช้ pattern ไหนจากข้อ 3 เช่น `/items` = การ์ด + ช่องค้นหา, `/admin/loans` = ตาราง]
