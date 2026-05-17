import { fileURLToPath } from 'node:url';

const FUNCTION_SLUG = 'make-server-e808db2a';

export function buildFunctionUrl(projectRefOrUrl, path = 'health') {
  const trimmed = String(projectRefOrUrl ?? '').trim();
  if (!trimmed) throw new Error('Supabase project ref or URL is required.');

  const baseUrl = trimmed.startsWith('http')
    ? new URL(trimmed).origin
    : `https://${trimmed}.supabase.co`;

  return `${baseUrl}/functions/v1/${FUNCTION_SLUG}/${path.replace(/^\/+/, '')}`;
}

export function maskValue(value) {
  const text = String(value ?? '');
  return text.length <= 4 ? '****' : `${text.slice(0, 4)}...`;
}

async function parseJsonResponse(response) {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`Supabase health returned non-JSON response: ${text.slice(0, 120)}`);
  }
}

export async function runSupabaseSmokeCheck({
  projectRefOrUrl = process.env.SUPABASE_PROJECT_ID ?? process.env.VITE_SUPABASE_URL,
  anonKey = process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY,
  fetchImpl = fetch,
} = {}) {
  if (!anonKey) throw new Error('SUPABASE_ANON_KEY or VITE_SUPABASE_ANON_KEY is required.');

  const url = buildFunctionUrl(projectRefOrUrl);
  const response = await fetchImpl(url, {
    headers: {
      Authorization: `Bearer ${anonKey}`,
      apikey: anonKey,
      'Cache-Control': 'no-cache',
    },
  });

  if (!response.ok) {
    throw new Error(`Supabase health failed: ${response.status} ${response.statusText} (${url}, key ${maskValue(anonKey)})`);
  }

  const body = await parseJsonResponse(response);
  if (body?.status !== 'ok') {
    throw new Error(`Supabase health returned unexpected body: ${JSON.stringify(body)}`);
  }

  return { url, status: body.status };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  runSupabaseSmokeCheck()
    .then((result) => {
      console.log(`Supabase smoke passed for ${result.url}.`);
    })
    .catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
}
