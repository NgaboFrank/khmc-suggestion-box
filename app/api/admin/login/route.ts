import { NextResponse } from 'next/server';
import { adminDb } from '../../../../lib/admin-db';
import { hashPassword, verifyPassword } from '../../../../lib/admin-password';
import { COOKIE, sessionToken, legacySessionToken } from '../../../../lib/admin-auth';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    if (!password) return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    const supabase = adminDb();
    let { data: admins, error } = await supabase.from('admin_users').select('id,username,name,password_hash,active').eq('active', true);
    if (error) return NextResponse.json({ error: 'Admin accounts are not configured. Run the admin database setup first.' }, { status: 500 });

    // On first use, migrate the existing ADMIN_PASSWORD into a persistent admin account.
    if ((!admins || admins.length === 0) && process.env.ADMIN_PASSWORD && password === process.env.ADMIN_PASSWORD) {
      const firstUsername = String(username || 'admin').trim().toLowerCase() || 'admin';
      const created = await supabase.from('admin_users').insert({ username: firstUsername, name: 'Administrator', password_hash: hashPassword(password), active: true }).select('id,username,name,password_hash').single();
      if (!created.error && created.data) admins = [created.data];
    }

    const wanted = String(username || '').trim().toLowerCase();
    const admin = (admins || []).find((a:any) => a.username.toLowerCase() === wanted);
    if (!admin || !verifyPassword(password, admin.password_hash)) {
      // Keep the existing shared login working during migration: username "admin" + ADMIN_PASSWORD.
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
  } catch (error:any) { return NextResponse.json({ error: error?.message || 'Invalid request' }, { status:400 }); }
}

export async function DELETE() { const response=NextResponse.json({ok:true}); response.cookies.set(COOKIE,'',{httpOnly:true,path:'/',maxAge:0}); return response; }
