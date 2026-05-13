// Verify the JWT and return the current user's identity
import { Env, getAuthPayload } from '../../../src/auth';

export async function onRequestGet(context: { request: Request; env: Env }) {
  const { request, env } = context;

  const payload = await getAuthPayload(request, env.JWT_SECRET_KEY);
  if (!payload) {
    return new Response(JSON.stringify({ error: 'Not authenticated' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(
    JSON.stringify({ user: { code: payload.sub, role: payload.role } }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}
