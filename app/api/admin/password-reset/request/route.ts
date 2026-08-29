import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { adminDb } from '../../../../../lib/admin-db';

function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    const wanted = String(email || '').trim().toLowerCase();
    if (!wanted) return NextResponse.json({ error: 'Email is required' }, { status: 400 });

    const supabase = adminDb();
    const { data: admin } = await supabase.from('admin_users').select('id,email,name,is_active').eq('email', wanted).limit(1).maybeSingle();

    // Always return the same response so the endpoint does not reveal whether an account exists.
    if (!admin || admin.is_active === false) return NextResponse.json({ ok: true });

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    const { error } = await supabase.from('admin_password_resets').insert({ admin_id: admin.id, token_hash: tokenHash, expires_at: expiresAt });
    if (error) {
      console.error('Password reset token error:', error);
      return NextResponse.json({ error: 'Password reset is not configured yet.' }, { status: 500 });
    }

    const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin).replace(/\/$/, '');
    const resetUrl = `${baseUrl}/admin/reset-password?token=${token}`;
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.PASSWORD_RESET_FROM || process.env.RESEND_FROM_EMAIL;

    if (!apiKey || !from) return NextResponse.json({ error: 'Email service is not configured yet. Add RESEND_API_KEY and PASSWORD_RESET_FROM.' }, { status: 500 });

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [admin.email],
        subject: 'Reset your KHMC admin password',
        html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto"><h2>Reset your admin password</h2><p>Hello ${admin.name || 'Administrator'},</p><p>Someone requested a password reset for your KHMC admin account.</p><p><a href="${resetUrl}" style="display:inline-block;background:#2864e8;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:700">Reset password</a></p><p>This link expires in 30 minutes and can only be used once.</p><p>If you did not request this, you can safely ignore this email.</p></div>`
      })
    });

    if (!emailResponse.ok) {
      console.error('Password reset email error:', await emailResponse.text());
      return NextResponse.json({ error: 'Unable to send the reset email.' }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error?.message || 'Unable to request password reset' }, { status: 500 });
  }
}
