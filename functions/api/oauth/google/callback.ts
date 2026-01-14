// OAuth callback handler for Google
import { 
  Env, 
  exchangeGoogleCode, 
  getGoogleUserInfo, 
  findOrCreateUser, 
  createSession,
  createSessionCookie 
} from '../../../../src/auth';

export async function onRequestGet(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');
  
  if (error) {
    return Response.redirect(`${env.BASE_URL}/?error=oauth_failed`);
  }
  
  if (!code) {
    return Response.redirect(`${env.BASE_URL}/?error=no_code`);
  }
  
  try {
    // Exchange code for tokens
    const redirectUri = `${env.BASE_URL}/api/oauth/google/callback`;
    const tokenData = await exchangeGoogleCode(
      code,
      env.GOOGLE_CLIENT_ID,
      env.GOOGLE_CLIENT_SECRET,
      redirectUri
    );
    
    // Get user info from Google
    const userInfo = await getGoogleUserInfo(tokenData.access_token);
    
    // Find or create user in our database
    const user = await findOrCreateUser(
      env.DB,
      'google',
      userInfo.id,
      userInfo.email,
      userInfo.name,
      userInfo.picture
    );
    
    // Create session
    const sessionId = await createSession(env.DB, user.id);
    
    // Redirect to app with session cookie
    return Response.redirect(env.BASE_URL, 302, {
      headers: {
        'Set-Cookie': createSessionCookie(sessionId)
      }
    });
  } catch (err) {
    console.error('Google OAuth error:', err);
    return Response.redirect(`${env.BASE_URL}/?error=oauth_failed`);
  }
}
