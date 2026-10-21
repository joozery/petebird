# Pete Bird's Nest — Admin Backend Design (MongoDB)

สถานะ: **ออกแบบ (design) — ยังไม่ได้ implement**
ผู้จัดทำ: Claude Code
วันที่: 2026-10-21

## 1. ขอบเขต (scope ที่ยืนยันแล้ว)

- จัดการ **สินค้า / ราคา / รูปภาพ**
- จัดการ **ข้อความหน้าเว็บทั้ง 3 ภาษา** (TH/EN/ZH) — แทนที่การแก้ `src/i18n/dictionaries.ts` ด้วยมือ
- จัดการ **ข้อมูลติดต่อ/โซเชียล** (LINE, Facebook, เบอร์โทร, QR code) — แทนที่ env vars
- **ไม่รวม** ในเวอร์ชันแรก: คำสั่งซื้อ/ตะกร้า, การชำระเงิน (เว็บนี้เป็น catalog + contact-to-order ผ่าน LINE ไม่ใช่ e-commerce เต็มรูปแบบ)
- MongoDB: **self-hosted บนเซิร์ฟเวอร์ของร้านเอง** (ไม่ใช่ Atlas)
- Auth: **หลายผู้ใช้ + สิทธิ์ต่างกัน** (role-based)

## 2. การตัดสินใจด้านสถาปัตยกรรมหลัก

| หัวข้อ | เลือกใช้ | เหตุผล |
|---|---|---|
| DB access | **Mongoose** | schema validation, enum สำหรับ role, timestamps, ง่ายต่อการอ้างอิงตอน implement |
| Auth | **Custom JWT (ไลบรารี `jose`) + httpOnly cookie** แทน NextAuth/Auth.js | โปรเจกต์ใช้ Next.js 16 (ใหม่มาก) ความเข้ากันได้ของ NextAuth กับเวอร์ชันนี้ยังไม่ชัวร์ และเราไม่มี OAuth provider ต้องรองรับ — credentials-only auth ง่ายกว่าคุมเองได้เต็มที่ ไม่ผูกกับ schema ของ adapter |
| Password hash | **bcryptjs** (pure JS) | ไม่มีปัญหา native binding ตอน build/deploy |
| Image storage | **เก็บไฟล์บน disk ที่ `public/uploads/`** ของเซิร์ฟเวอร์เดียวกับที่รัน Next.js | self-hosted อยู่แล้ว ง่ายสุด ไม่ต้องพึ่ง S3/Atlas |
| Public page data | Server Component fetch จาก MongoDB + **ISR/on-demand revalidate** | หน้าแรกต้องอัปเดตทันทีที่แอดมินกดบันทึก โดยไม่ต้อง deploy ใหม่ |
| Fallback | เก็บ `src/i18n/dictionaries.ts` เป็น **ค่าเริ่มต้น/seed** ไว้เหมือนเดิม | ถ้า DB ว่างหรือต่อไม่ติด เว็บยังไม่พังเป็นหน้าขาว |

### ⚠️ ข้อควรระวัง: การเก็บรูปบน disk
ถ้า deploy ด้วยวิธี "ลบโค้ดเก่าทั้งโฟลเดอร์แล้ววางโค้ดใหม่" รูปที่แอดมินอัปโหลดไว้ใน `public/uploads/` จะหายเวลา deploy รอบถัดไป ต้องให้ไดเรกทอรีนี้**อยู่นอก path ที่ deploy เขียนทับ** (เช่น symlink ไปยังโฟลเดอร์ถาวร หรือใช้ volume แยก) — จะระบุขั้นตอนตอน implement จริงตามวิธี deploy ที่ใช้อยู่ (Hostinger Node.js hosting)

## 3. Data Models (MongoDB collections)

### 3.1 `AdminUser`
```ts
{
  _id: ObjectId,
  name: string,
  email: string,        // unique, lowercase
  passwordHash: string,
  role: 'owner' | 'editor',   // owner = จัดการผู้ใช้ได้ด้วย, editor = จัดการเนื้อหาอย่างเดียว
  isActive: boolean,
  lastLoginAt: Date | null,
  createdAt: Date,
  updatedAt: Date,
}
```

### 3.2 `Product`
```ts
{
  _id: ObjectId,
  slug: string,          // "01" | "02" | ... ใช้เป็น anchor #product-01 เหมือนเดิม
  order: number,         // ลำดับแสดงผล
  badge: string,         // "SIGNATURE COLLECTION" ฯลฯ
  price: number | null,  // null = "สอบถามราคา"
  unit: string,          // "กล่อง" / "ชุด" — เก็บแบบ per-language เหมือนกัน (ดูด้านล่าง)
  image: string,         // path เช่น "/uploads/products/<uuid>.png"
  isPublished: boolean,
  translations: {
    th: { name, alt, type, unit, description, detail },
    en: { name, alt, type, unit, description, detail },
    zh: { name, alt, type, unit, description, detail },
  },
  createdAt: Date,
  updatedAt: Date,
}
```
โครงสร้าง `translations` ตรงกับ `t.products.items['01']` ใน `dictionaries.ts` ทุก field — migrate ตรงๆ ได้เลย

