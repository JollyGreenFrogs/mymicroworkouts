// OAuth callback handler for Microsoft
import { 
  Env, 
  exchangeMicrosoftCode, 
  getMicrosoftUserInfo, 
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
    const redirectUri = `${env.BASE_URL}/api/oauth/microsoft/callback`;
    const tokenData = await exchangeMicrosoftCode(
      code,
      env.MICROSOFT_CLIENT_ID,
      env.MICROSOFT_CLIENT_SECRET,
      redirectUri
    );
    
    // Get user info from Microsoft
    const userInfo = await getMicrosoftUserInfo(tokenData.access_token);
    
    // Find or create user in our database
    const user = await findOrCreateUser(
      env.DB,
      'microsoft',
      userInfo.id,
      userInfo.mail || userInfo.userPrincipalName,
      userInfo.displayName,
      null // Microsoft Graph doesn't provide picture URL directly
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
    console.error('Microsoft OAuth error:', err);
    return Response.redirect(`${env.BASE_URL}/?error=oauth_failed`);
  }
}
