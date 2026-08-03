import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const MAX_FAILURES = 20;
const WINDOW_MS = 24 * 60 * 60 * 1000;

interface LoginLimitRecord {
  identifier: string;
  count: number;
  window_start: string;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

function getClientIdentifier(req: Request): string {
  const forwardedFor = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const realIp = req.headers.get('x-real-ip')?.trim();
  const cfIp = req.headers.get('cf-connecting-ip')?.trim();

  return forwardedFor || realIp || cfIp || 'unknown';
}

function isExpired(record: LoginLimitRecord): boolean {
  return Date.now() - new Date(record.window_start).getTime() >= WINDOW_MS;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return jsonResponse({ error: 'Server is missing Supabase function credentials.' }, 500);
  }

  const body = await req.json().catch(() => null);
  const email = String(body?.email || '').trim();
  const password = String(body?.password || '');

  if (!email || !password) {
    return jsonResponse({ error: 'Email and password are required.' }, 400);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const identifier = `admin:${getClientIdentifier(req)}`;
  const { data: existingLimit, error: readError } = await supabase
    .from('admin_login_limits')
    .select('*')
    .eq('identifier', identifier)
    .maybeSingle<LoginLimitRecord>();

  if (readError) {
    return jsonResponse({ error: readError.message }, 500);
  }

  const activeLimit = existingLimit && !isExpired(existingLimit) ? existingLimit : null;
  if (activeLimit && activeLimit.count >= MAX_FAILURES) {
    const resetAt = new Date(new Date(activeLimit.window_start).getTime() + WINDOW_MS).toISOString();
    return jsonResponse(
      {
        error: 'Too many failed login attempts.',
        remaining: 0,
        resetAt,
      },
      429
    );
  }

  const authResponse = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const authPayload = await authResponse.json().catch(() => ({}));

  if (!authResponse.ok) {
    const now = new Date().toISOString();
    const nextCount = activeLimit ? activeLimit.count + 1 : 1;
    const windowStart = activeLimit?.window_start || now;
    const resetAt = new Date(new Date(windowStart).getTime() + WINDOW_MS).toISOString();

    const { error: writeError } = await supabase.from('admin_login_limits').upsert({
      identifier,
      count: nextCount,
      window_start: windowStart,
      updated_at: now,
    });

    if (writeError) {
      return jsonResponse({ error: writeError.message }, 500);
    }

    return jsonResponse(
      {
        error: authPayload.error_description || authPayload.msg || 'Invalid login credentials.',
        remaining: Math.max(MAX_FAILURES - nextCount, 0),
        resetAt,
      },
      401
    );
  }

  await supabase.from('admin_login_limits').delete().eq('identifier', identifier);

  return jsonResponse({
    session: {
      access_token: authPayload.access_token,
      refresh_token: authPayload.refresh_token,
      expires_in: authPayload.expires_in,
      token_type: authPayload.token_type,
      user: authPayload.user,
    },
  });
});
