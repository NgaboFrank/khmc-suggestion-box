import { NextResponse } from 'next/server';
import { adminDb } from '../../../../lib/admin-db';
import { hashPassword } from '../../../../lib/admin-password';
import { currentAdmin } from '../../../../lib/admin-auth';

export async function GET() {
  if (!(await currentAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data, error } = await adminDb().from('admin_users').select('id,email,name,created_at').order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ admins: data || [] });
}

export async function POST(request: Request) {
  if (!(await currentAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { email, name, password } = await request.json();
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanName = String(name || '').trim() || 'Administrator';
    const cleanPassword = String(password || '');
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) return NextResponse.json({ error: 'Enter a valid email address' }, { status: 400 });
    if (cleanPassword.length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    const db = adminDb();
    const existing = await db.from('admin_users').select('id').eq('email', cleanEmail).maybeSingle();
    if (existing.error) return NextResponse.json({ error: existing.error.message }, { status: 500 });
    if (existing.data) return NextResponse.json({ error: 'An admin with this email already exists' }, { status: 409 });
    const { data, error } = await db.from('admin_users').insert({ email: cleanEmail, name: cleanName, password_hash: hashPassword(cleanPassword) }).select('id,email,name,created_at').single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ admin: data }, { status: 201 });
  } catch (error:any) { return NextResponse.json({ error: error?.message || 'Invalid request' }, { status: 400 }); }
}

export async function DELETE(request: Request) {
  const me = await currentAdmin();
  if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'Admin id is required' }, { status: 400 });
    if (String(id) === String(me.id)) return NextResponse.json({ error: 'You cannot delete the account you are currently using' }, { status: 400 });
    const { error } = await adminDb().from('admin_users').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (error:any) { return NextResponse.json({ error: error?.message || 'Invalid request' }, { status: 400 }); }
}
