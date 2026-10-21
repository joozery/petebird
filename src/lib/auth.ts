import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import type { AdminRole } from './models/AdminUser';

export const SESSION_COOKIE = 'admin_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

function secretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error('AUTH_SECRET is not set. Add it to .env.local.');
  return new TextEncoder().encode(secret);
}

export type SessionPayload = { sub: string; email: string; name: string; role: AdminRole };

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(secretKey());
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (typeof payload.sub !== 'string' || typeof payload.role !== 'string') return null;
    return { sub: payload.sub, email: String(payload.email ?? ''), name: String(payload.name ?? ''), role: payload.role as AdminRole };
  } catch {
    return null;
  }
}

/** Reads and verifies the session cookie from the current request (Server Components, Route Handlers). */
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}

export function setSessionCookie(response: NextResponse, token: string) {
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Guard for API route handlers: returns the verified session, or a ready-to-return
 * 401/403 NextResponse if the caller isn't allowed in. Usage:
 *   const auth = await requireRole();
 *   if ('response' in auth) return auth.response;
 *   const { session } = auth;
 */
export async function requireRole(
  allowedRoles?: AdminRole[],
): Promise<{ session: SessionPayload } | { response: NextResponse }> {
  const session = await getSession();
  if (!session) return { response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  if (allowedRoles && !allowedRoles.includes(session.role)) {
    return { response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }
  return { session };
}
