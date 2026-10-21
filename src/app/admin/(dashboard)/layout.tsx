import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { AdminSidebar } from './AdminSidebar';

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/admin/login');

  return (
    <div className="min-h-screen flex bg-white text-[#1f1b16]">
      <AdminSidebar name={session.name} role={session.role} />
      <main className="flex-1 min-w-0 bg-white">
        <div className="max-w-6xl px-10 py-9">{children}</div>
      </main>
    </div>
  );
}
