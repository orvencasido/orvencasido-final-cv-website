import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

const MAX_DOWNLOADS = 20;
const WINDOW_SECONDS = 24 * 60 * 60;
const SIGNED_URL_TTL_SECONDS = 60;
const FILE_BUCKET = 'portfolio-files';

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

function isValidResumePath(path: string): boolean {
  return path.startsWith('resumes/') && !path.includes('..') && path.toLowerCase().endsWith('.pdf');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'GET') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ error: 'Server is missing Supabase function credentials.' }, 500);
  }

  const url = new URL(req.url);
  const path = url.searchParams.get('path') || '';

  if (!isValidResumePath(path)) {
    return jsonResponse({ error: 'Invalid resume path.' }, 400);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const identifier = getClientIdentifier(req);
  const { data: limitRows, error: limitError } = await supabase.rpc('consume_resume_download_limit', {
    p_identifier: identifier,
    p_max_attempts: MAX_DOWNLOADS,
    p_window_seconds: WINDOW_SECONDS,
  });

  if (limitError) {
    return jsonResponse({ error: limitError.message }, 500);
  }

  const limit = Array.isArray(limitRows) ? limitRows[0] : limitRows;
  if (!limit?.allowed) {
    return jsonResponse(
      {
        error: 'Resume download limit reached.',
        resetAt: limit?.reset_at,
        remaining: 0,
      },
      429
    );
  }

  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
    .from(FILE_BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS, {
      download: true,
    });

  if (signedUrlError || !signedUrlData?.signedUrl) {
    return jsonResponse({ error: signedUrlError?.message || 'Unable to create resume download URL.' }, 500);
  }

  return jsonResponse({
    signedUrl: signedUrlData.signedUrl,
    remaining: limit.remaining,
    resetAt: limit.reset_at,
    expiresIn: SIGNED_URL_TTL_SECONDS,
  });
});
