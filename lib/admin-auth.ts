import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import { adminDb } from './admin-db';

export const COOKIE = 'khmc_admin_session';
const SESSION_HOURS = 8;

function token(secret: string) {
  return createHmac('sha256', secret).update('khmc-admin-session').digest('hex');
}

export function sessionToken(email: string, passwordHash: string) {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || '';
  if (!secret) return null;
  return token(`${email}:${passwordHash}:${secret}`);
}

export async function setAdminSession(email: string, passwordHash: string) {
  const value = sessionToken(email, passwordHash);
  if (!value) return false;
  const response = cookies();
  (await response).set(COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * SESSION_HOURS,
  });
  return true;
}

export async function isAdmin() {
  const value = (await cookies()).get(COOKIE)?.value || '';
  if (!value) return false;
  try {
    const { data } = await adminDb()
      .from('admin_users')
      .select('email,password_hash');

    return (data || []).some((a: any) => {
      const expected = sessionToken(a.email, a.password_hash);
      if (!expected) return false;
      const x = Buffer.from(value);
      const y = Buffer.from(expected);
      return x.length === y.length && timingSafeEqual(x, y);
    });
  } catch {
    return false;
  }
}

export async function currentAdmin() {
  const value = (await cookies()).get(COOKIE)?.value || '';
  if (!value) return null;
  try {
    const { data } = await adminDb()
      .from('admin_users')
      .select('id,email,name,password_hash');

    return (data || []).find((a: any) => {
      const expected = sessionToken(a.email, a.password_hash);
      if (!expected) return false;
      const x = Buffer.from(value);
      const y = Buffer.from(expected);
      return x.length === y.length && timingSafeEqual(x, y);
    }) || null;
  } catch {
    return null;
  }
}

export { SESSION_HOURS };
