import { NextResponse } from 'next/server';
import { adminDb } from '../../../../lib/admin-db';
import { hashPassword, verifyPassword } from '../../../../lib/admin-password';
import { COOKIE, sessionToken } from '../../../../lib/admin-auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const wanted = String(email || '').trim().toLowerCase();
    if (!wanted) return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    if (!password) return NextResponse.json({ error: 'Password is required' }, { status: 400 });

    const supabase = adminDb();
    let { data: admins, error } = await supabase
      .from('admin_users')
      .select('id,email,name,password_hash,is_active')
      .eq('email', wanted)
      .limit(1);

    if (error) {
      console.error('Admin login database error:', error);
      return NextResponse.json({ error: 'Admin accounts are not configured. Make sure admin_users has email and password_hash columns.' }, { status: 500 });
    }

    if ((!admins || admins.length === 0) && process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD && wanted === process.env.ADMIN_EMAIL.trim().toLowerCase() && password === process.env.ADMIN_PASSWORD) {
      const created = await supabase.from('admin_users').insert({ email: wanted, name: 'Administrator', password_hash: hashPassword(password), is_active: true }).select('id,email,name,password_hash,is_active').single();
      if (!created.error && created.data) admins = [created.data];
    }

    const admin = (admins || [])[0] as { id:any; email:string; name:string; password_hash:string; is_active?:boolean } | undefined;
    if (!admin || admin.is_active === false || !verifyPassword(password, admin.password_hash)) return NextResponse.json({ error: 'Incorrect email or password' }, { status: 401 });

    const token = sessionToken(admin.email, admin.password_hash);
    if (!token) return NextResponse.json({ error: 'Admin session is not configured' }, { status: 500 });
    const response = NextResponse.json({ ok: true, name: admin.name });
    response.cookies.set(COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 60 * 60 * 8 });
    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Invalid request' }, { status: 400 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
  return response;
}
