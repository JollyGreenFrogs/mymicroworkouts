// API endpoint to get current user info
import { Env, getSessionFromCookie, validateSession } from '../../../src/auth';

export async function onRequestGet(context: { request: Request; env: Env }) {
  const { request, env } = context;
  
  const sessionId = getSessionFromCookie(request);
  if (!sessionId) {
    return new Response(JSON.stringify({ error: 'Not authenticated' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  const user = await validateSession(env.DB, sessionId);
  if (!user) {
    return new Response(JSON.stringify({ error: 'Invalid session' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return new Response(JSON.stringify({ user }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
