import { describe, it, expect, vi, beforeEach } from 'vitest';
import { onRequestGet, onRequestPost, onRequestDelete } from '../functions/api/workouts/index';
import { mintJWT, validPayload, TEST_SECRET } from './helpers';

// ─── D1 mock factory ───────────────────────────────────────────────────────
// Mimics the prepare().bind().all() / .first() / .run() chained D1 API.

function makeD1Mock(overrides: {
  allResults?: unknown[];
  firstResult?: unknown;
  runShouldFail?: boolean;
} = {}) {
  const chain = {
    bind: vi.fn().mockReturnThis(),
    all:  vi.fn().mockResolvedValue({ results: overrides.allResults ?? [] }),
    first: vi.fn().mockResolvedValue(overrides.firstResult ?? null),
    run:  overrides.runShouldFail
      ? vi.fn().mockRejectedValue(new Error('DB error'))
      : vi.fn().mockResolvedValue(undefined),
  };
  return { prepare: vi.fn().mockReturnValue(chain), _chain: chain };
}

// ─── Helpers ───────────────────────────────────────────────────────────────

async function makeContext(
  method: string,
  url: string,
  body: unknown,
  dbOverrides = {},
  token?: string,
) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const request = new Request(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const db = makeD1Mock(dbOverrides);
  const env = { DB: db, JWT_SECRET_KEY: TEST_SECRET, AUTH_SIDECAR_URL: '', BASE_URL: '' };
  return { context: { request, env }, db };
}

// ─── GET /api/workouts ─────────────────────────────────────────────────────

describe('GET /api/workouts', () => {
  it('returns 401 without a token', async () => {
    const { context } = await makeContext('GET', 'http://localhost/api/workouts', null);
    const res = await onRequestGet(context);
    expect(res.status).toBe(401);
  });

  it('returns workouts for an authenticated user', async () => {
    const workouts = [
      { id: 'w1', day: 'Monday', time: '07:00', exercise: 'Run', completed: 0, week_start: '2026-05-11' },
    ];
    const token = await mintJWT(validPayload());
    const { context } = await makeContext(
      'GET', 'http://localhost/api/workouts', null,
      { allResults: workouts }, token,
    );
    const res = await onRequestGet(context);
    expect(res.status).toBe(200);
    const json = await res.json() as { workouts: unknown[] };
    expect(json.workouts).toHaveLength(1);
  });

  it('returns empty array when no workouts exist', async () => {
    const token = await mintJWT(validPayload());
    const { context } = await makeContext('GET', 'http://localhost/api/workouts', null, {}, token);
    const res = await onRequestGet(context);
    expect(res.status).toBe(200);
    const json = await res.json() as { workouts: unknown[] };
    expect(json.workouts).toHaveLength(0);
  });
});

// ─── POST /api/workouts ────────────────────────────────────────────────────

describe('POST /api/workouts', () => {
  it('returns 401 without a token', async () => {
    const { context } = await makeContext('POST', 'http://localhost/api/workouts', {
      day: 'Monday', time: '07:00', exercise: 'Run', completed: false,
    });
    const res = await onRequestPost(context);
    expect(res.status).toBe(401);
  });

  it('returns 400 when required fields are missing', async () => {
    const token = await mintJWT(validPayload());
    const { context } = await makeContext('POST', 'http://localhost/api/workouts',
      { day: 'Monday' }, {}, token,
    );
    const res = await onRequestPost(context);
    expect(res.status).toBe(400);
  });

  it('returns 400 when fields are empty strings', async () => {
    const token = await mintJWT(validPayload());
    const { context } = await makeContext('POST', 'http://localhost/api/workouts',
      { day: '', time: '07:00', exercise: 'Run', completed: false }, {}, token,
    );
    const res = await onRequestPost(context);
    expect(res.status).toBe(400);
  });

  it('creates a new workout (201) when none exists for that slot', async () => {
    const token = await mintJWT(validPayload());
    // firstResult: null → no existing workout → INSERT path
    const { context } = await makeContext('POST', 'http://localhost/api/workouts',
      { day: 'Monday', time: '07:00', exercise: 'Run', completed: false },
      { firstResult: null }, token,
    );
    const res = await onRequestPost(context);
    expect(res.status).toBe(201);
    const json = await res.json() as { success: boolean; id: string };
    expect(json.success).toBe(true);
    expect(json.id).toBeTruthy();
  });

  it('updates an existing workout (200) when slot already taken', async () => {
    const token = await mintJWT(validPayload());
    // firstResult: existing row → UPDATE path
    const { context } = await makeContext('POST', 'http://localhost/api/workouts',
      { day: 'Monday', time: '07:00', exercise: 'Run', completed: true },
      { firstResult: { id: 'existing-id' } }, token,
    );
    const res = await onRequestPost(context);
    expect(res.status).toBe(200);
    const json = await res.json() as { success: boolean; id: string };
    expect(json.success).toBe(true);
    expect(json.id).toBe('existing-id');
  });

  it('returns 400 for invalid JSON body', async () => {
    const token = await mintJWT(validPayload());
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
    const request = new Request('http://localhost/api/workouts', {
      method: 'POST',
      headers,
      body: 'not json',
    });
    const db = makeD1Mock();
    const env = { DB: db, JWT_SECRET_KEY: TEST_SECRET, AUTH_SIDECAR_URL: '', BASE_URL: '' };
    const res = await onRequestPost({ request, env });
    expect(res.status).toBe(400);
  });
});

// ─── DELETE /api/workouts ──────────────────────────────────────────────────

describe('DELETE /api/workouts', () => {
  it('returns 401 without a token', async () => {
    const { context } = await makeContext('DELETE', 'http://localhost/api/workouts', null);
    const res = await onRequestDelete(context);
    expect(res.status).toBe(401);
  });

  it('deletes workouts for authenticated user and returns 200', async () => {
    const token = await mintJWT(validPayload());
    const { context } = await makeContext('DELETE', 'http://localhost/api/workouts', null, {}, token);
    const res = await onRequestDelete(context);
    expect(res.status).toBe(200);
    const json = await res.json() as { success: boolean };
    expect(json.success).toBe(true);
  });

  it('returns 500 when DB throws', async () => {
    const token = await mintJWT(validPayload());
    const { context } = await makeContext('DELETE', 'http://localhost/api/workouts', null,
      { runShouldFail: true }, token,
    );
    const res = await onRequestDelete(context);
    expect(res.status).toBe(500);
  });
});
