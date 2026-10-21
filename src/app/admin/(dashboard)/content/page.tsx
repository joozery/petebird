'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { dictionaries, type Lang } from '@/i18n/dictionaries';
import { DynamicForm } from './DynamicForm';

const SECTIONS: { key: string; label: string }[] = [
  { key: 'nav', label: 'เมนูนำทาง' },
  { key: 'common', label: 'ข้อความทั่วไป (ปุ่ม, dialog)' },
  { key: 'hero', label: 'หน้าแรก (Hero)' },
  { key: 'about', label: 'เกี่ยวกับเรา' },
  { key: 'nutrition', label: 'ประโยชน์ของรังนก' },
  { key: 'products', label: 'ส่วนสินค้า (ข้อความ UI)' },
  { key: 'benefits', label: 'ความใส่ใจ' },
  { key: 'faq', label: 'คำถามที่พบบ่อย' },
  { key: 'contact', label: 'ติดต่อเรา' },
  { key: 'footer', label: 'ท้ายเว็บ' },
];

const LANG_TABS: { code: Lang; label: string }[] = [
  { code: 'th', label: 'ไทย' },
  { code: 'en', label: 'English' },
  { code: 'zh', label: '中文' },
];

function fallbackFor(key: string) {
  const out: Record<Lang, unknown> = { th: undefined, en: undefined, zh: undefined };
  for (const lang of ['th', 'en', 'zh'] as Lang[]) {
    const dict = dictionaries[lang] as unknown as Record<string, unknown>;
    const section = dict[key];
    if (key === 'products' && section && typeof section === 'object') {
      const { items: _items, ...rest } = section as Record<string, unknown>;
      out[lang] = rest;
    } else {
      out[lang] = section;
    }
  }
  return out;
}

export default function AdminContentPage() {
  const [activeKey, setActiveKey] = useState(SECTIONS[0].key);
  const [tab, setTab] = useState<Lang>('th');
  const [data, setData] = useState<Record<Lang, unknown> | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);

  useEffect(() => {
    setData(null);
    setStatus(null);
    (async () => {
      const res = await fetch(`/api/admin/content/${activeKey}`);
      const result = await res.json();
      if (result.content) {
        setData({ th: result.content.th, en: result.content.en, zh: result.content.zh });
      } else {
        setData(fallbackFor(activeKey));
      }
    })();
  }, [activeKey]);

  async function save() {
    if (!data) return;
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch(`/api/admin/content/${activeKey}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'บันทึกไม่สำเร็จ');
      setStatus({ type: 'ok', text: 'บันทึกแล้ว — หน้าเว็บจะอัปเดตภายในไม่กี่วินาที' });
    } catch (err) {
      setStatus({ type: 'error', text: err instanceof Error ? err.message : 'บันทึกไม่สำเร็จ' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h1 className="text-[22px] font-semibold text-[#1f1b16]">ข้อความหน้าเว็บ</h1>
      <p className="mt-1 text-sm text-[#8a7f6d]">แก้ไขข้อความทั้ง 3 ภาษา แต่ละส่วนของหน้าเว็บ</p>

      <div className="mt-6 flex gap-6">
        <aside className="w-56 shrink-0 space-y-0.5">
          {SECTIONS.map((s) => (
            <button
              key={s.key}
              onClick={() => setActiveKey(s.key)}
              className={`block w-full text-left rounded-lg px-3 py-2.5 text-[13.5px] transition-colors ${
                activeKey === s.key ? 'bg-[#1f1b16] text-white font-medium' : 'text-[#50493f] hover:bg-[#f5f4f2]'
              }`}
            >
              {s.label}
            </button>
          ))}
        </aside>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex gap-1 bg-[#f5f4f2] rounded-lg p-1">
              {LANG_TABS.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setTab(l.code)}
                  className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    tab === l.code ? 'bg-white text-[#1f1b16] shadow-[0_1px_2px_rgba(0,0,0,0.06)]' : 'text-[#8a7f6d]'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
            <button
              onClick={save}
              disabled={saving || data === null}
              className="rounded-lg bg-[#1f1b16] text-white px-5 py-2.5 text-sm font-medium hover:bg-[#33291c] disabled:opacity-60 transition-colors"
            >
              {saving ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
          </div>

          {status && (
            <div
              className={`mt-3 flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm ${
                status.type === 'ok' ? 'bg-[#eef7ef] border-[#cde7cf] text-[#2f6b38]' : 'bg-[#fdf0ee] border-[#f3cfc8] text-[#a83a2a]'
              }`}
            >
              {status.type === 'ok' ? <CheckCircle2 size={15} className="shrink-0" /> : <AlertTriangle size={15} className="shrink-0" />}
              {status.text}
            </div>
          )}

          <div className="mt-4 bg-white border border-[#ededed] rounded-2xl p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            {data === null ? (
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-10 rounded-lg bg-[#f7f6f3] animate-pulse" />
                ))}
              </div>
            ) : (
              <DynamicForm value={data[tab]} onChange={(next) => setData({ ...data, [tab]: next })} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
