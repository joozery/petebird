import { NextResponse } from 'next/server';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { requireRole } from '@/lib/auth';

const ALLOWED_FOLDERS = ['products', 'qr', 'content', 'misc'] as const;
const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const EXT_BY_MIME: Record<string, string> = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/webp': '.webp',
  'image/svg+xml': '.svg',
};

const r2Configured = Boolean(
  process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY &&
  process.env.R2_BUCKET && process.env.R2_PUBLIC_URL,
);

const r2 = r2Configured
  ? new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    })
  : null;

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
  const body = Buffer.from(await file.arrayBuffer());

  if (r2) {
    const key = `${folder}/${filename}`;
    try {
      await r2.send(new PutObjectCommand({
        Bucket: process.env.R2_BUCKET!,
        Key: key,
        Body: body,
        ContentType: file.type,
        CacheControl: 'public, max-age=31536000, immutable',
      }));
    } catch (err) {
      console.error('R2 upload failed', err);
      return NextResponse.json({ error: 'อัปโหลดไม่สำเร็จ' }, { status: 502 });
    }
    const base = process.env.R2_PUBLIC_URL!.replace(/\/$/, '');
    return NextResponse.json({ path: `${base}/${key}` }, { status: 201 });
  }

  // Local fallback when R2 isn't configured.
  // NOTE: on deploy, make sure this directory lives outside the path your
  // deploy step wipes/replaces — see "ข้อควรระวัง" in docs/admin-backend-design.md.
  const dir = path.join(process.cwd(), 'public', 'uploads', folder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), body);

  return NextResponse.json({ path: `/uploads/${folder}/${filename}` }, { status: 201 });
}
