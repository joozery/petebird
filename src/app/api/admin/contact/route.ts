import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { connectDB } from '@/lib/db';
import { ContactInfo } from '@/lib/models/ContactInfo';
import { requireRole } from '@/lib/auth';

export async function GET() {
  const auth = await requireRole();
  if ('response' in auth) return auth.response;
  await connectDB();
  const doc = await ContactInfo.findById('contact');
  return NextResponse.json({ contact: doc });
}

export async function PATCH(req: Request) {
  const auth = await requireRole();
  if ('response' in auth) return auth.response;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 });

  await connectDB();
  const update: Record<string, unknown> = {};
  for (const key of ['lineUrl', 'facebookUrl', 'phone', 'lineQrImage'] as const) {
    if (key in body) update[key] = body[key] || null;
  }
  const doc = await ContactInfo.findByIdAndUpdate('contact', update, { new: true, upsert: true });

  revalidatePath('/');
  return NextResponse.json({ contact: doc });
}
