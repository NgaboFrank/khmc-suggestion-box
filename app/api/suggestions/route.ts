import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.type || !body.department || !body.message) {
      return NextResponse.json({ error: 'Please complete all required fields.' }, { status: 400 });
    }

    const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

    if (!url || !key) {
      console.error('Supabase configuration missing:', {
        hasUrl: Boolean(url),
        hasServiceKey: Boolean(key),
      });
      return NextResponse.json({ error: 'Supabase server configuration is missing. Check Vercel environment variables.' }, { status: 500 });
    }

    const supabase = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

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
      return NextResponse.json({ error: `Database error: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Suggestion API error:', error);
    const message = error instanceof Error ? error.message : 'Unknown server error';
    return NextResponse.json({ error: `Server error: ${message}` }, { status: 500 });
  }
}
