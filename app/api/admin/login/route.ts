import { NextResponse } from 'next/server';
import { adminDb } from '../../../../lib/admin-db';
import { hashPassword, verifyPassword } from '../../../../lib/admin-password';
import { COOKIE, sessionToken, legacySessionToken } from '../../../../lib/admin-auth';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    const wanted = String(username || '').trim().toLowerCase();
    if (!wanted || !password) return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });

    const supabase = adminDb();
    let { data: admins, error } = await supabase
      .from('admin_users')
      .select('id,username,name,password_hash,is_active')
      .eq('is_active', true);
    if (error) return NextResponse.json({ error: 'Admin accounts are not configured. Make sure the admin_users table exists.' }, { status: 500 });

    // First login can migrate the existing ADMIN_PASSWORD into an individual account.
    if ((!admins || admins.length === 0) && process.env.ADMIN_PASSWORD && wanted === 'admin' && password === process.env.ADMIN_PASSWORD) {
      const created = await supabase.from('admin_users').insert({
        username: 'admin',
        name: 'Administrator',
        password_hash: hashPassword(password),
        is_active: true,
      }).select('id,username,name,password_hash').single();
      if (!created.error && created.data) admins = [created.data];
    }

    const admin = (admins || []).find((a: any) => a.username.toLowerCase() === wanted);
    if (!admin || !verifyPassword(password, admin.password_hash)) {
      if (wanted === 'admin' && process.env.ADMIN_PASSWORD && password === process.env.ADMIN_PASSWORD) {
        const response = NextResponse.json({ ok: true, name: 'Administrator' });
        const legacy = legacySessionToken();
        if (legacy) response.cookies.set(COOKIE, legacy, { httpOnly:true, secure:process.env.NODE_ENV==='production', sameSite:'lax', path:'/', maxAge:60*60*8 });
        return response;
      }
      return NextResponse.json({ error: 'Incorrect username or password' }, { status: 401 });
    }

    const token = sessionToken(admin.username, admin.password_hash);
    if (!token) return NextResponse.json({ error: 'Admin session is not configured' }, { status: 500 });
    const response = NextResponse.json({ ok: true, name: admin.name });
    response.cookies.set(COOKIE, token, { httpOnly:true, secure:process.env.NODE_ENV==='production', sameSite:'lax', path:'/', maxAge:60*60*8 });
    return response;
  } catch (error:any) {
    return NextResponse.json({ error: error?.message || 'Invalid request' }, { status:400 });
  }
}

export async function DELETE() {
  const response=NextResponse.json({ok:true});
  response.cookies.set(COOKIE,'',{httpOnly:true,path:'/',maxAge:0});
  return response;
}
