// API endpoint to manage workouts
import { Env, getSessionFromCookie, validateSession, generateUUID, getWeekStart } from '../../../src/auth';

interface Workout {
  id: string;
  user_id: string;
  day: string;
  time: string;
  exercise: string;
  completed: number;
  week_start: string;
}

// GET /api/workouts - Get all workouts for current week
export async function onRequestGet(context: { request: Request; env: Env }) {
  const { request, env } = context;
  
  const sessionId = getSessionFromCookie(request);
  if (!sessionId) {
    return new Response(JSON.stringify({ error: 'Not authenticated' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  const user = await validateSession(env.DB, sessionId);
  if (!user) {
    return new Response(JSON.stringify({ error: 'Invalid session' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  const url = new URL(request.url);
  const weekStart = url.searchParams.get('week_start') || getWeekStart();
  
  try {
    const workouts = await env.DB.prepare(`
      SELECT id, day, time, exercise, completed, week_start
      FROM workouts
      WHERE user_id = ? AND week_start = ?
      ORDER BY time, day
    `).bind(user.id, weekStart).all();
    
    return new Response(JSON.stringify({ workouts: workouts.results || [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('Error fetching workouts:', err);
    return new Response(JSON.stringify({ error: 'Failed to fetch workouts' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// POST /api/workouts - Create or update a workout
export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;
  
  const sessionId = getSessionFromCookie(request);
  if (!sessionId) {
    return new Response(JSON.stringify({ error: 'Not authenticated' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  const user = await validateSession(env.DB, sessionId);
  if (!user) {
    return new Response(JSON.stringify({ error: 'Invalid session' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  let body;
  try {
    body = await request.json();
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  const { day, time, exercise, completed, week_start } = body as {
    day: string;
    time: string;
    exercise: string;
    completed: boolean;
    week_start?: string;
  };
  
  // Validate required fields
  if (!day || !time || !exercise || completed === undefined) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Validate non-empty strings
  if (day.trim() === '' || time.trim() === '' || exercise.trim() === '') {
    return new Response(JSON.stringify({ error: 'Fields cannot be empty' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  const weekStartDate = week_start || getWeekStart();
  
  try {
    // Check if workout already exists
    const existing = await env.DB.prepare(`
      SELECT id FROM workouts
      WHERE user_id = ? AND day = ? AND time = ? AND week_start = ?
    `).bind(user.id, day, time, weekStartDate).first<{ id: string }>();
    
    if (existing) {
      // Update existing workout
      await env.DB.prepare(`
        UPDATE workouts
        SET completed = ?, exercise = ?
        WHERE id = ?
      `).bind(completed ? 1 : 0, exercise, existing.id).run();
      
      return new Response(JSON.stringify({ id: existing.id, success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      // Create new workout
      const workoutId = generateUUID();
      await env.DB.prepare(`
        INSERT INTO workouts (id, user_id, day, time, exercise, completed, week_start)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(workoutId, user.id, day, time, exercise, completed ? 1 : 0, weekStartDate).run();
      
      return new Response(JSON.stringify({ id: workoutId, success: true }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (err) {
    console.error('Error saving workout:', err);
    return new Response(JSON.stringify({ error: 'Failed to save workout' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// DELETE /api/workouts - Reset all workouts for the week
export async function onRequestDelete(context: { request: Request; env: Env }) {
  const { request, env } = context;
  
  const sessionId = getSessionFromCookie(request);
  if (!sessionId) {
    return new Response(JSON.stringify({ error: 'Not authenticated' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  const user = await validateSession(env.DB, sessionId);
  if (!user) {
    return new Response(JSON.stringify({ error: 'Invalid session' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  const url = new URL(request.url);
  const weekStart = url.searchParams.get('week_start') || getWeekStart();
  
  try {
    await env.DB.prepare(`
      DELETE FROM workouts
      WHERE user_id = ? AND week_start = ?
    `).bind(user.id, weekStart).run();
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('Error deleting workouts:', err);
    return new Response(JSON.stringify({ error: 'Failed to delete workouts' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
