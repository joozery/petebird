import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';

export async function GET() {
  const auth = await requireRole();
  if ('response' in auth) return auth.response;
  return NextResponse.json({ user: auth.session });
}
