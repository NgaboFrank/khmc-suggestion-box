import { NextResponse } from 'next/server';
import { COOKIE, sessionToken, validPassword } from '@/lib/admin-auth';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    if (!validPassword(password)) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
    }
    const token = sessionToken();
    if (!token) return NextResponse.json({ error: 'Admin login is not configured' }, { status: 500 });

    const response = NextResponse.json({ ok: true });
    response.cookies.set(COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 8,
    });
    return response;
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
  return response;
}
