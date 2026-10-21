import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { AdminUser, ADMIN_ROLES } from '@/lib/models/AdminUser';
import { hashPassword, requireRole } from '@/lib/auth';

type Ctx = { params: Promise<{ id: string }> };

async function remainingOwnerCount(excludeId?: string) {
  const query: Record<string, unknown> = { role: 'owner', isActive: true };
  if (excludeId) query._id = { $ne: excludeId };
  return AdminUser.countDocuments(query);
}

export async function PATCH(req: Request, { params }: Ctx) {
  const auth = await requireRole(['owner']);
  if ('response' in auth) return auth.response;
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 });

  await connectDB();

  // Guard: don't let the last active owner demote themself or get deactivated.
  if ((body.role && body.role !== 'owner') || body.isActive === false) {
    const target = await AdminUser.findById(id);
    if (target?.role === 'owner' && (await remainingOwnerCount(id)) === 0) {
      return NextResponse.json({ error: 'ต้องมี owner อย่างน้อย 1 คนเสมอ' }, { status: 400 });
    }
  }

  const update: Record<string, unknown> = {};
  if (typeof body.name === 'string' && body.name.trim()) update.name = body.name.trim();
  if (ADMIN_ROLES.includes(body.role)) update.role = body.role;
  if (typeof body.isActive === 'boolean') update.isActive = body.isActive;
  if (typeof body.password === 'string' && body.password) {
    if (body.password.length < 8) return NextResponse.json({ error: 'รหัสผ่านต้องยาวอย่างน้อย 8 ตัวอักษร' }, { status: 400 });
    update.passwordHash = await hashPassword(body.password);
  }

  const user = await AdminUser.findByIdAndUpdate(id, update, { new: true }).select('-passwordHash');
  if (!user) return NextResponse.json({ error: 'ไม่พบผู้ใช้' }, { status: 404 });
  return NextResponse.json({ user });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const auth = await requireRole(['owner']);
  if ('response' in auth) return auth.response;
  const { id } = await params;

  if (id === auth.session.sub) {
    return NextResponse.json({ error: 'ลบบัญชีตัวเองไม่ได้' }, { status: 400 });
  }

  await connectDB();
  const target = await AdminUser.findById(id);
  if (!target) return NextResponse.json({ error: 'ไม่พบผู้ใช้' }, { status: 404 });
  if (target.role === 'owner' && (await remainingOwnerCount(id)) === 0) {
    return NextResponse.json({ error: 'ต้องมี owner อย่างน้อย 1 คนเสมอ' }, { status: 400 });
  }

  await AdminUser.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
