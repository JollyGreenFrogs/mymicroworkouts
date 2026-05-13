// Microsoft OAuth has been replaced by jgf-auth email+password login.
export async function onRequestGet(): Promise<Response> {
  return new Response('OAuth login removed. Please use email and password.', { status: 410 });
}
