import type { Metadata } from 'next';
import '@fontsource-variable/noto-sans-thai';
import './globals.css';

export const metadata: Metadata = {
  title: 'Pete Bird’s Nest — รังนกแท้ คัดพิเศษจากธรรมชาติ',
  description: 'Pete Bird’s Nest รังนกแห้งคัดสรรอย่างใส่ใจ พร้อมชุดของขวัญสำหรับคุณและคนสำคัญ',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="th"><body style={{ position: 'relative' }}>{children}</body></html>;
}
