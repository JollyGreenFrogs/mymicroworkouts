// API endpoint to logout (delete session)
import { Env, getSessionFromCookie, deleteSession, deleteSessionCookie } from '../../../src/auth';

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;
  
  const sessionId = getSessionFromCookie(request);
  if (sessionId) {
    await deleteSession(env.DB, sessionId);
  }
  
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': deleteSessionCookie()
    }
  });
}
