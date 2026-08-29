import { NextResponse } from 'next/server';
import { adminDb } from '../../../../lib/admin-db';
import { hashPassword } from '../../../../lib/admin-password';
import { currentAdmin } from '../../../../lib/admin-auth';

function clean(value: unknown) { return String(value ?? '').trim(); }

export async function GET() {
  const me = await currentAdmin();
  if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!me.is_owner) return NextResponse.json({ error: 'Only the owner can manage admins' }, { status: 403 });
  const { data, error } = await adminDb().from('admin_users').select('id,email,name,username,is_active,is_owner,created_at').order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ admins: data || [] });
}

export async function POST(request: Request) {
  const me = await currentAdmin();
  if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!me.is_owner) return NextResponse.json({ error: 'Only the owner can add admins' }, { status: 403 });
  try {
    const { email, name, password } = await request.json();
    const cleanEmail = clean(email).toLowerCase();
    const cleanName = clean(name) || 'Administrator';
    const cleanPassword = String(password || '');
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) return NextResponse.json({ error: 'Enter a valid email address' }, { status: 400 });
    if (cleanPassword.length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    const db = adminDb();
    const existing = await db.from('admin_users').select('id').eq('email', cleanEmail).maybeSingle();
    if (existing.error) return NextResponse.json({ error: existing.error.message }, { status: 500 });
    if (existing.data) return NextResponse.json({ error: 'An admin with this email already exists' }, { status: 409 });

    const base = (cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9._-]/g, '').slice(0, 24) || 'admin');
    let username = base;
    for (let n = 2; n <= 100; n++) {
      const taken = await db.from('admin_users').select('id').eq('username', username).maybeSingle();
      if (taken.error) return NextResponse.json({ error: taken.error.message }, { status: 500 });
      if (!taken.data) break;
      username = `${base}${n}`;
    }

    const { data, error } = await db.from('admin_users').insert({
      email: cleanEmail,
      name: cleanName,
      username,
      password_hash: hashPassword(cleanPassword),
      is_active: true,
      is_owner: false,
    }).select('id,email,name,username,is_active,is_owner,created_at').single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ admin: data }, { status: 201 });
  } catch (error:any) { return NextResponse.json({ error: error?.message || 'Invalid request' }, { status: 400 }); }
}

export async function PATCH(request: Request) {
  const me = await currentAdmin();
  if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!me.is_owner) return NextResponse.json({ error: 'Only the owner can change admins' }, { status: 403 });
  try {
    const { id, is_active } = await request.json();
    if (!id) return NextResponse.json({ error: 'Admin id is required' }, { status: 400 });
    if (String(id) === String(me.id)) return NextResponse.json({ error: 'You cannot disable your owner account here' }, { status: 400 });
    const { data, error } = await adminDb().from('admin_users').update({ is_active: Boolean(is_active) }).eq('id', id).eq('is_owner', false).select('id,email,name,username,is_active,is_owner,created_at').single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ admin: data });
  } catch (error:any) { return NextResponse.json({ error: error?.message || 'Invalid request' }, { status: 400 }); }
}

export async function DELETE(request: Request) {
  const me = await currentAdmin();
  if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!me.is_owner) return NextResponse.json({ error: 'Only the owner can remove admins' }, { status: 403 });
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'Admin id is required' }, { status: 400 });
    if (String(id) === String(me.id)) return NextResponse.json({ error: 'You cannot delete your owner account' }, { status: 400 });
    const { error } = await adminDb().from('admin_users').delete().eq('id', id).eq('is_owner', false);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (error:any) { return NextResponse.json({ error: error?.message || 'Invalid request' }, { status: 400 }); }
}
