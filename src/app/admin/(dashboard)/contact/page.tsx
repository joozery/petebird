'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

type ContactState = { lineUrl: string; facebookUrl: string; phone: string; lineQrImage: string };
const empty: ContactState = { lineUrl: '', facebookUrl: '', phone: '', lineQrImage: '' };

export default function AdminContactPage() {
  const [form, setForm] = useState<ContactState>(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/admin/contact');
      const data = await res.json();
      if (data.contact) {
        setForm({
          lineUrl: data.contact.lineUrl || '',
          facebookUrl: data.contact.facebookUrl || '',
          phone: data.contact.phone || '',
          lineQrImage: data.contact.lineQrImage || '',
        });
      }
      setLoading(false);
    })();
  }, []);

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'qr');
      const res = await fetch('/api/admin/uploads', { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok) setForm((f) => ({ ...f, lineQrImage: data.path }));
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/contact', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'บันทึกไม่สำเร็จ');
      setMessage('บันทึกแล้ว');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'บันทึกไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  }

  const input = 'mt-1 w-full rounded-lg border border-[#e0d4bf] px-3 py-2 text-sm outline-none focus:border-[#a87c3c]';
  const label = 'block text-sm text-[#5c5244]';

  if (loading) return <p className="text-sm text-[#827b71]">กำลังโหลด...</p>;

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl text-[#302a22]">ข้อมูลติดต่อ</h1>
      <p className="mt-1 text-sm text-[#827b71]">LINE, Facebook, เบอร์โทร และ QR code ที่แสดงบนหน้าเว็บ</p>

      <div className="mt-6 bg-white border border-[#e9e2d6] rounded-xl p-5 space-y-4">
        <label className={label}>
          LINE URL
          <input className={input} placeholder="https://line.me/ti/p/xxxxx" value={form.lineUrl} onChange={(e) => setForm({ ...form, lineUrl: e.target.value })} />
        </label>
        <label className={label}>
          Facebook Page URL
          <input className={input} placeholder="https://facebook.com/xxxxx" value={form.facebookUrl} onChange={(e) => setForm({ ...form, facebookUrl: e.target.value })} />
        </label>
        <label className={label}>
          เบอร์โทร
          <input className={input} placeholder="06-2595-9749" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </label>

        <div>
          <p className={label}>QR Code LINE</p>
          <div className="mt-2 flex items-center gap-4">
            {form.lineQrImage && (
              <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-[#e9e2d6] bg-white">
                <Image src={form.lineQrImage} alt="" fill sizes="96px" className="object-contain" />
              </div>
            )}
            <label className="text-sm text-[#a77a3b] cursor-pointer hover:underline">
              {uploading ? 'กำลังอัปโหลด...' : form.lineQrImage ? 'เปลี่ยนรูป' : 'อัปโหลดรูป'}
              <input type="file" accept="image/*" className="hidden" onChange={onUpload} disabled={uploading} />
            </label>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <button onClick={save} disabled={saving} className="rounded-lg bg-[#a77a3b] text-white px-5 py-2.5 text-sm font-medium hover:bg-[#8a622b] disabled:opacity-60">
          {saving ? 'กำลังบันทึก...' : 'บันทึก'}
        </button>
        {message && <p className="text-sm text-[#5c5244]">{message}</p>}
      </div>
    </div>
  );
}
