import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { AdminSidebar } from './AdminSidebar';

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/admin/login');

  return (
    <div className="min-h-screen flex bg-[#fcfaf6] text-[#302a22]">
      <AdminSidebar name={session.name} role={session.role} />
      <main className="flex-1 min-w-0 px-8 py-8">{children}</main>
    </div>
  );
}
