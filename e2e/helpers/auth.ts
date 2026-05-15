/**
 * e2e auth helper — mints HS256 JWTs using the Web Crypto API.
 * The secret matches docker-compose.e2e.yml JWT_SECRET_KEY so the
 * FastAPI sidecar will accept these tokens in the test environment.
 *
 * The sub claim must match the user code seeded by start-e2e-server.sh.
 */

export const E2E_JWT_SECRET = 'e2e-test-jwt-secret-mymicroworkouts';
export const E2E_USER_CODE  = 'e2euser001ab';  // 12-char code seeded into admin.users

function base64urlEncode(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export async function mintE2EToken(
  overrides: Record<string, unknown> = {},
): Promise<string> {
  const header  = base64urlEncode(new TextEncoder().encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' })));
  const payload = base64urlEncode(new TextEncoder().encode(JSON.stringify({
    sub: E2E_USER_CODE,
    role: 'parent',
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
