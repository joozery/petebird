import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { connectDB } from '@/lib/db';
import { Product } from '@/lib/models/Product';
import { requireRole } from '@/lib/auth';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const auth = await requireRole();
  if ('response' in auth) return auth.response;
  const { id } = await params;
  await connectDB();
  const product = await Product.findById(id);
  if (!product) return NextResponse.json({ error: 'ไม่พบสินค้า' }, { status: 404 });
  return NextResponse.json({ product });
}

export async function PATCH(req: Request, { params }: Ctx) {
  const auth = await requireRole();
  if ('response' in auth) return auth.response;
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 });

  await connectDB();
  const update: Record<string, unknown> = {};
  for (const key of ['slug', 'order', 'badge', 'price', 'image', 'isPublished', 'translations'] as const) {
    if (key in body) update[key] = body[key];
  }
  const product = await Product.findByIdAndUpdate(id, update, { new: true, runValidators: true });
  if (!product) return NextResponse.json({ error: 'ไม่พบสินค้า' }, { status: 404 });

  revalidatePath('/');
  return NextResponse.json({ product });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const auth = await requireRole();
  if ('response' in auth) return auth.response;
  const { id } = await params;
  await connectDB();
  const product = await Product.findByIdAndDelete(id);
  if (!product) return NextResponse.json({ error: 'ไม่พบสินค้า' }, { status: 404 });

  revalidatePath('/');
  return NextResponse.json({ ok: true });
}
