import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAdmin } from '@/lib/admin-auth';

function db() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error('Supabase admin environment variables are missing');
  return createClient(url, key);
}

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { data, error } = await db().from('suggestions').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ suggestions: data || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Unable to load suggestions' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { id, status } = await request.json();
    if (!id || !['New', 'In Review', 'Resolved'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status update' }, { status: 400 });
    }
    const { error } = await db().from('suggestions').update({ status }).eq('id', id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Unable to update suggestion' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'Missing suggestion id' }, { status: 400 });
    const { error } = await db().from('suggestions').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Unable to delete suggestion' }, { status: 500 });
  }
}
