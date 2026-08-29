import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import { adminDb } from './admin-db';

export const COOKIE = 'khmc_admin_session';
const SESSION_HOURS = 8;
function token(secret: string) { return createHmac('sha256', secret).update('khmc-admin-session').digest('hex'); }
export function sessionToken(username: string, passwordHash: string) {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || '';
  if (!secret) return null;
  return token(`${username}:${passwordHash}:${secret}`);
}
export function legacySessionToken() {
  const password = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SESSION_SECRET || password;
  if (!password || !secret) return null;
  return token(`${password}:${secret}`);
}
export async function setAdminSession(username: string, passwordHash: string) {
  const value = sessionToken(username, passwordHash);
  if (!value) return false;
  const response = cookies();
  (await response).set(COOKIE, value, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 60 * 60 * SESSION_HOURS });
  return true;
}
export async function isAdmin() {
  const value = (await cookies()).get(COOKIE)?.value || '';
  if (!value) return false;
  const legacy = legacySessionToken();
  if (legacy && value === legacy) return true;
  try {
    const { data } = await adminDb().from('admin_users').select('username,password_hash,is_active').eq('is_active', true);
    return (data || []).some((a: any) => { const expected = sessionToken(a.username, a.password_hash); if (!expected) return false; const x=Buffer.from(value), y=Buffer.from(expected); return x.length===y.length && timingSafeEqual(x,y); });
  } catch { return false; }
}
export async function currentAdmin() {
  const value = (await cookies()).get(COOKIE)?.value || '';
  if (!value) return null;
  try { const { data } = await adminDb().from('admin_users').select('id,username,name,is_active,password_hash').eq('is_active', true); return (data || []).find((a:any)=>{const expected=sessionToken(a.username,a.password_hash);if(!expected)return false;const x=Buffer.from(value),y=Buffer.from(expected);return x.length===y.length&&timingSafeEqual(x,y)}) || null; } catch { return null; }
}
export { SESSION_HOURS };
