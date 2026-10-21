'use client';

// Generic editor for a SiteContent section's value. Every section in
// src/i18n/dictionaries.ts is built from only these shapes, so one recursive
// component can edit any of them without per-section hardcoding:
//   - string                      -> textarea
//   - string[]                    -> repeatable list of textareas
//   - [string, string][]          -> repeatable list of two-column rows
//   - { [key]: (one of the above) } -> labeled stack of the above, recursively

const inputClass = 'w-full rounded-lg border border-[#e0d4bf] px-3 py-2 text-sm outline-none focus:border-[#a87c3c]';

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
              <button type="button" onClick={() => onChange(value.filter((_, idx) => idx !== i))} className="shrink-0 text-xs text-red-500 px-2 py-2">
                ลบ
              </button>
            </div>
          ))}
          <button type="button" onClick={() => onChange([...value, ['', '']])} className="text-xs text-[#a77a3b] hover:underline">
            + เพิ่มแถว
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
              <button type="button" onClick={() => onChange(value.filter((_, idx) => idx !== i))} className="shrink-0 text-xs text-red-500 px-2 py-2">
                ลบ
              </button>
            </div>
          ))}
          <button type="button" onClick={() => onChange([...value, ''])} className="text-xs text-[#a77a3b] hover:underline">
            + เพิ่มบรรทัด
          </button>
        </div>
      );
    }
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    return (
      <div className="space-y-4">
        {entries.map(([key, v]) => (
          <div key={key}>
            <p className="text-sm text-[#5c5244] mb-1">{humanize(key)}</p>
            <DynamicForm value={v} onChange={(next) => onChange({ ...(value as Record<string, unknown>), [key]: next })} />
          </div>
        ))}
      </div>
    );
  }

  return null;
}
