// Proxy all /api/auth/mfa/* and /api/auth/passkey/* requests to the jgf-auth sidecar.
// Cloudflare Pages Functions use catch-all routes via the [[path]] filename convention.
import { Env, getBearerToken } from '../../../src/auth';

async function proxy(request: Request, env: Env, path: string): Promise<Response> {
  const url = new URL(request.url);
  const sidecarUrl = `${env.AUTH_SIDECAR_URL}/auth/${path}${url.search}`;

  const headers: Record<string, string> = {
    'Content-Type': request.headers.get('Content-Type') || 'application/json',
  };
  const token = getBearerToken(request);
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const init: RequestInit = { method: request.method, headers };
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = await request.text();
  }

  try {
    const res = await fetch(sidecarUrl, init);
    const data = await res.text();
    return new Response(data, {
      status: res.status,
      headers: { 'Content-Type': res.headers.get('Content-Type') || 'application/json' },
    });
  } catch (err) {
    console.error('Auth proxy error:', err);
    return new Response(JSON.stringify({ error: 'Auth service unavailable' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function onRequest(context: { request: Request; env: Env; params: { path: string[] } }) {
  const subpath = context.params.path?.join('/') ?? '';
  return proxy(context.request, context.env, subpath);
}
