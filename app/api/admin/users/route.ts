import { NextResponse } from 'next/server';
import { adminDb } from '../../../../lib/admin-db';
import { hashPassword } from '../../../../lib/admin-password';
import { isAdmin } from '../../../../lib/admin-auth';

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data, error } = await adminDb().from('admin_users').select('id,name,username,is_active,created_at').order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ admins: data || [] });
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { name, username, password } = await request.json();
    const cleanName = String(name || '').trim();
    const cleanUsername = String(username || '').trim().toLowerCase();
    if (!cleanName || !cleanUsername || !password) return NextResponse.json({ error: 'Name, username and password are required' }, { status: 400 });
    if (!/^[a-z0-9._-]{3,30}$/.test(cleanUsername)) return NextResponse.json({ error: 'Username must be 3-30 characters using letters, numbers, dot, underscore or hyphen' }, { status: 400 });
    if (String(password).length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    const { data, error } = await adminDb().from('admin_users').insert({ name: cleanName, username: cleanUsername, password_hash: hashPassword(String(password)), is_active: true }).select('id,name,username,is_active,created_at').single();
    if (error) return NextResponse.json({ error: error.code === '23505' ? 'That username already exists' : error.message }, { status: 400 });
    return NextResponse.json({ admin: data });
  } catch (error:any) { return NextResponse.json({ error: error?.message || 'Invalid request' }, { status: 400 }); }
}

export async function PATCH(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { id, name, password, is_active } = await request.json();
    if (!id) return NextResponse.json({ error: 'Admin id is required' }, { status: 400 });
    const update: Record<string, unknown> = {};
    if (typeof name === 'string' && name.trim()) update.name = name.trim();
    if (typeof is_active === 'boolean') update.is_active = is_active;
    if (typeof password === 'string' && password) { if (password.length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 }); update.password_hash = hashPassword(password); }
    if (!Object.keys(update).length) return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
    const { data, error } = await adminDb().from('admin_users').update(update).eq('id', id).select('id,name,username,is_active,created_at').single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ admin: data });
  } catch (error:any) { return NextResponse.json({ error: error?.message || 'Invalid request' }, { status: 400 }); }
}

export async function DELETE(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: 'Admin id is required' }, { status: 400 });
  const { error } = await adminDb().from('admin_users').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
