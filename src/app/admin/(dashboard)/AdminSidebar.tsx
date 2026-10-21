'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { AdminRole } from '@/lib/models/AdminUser';

const links: { href: string; label: string; ownerOnly?: boolean }[] = [
  { href: '/admin', label: 'แดชบอร์ด' },
  { href: '/admin/products', label: 'สินค้า' },
  { href: '/admin/content', label: 'ข้อความหน้าเว็บ' },
  { href: '/admin/contact', label: 'ข้อมูลติดต่อ' },
  { href: '/admin/users', label: 'ผู้ใช้งาน', ownerOnly: true },
];

export function AdminSidebar({ name, role }: { name: string; role: AdminRole }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <aside className="w-60 shrink-0 bg-white border-r border-[#e9e2d6] flex flex-col">
      <div className="px-5 py-6 border-b border-[#e9e2d6]">
        <p className="text-[10px] tracking-[0.2em] text-[#a87c3c] font-medium">PETE BIRD&apos;S NEST</p>
        <p className="mt-1 text-sm text-[#302a22]">หลังบ้านแอดมิน</p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links
          .filter((l) => !l.ownerOnly || role === 'owner')
          .map((l) => {
            const active = l.href === '/admin' ? pathname === '/admin' : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`block rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  active ? 'bg-[#f3ead9] text-[#a77a3b] font-medium' : 'text-[#5c5244] hover:bg-[#f7f3eb]'
                }`}
              >
                {l.label}
              </Link>
            );
          })}
      </nav>
      <div className="px-5 py-4 border-t border-[#e9e2d6]">
        <p className="text-sm text-[#302a22] truncate">{name}</p>
        <p className="text-xs text-[#a0947e]">{role === 'owner' ? 'เจ้าของระบบ' : 'ผู้แก้ไข'}</p>
        <button onClick={logout} className="mt-3 text-xs text-[#a87c3c] hover:underline">
          ออกจากระบบ
        </button>
      </div>
    </aside>
  );
}
