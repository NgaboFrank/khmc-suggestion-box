import { createClient } from '@supabase/supabase-js';

export function adminDb() {
  const rawUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const url = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || '';
  if (!url || !key) throw new Error('Supabase server configuration is missing');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}
