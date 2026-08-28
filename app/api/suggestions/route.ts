import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.type || !body.department || !body.message) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      console.error('Supabase environment variables are missing');
      return NextResponse.json({ error: 'Supabase is not configured' }, { status: 500 });
    }
    const supabase = createClient(url, key);
    const { error } = await supabase.from('suggestions').insert({
      type: body.type,
      department: body.department,
      message: body.message,
      anonymous: body.anonymous === 'true',
      name: body.anonymous === 'true' ? null : (body.name || null),
      phone: body.anonymous === 'true' ? null : (body.phone || null),
      status: 'New',
    });
    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Suggestion API error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
