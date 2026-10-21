'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

type Translation = { name: string; alt: string; type: string; unit: string; description: string; detail: string };
type ProductFormState = {
  slug: string;
  order: number;
  badge: string;
  price: string; // kept as string in the form, parsed on submit ('' => null)
  image: string;
  isPublished: boolean;
  translations: { th: Translation; en: Translation; zh: Translation };
};

const emptyTranslation: Translation = { name: '', alt: '', type: '', unit: '', description: '', detail: '' };
const emptyState: ProductFormState = {
  slug: '',
  order: 0,
  badge: '',
  price: '',
  image: '',
  isPublished: true,
  translations: { th: { ...emptyTranslation }, en: { ...emptyTranslation }, zh: { ...emptyTranslation } },
};

const LANG_TABS: { code: 'th' | 'en' | 'zh'; label: string }[] = [
  { code: 'th', label: 'ไทย' },
  { code: 'en', label: 'English' },
  { code: 'zh', label: '中文' },
];

export function ProductForm({ productId }: { productId?: string }) {
  const router = useRouter();
  const [form, setForm] = useState<ProductFormState>(emptyState);
  const [tab, setTab] = useState<'th' | 'en' | 'zh'>('th');
  const [loading, setLoading] = useState(!!productId);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) return;
    (async () => {
      const res = await fetch(`/api/admin/products/${productId}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'โหลดข้อมูลสินค้าไม่สำเร็จ');
        return;
      }
      const p = data.product;
      setForm({
        slug: p.slug,
        order: p.order,
        badge: p.badge,
        price: p.price === null ? '' : String(p.price),
        image: p.image,
        isPublished: p.isPublished,
        translations: p.translations,
      });
      setLoading(false);
    })();
  }, [productId]);

  function updateTranslation(field: keyof Translation, value: string) {
    setForm((f) => ({ ...f, translations: { ...f.translations, [tab]: { ...f.translations[tab], [field]: value } } }));
  }

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'products');
      const res = await fetch('/api/admin/uploads', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'อัปโหลดไม่สำเร็จ');
      setForm((f) => ({ ...f, image: data.path }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'อัปโหลดไม่สำเร็จ');
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        slug: form.slug.trim(),
        order: Number(form.order),
        badge: form.badge.trim(),
        price: form.price.trim() === '' ? null : Number(form.price),
        image: form.image,
        isPublished: form.isPublished,
        translations: form.translations,
      };
      const url = productId ? `/api/admin/products/${productId}` : '/api/admin/products';
      const res = await fetch(url, {
        method: productId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'บันทึกไม่สำเร็จ');
      router.push('/admin/products');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'บันทึกไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm text-[#827b71]">กำลังโหลด...</p>;

  const input = 'mt-1 w-full rounded-lg border border-[#e0d4bf] px-3 py-2 text-sm outline-none focus:border-[#a87c3c]';
  const label = 'block text-sm text-[#5c5244]';

  return (
    <form onSubmit={onSubmit} className="max-w-3xl space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <label className={label}>
          Slug (เช่น 01, 02)
          <input className={input} required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
        </label>
        <label className={label}>
          ลำดับการแสดงผล
          <input type="number" className={input} value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
        </label>
        <label className={label}>
          Badge (เช่น SIGNATURE COLLECTION)
          <input className={input} required value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} />
        </label>
        <label className={label}>
          ราคา (บาท, เว้นว่าง = &quot;สอบถามราคา&quot;)
          <input type="number" className={input} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
        </label>
      </div>

      <div>
        <p className={label}>รูปสินค้า</p>
        <div className="mt-2 flex items-center gap-4">
          {form.image && (
            <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-[#e9e2d6] bg-white">
              <Image src={form.image} alt="" fill sizes="96px" className="object-cover" />
            </div>
          )}
          <label className="text-sm text-[#a77a3b] cursor-pointer hover:underline">
            {uploading ? 'กำลังอัปโหลด...' : form.image ? 'เปลี่ยนรูป' : 'อัปโหลดรูป'}
            <input type="file" accept="image/*" className="hidden" onChange={onUpload} disabled={uploading} />
          </label>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-[#5c5244]">
        <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} />
        แสดงบนหน้าเว็บ
      </label>

      <div>
        <div className="flex gap-1 border-b border-[#e9e2d6]">
          {LANG_TABS.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => setTab(l.code)}
              className={`px-4 py-2 text-sm -mb-px border-b-2 ${tab === l.code ? 'border-[#a77a3b] text-[#a77a3b]' : 'border-transparent text-[#827b71]'}`}
            >
              {l.label}
            </button>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <label className={label}>
            ชื่อสินค้า
            <input className={input} required value={form.translations[tab].name} onChange={(e) => updateTranslation('name', e.target.value)} />
          </label>
          <label className={label}>
            ประเภทบรรจุภัณฑ์ (เช่น กล่องซิกเนเจอร์)
            <input className={input} required value={form.translations[tab].type} onChange={(e) => updateTranslation('type', e.target.value)} />
          </label>
          <label className={label}>
            หน่วย (เช่น กล่อง, ชุด)
            <input className={input} required value={form.translations[tab].unit} onChange={(e) => updateTranslation('unit', e.target.value)} />
          </label>
          <label className={label}>
            ข้อความ alt รูปภาพ
            <input className={input} required value={form.translations[tab].alt} onChange={(e) => updateTranslation('alt', e.target.value)} />
          </label>
          <label className={`${label} col-span-2`}>
            คำอธิบายสั้น (การ์ดสินค้า)
            <textarea className={`${input} min-h-20`} required value={form.translations[tab].description} onChange={(e) => updateTranslation('description', e.target.value)} />
          </label>
          <label className={`${label} col-span-2`}>
            รายละเอียดเต็ม (popup)
            <textarea className={`${input} min-h-24`} required value={form.translations[tab].detail} onChange={(e) => updateTranslation('detail', e.target.value)} />
          </label>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="rounded-lg bg-[#a77a3b] text-white px-5 py-2.5 text-sm font-medium hover:bg-[#8a622b] disabled:opacity-60">
          {saving ? 'กำลังบันทึก...' : 'บันทึก'}
        </button>
        <button type="button" onClick={() => router.push('/admin/products')} className="rounded-lg border border-[#e0d4bf] px-5 py-2.5 text-sm text-[#5c5244]">
          ยกเลิก
        </button>
      </div>
    </form>
  );
}
