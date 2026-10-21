import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { connectDB } from '@/lib/db';
import { Product } from '@/lib/models/Product';
import { requireRole } from '@/lib/auth';

export async function GET() {
  const auth = await requireRole();
  if ('response' in auth) return auth.response;
  await connectDB();
  const products = await Product.find().sort({ order: 1 });
  return NextResponse.json({ products });
}

export async function POST(req: Request) {
  const auth = await requireRole();
  if ('response' in auth) return auth.response;

  const body = await req.json().catch(() => null);
  if (!body?.slug || !body?.badge || !body?.image || !body?.translations) {
    return NextResponse.json({ error: 'ข้อมูลไม่ครบ: ต้องมี slug, badge, image, translations' }, { status: 400 });
  }

  await connectDB();
  const existing = await Product.findOne({ slug: body.slug });
  if (existing) return NextResponse.json({ error: `มีสินค้า slug "${body.slug}" อยู่แล้ว` }, { status: 409 });

  const maxOrder = await Product.findOne().sort({ order: -1 });
  const product = await Product.create({
    slug: body.slug,
    order: typeof body.order === 'number' ? body.order : (maxOrder?.order ?? 0) + 1,
    badge: body.badge,
    price: body.price === null || body.price === undefined ? null : Number(body.price),
    image: body.image,
    isPublished: body.isPublished ?? true,
    translations: body.translations,
  });

  revalidatePath('/');
  return NextResponse.json({ product }, { status: 201 });
}
