'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

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
    if (!confirm(`ลบสินค้า "${p.translations.th.name}" ใช่ไหม? ย้อนกลับไม่ได้`)) return;
    await fetch(`/api/admin/products/${p._id}`, { method: 'DELETE' });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-[#302a22]">สินค้า</h1>
          <p className="mt-1 text-sm text-[#827b71]">จัดการสินค้า ราคา และรูปภาพที่แสดงบนหน้าเว็บ</p>
        </div>
        <Link href="/admin/products/new" className="rounded-lg bg-[#a77a3b] text-white px-4 py-2.5 text-sm font-medium hover:bg-[#8a622b]">
          + เพิ่มสินค้า
        </Link>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-6 bg-white border border-[#e9e2d6] rounded-xl overflow-hidden">
        {products === null ? (
          <p className="p-6 text-sm text-[#827b71]">กำลังโหลด...</p>
        ) : products.length === 0 ? (
          <p className="p-6 text-sm text-[#827b71]">ยังไม่มีสินค้า — กด &quot;เพิ่มสินค้า&quot; หรือรัน seed script</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e9e2d6] text-left text-xs text-[#a0947e]">
                <th className="px-4 py-3 font-normal">รูป</th>
                <th className="px-4 py-3 font-normal">ชื่อสินค้า</th>
                <th className="px-4 py-3 font-normal">Badge</th>
                <th className="px-4 py-3 font-normal">ราคา</th>
                <th className="px-4 py-3 font-normal">สถานะ</th>
                <th className="px-4 py-3 font-normal text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="border-b border-[#f1ece3] last:border-0">
                  <td className="px-4 py-3">
                    {p.image && (
                      <div className="relative w-12 h-12 rounded-md overflow-hidden bg-[#f3ead9]">
                        <Image src={p.image} alt="" fill sizes="48px" className="object-cover" />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[#302a22]">{p.translations.th.name}</td>
                  <td className="px-4 py-3 text-[#827b71]">{p.badge}</td>
                  <td className="px-4 py-3 text-[#827b71]">{p.price === null ? 'สอบถามราคา' : `฿${p.price.toLocaleString('th-TH')}`}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => togglePublished(p)}
                      className={`text-xs px-2.5 py-1 rounded-full ${p.isPublished ? 'bg-[#e9f5ea] text-[#3a7a44]' : 'bg-[#f1ece3] text-[#827b71]'}`}
                    >
                      {p.isPublished ? 'แสดงอยู่' : 'ซ่อนอยู่'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right space-x-3">
                    <Link href={`/admin/products/${p._id}`} className="text-[#a77a3b] hover:underline">
                      แก้ไข
                    </Link>
                    <button onClick={() => remove(p)} className="text-red-500 hover:underline">
                      ลบ
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
