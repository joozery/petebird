'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutGrid, Package, FileText, Contact, Users, LogOut, Menu, X } from 'lucide-react';
import type { AdminRole } from '@/lib/models/AdminUser';

const links: { href: string; label: string; icon: typeof LayoutGrid; ownerOnly?: boolean }[] = [
  { href: '/admin', label: 'แดชบอร์ด', icon: LayoutGrid },
  { href: '/admin/products', label: 'สินค้า', icon: Package },
  { href: '/admin/content', label: 'ข้อความหน้าเว็บ', icon: FileText },
  { href: '/admin/contact', label: 'ข้อมูลติดต่อ', icon: Contact },
  { href: '/admin/users', label: 'ผู้ใช้งาน', icon: Users, ownerOnly: true },
];

function Brand() {
  return (
    <div>
      <p className="text-[10px] tracking-[0.18em] text-[#b8892c] font-semibold">PETE BIRD&apos;S NEST</p>
      <p className="text-[13px] text-[#1f1b16] font-medium">หลังบ้านแอดมิน</p>
    </div>
  );
}

export function AdminSidebar({ name, role }: { name: string; role: AdminRole }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => setOpen(false), [pathname]);

  // Lock page scroll while the drawer is open on mobile.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  async function logout() {
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  const visibleLinks = links.filter((l) => !l.ownerOnly || role === 'owner');
  const current = visibleLinks.find((l) => (l.href === '/admin' ? pathname === '/admin' : pathname.startsWith(l.href)));

  return (
    <>
      {/* Mobile / tablet top bar */}
      <header className="lg:hidden sticky top-0 z-30 h-14 px-4 flex items-center gap-3 bg-white/95 backdrop-blur border-b border-[#ededed]">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="เปิดเมนู"
          aria-expanded={open}
          className="-ml-2 inline-flex items-center justify-center w-10 h-10 rounded-lg text-[#1f1b16] hover:bg-[#f5f4f2]"
        >
          <Menu size={20} />
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] tracking-[0.18em] text-[#b8892c] font-semibold leading-tight">PETE BIRD&apos;S NEST</p>
          <p className="text-[13px] text-[#1f1b16] font-medium truncate leading-tight">{current?.label ?? 'หลังบ้านแอดมิน'}</p>
        </div>
        <div className="w-8 h-8 shrink-0 rounded-full bg-gradient-to-br from-[#c7974c] to-[#9c753a] text-white text-xs font-semibold flex items-center justify-center">
          {name.trim().slice(0, 1).toUpperCase() || '?'}
        </div>
      </header>

      {/* Backdrop for the mobile drawer */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden
        className={`lg:hidden fixed inset-0 z-40 bg-[#24190f]/40 backdrop-blur-[2px] transition-opacity ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-white border-r border-[#ededed] flex flex-col transition-transform duration-200
          ${open ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
          lg:sticky lg:top-0 lg:h-dvh lg:w-64 lg:translate-x-0 lg:shadow-none lg:shrink-0`}
      >
        <div className="h-14 lg:h-16 px-6 flex items-center justify-between border-b border-[#ededed]">
          <Brand />
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="ปิดเมนู"
            className="lg:hidden -mr-2 inline-flex items-center justify-center w-10 h-10 rounded-lg text-[#50493f] hover:bg-[#f5f4f2]"
          >
            <X size={18} />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-0.5">
          {visibleLinks.map((l) => {
            const active = l === current;
            const Icon = l.icon;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-3 lg:py-2.5 text-[14px] lg:text-[13.5px] transition-colors ${
                  active ? 'bg-[#1f1b16] text-white font-medium' : 'text-[#50493f] hover:bg-[#f5f4f2]'
                }`}
              >
                <Icon size={16} className={active ? 'text-[#d9b877]' : 'text-[#9a9388]'} />
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-4 py-4 border-t border-[#ededed] pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 shrink-0 rounded-full bg-gradient-to-br from-[#c7974c] to-[#9c753a] text-white text-xs font-semibold flex items-center justify-center">
              {name.trim().slice(0, 1).toUpperCase() || '?'}
            </div>
            <div className="min-w-0">
              <p className="text-[13px] text-[#1f1b16] font-medium truncate">{name}</p>
              <p className="text-[11px] text-[#9a9388]">{role === 'owner' ? 'Owner' : 'Editor'}</p>
            </div>
          </div>
          <button onClick={logout} className="mt-1 w-full flex items-center gap-2.5 rounded-lg px-2 py-2.5 text-[13px] text-[#8a7f6d] hover:bg-[#f5f4f2] hover:text-[#1f1b16] transition-colors">
            <LogOut size={15} /> ออกจากระบบ
          </button>
        </div>
      </aside>
    </>
  );
}
