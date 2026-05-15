import { test, expect } from '@playwright/test';
import { mintE2EToken } from './helpers/auth';

/**
 * API-level e2e tests — exercise the full HTTP stack through wrangler
 * without needing OAuth or a running auth sidecar.
 * A pre-minted JWT is injected directly into the Authorization header.
 */

test.describe('Workout API', () => {
  let token: string;

  test.beforeAll(async () => {
    token = await mintE2EToken();
  });

  // ── Unauthenticated ──────────────────────────────────────────────────────

  test('GET /api/workouts returns 401 without token', async ({ request }) => {
    const res = await request.get('/api/workouts');
    expect(res.status()).toBe(401);
  });

  test('POST /api/workouts returns 401 without token', async ({ request }) => {
    const res = await request.post('/api/workouts', {
      data: { day: 'Monday', time: '09:00', exercise: 'Push-Ups', completed: false },
    });
    expect(res.status()).toBe(401);
  });

  test('DELETE /api/workouts returns 401 without token', async ({ request }) => {
    const res = await request.delete('/api/workouts');
    expect(res.status()).toBe(401);
  });

  // ── Input validation ─────────────────────────────────────────────────────

  test('POST /api/workouts returns 400 for missing fields', async ({ request }) => {
    const res = await request.post('/api/workouts', {
      headers: { Authorization: `Bearer ${token}` },
      data: { day: 'Tuesday' },
    });
    expect(res.status()).toBe(400);
  });

  // ── CRUD lifecycle (explicit ordering via test steps) ────────────────────
  //
  // These steps are intentionally sequential: create → read → update →
  // read → delete → read. Each step depends on the previous one. Using a
  // single test with test.step() makes that dependency explicit and prevents
  // accidental breakage if parallelism is ever turned on.
  test('CRUD lifecycle: create → update → delete', async ({ request }) => {
    const authHeaders = { Authorization: `Bearer ${token}` };

    await test.step('initial GET returns a list', async () => {
      const res = await request.get('/api/workouts', { headers: authHeaders });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(Array.isArray(body.workouts)).toBe(true);
    });

    await test.step('POST creates a workout (200)', async () => {
      const res = await request.post('/api/workouts', {
        headers: authHeaders,
        data: { day: 'Monday', time: '09:00', exercise: 'Push-Ups', completed: false },
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(typeof body.id).toBe('string');
    });

    await test.step('GET returns the created workout', async () => {
      const res = await request.get('/api/workouts', { headers: authHeaders });
      expect(res.status()).toBe(200);
      const body = await res.json();
      const workout = body.workouts.find((w: { exercise: string }) => w.exercise === 'Push-Ups');
      expect(workout).toBeDefined();
      expect(workout.day).toBe('Monday');
      expect(workout.completed).toBe(false);
    });

    await test.step('POST updates existing workout to completed (200)', async () => {
      const res = await request.post('/api/workouts', {
        headers: authHeaders,
        data: { day: 'Monday', time: '09:00', exercise: 'Push-Ups', completed: true },
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
    });

    await test.step('GET shows workout as completed', async () => {
      const res = await request.get('/api/workouts', { headers: authHeaders });
      const body = await res.json();
      const workout = body.workouts.find((w: { exercise: string }) => w.exercise === 'Push-Ups');
      expect(workout.completed).toBe(true);
    });

    await test.step('DELETE clears workouts for the week', async () => {
      const res = await request.delete('/api/workouts', { headers: authHeaders });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
    });

    await test.step('GET is empty after delete', async () => {
      const res = await request.get('/api/workouts', { headers: authHeaders });
      const body = await res.json();
      expect(body.workouts).toHaveLength(0);
    });
  });
});
