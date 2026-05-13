// Authentication utilities for Cloudflare Workers
// Auth is delegated to the jgf-auth FastAPI sidecar.
// JWTs issued by the sidecar are verified locally here (no per-request round-trip).

export interface Env {
  DB: D1Database;
  AUTH_SIDECAR_URL: string; // e.g. http://localhost:8787
  JWT_SECRET_KEY: string;   // must match sidecar JWT_SECRET_KEY
  BASE_URL: string;
}

// JWT payload issued by jgf-auth (HS256)
export interface JWTPayload {
  sub: string;          // user code (unique identifier)
  role: string;
  session_code: string;
  iat: number;
  exp: number;
}

// ─── JWT verification ──────────────────────────────────────────────────────────

function base64urlDecode(str: string): string {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  return atob(padded);
}

function base64urlToBytes(str: string): Uint8Array {
  const binary = base64urlDecode(str);
  return Uint8Array.from(binary, c => c.charCodeAt(0));
}

export async function verifyJWT(token: string, secret: string): Promise<JWTPayload> {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Malformed JWT');

  const [headerB64, payloadB64, sigB64] = parts;

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );

  const valid = await crypto.subtle.verify(
    'HMAC',
    key,
    base64urlToBytes(sigB64),
    new TextEncoder().encode(`${headerB64}.${payloadB64}`)
  );

  if (!valid) throw new Error('Invalid JWT signature');

  const payload = JSON.parse(base64urlDecode(payloadB64)) as JWTPayload;

  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error('JWT expired');
  }

  return payload;
}

// Extract Bearer token from the Authorization header
export function getBearerToken(request: Request): string | null {
  const auth = request.headers.get('Authorization');
  if (!auth || !auth.startsWith('Bearer ')) return null;
  return auth.slice(7);
}

// Verify request JWT and return payload, or null if invalid/missing
export async function getAuthPayload(request: Request, secret: string): Promise<JWTPayload | null> {
  const token = getBearerToken(request);
  if (!token) return null;
  try {
    return await verifyJWT(token, secret);
  } catch {
    return null;
  }
}

// ─── Workout utilities (retained from original) ────────────────────────────────

export function generateUUID(): string {
  return crypto.randomUUID();
}

// Get current week start (Monday, YYYY-MM-DD)
export function getWeekStart(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split('T')[0];
}