### 3.3 `SiteContent`
เก็บเป็น 1 เอกสารต่อ 1 "section" (ยืดหยุ่นกว่าเอกสารก้อนเดียวใหญ่ๆ, แก้ทีละส่วนได้โดยไม่ชนกัน):
```ts
{
  _id: ObjectId,
  key: 'nav' | 'common' | 'hero' | 'about' | 'benefits' | 'faq' | 'contact' | 'footer',
  th: Mixed,   // โครงสร้างตรงกับ Dict[key] ของแต่ละภาษาใน dictionaries.ts
  en: Mixed,
  zh: Mixed,
  updatedAt: Date,
}
```
เหตุผลที่ใช้ `Mixed`: แต่ละ section มีรูปร่างต่างกัน (hero มี array of tuple, faq มี array of [question, answer]) การ hardcode schema ย่อยทุกจุดจะเปราะเกินไป — ฝั่งแอดมิน UI จะ render form ตามโครงสร้างที่รู้จักอยู่แล้ว (เพราะหน้าแอดมินเขียน UI เฉพาะทีละ section)

### 3.4 `ContactInfo` (เอกสารเดียว, singleton)
```ts
{
  _id: 'contact',   // fixed id กัน insert ซ้ำ
  lineUrl: string | null,
  facebookUrl: string | null,
  phone: string | null,
  lineQrImage: string | null,  // "/uploads/qr/<uuid>.png"
  updatedAt: Date,
}
```

> Phase ถัดไป (ไม่อยู่ใน v1): `AuditLog` (บันทึกว่าใครแก้อะไรเมื่อไหร่) — แนะนำให้เพิ่มทีหลังเมื่อมีผู้ใช้หลายคนจริงจัง

## 4. Auth & สิทธิ์การใช้งาน

- Login: `POST /api/admin/auth/login` → ตรวจ email/password → sign JWT (payload: `{ sub: userId, role }`) → set เป็น httpOnly, Secure, SameSite=Lax cookie อายุ 7 วัน
- Logout: `POST /api/admin/auth/logout` → เคลียร์ cookie
- `middleware.ts` ดัก path `/admin/*` (ยกเว้น `/admin/login`) และ `/api/admin/*` (ยกเว้น `/api/admin/auth/login`) → verify JWT → ไม่ผ่าน redirect ไป `/admin/login`
- Role gate: endpoint ที่เกี่ยวกับ `/api/admin/users/*` ต้อง role เป็น `owner` เท่านั้น (เช็กซ้ำใน route handler ไม่พึ่ง middleware อย่างเดียว)
- กันลบ owner คนสุดท้าย / กันลบตัวเอง ตอนยังไม่มี owner คนอื่นแทน

## 5. API Routes

```
POST   /api/admin/auth/login
POST   /api/admin/auth/logout
GET    /api/admin/me

GET    /api/admin/products
POST   /api/admin/products
GET    /api/admin/products/[id]
PATCH  /api/admin/products/[id]
DELETE /api/admin/products/[id]

GET    /api/admin/content/[key]
PATCH  /api/admin/content/[key]

GET    /api/admin/contact
PATCH  /api/admin/contact

GET    /api/admin/users          (owner only)
POST   /api/admin/users          (owner only)
PATCH  /api/admin/users/[id]     (owner only)
DELETE /api/admin/users/[id]     (owner only)

POST   /api/admin/uploads        (multipart/form-data → บันทึกไฟล์ คืน path)
```

## 6. Admin UI (หน้าเว็บ `/admin/*`)

- `/admin/login` — ฟอร์ม login ธีมทอง/ครีมเดียวกับหน้าเว็บหลัก
- `/admin` — dashboard: จำนวนสินค้า, แก้ไขล่าสุด, ทางลัด
- `/admin/products` — ตารางสินค้า + ปุ่มเพิ่ม/แก้ไข/ลบ/publish toggle, ฟอร์มแก้ไขมี tab ภาษา TH/EN/ZH, ช่องอัปโหลดรูป
- `/admin/content` — เลือก section (hero/about/benefits/faq/footer/common) → ฟอร์มตาม tab ภาษา, FAQ เป็นแถวที่เพิ่ม/ลบได้
- `/admin/contact` — แก้ LINE URL, Facebook URL, เบอร์โทร, อัปโหลด QR
- `/admin/users` — (owner เท่านั้น) รายชื่อแอดมิน, เพิ่ม/ปิดการใช้งาน/เปลี่ยน role
- Layout กลาง `AdminLayout` มี sidebar ซ่อนเมนู "ผู้ใช้" ถ้า role เป็น editor

แนะนำให้หน้าแอดมินใช้ Tailwind utility classes ตรงๆ (โปรเจกต์มี Tailwind v4 อยู่แล้ว) แยกจากธีม CSS ของหน้าเว็บหลัก เพื่อความเร็วในการพัฒนา เพราะเป็นเครื่องมือภายใน ไม่ต้องสวยเท่าหน้า marketing

## 7. หน้าเว็บหลัก (public page) จะเปลี่ยนยังไง

