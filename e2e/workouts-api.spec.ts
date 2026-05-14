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

  // ── Authenticated CRUD ───────────────────────────────────────────────────

  test('GET /api/workouts returns empty list for new user', async ({ request }) => {
    const res = await request.get('/api/workouts', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.workouts)).toBe(true);
  });

  test('POST /api/workouts creates a workout (201)', async ({ request }) => {
    const res = await request.post('/api/workouts', {
      headers: { Authorization: `Bearer ${token}` },
      data: { day: 'Monday', time: '09:00', exercise: 'Push-Ups', completed: false },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(typeof body.id).toBe('string');
  });

  test('GET /api/workouts returns the created workout', async ({ request }) => {
    const res = await request.get('/api/workouts', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    const workout = body.workouts.find((w: { exercise: string }) => w.exercise === 'Push-Ups');
    expect(workout).toBeDefined();
    expect(workout.day).toBe('Monday');
    expect(workout.completed).toBe(0);
  });

  test('POST /api/workouts updates existing workout (200)', async ({ request }) => {
    const res = await request.post('/api/workouts', {
      headers: { Authorization: `Bearer ${token}` },
      data: { day: 'Monday', time: '09:00', exercise: 'Push-Ups', completed: true },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  test('GET /api/workouts shows workout as completed after update', async ({ request }) => {
    const res = await request.get('/api/workouts', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await res.json();
    const workout = body.workouts.find((w: { exercise: string }) => w.exercise === 'Push-Ups');
    expect(workout.completed).toBe(1);
  });

  test('POST /api/workouts returns 400 for missing fields', async ({ request }) => {
    const res = await request.post('/api/workouts', {
      headers: { Authorization: `Bearer ${token}` },
      data: { day: 'Tuesday' },
    });
    expect(res.status()).toBe(400);
  });

  test('DELETE /api/workouts clears workouts for the week', async ({ request }) => {
    const res = await request.delete('/api/workouts', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  test('GET /api/workouts is empty after delete', async ({ request }) => {
    const res = await request.get('/api/workouts', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await res.json();
    expect(body.workouts).toHaveLength(0);
  });
});
