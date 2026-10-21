'use client';

import { Suspense, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fcfaf6] px-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-white border border-[#e9e2d6] rounded-2xl shadow-sm p-8">
        <p className="text-[11px] tracking-[0.2em] text-[#a87c3c] font-medium">PETE BIRD&apos;S NEST</p>
        <h1 className="mt-2 text-2xl text-[#302a22]">เข้าสู่ระบบแอดมิน</h1>

        <label className="block mt-6 text-sm text-[#5c5244]">
          อีเมล
          <input
            type="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[#e0d4bf] px-3 py-2.5 text-sm outline-none focus:border-[#a87c3c]"
          />
        </label>

        <label className="block mt-4 text-sm text-[#5c5244]">
          รหัสผ่าน
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[#e0d4bf] px-3 py-2.5 text-sm outline-none focus:border-[#a87c3c]"
          />
        </label>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-lg bg-[#a77a3b] text-white py-2.5 text-sm font-medium hover:bg-[#8a622b] transition-colors disabled:opacity-60"
        >
          {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
        </button>
      </form>
    </div>
  );
}
