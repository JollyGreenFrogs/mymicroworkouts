/**
 * Shared test helpers — mint HS256 JWTs using the same Web Crypto path
 * that the production code uses so tests exercise the real verifyJWT().
 */

const TEST_SECRET = 'test-secret-key-for-vitest-only';

function base64urlEncode(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export async function mintJWT(
  payload: Record<string, unknown>,
  secret: string = TEST_SECRET,
): Promise<string> {
  const header = base64urlEncode(new TextEncoder().encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' })));
  const body   = base64urlEncode(new TextEncoder().encode(JSON.stringify(payload)));
  const signingInput = `${header}.${body}`;

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signingInput));
  return `${signingInput}.${base64urlEncode(sig)}`;
}

export function validPayload(overrides: Record<string, unknown> = {}) {
  return {
    sub: 'user-123',
    role: 'user',
    session_code: 'sess-abc',
    iat: Math.floor(Date.now() / 1000) - 10,
    exp: Math.floor(Date.now() / 1000) + 3600,
    ...overrides,
  };
}

export { TEST_SECRET };
