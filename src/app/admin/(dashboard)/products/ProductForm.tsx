'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Switch } from 'radix-ui';
import { AlertTriangle, ImagePlus, Upload } from 'lucide-react';

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

const input = 'mt-1.5 w-full rounded-lg border border-[#e5e3dd] bg-white px-3 py-2.5 text-sm text-[#1f1b16] outline-none focus:border-[#b8892c] focus:ring-2 focus:ring-[#b8892c1a] transition-shadow';
const label = 'block text-[13px] font-medium text-[#50493f]';
const card = 'bg-white border border-[#ededed] rounded-2xl p-6';
const cardTitle = 'text-[15px] font-semibold text-[#1f1b16]';

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

  if (loading) {
    return (
      <div className="max-w-3xl space-y-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-32 rounded-2xl bg-[#f7f6f3] animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="max-w-3xl space-y-5">
      <div className={card}>
        <h2 className={cardTitle}>ข้อมูลพื้นฐาน</h2>
        <div className="mt-4 grid grid-cols-2 gap-4">
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

        <label className="mt-5 flex items-center gap-3">
          <Switch.Root
            checked={form.isPublished}
            onCheckedChange={(checked) => setForm({ ...form, isPublished: checked })}
            className="w-9 h-5 rounded-full bg-[#e5e3dd] data-[state=checked]:bg-[#1f1b16] transition-colors relative outline-none"
          >
            <Switch.Thumb className="block w-4 h-4 bg-white rounded-full shadow translate-x-0.5 data-[state=checked]:translate-x-[18px] transition-transform" />
          </Switch.Root>
          <span className="text-[13px] font-medium text-[#50493f]">แสดงบนหน้าเว็บ</span>
        </label>
      </div>

      <div className={card}>
        <h2 className={cardTitle}>รูปสินค้า</h2>
        <div className="mt-4 flex items-center gap-5">
          {form.image ? (
            <div className="relative w-28 h-28 shrink-0 rounded-xl overflow-hidden border border-[#ededed] bg-[#fafafa]">
              <Image src={form.image} alt="" fill sizes="112px" className="object-cover" />
            </div>
          ) : (
            <div className="w-28 h-28 shrink-0 rounded-xl border border-dashed border-[#d9d5cb] bg-[#fafafa] flex items-center justify-center text-[#c2bca9]">
              <ImagePlus size={24} />
            </div>
          )}
          <label className="inline-flex items-center gap-2 rounded-lg border border-[#e5e3dd] px-4 py-2.5 text-sm font-medium text-[#50493f] cursor-pointer hover:bg-[#f5f4f2] transition-colors">
            <Upload size={14} />
            {uploading ? 'กำลังอัปโหลด...' : form.image ? 'เปลี่ยนรูป' : 'อัปโหลดรูป'}
            <input type="file" accept="image/*" className="hidden" onChange={onUpload} disabled={uploading} />
          </label>
        </div>
      </div>

      <div className={card}>
        <div className="flex items-center justify-between">
          <h2 className={cardTitle}>ข้อความสินค้า</h2>
          <div className="flex gap-1 bg-[#f5f4f2] rounded-lg p-1">
            {LANG_TABS.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => setTab(l.code)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  tab === l.code ? 'bg-white text-[#1f1b16] shadow-[0_1px_2px_rgba(0,0,0,0.06)]' : 'text-[#8a7f6d]'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
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

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-[#fdf0ee] border border-[#f3cfc8] px-4 py-3 text-sm text-[#a83a2a]">
          <AlertTriangle size={15} className="shrink-0" /> {error}
        </div>
      )}

      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="rounded-lg bg-[#1f1b16] text-white px-5 py-2.5 text-sm font-medium hover:bg-[#33291c] disabled:opacity-60 transition-colors">
          {saving ? 'กำลังบันทึก...' : 'บันทึก'}
        </button>
        <button type="button" onClick={() => router.push('/admin/products')} className="rounded-lg border border-[#e5e3dd] px-5 py-2.5 text-sm text-[#50493f] hover:bg-[#f5f4f2] transition-colors">
          ยกเลิก
        </button>
      </div>
    </form>
  );
}
