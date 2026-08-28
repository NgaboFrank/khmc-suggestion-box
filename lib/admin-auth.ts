import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

const COOKIE = 'khmc_admin_session';

function token(secret: string) {
  return createHmac('sha256', secret).update('khmc-admin-session').digest('hex');
}

export function sessionToken() {
  const password = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!password || !secret) return null;
  return token(`${password}:${secret}`);
}

export function validPassword(value: string) {
  return !!process.env.ADMIN_PASSWORD && value === process.env.ADMIN_PASSWORD;
}

export async function isAdmin() {
  const expected = sessionToken();
  if (!expected) return false;
  const value = (await cookies()).get(COOKIE)?.value || '';
  const a = Buffer.from(value);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export { COOKIE };
