import { describe, it, expect } from 'vitest';
import { verifyJWT, getBearerToken, getAuthPayload, getWeekStart } from '../src/auth';
import { mintJWT, validPayload, TEST_SECRET } from './helpers';

// ─── getWeekStart ──────────────────────────────────────────────────────────

describe('getWeekStart', () => {
  it('returns a Monday in YYYY-MM-DD format', () => {
    const result = getWeekStart();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    const day = new Date(result + 'T00:00:00Z').getUTCDay();
    expect(day).toBe(1); // 1 = Monday
  });

  it('returns the Monday for a given Wednesday', () => {
    const wednesday = new Date('2026-05-13'); // Wednesday
    expect(getWeekStart(wednesday)).toBe('2026-05-11'); // previous Monday
  });

  it('returns the same Monday for a given Monday', () => {
    const monday = new Date('2026-05-11');
    expect(getWeekStart(monday)).toBe('2026-05-11');
  });

  it('returns the previous Monday for a Sunday', () => {
    const sunday = new Date('2026-05-17');
    expect(getWeekStart(sunday)).toBe('2026-05-11');
  });
});

// ─── getBearerToken ────────────────────────────────────────────────────────

describe('getBearerToken', () => {
  it('extracts token from Authorization header', () => {
    const req = new Request('http://localhost/', {
      headers: { Authorization: 'Bearer my-token' },
    });
    expect(getBearerToken(req)).toBe('my-token');
  });

  it('returns null when header is missing', () => {
    const req = new Request('http://localhost/');
    expect(getBearerToken(req)).toBeNull();
  });

  it('returns null for non-Bearer scheme', () => {
    const req = new Request('http://localhost/', {
      headers: { Authorization: 'Basic dXNlcjpwYXNz' },
    });
    expect(getBearerToken(req)).toBeNull();
  });
});

// ─── verifyJWT ─────────────────────────────────────────────────────────────

describe('verifyJWT', () => {
  it('accepts a valid token', async () => {
    const token = await mintJWT(validPayload());
    const payload = await verifyJWT(token, TEST_SECRET);
    expect(payload.sub).toBe('user-123');
    expect(payload.role).toBe('user');
  });

  it('rejects a token signed with the wrong secret', async () => {
    const token = await mintJWT(validPayload(), 'wrong-secret');
    await expect(verifyJWT(token, TEST_SECRET)).rejects.toThrow('Invalid JWT signature');
  });

  it('rejects an expired token', async () => {
    const token = await mintJWT(validPayload({ exp: Math.floor(Date.now() / 1000) - 60 }));
    await expect(verifyJWT(token, TEST_SECRET)).rejects.toThrow('JWT expired');
  });

  it('rejects a malformed token', async () => {
    await expect(verifyJWT('not.a.valid', TEST_SECRET)).rejects.toThrow();
  });
});

// ─── getAuthPayload ────────────────────────────────────────────────────────

describe('getAuthPayload', () => {
  it('returns payload for a valid Bearer token', async () => {
    const token = await mintJWT(validPayload());
    const req = new Request('http://localhost/', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const payload = await getAuthPayload(req, TEST_SECRET);
    expect(payload).not.toBeNull();
    expect(payload!.sub).toBe('user-123');
  });

  it('returns null when no Authorization header', async () => {
    const req = new Request('http://localhost/');
    expect(await getAuthPayload(req, TEST_SECRET)).toBeNull();
  });

  it('returns null for an invalid token', async () => {
    const req = new Request('http://localhost/', {
      headers: { Authorization: 'Bearer bad.token.here' },
    });
    expect(await getAuthPayload(req, TEST_SECRET)).toBeNull();
  });
});
