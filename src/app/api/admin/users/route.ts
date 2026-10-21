import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { AdminUser, ADMIN_ROLES } from '@/lib/models/AdminUser';
import { hashPassword, requireRole } from '@/lib/auth';

export async function GET() {
  const auth = await requireRole(['owner']);
  if ('response' in auth) return auth.response;
  await connectDB();
  const users = await AdminUser.find().select('-passwordHash').sort({ createdAt: 1 });
  return NextResponse.json({ users });
}

export async function POST(req: Request) {
  const auth = await requireRole(['owner']);
  if ('response' in auth) return auth.response;

  const body = await req.json().catch(() => null);
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const password = typeof body?.password === 'string' ? body.password : '';
  const role = ADMIN_ROLES.includes(body?.role) ? body.role : 'editor';
  if (!email || !name || password.length < 8) {
    return NextResponse.json({ error: 'ต้องมีชื่อ, อีเมล, และรหัสผ่านอย่างน้อย 8 ตัวอักษร' }, { status: 400 });
  }

  await connectDB();
  const existing = await AdminUser.findOne({ email });
  if (existing) return NextResponse.json({ error: 'อีเมลนี้มีผู้ใช้อยู่แล้ว' }, { status: 409 });

  const user = await AdminUser.create({ name, email, role, passwordHash: await hashPassword(password) });
  const { passwordHash: _omit, ...safe } = user.toObject();
  return NextResponse.json({ user: safe }, { status: 201 });
}
