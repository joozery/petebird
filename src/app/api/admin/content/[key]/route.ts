import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { connectDB } from '@/lib/db';
import { SiteContent, SITE_CONTENT_KEYS, type SiteContentKey } from '@/lib/models/SiteContent';
import { requireRole } from '@/lib/auth';

type Ctx = { params: Promise<{ key: string }> };

function isValidKey(key: string): key is SiteContentKey {
  return (SITE_CONTENT_KEYS as readonly string[]).includes(key);
}

export async function GET(_req: Request, { params }: Ctx) {
  const auth = await requireRole();
  if ('response' in auth) return auth.response;
  const { key } = await params;
  if (!isValidKey(key)) return NextResponse.json({ error: 'ไม่รู้จัก section นี้' }, { status: 400 });

  await connectDB();
  const doc = await SiteContent.findOne({ key });
  return NextResponse.json({ content: doc });
}

export async function PATCH(req: Request, { params }: Ctx) {
  const auth = await requireRole();
  if ('response' in auth) return auth.response;
  const { key } = await params;
  if (!isValidKey(key)) return NextResponse.json({ error: 'ไม่รู้จัก section นี้' }, { status: 400 });

  const body = await req.json().catch(() => null);
  if (!body?.th || !body?.en || !body?.zh) {
    return NextResponse.json({ error: 'ต้องมีข้อมูลครบทั้ง th, en, zh' }, { status: 400 });
  }

  await connectDB();
  const doc = await SiteContent.findOneAndUpdate(
    { key },
    { key, th: body.th, en: body.en, zh: body.zh },
    { new: true, upsert: true },
  );

  revalidatePath('/');
  return NextResponse.json({ content: doc });
}
