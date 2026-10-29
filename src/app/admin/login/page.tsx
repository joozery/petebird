'use client';

import { Suspense, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import logo from '../../../../public/logolong.png';

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginForm />
    </Suspense>
  );
}

function AdminLoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'เข้าสู่ระบบไม่สำเร็จ');
        return;
      }
      router.push(params.get('next') || '/admin');
      router.refresh();
    } catch {
      setError('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ ลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  }

  const input = 'mt-1.5 w-full rounded-lg border border-[#e5e3dd] bg-white pl-10 pr-3 py-2.5 text-sm text-[#1f1b16] outline-none focus:border-[#b8892c] focus:ring-2 focus:ring-[#b8892c1a] transition-shadow';

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-[380px]">
        <div className="flex justify-center">
          <Image src={logo} alt="Pete Bird's Nest" height={44} style={{ width: 'auto', height: 44 }} priority />
        </div>

        <form onSubmit={onSubmit} className="mt-8 bg-white border border-[#ededed] rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_rgba(31,27,22,0.06)] p-8">
          <h1 className="text-xl font-semibold text-[#1f1b16]">เข้าสู่ระบบแอดมิน</h1>
          <p className="mt-1 text-sm text-[#8a7f6d]">จัดการสินค้า เนื้อหา และข้อมูลติดต่อของเว็บไซต์</p>

          <label className="block mt-6 text-[13px] font-medium text-[#50493f]">
            อีเมล
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a79e8c]" />
              <input
                type="email"
                required
                autoFocus
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={input}
                placeholder="you@petebird.local"
              />
            </div>
          </label>

          <label className="block mt-4 text-[13px] font-medium text-[#50493f]">
            รหัสผ่าน
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a79e8c]" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${input} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                tabIndex={-1}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#a79e8c] hover:text-[#50493f]"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </label>

          {error && (
            <div className="mt-4 rounded-lg bg-[#fdf0ee] border border-[#f3cfc8] px-3.5 py-2.5 text-[13px] text-[#a83a2a]">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-lg bg-[#1f1b16] text-white py-2.5 text-sm font-medium hover:bg-[#33291c] transition-colors disabled:opacity-60"
          >
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-[#a79e8c]">© Pete Bird&apos;s Nest Admin</p>
      </div>
    </div>
  );
}
