import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { AdminUser } from '@/lib/models/AdminUser';
import { comparePassword, setSessionCookie, signSession } from '@/lib/auth';
import { clearLoginFailures, isLoginLocked, recordLoginFailure } from '@/lib/rateLimit';

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body?.password === 'string' ? body.password : '';
  if (!email || !password) return NextResponse.json({ error: 'กรอกอีเมลและรหัสผ่าน' }, { status: 400 });

  if (isLoginLocked(email)) {
    return NextResponse.json({ error: 'ลองผิดหลายครั้งเกินไป กรุณารออีก 15 นาที' }, { status: 429 });
  }

  await connectDB();
  const user = await AdminUser.findOne({ email });
  const valid = user && user.isActive && (await comparePassword(password, user.passwordHash));
  if (!valid) {
    recordLoginFailure(email);
    return NextResponse.json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' }, { status: 401 });
  }
  clearLoginFailures(email);

  user.lastLoginAt = new Date();
  await user.save();

  const token = await signSession({ sub: user._id.toString(), email: user.email, name: user.name, role: user.role });
  const response = NextResponse.json({ ok: true, user: { id: user._id.toString(), email: user.email, name: user.name, role: user.role } });
  setSessionCookie(response, token);
  return response;
}
