import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAdmin } from '../../../../lib/admin-auth';

function urls() {
  return [process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_URL]
    .filter((v): v is string => Boolean(v))
    .map(v => v.replace(/\/$/, ''))
    .filter((v, i, a) => a.indexOf(v) === i);
}

function key() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const serviceKey = key();
    const candidates = urls();
    if (!serviceKey || candidates.length === 0) {
      return NextResponse.json({ error: 'Supabase admin environment variables are missing' }, { status: 500 });
    }

    let lastError = '';
    for (const url of candidates) {
      const supabase = createClient(url, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      const { data, error } = await supabase
        .from('suggestions')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        return NextResponse.json(
          { suggestions: data },
          { headers: { 'Cache-Control': 'no-store, max-age=0, must-revalidate' } }
        );
      }
      if (error) lastError = error.message;
    }

    if (lastError) return NextResponse.json({ error: lastError }, { status: 500 });
    return NextResponse.json(
      { suggestions: [] },
      { headers: { 'Cache-Control': 'no-store, max-age=0, must-revalidate' } }
    );
  } catch (error: any) {
    console.error('Admin suggestions GET failed:', error);
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
    const serviceKey = key();
    const url = urls()[0];
    if (!serviceKey || !url) throw new Error('Supabase admin environment variables are missing');
    const { error } = await createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })
      .from('suggestions').update({ status }).eq('id', id);
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
    const serviceKey = key();
    const url = urls()[0];
    if (!serviceKey || !url) throw new Error('Supabase admin environment variables are missing');
    const { error } = await createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })
      .from('suggestions').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Unable to delete suggestion' }, { status: 500 });
  }
}
