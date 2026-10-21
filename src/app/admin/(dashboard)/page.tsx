import Link from 'next/link';
import { Package, FileText, Users, ArrowUpRight } from 'lucide-react';
import { connectDB } from '@/lib/db';
import { Product } from '@/lib/models/Product';
import { SiteContent, SITE_CONTENT_KEYS } from '@/lib/models/SiteContent';
import { AdminUser } from '@/lib/models/AdminUser';

export const dynamic = 'force-dynamic';

async function getStats() {
  await connectDB();
  const [productCount, publishedCount, contentCount, userCount] = await Promise.all([
    Product.countDocuments(),
    Product.countDocuments({ isPublished: true }),
    SiteContent.countDocuments(),
    AdminUser.countDocuments({ isActive: true }),
  ]);
  return { productCount, publishedCount, contentCount, userCount };
}

export default async function AdminDashboardPage() {
  const stats = await getStats();
  const totalSections = SITE_CONTENT_KEYS.length;

  const cards = [
    { label: 'สินค้าทั้งหมด', value: stats.productCount, sub: `แสดงอยู่ ${stats.publishedCount} รายการ`, href: '/admin/products', icon: Package },
    { label: 'ส่วนเนื้อหาที่ตั้งค่าแล้ว', value: `${stats.contentCount}/${totalSections}`, sub: 'nav, hero, about, faq ฯลฯ', href: '/admin/content', icon: FileText },
    { label: 'ผู้ใช้งานแอดมิน', value: stats.userCount, sub: 'ที่เปิดใช้งานอยู่', href: '/admin/users', icon: Users },
  ];

  return (
    <div>
      <h1 className="text-[22px] font-semibold text-[#1f1b16]">แดชบอร์ด</h1>
      <p className="mt-1 text-sm text-[#8a7f6d]">ภาพรวมของเว็บไซต์ Pete Bird&apos;s Nest</p>

      <div className="mt-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.label}
              href={c.href}
              className="group block bg-white border border-[#ededed] rounded-2xl p-5 hover:border-[#d9d5cb] hover:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(31,27,22,0.05)] transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="w-9 h-9 rounded-lg bg-[#f5f1e7] text-[#a77a3b] flex items-center justify-center">
                  <Icon size={17} />
                </div>
                <ArrowUpRight size={15} className="text-[#d2cdc0] group-hover:text-[#a77a3b] transition-colors" />
              </div>
              <p className="mt-4 text-[28px] leading-none font-semibold text-[#1f1b16]">{c.value}</p>
              <p className="mt-2 text-[13px] text-[#50493f]">{c.label}</p>
              <p className="mt-0.5 text-xs text-[#a79e8c]">{c.sub}</p>
            </Link>
          );
        })}
      </div>

      {stats.contentCount === 0 && (
        <div className="mt-6 bg-[#fdf8ec] border border-[#efe0ad] rounded-xl p-5 text-sm text-[#8a622b]">
          ยังไม่มีข้อมูลในระบบเลย — รัน seed script ก่อน: <code className="bg-white/60 px-1.5 py-0.5 rounded font-mono text-xs">npm run seed</code>
        </div>
      )}
    </div>
  );
}
