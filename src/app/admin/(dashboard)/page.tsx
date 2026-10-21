import Link from 'next/link';
import { connectDB } from '@/lib/db';
import { Product } from '@/lib/models/Product';
import { SiteContent } from '@/lib/models/SiteContent';
import { AdminUser } from '@/lib/models/AdminUser';

export const dynamic = 'force-dynamic';

async function getStats() {
  await connectDB();
  const [productCount, publishedCount, contentCount, userCount, latestContent] = await Promise.all([
    Product.countDocuments(),
    Product.countDocuments({ isPublished: true }),
    SiteContent.countDocuments(),
    AdminUser.countDocuments({ isActive: true }),
    SiteContent.findOne().sort({ updatedAt: -1 }),
  ]);
  return { productCount, publishedCount, contentCount, userCount, latestContent };
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  const cards = [
    { label: 'สินค้าทั้งหมด', value: stats.productCount, sub: `แสดงอยู่ ${stats.publishedCount} รายการ`, href: '/admin/products' },
    { label: 'ส่วนเนื้อหาที่ตั้งค่าแล้ว', value: `${stats.contentCount}/9`, sub: 'nav, hero, about, faq ฯลฯ', href: '/admin/content' },
    { label: 'ผู้ใช้งานแอดมิน', value: stats.userCount, sub: 'ที่เปิดใช้งานอยู่', href: '/admin/users' },
  ];

  return (
    <div>
      <h1 className="text-2xl text-[#302a22]">แดชบอร์ด</h1>
      <p className="mt-1 text-sm text-[#827b71]">ภาพรวมของเว็บไซต์ Pete Bird&apos;s Nest</p>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="block bg-white border border-[#e9e2d6] rounded-xl p-5 hover:border-[#c6a876] transition-colors">
            <p className="text-xs text-[#a0947e]">{c.label}</p>
            <p className="mt-2 text-3xl text-[#a77a3b]">{c.value}</p>
            <p className="mt-1 text-xs text-[#827b71]">{c.sub}</p>
          </Link>
        ))}
      </div>

      {stats.contentCount === 0 && (
        <div className="mt-6 bg-[#fff8ea] border border-[#e9d9ad] rounded-xl p-5 text-sm text-[#8a622b]">
          ยังไม่มีข้อมูลในระบบเลย — รัน seed script ก่อน: <code className="bg-white/60 px-1.5 py-0.5 rounded">npm run seed</code>
        </div>
      )}
    </div>
  );
}
