// Proxy logout to the jgf-auth sidecar (revokes the session server-side)
import { Env, getBearerToken } from '../../../src/auth';

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;

  const token = getBearerToken(request);
  if (!token) {
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    await fetch(`${env.AUTH_SIDECAR_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ revoke_all_sessions: false }),
    });
  } catch (err) {
    console.error('Sidecar logout error (non-fatal):', err);
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
