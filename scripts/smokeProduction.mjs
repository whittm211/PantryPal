import { fileURLToPath } from 'node:url';

const DEFAULT_APP_URL = 'https://whittm211.github.io/PantryPal/';

export function normalizeBaseUrl(value) {
  const url = new URL(value);
  return url.href.endsWith('/') ? url.href : `${url.href}/`;
}

export function extractAssetUrls(html, baseUrl) {
  const urls = new Set();
  const patterns = [
    /<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi,
    /<link\b[^>]*\brel=["']stylesheet["'][^>]*\bhref=["']([^"']+)["'][^>]*>/gi,
    /<link\b[^>]*\bhref=["']([^"']+)["'][^>]*\brel=["']stylesheet["'][^>]*>/gi,
  ];

  for (const pattern of patterns) {
    for (const match of html.matchAll(pattern)) {
      urls.add(new URL(match[1], baseUrl).href);
    }
  }

  return [...urls].sort();
}

export function buildChecks(baseUrl, html) {
  return [
    { label: 'app shell', url: baseUrl },
    ...buildStaticPageChecks(baseUrl),
    ...extractAssetUrls(html, baseUrl).map((url, index) => ({ label: `asset ${index + 1}`, url })),
  ];
}

export function buildStaticPageChecks(baseUrl) {
  return [
    { label: 'privacy policy', url: new URL('privacy.html', baseUrl).href },
    { label: 'support page', url: new URL('support.html', baseUrl).href },
    { label: 'terms page', url: new URL('terms.html', baseUrl).href },
    { label: 'marketing page', url: new URL('marketing.html', baseUrl).href },
  ];
}

async function assertReachable(check, fetchImpl = fetch) {
  const response = await fetchImpl(check.url, {
    headers: {
      'Cache-Control': 'no-cache',
    },
  });

  if (!response.ok) {
    throw new Error(`${check.label} failed: ${response.status} ${response.statusText} (${check.url})`);
  }

  return response;
}

export async function runSmokeCheck({ appUrl = DEFAULT_APP_URL, fetchImpl = fetch } = {}) {
  const baseUrl = normalizeBaseUrl(appUrl);
  const appResponse = await assertReachable({ label: 'app shell', url: baseUrl }, fetchImpl);
  const html = await appResponse.text();

  if (!html.includes('<div id="root"></div>')) {
    throw new Error(`app shell did not contain the React root (${baseUrl})`);
  }

  const assetUrls = extractAssetUrls(html, baseUrl);
  if (assetUrls.length === 0) {
    throw new Error(`app shell did not reference built assets (${baseUrl})`);
  }

  for (const check of buildStaticPageChecks(baseUrl)) {
    await assertReachable(check, fetchImpl);
  }

  for (const [index, url] of assetUrls.entries()) {
    await assertReachable({ label: `asset ${index + 1}`, url }, fetchImpl);
  }

  return {
    appUrl: baseUrl,
    assetCount: assetUrls.length,
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const appUrl = process.env.SMOKE_APP_URL ?? process.argv[2] ?? DEFAULT_APP_URL;
  runSmokeCheck({ appUrl })
    .then((result) => {
      console.log(`Production smoke passed for ${result.appUrl} (${result.assetCount} assets).`);
    })
    .catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
}
