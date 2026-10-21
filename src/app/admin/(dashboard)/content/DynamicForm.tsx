'use client';

import { Plus, Trash2 } from 'lucide-react';

// Generic editor for a SiteContent section's value. Every section in
// src/i18n/dictionaries.ts is built from only these shapes, so one recursive
// component can edit any of them without per-section hardcoding:
//   - string                      -> textarea
//   - string[]                    -> repeatable list of textareas
//   - [string, string][]          -> repeatable list of two-column rows
//   - { [key]: (one of the above) } -> labeled stack of the above, recursively

const inputClass = 'w-full rounded-lg border border-[#e5e3dd] bg-white px-3 py-2 text-sm text-[#1f1b16] outline-none focus:border-[#a77a3b] focus:ring-2 focus:ring-[#a77a3b1a] transition-shadow';
const removeBtn = 'shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-lg text-[#c0564a] hover:bg-[#fdf0ee] transition-colors';
const addBtn = 'inline-flex items-center gap-1.5 text-xs font-medium text-[#a77a3b] hover:text-[#8a622b]';

function humanize(key: string): string {
  return key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/^./, (c) => c.toUpperCase());
}

function isTupleArray(arr: unknown[]): arr is [string, string][] {
  return arr.length > 0 && arr.every((item) => Array.isArray(item) && item.length === 2 && item.every((v) => typeof v === 'string'));
}
function isStringArray(arr: unknown[]): arr is string[] {
  return arr.length === 0 || arr.every((item) => typeof item === 'string');
}

export function DynamicForm({ value, onChange }: { value: unknown; onChange: (next: unknown) => void }) {
  if (typeof value === 'string') {
    return <textarea className={`${inputClass} min-h-16`} value={value} onChange={(e) => onChange(e.target.value)} />;
  }

  if (Array.isArray(value)) {
    if (isTupleArray(value)) {
      return (
        <div className="space-y-2">
          {value.map((pair, i) => (
            <div key={i} className="flex gap-2 items-start">
              <input
                className={inputClass}
                value={pair[0]}
                placeholder="หัวข้อ"
                onChange={(e) => onChange(value.map((p, idx) => (idx === i ? [e.target.value, p[1]] : p)))}
              />
              <input
                className={inputClass}
                value={pair[1]}
                placeholder="คำอธิบาย"
                onChange={(e) => onChange(value.map((p, idx) => (idx === i ? [p[0], e.target.value] : p)))}
              />
              <button type="button" onClick={() => onChange(value.filter((_, idx) => idx !== i))} className={removeBtn} aria-label="ลบแถว">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <button type="button" onClick={() => onChange([...value, ['', '']])} className={addBtn}>
            <Plus size={13} /> เพิ่มแถว
          </button>
        </div>
      );
    }
    if (isStringArray(value)) {
      return (
        <div className="space-y-2">
          {value.map((item, i) => (
            <div key={i} className="flex gap-2 items-start">
              <textarea
                className={`${inputClass} min-h-12`}
                value={item}
                onChange={(e) => onChange(value.map((v, idx) => (idx === i ? e.target.value : v)))}
              />
              <button type="button" onClick={() => onChange(value.filter((_, idx) => idx !== i))} className={removeBtn} aria-label="ลบบรรทัด">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <button type="button" onClick={() => onChange([...value, ''])} className={addBtn}>
            <Plus size={13} /> เพิ่มบรรทัด
          </button>
        </div>
      );
    }
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    return (
      <div className="space-y-5">
        {entries.map(([key, v]) => (
          <div key={key}>
            <p className="text-[13px] font-medium text-[#50493f] mb-1.5">{humanize(key)}</p>
            <DynamicForm value={v} onChange={(next) => onChange({ ...(value as Record<string, unknown>), [key]: next })} />
          </div>
        ))}
      </div>
    );
  }

  return null;
}