ตอนนี้ `src/app/page.tsx` เป็น `'use client'` ทั้งไฟล์ และ `dictionaries.ts` เป็น static import

แผนใหม่:
1. แยกเป็น `src/app/page.tsx` (Server Component) — fetch `products`, `siteContent`, `contactInfo` จาก MongoDB ตรงๆ ในฝั่ง server
2. ส่งต่อเป็น props ให้ `src/app/HomeClient.tsx` (ของเดิมเกือบทั้งหมด ย้ายมาเป็น client component ที่รับ initial data)
3. `LanguageProvider` ปรับให้รับ `initialDict` จาก props แทนการ import `dictionaries.ts` ตรงๆ — แต่ยังคง import `dictionaries.ts` ไว้เป็นค่า **fallback** เวลา fetch ไม่สำเร็จ
4. ใช้ `export const revalidate = 60` (ISR) และเรียก `revalidatePath('/')` ทุกครั้งที่แอดมินบันทึกข้อมูล เพื่อให้เห็นผลทันทีโดยไม่ต้อง deploy ใหม่

## 8. โครงสร้างไฟล์ที่จะเพิ่ม

```
src/
  app/
    admin/
      layout.tsx
      login/page.tsx
      page.tsx
      products/page.tsx
      products/[id]/page.tsx
      content/page.tsx
      contact/page.tsx
      users/page.tsx
    api/admin/
      auth/login/route.ts
      auth/logout/route.ts
      me/route.ts
      products/route.ts
      products/[id]/route.ts
      content/[key]/route.ts
      contact/route.ts
      users/route.ts
      users/[id]/route.ts
      uploads/route.ts
    page.tsx              (ปรับเป็น Server Component)
    HomeClient.tsx         (ของเดิม ย้ายมา + รับ props)
  lib/
    db.ts                  (mongoose connection singleton, กัน hot-reload เปิดซ้ำ)
    auth.ts                (sign/verify JWT, bcrypt helpers, getSession())
    models/
      AdminUser.ts
      Product.ts
      SiteContent.ts
      ContactInfo.ts
middleware.ts
scripts/
  seed.ts                  (ครั้งเดียว: ย้ายข้อมูลปัจจุบันเข้า Mongo + สร้าง owner คนแรก)
.env.example               (เพิ่ม MONGODB_URI, MONGODB_DB_NAME, AUTH_SECRET)
```

## 9. สคริปต์ Seed (ย้ายของเดิมเข้า DB)

`scripts/seed.ts` จะ:
1. ต่อ MongoDB ด้วย `MONGODB_URI`
2. สร้างเอกสาร `SiteContent` จากทุก key ใน `dictionaries.ts` (th/en/zh)
3. สร้างเอกสาร `Product` ทั้ง 4 ตัวจาก array `products` + `t.products.items` ปัจจุบัน
4. สร้าง `ContactInfo` จากค่าปัจจุบันใน `.env` (ถ้ามี) หรือเว้นว่างให้แอดมินกรอกทีหลัง
5. สร้างผู้ใช้ `owner` คนแรก (รับ email/password ผ่าน CLI args หรือ prompt, hash ด้วย bcrypt)

รันครั้งเดียวตอน deploy รอบแรก → เว็บจะเหมือนเดิมทุกอย่าง แต่ข้อมูลอยู่ใน DB แล้ว แก้ผ่านแอดมินได้ทันที

## 10. แผนการ implement เป็นเฟส

| เฟส | งาน |
|---|---|
| **1. รากฐาน** | ต่อ MongoDB, โมเดล `AdminUser`, auth (login/logout/middleware), seed script สร้าง owner คนแรก, โครง admin shell + หน้า login + dashboard เปล่า |
| **2. สินค้า** | CRUD สินค้าเต็มรูปแบบ (list/create/edit/delete/publish/อัปโหลดรูป), ต่อหน้าแรกให้อ่านสินค้าจาก DB แทน hardcode |
| **3. เนื้อหาเว็บ** | CRUD `SiteContent` ทีละ section, ต่อ `LanguageProvider`ให้อ่านจาก DB (fallback เป็น `dictionaries.ts`) |
| **4. ข้อมูลติดต่อ** | CRUD `ContactInfo`, แทนที่ env vars เดิมในหน้าเว็บ |
| **5. ผู้ใช้ + ขัดเกลา** | CRUD ผู้ใช้แอดมิน (owner only), rate-limit login, (ถ้าต้องการ) audit log พื้นฐาน |

แต่ละเฟสรันแยก build/typecheck ได้ และเว็บหน้าแรกยังใช้งานได้ปกติตลอดระหว่างพัฒนา (เพราะมี fallback เป็นของเดิม)

## 11. Environment variables ที่ต้องเพิ่ม

```
MONGODB_URI=mongodb://<user>:<pass>@<host>:27017
MONGODB_DB_NAME=petebird
AUTH_SECRET=<random 32+ bytes, ใช้ sign JWT>
```
(เก็บใน `.env.local`, ไม่ commit — `.env.example` จะมีแค่ key เปล่าๆ ให้)
