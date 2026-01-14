// OAuth and Authentication Utilities for Cloudflare Workers
// Supports Google and Microsoft OAuth 2.0 flows

export interface Env {
  DB: D1Database;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  MICROSOFT_CLIENT_ID: string;
  MICROSOFT_CLIENT_SECRET: string;
  SESSION_SECRET: string;
  BASE_URL: string;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  picture: string | null;
}

export interface Session {
  id: string;
  user_id: string;
  expires_at: number;
}

// Generate a cryptographically secure random string
export function generateSecureToken(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Generate UUID v4
export function generateUUID(): string {
  return crypto.randomUUID();
}

// Session configuration
const SESSION_DURATION_SECONDS = 30 * 24 * 60 * 60; // 30 days

// Get current week start (Monday)
export function getWeekStart(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split('T')[0];
}

// Create a new session for a user
export async function createSession(db: D1Database, userId: string): Promise<string> {
  const sessionId = generateSecureToken(48);
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS;
  
  await db.prepare(
    'INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)'
  ).bind(sessionId, userId, expiresAt).run();
  
  return sessionId;
}

// Validate session and return user
export async function validateSession(db: D1Database, sessionId: string): Promise<User | null> {
  const now = Math.floor(Date.now() / 1000);
  
  const result = await db.prepare(`
    SELECT u.id, u.email, u.name, u.picture
    FROM users u
    INNER JOIN sessions s ON s.user_id = u.id
    WHERE s.id = ? AND s.expires_at > ?
  `).bind(sessionId, now).first<User>();
  
  return result || null;
}

// Delete session (logout)
export async function deleteSession(db: D1Database, sessionId: string): Promise<void> {
  await db.prepare('DELETE FROM sessions WHERE id = ?').bind(sessionId).run();
}

// Clean up expired sessions
export async function cleanupExpiredSessions(db: D1Database): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  await db.prepare('DELETE FROM sessions WHERE expires_at <= ?').bind(now).run();
}

// Find or create user from OAuth data
export async function findOrCreateUser(
  db: D1Database,
  provider: 'google' | 'microsoft',
  providerUserId: string,
  email: string,
  name?: string,
  picture?: string
): Promise<User> {
  // Try to find existing OAuth account
  const existingOAuth = await db.prepare(`
    SELECT user_id FROM oauth_accounts 
    WHERE provider = ? AND provider_user_id = ?
  `).bind(provider, providerUserId).first<{ user_id: string }>();
  
  if (existingOAuth) {
    // User exists, fetch and return
    const user = await db.prepare(
      'SELECT id, email, name, picture FROM users WHERE id = ?'
    ).bind(existingOAuth.user_id).first<User>();
    
    if (user) return user;
  }
  
  // User doesn't exist, create new user and OAuth account
  const userId = generateUUID();
  
  // Insert user
  await db.prepare(
    'INSERT INTO users (id, email, name, picture) VALUES (?, ?, ?, ?)'
  ).bind(userId, email, name || null, picture || null).run();
  
  // Insert OAuth account
  const oauthId = generateUUID();
  await db.prepare(
    'INSERT INTO oauth_accounts (id, user_id, provider, provider_user_id, email) VALUES (?, ?, ?, ?, ?)'
  ).bind(oauthId, userId, provider, providerUserId, email).run();
  
  return {
    id: userId,
    email,
    name: name || null,
    picture: picture || null
  };
}

// Exchange OAuth code for tokens
export async function exchangeGoogleCode(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string
): Promise<any> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    })
  });
  
  if (!response.ok) {
    throw new Error(`Google token exchange failed: ${response.statusText}`);
  }
  
  return await response.json();
}

export async function exchangeMicrosoftCode(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string
): Promise<any> {
  const response = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    })
  });
  
  if (!response.ok) {
    throw new Error(`Microsoft token exchange failed: ${response.statusText}`);
  }
  
  return await response.json();
}

// Get Google user info
export async function getGoogleUserInfo(accessToken: string): Promise<any> {
  const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to get Google user info: ${response.statusText}`);
  }
  
  return await response.json();
}

// Get Microsoft user info
export async function getMicrosoftUserInfo(accessToken: string): Promise<any> {
  const response = await fetch('https://graph.microsoft.com/v1.0/me', {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to get Microsoft user info: ${response.statusText}`);
  }
  
  return await response.json();
}

// Get session from cookie
export function getSessionFromCookie(request: Request): string | null {
  const cookie = request.headers.get('Cookie');
  if (!cookie) return null;
  
  const match = cookie.match(/session=([^;]+)/);
  return match ? match[1] : null;
}

// Create session cookie
export function createSessionCookie(sessionId: string, maxAge: number = 30 * 24 * 60 * 60): string {
  return `session=${sessionId}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAge}`;
}

// Delete session cookie
export function deleteSessionCookie(): string {
  return 'session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0';
}
