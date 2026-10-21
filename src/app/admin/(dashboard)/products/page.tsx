'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AlertDialog } from 'radix-ui';
import { AlertTriangle, PackageOpen, PenLine, Plus, Trash2 } from 'lucide-react';

type ProductRow = {
  _id: string;
  slug: string;
  order: number;
  badge: string;
  price: number | null;
  image: string;
  isPublished: boolean;
  translations: { th: { name: string } };
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductRow | null>(null);

  async function load() {
    const res = await fetch('/api/admin/products');
    const data = await res.json();
    if (!res.ok) return setError(data.error || 'โหลดข้อมูลไม่สำเร็จ');
    setProducts(data.products);
  }

  useEffect(() => {
    load();
  }, []);

  async function togglePublished(p: ProductRow) {
    await fetch(`/api/admin/products/${p._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublished: !p.isPublished }),
    });
    load();
  }

  async function remove(p: ProductRow) {
    await fetch(`/api/admin/products/${p._id}`, { method: 'DELETE' });
    setDeleteTarget(null);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-semibold text-[#1f1b16]">สินค้า</h1>
          <p className="mt-1 text-sm text-[#8a7f6d]">จัดการสินค้า ราคา และรูปภาพที่แสดงบนหน้าเว็บ</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 rounded-lg bg-[#1f1b16] text-white px-4 py-2.5 text-sm font-medium hover:bg-[#33291c] transition-colors shrink-0"
        >
          <Plus size={16} /> เพิ่มสินค้า
        </Link>
      </div>

      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-[#fdf0ee] border border-[#f3cfc8] px-4 py-3 text-sm text-[#a83a2a]">
          <AlertTriangle size={15} className="shrink-0" /> {error}
        </div>
      )}

      <div className="mt-6 bg-white border border-[#ededed] rounded-2xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        {products === null ? (
          <div className="p-5 space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-14 rounded-lg bg-[#f7f6f3] animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-14 flex flex-col items-center text-center">
            <PackageOpen size={28} className="text-[#d2cdc0]" />
            <p className="mt-3 text-sm text-[#8a7f6d]">ยังไม่มีสินค้า — กด &quot;เพิ่มสินค้า&quot; หรือรัน seed script</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#fafafa] border-b border-[#ededed] text-left text-[11px] uppercase tracking-wide text-[#a79e8c]">
                <th className="px-5 py-3 font-medium">สินค้า</th>
                <th className="px-5 py-3 font-medium">Badge</th>
                <th className="px-5 py-3 font-medium">ราคา</th>
                <th className="px-5 py-3 font-medium">สถานะ</th>
                <th className="px-5 py-3 font-medium text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="border-b border-[#f3f2ef] last:border-0 hover:bg-[#fbfbfa] transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {p.image && (
                        <div className="relative w-12 h-12 shrink-0 rounded-lg overflow-hidden bg-[#f5f1e7] border border-[#ededed]">
                          <Image src={p.image} alt="" fill sizes="48px" className="object-cover" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-[#1f1b16] font-medium truncate">{p.translations.th.name}</p>
                        <p className="text-xs text-[#a79e8c]">#{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-[#50493f]">{p.badge}</td>
                  <td className="px-5 py-3 text-[#50493f]">{p.price === null ? 'สอบถามราคา' : `฿${p.price.toLocaleString('th-TH')}`}</td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => togglePublished(p)}
                      className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full transition-colors ${
                        p.isPublished ? 'bg-[#e9f5ea] text-[#3a7a44]' : 'bg-[#f3f2ef] text-[#8a7f6d]'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${p.isPublished ? 'bg-[#3a7a44]' : 'bg-[#b5ad9d]'}`} />
                      {p.isPublished ? 'แสดงอยู่' : 'ซ่อนอยู่'}
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/products/${p._id}`}
                        aria-label={`แก้ไข ${p.translations.th.name}`}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-[#50493f] hover:bg-[#f5f4f2] transition-colors"
                      >
                        <PenLine size={15} />
                      </Link>
                      <button
                        onClick={() => setDeleteTarget(p)}
                        aria-label={`ลบ ${p.translations.th.name}`}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-[#c0564a] hover:bg-[#fdf0ee] transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <AlertDialog.Root open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="dialog-overlay" />
          <AlertDialog.Content className="dialog-content" style={{ maxWidth: 400 }}>
            <div className="w-11 h-11 rounded-full bg-[#fdf0ee] text-[#c0564a] flex items-center justify-center">
              <AlertTriangle size={20} />
            </div>
            <AlertDialog.Title className="mt-4 text-lg font-medium text-[#1f1b16]">ลบสินค้านี้?</AlertDialog.Title>
            <AlertDialog.Description className="mt-2 text-sm text-[#8a7f6d] leading-6">
              สินค้า <strong className="text-[#1f1b16]">{deleteTarget?.translations.th.name}</strong> จะถูกลบถาวรและหายจากหน้าเว็บทันที ย้อนกลับไม่ได้
            </AlertDialog.Description>
            <div className="mt-6 flex gap-3 justify-end">
              <AlertDialog.Cancel className="rounded-lg border border-[#e5e3dd] px-4 py-2 text-sm text-[#50493f]">ยกเลิก</AlertDialog.Cancel>
              <AlertDialog.Action
                onClick={() => deleteTarget && remove(deleteTarget)}
                className="rounded-lg bg-[#c0564a] text-white px-4 py-2 text-sm font-medium hover:bg-[#a8483d]"
              >
                ลบสินค้า
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  );
}
