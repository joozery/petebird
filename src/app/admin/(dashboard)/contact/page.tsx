'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { AlertTriangle, CheckCircle2, ImagePlus, MessageCircle, Phone, QrCode, Share2, Upload } from 'lucide-react';

type ContactState = { lineUrl: string; facebookUrl: string; phone: string; lineQrImage: string };
const empty: ContactState = { lineUrl: '', facebookUrl: '', phone: '', lineQrImage: '' };

const input = 'mt-1.5 w-full rounded-lg border border-[#e5e3dd] bg-white pl-10 pr-3 py-2.5 text-sm text-[#1f1b16] outline-none focus:border-[#a77a3b] focus:ring-2 focus:ring-[#a77a3b1a] transition-shadow';
const label = 'block text-[13px] font-medium text-[#50493f]';
const card = 'bg-white border border-[#ededed] rounded-2xl p-6';

export default function AdminContactPage() {
  const [form, setForm] = useState<ContactState>(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);

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
    setStatus(null);
    try {
      const res = await fetch('/api/admin/contact', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'บันทึกไม่สำเร็จ');
      setStatus({ type: 'ok', text: 'บันทึกแล้ว' });
    } catch (err) {
      setStatus({ type: 'error', text: err instanceof Error ? err.message : 'บันทึกไม่สำเร็จ' });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-xl space-y-4">
        <div className="h-64 rounded-2xl bg-[#f7f6f3] animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-[22px] font-semibold text-[#1f1b16]">ข้อมูลติดต่อ</h1>
      <p className="mt-1 text-sm text-[#8a7f6d]">LINE, Facebook, เบอร์โทร และ QR code ที่แสดงบนหน้าเว็บ</p>

      <div className={`mt-6 ${card} space-y-5`}>
        <label className={label}>
          LINE URL
          <div className="relative">
            <MessageCircle size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a79e8c]" />
            <input className={input} placeholder="https://line.me/ti/p/xxxxx" value={form.lineUrl} onChange={(e) => setForm({ ...form, lineUrl: e.target.value })} />
          </div>
        </label>
        <label className={label}>
          Facebook Page URL
          <div className="relative">
            <Share2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a79e8c]" />
            <input className={input} placeholder="https://facebook.com/xxxxx" value={form.facebookUrl} onChange={(e) => setForm({ ...form, facebookUrl: e.target.value })} />
          </div>
        </label>
        <label className={label}>
          เบอร์โทร
          <div className="relative">
            <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a79e8c]" />
            <input className={input} placeholder="06-2595-9749" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
        </label>

        <div>
          <p className={`${label} flex items-center gap-1.5`}>
            <QrCode size={14} className="text-[#a79e8c]" /> QR Code LINE
          </p>
          <div className="mt-2 flex items-center gap-5">
            {form.lineQrImage ? (
              <div className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden border border-[#ededed] bg-[#fafafa]">
                <Image src={form.lineQrImage} alt="" fill sizes="96px" className="object-contain" />
              </div>
            ) : (
              <div className="w-24 h-24 shrink-0 rounded-xl border border-dashed border-[#d9d5cb] bg-[#fafafa] flex items-center justify-center text-[#c2bca9]">
                <ImagePlus size={22} />
              </div>
            )}
            <label className="inline-flex items-center gap-2 rounded-lg border border-[#e5e3dd] px-4 py-2.5 text-sm font-medium text-[#50493f] cursor-pointer hover:bg-[#f5f4f2] transition-colors">
              <Upload size={14} />
              {uploading ? 'กำลังอัปโหลด...' : form.lineQrImage ? 'เปลี่ยนรูป' : 'อัปโหลดรูป'}
              <input type="file" accept="image/*" className="hidden" onChange={onUpload} disabled={uploading} />
            </label>
          </div>
        </div>
      </div>

      {status && (
        <div
          className={`mt-4 flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm ${
            status.type === 'ok' ? 'bg-[#eef7ef] border-[#cde7cf] text-[#2f6b38]' : 'bg-[#fdf0ee] border-[#f3cfc8] text-[#a83a2a]'
          }`}
        >
          {status.type === 'ok' ? <CheckCircle2 size={15} className="shrink-0" /> : <AlertTriangle size={15} className="shrink-0" />}
          {status.text}
        </div>
      )}

      <div className="mt-4">
        <button onClick={save} disabled={saving} className="rounded-lg bg-[#1f1b16] text-white px-5 py-2.5 text-sm font-medium hover:bg-[#33291c] disabled:opacity-60 transition-colors">
          {saving ? 'กำลังบันทึก...' : 'บันทึก'}
        </button>
      </div>
    </div>
  );
}
