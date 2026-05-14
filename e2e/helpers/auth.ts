/**
 * e2e auth helper — mints HS256 JWTs using the same Web Crypto API
 * that the production worker uses, so these tokens will be accepted
 * by the running wrangler dev server.
 *
 * The secret MUST match the --binding JWT_SECRET_KEY value in
 * scripts/start-e2e-server.sh.
 */

export const E2E_JWT_SECRET = 'e2e-test-jwt-secret-mymicroworkouts';

function base64urlEncode(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export async function mintE2EToken(
  overrides: Record<string, unknown> = {},
): Promise<string> {
  const header  = base64urlEncode(new TextEncoder().encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' })));
  const payload = base64urlEncode(new TextEncoder().encode(JSON.stringify({
    sub: 'e2e-user-001',
    role: 'user',
    session_code: 'e2e-session',
    iat: Math.floor(Date.now() / 1000) - 10,
    exp: Math.floor(Date.now() / 1000) + 3600,
    ...overrides,
  })));

  const signingInput = `${header}.${payload}`;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(E2E_JWT_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signingInput));
  return `${signingInput}.${base64urlEncode(sig)}`;
}
