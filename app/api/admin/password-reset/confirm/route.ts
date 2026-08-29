import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { adminDb } from '../../../../../lib/admin-db';
import { hashPassword } from '../../../../../lib/admin-password';

function hashToken(token: string) { return crypto.createHash('sha256').update(token).digest('hex'); }

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();
    const cleanToken = String(token || '').trim();
    const cleanPassword = String(password || '');
    if (!cleanToken || !cleanPassword) return NextResponse.json({ error: 'Token and password are required' }, { status: 400 });
    if (cleanPassword.length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });

    const supabase = adminDb();
    const tokenHash = hashToken(cleanToken);
    const { data: reset } = await supabase.from('admin_password_resets').select('id,admin_id,expires_at,used_at').eq('token_hash', tokenHash).limit(1).maybeSingle();
    if (!reset || reset.used_at || new Date(reset.expires_at).getTime() < Date.now()) return NextResponse.json({ error: 'This reset link is invalid or expired.' }, { status: 400 });

    const { error: updateError } = await supabase.from('admin_users').update({ password_hash: hashPassword(cleanPassword) }).eq('id', reset.admin_id);
    if (updateError) return NextResponse.json({ error: 'Unable to update password.' }, { status: 500 });
    const { error: markError } = await supabase.from('admin_password_resets').update({ used_at: new Date().toISOString() }).eq('id', reset.id);
    if (markError) console.error('Unable to mark reset token used:', markError);

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Unable to reset password' }, { status: 500 });
  }
}
