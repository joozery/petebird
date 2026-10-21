import type { Metadata } from 'next';
import '@fontsource-variable/noto-sans-thai';
import 'flag-icons/css/flag-icons.min.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'Pete Bird’s Nest — รังนกแท้ คัดพิเศษจากธรรมชาติ | Premium Bird’s Nest | 纯正燕窝',
  description: 'Pete Bird’s Nest รังนกแห้งคัดสรรอย่างใส่ใจ พร้อมชุดของขวัญสำหรับคุณและคนสำคัญ · Thoughtfully selected dried bird’s nest and gift sets · 严选干燕窝与燕窝礼盒',
};

// LanguageProvider wraps HomeClient directly (see src/app/HomeClient.tsx) so it
// can receive dictionaries fetched from MongoDB, and so /admin routes don't
// carry the public site's language context for no reason.
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="th"><body style={{ position: 'relative' }}>{children}</body></html>;
}
