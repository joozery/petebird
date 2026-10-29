'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutGrid, Package, FileText, Contact, Users, LogOut } from 'lucide-react';
import type { AdminRole } from '@/lib/models/AdminUser';

const links: { href: string; label: string; icon: typeof LayoutGrid; ownerOnly?: boolean }[] = [
  { href: '/admin', label: 'แดชบอร์ด', icon: LayoutGrid },
  { href: '/admin/products', label: 'สินค้า', icon: Package },
  { href: '/admin/content', label: 'ข้อความหน้าเว็บ', icon: FileText },
  { href: '/admin/contact', label: 'ข้อมูลติดต่อ', icon: Contact },
  { href: '/admin/users', label: 'ผู้ใช้งาน', icon: Users, ownerOnly: true },
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
    <aside className="w-64 shrink-0 bg-white border-r border-[#ededed] flex flex-col">
      <div className="h-16 px-6 flex items-center border-b border-[#ededed]">
        <div>
          <p className="text-[10px] tracking-[0.18em] text-[#b8892c] font-semibold">PETE BIRD&apos;S NEST</p>
          <p className="text-[13px] text-[#1f1b16] font-medium">หลังบ้านแอดมิน</p>
        </div>
      </div>
      <nav className="flex-1 px-3 py-5 space-y-0.5">
        {links
          .filter((l) => !l.ownerOnly || role === 'owner')
          .map((l) => {
            const active = l.href === '/admin' ? pathname === '/admin' : pathname.startsWith(l.href);
            const Icon = l.icon;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] transition-colors ${
                  active ? 'bg-[#1f1b16] text-white font-medium' : 'text-[#50493f] hover:bg-[#f5f4f2]'
                }`}
              >
                <Icon size={16} className={active ? 'text-[#d9b877]' : 'text-[#9a9388]'} />
                {l.label}
              </Link>
            );
          })}
      </nav>
      <div className="px-4 py-4 border-t border-[#ededed]">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-8 h-8 shrink-0 rounded-full bg-gradient-to-br from-[#c7974c] to-[#9c753a] text-white text-xs font-semibold flex items-center justify-center">
            {name.trim().slice(0, 1).toUpperCase() || '?'}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] text-[#1f1b16] font-medium truncate">{name}</p>
            <p className="text-[11px] text-[#9a9388]">{role === 'owner' ? 'Owner' : 'Editor'}</p>
          </div>
        </div>
        <button onClick={logout} className="mt-1 w-full flex items-center gap-2.5 rounded-lg px-2 py-2 text-[13px] text-[#8a7f6d] hover:bg-[#f5f4f2] hover:text-[#1f1b16] transition-colors">
          <LogOut size={15} /> ออกจากระบบ
        </button>
      </div>
    </aside>
  );
}
