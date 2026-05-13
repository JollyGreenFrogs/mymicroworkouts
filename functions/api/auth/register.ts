// Proxy registration requests to the jgf-auth sidecar
import { Env } from '../../../src/auth';

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const sidecarRes = await fetch(`${env.AUTH_SIDECAR_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await sidecarRes.json();
    return new Response(JSON.stringify(data), {
      status: sidecarRes.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Sidecar register error:', err);
    return new Response(JSON.stringify({ error: 'Auth service unavailable' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
