import { NextResponse } from 'next/server';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { requireRole } from '@/lib/auth';

const ALLOWED_FOLDERS = ['products', 'qr', 'content', 'misc'] as const;
const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const EXT_BY_MIME: Record<string, string> = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/webp': '.webp',
  'image/svg+xml': '.svg',
};

export async function POST(req: Request) {
  const auth = await requireRole();
  if ('response' in auth) return auth.response;

  const form = await req.formData().catch(() => null);
  const file = form?.get('file');
  const folderRaw = form?.get('folder');
  const folder = ALLOWED_FOLDERS.includes(folderRaw as typeof ALLOWED_FOLDERS[number]) ? (folderRaw as string) : 'misc';

  if (!(file instanceof File)) return NextResponse.json({ error: 'ไม่พบไฟล์' }, { status: 400 });
  if (!file.type.startsWith('image/')) return NextResponse.json({ error: 'รองรับเฉพาะไฟล์รูปภาพ' }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: 'ไฟล์ใหญ่เกินไป (จำกัด 5MB)' }, { status: 400 });

  const ext = EXT_BY_MIME[file.type] ?? path.extname(file.name) ?? '';
  const filename = `${randomUUID()}${ext}`;
  // NOTE: on deploy, make sure this directory lives outside the path your
  // deploy step wipes/replaces — see "ข้อควรระวัง" in docs/admin-backend-design.md.
  const dir = path.join(process.cwd(), 'public', 'uploads', folder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), Buffer.from(await file.arrayBuffer()));

  return NextResponse.json({ path: `/uploads/${folder}/${filename}` }, { status: 201 });
}
