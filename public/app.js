// MicroWorkouts — Client-side application
// Evidence-based full-body desk workout planner with notifications and injury tracking.

'use strict';

// ============================================================
// WORKOUT DATA
// Full-body plan spread across a typical desk-worker day.
//
// Rep-count goals are research-backed:
//   • 100 push-ups/day  — popular challenge; effective for upper-body endurance
//   • 100 squats/day    — leg strength & metabolic health for sedentary workers
//   • 3 min plank/day   — core stability standard from physiotherapy guidelines
// ============================================================

const INJURIES_CONFIG = [
  { key: 'knee',       label: 'Knee',       emoji: '🦵', desc: 'Runner\'s knee, surgery recovery, general pain' },
  { key: 'shoulder',   label: 'Shoulder',   emoji: '🦾', desc: 'Rotator cuff, impingement, post-surgery' },
  { key: 'lower-back', label: 'Lower Back', emoji: '🔙', desc: 'Herniated disc, muscle strain, sciatica' },
  { key: 'upper-back', label: 'Upper Back', emoji: '🔝', desc: 'Thoracic pain, muscle tension, trapezius strain' },
  { key: 'wrist',      label: 'Wrist',      emoji: '✋', desc: 'Carpal tunnel, sprain, tendinitis' },
  { key: 'elbow',      label: 'Elbow',      emoji: '💪', desc: 'Tennis/golfer\'s elbow, strain' },
  { key: 'hip',        label: 'Hip',        emoji: '🦴', desc: 'Hip flexor strain, bursitis' },
];

// Daily goals – amounts accumulate across all checked exercises
const DAILY_GOALS = {
  pushups: { label: 'Push-Ups', target: 100, unit: 'reps', displayTarget: '100 reps', emoji: '✊', color: '#FF3B30' },
  squats:  { label: 'Squats',   target: 100, unit: 'reps', displayTarget: '100 reps', emoji: '⬇️', color: '#34C759' },
  plank:   { label: 'Plank',    target: 180, unit: 'sec',  displayTarget: '3 min',    emoji: '⬛', color: '#5856D6' },
};

// Full workout schedule — exercises are distributed throughout the day
const WORKOUT_SCHEDULE = [
  {
    time: '9:00 AM',
    category: 'Wake-Up Mobility',
    emoji: '🌅',
    color: '#FF9500',
    notification: 'Good morning! Start your day with some mobility work.',
    exercises: [
      { name: 'Neck Rolls',     sets: 2, reps: '30 sec', emoji: '🔄', exclude: [] },
      { name: 'Shoulder Rolls', sets: 2, reps: '30 sec', emoji: '🔄', exclude: ['shoulder'] },
      { name: 'Hip Circles',    sets: 2, reps: '30 sec', emoji: '🔄', exclude: ['hip', 'lower-back'] },
      { name: 'Wrist Circles',  sets: 2, reps: '30 sec', emoji: '🔄', exclude: ['wrist'] },
      { name: 'Ankle Circles',  sets: 2, reps: '30 sec', emoji: '🔄', exclude: [] },
    ],
  },
  {
    time: '10:30 AM',
    category: 'Push — Chest & Triceps',
    emoji: '💪',
    color: '#FF3B30',
    notification: 'Push time! 3 sets of push-ups — you\'ve got this!',
    exercises: [
      { name: 'Push-Ups',   sets: 3, reps: 15, emoji: '✊', goal: { key: 'pushups', amount: 45 }, exclude: ['shoulder', 'wrist'] },
      { name: 'Chair Dips', sets: 3, reps: 12, emoji: '💺', goal: { key: 'pushups', amount: 36 }, exclude: ['shoulder', 'wrist', 'elbow'] },
    ],
    injuryAlternatives: {
      shoulder: [
        { name: 'Forearm Plank',  sets: 3, reps: '30 sec',  emoji: '⬛', goal: { key: 'plank', amount: 90 } },
        { name: 'Shoulder Taps',  sets: 3, reps: '20 each', emoji: '👆' },
      ],
      wrist: [
        { name: 'Incline Push-Ups', sets: 3, reps: 15, emoji: '🔼', goal: { key: 'pushups', amount: 45 } },
      ],
    },
  },
  {
    time: '12:30 PM',
    category: 'Legs',
    emoji: '🦵',
    color: '#34C759',
    notification: 'Stand up! Time for squats and lunges.',
    exercises: [
      { name: 'Air Squats',     sets: 3, reps: 20,        emoji: '⬇️', goal: { key: 'squats', amount: 60 }, exclude: ['knee'] },
      { name: 'Reverse Lunges', sets: 3, reps: '12 each', emoji: '🚶', exclude: ['knee'] },
      { name: 'Calf Raises',    sets: 3, reps: 20,        emoji: '⬆️', exclude: [] },
    ],
    injuryAlternatives: {
      knee: [
        { name: 'Seated Leg Raises',      sets: 3, reps: 15,        emoji: '🪑' },
        { name: 'Standing Hip Abduction', sets: 3, reps: 15,        emoji: '↔️' },
        { name: 'Seated Calf Raises',     sets: 3, reps: 20,        emoji: '⬆️' },
      ],
    },
  },
  {
    time: '2:30 PM',
    category: 'Pull — Back & Biceps',
    emoji: '🏋️',
    color: '#007AFF',
    notification: 'Back to it! Time for pulling exercises.',
    exercises: [
      { name: 'Desk Rows',        sets: 3, reps: 12, emoji: '🪑', exclude: ['shoulder', 'upper-back'] },
      { name: 'Band Pull-Aparts', sets: 3, reps: 15, emoji: '↔️', exclude: ['shoulder'] },
      { name: 'Bicep Curls',      sets: 3, reps: 12, emoji: '💪', exclude: ['elbow', 'wrist'] },
    ],
  },
  {
    time: '4:30 PM',
    category: 'Core',
    emoji: '🔥',
    color: '#FF2D55',
    notification: 'Core time! Planks and crunches.',
    exercises: [
      { name: 'Plank',            sets: 3, reps: '30 sec',  emoji: '⬛', goal: { key: 'plank', amount: 90 },  exclude: ['wrist', 'lower-back'] },
      { name: 'Bicycle Crunches', sets: 3, reps: '20 each', emoji: '🚲', exclude: ['lower-back'] },
      { name: 'Dead Bug',         sets: 3, reps: 10,         emoji: '🐛', exclude: ['lower-back'] },
    ],
    injuryAlternatives: {
      wrist: [
        { name: 'Forearm Plank', sets: 3, reps: '30 sec', emoji: '⬛', goal: { key: 'plank', amount: 90 } },
      ],
      'lower-back': [
        { name: 'Bird Dog',        sets: 3, reps: '10 each', emoji: '🐦' },
        { name: 'Seated Crunches', sets: 3, reps: 20,         emoji: '🪑' },
      ],
    },
  },
  {
    time: '6:30 PM',
    category: 'Shoulders & Arms',
    emoji: '🏅',
    color: '#5856D6',
    notification: 'Almost done — shoulders and arms!',
    exercises: [
      { name: 'Shoulder Press', sets: 3, reps: 12, emoji: '🔝', exclude: ['shoulder'] },
      { name: 'Lateral Raises', sets: 3, reps: 12, emoji: '↔️', exclude: ['shoulder'] },
      { name: 'Push-Ups',       sets: 2, reps: 10, emoji: '✊', goal: { key: 'pushups', amount: 20 }, exclude: ['shoulder', 'wrist'] },
      { name: 'Hammer Curls',   sets: 3, reps: 12, emoji: '🔨', exclude: ['elbow', 'wrist'] },
    ],
    injuryAlternatives: {
      shoulder: [
        { name: 'Resistance Band Rows', sets: 3, reps: 15,        emoji: '↔️' },
        { name: 'Forearm Circles',      sets: 2, reps: '30 sec',  emoji: '🔄' },
      ],
    },
  },
  {
    time: '8:00 PM',
    category: 'Cool Down & Stretch',
    emoji: '🧘',
    color: '#30D158',
    notification: 'Great work today! Time to cool down and stretch.',
    exercises: [
      { name: 'Full Body Stretch',      sets: 1, reps: '5 min',   emoji: '🧘', exclude: [] },
      { name: 'Chest Opener',           sets: 2, reps: '30 sec',  emoji: '🤲', exclude: ['shoulder'] },
      { name: 'Pigeon Pose',            sets: 2, reps: '30 sec',  emoji: '🦢', exclude: ['hip', 'knee'] },
      { name: "Child's Pose",           sets: 2, reps: '30 sec',  emoji: '🙏', exclude: ['knee', 'lower-back'] },
      { name: 'Standing Quad Stretch',  sets: 2, reps: '30 sec',  emoji: '🦵', exclude: ['knee'] },
    ],
  },
];

// ============================================================
// STATE
// ============================================================

let currentUser     = null;
let workoutData     = {};    // "DayName|SlotTime|ExerciseName" → boolean
let activeInjuries  = new Set();
let notifPermission = 'default';
let notifInterval   = null;
let countdownTimer  = null;

// ============================================================
// HELPERS
// ============================================================

function getWeekStart() {
  const d   = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split('T')[0];
}

function getCurrentDayName() {
  return ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][new Date().getDay()];
}

function parseTimeToMinutes(timeStr) {
  const [time, mer] = timeStr.split(' ');
  let [h, m]        = time.split(':').map(Number);
  if (mer === 'PM' && h !== 12) h += 12;
  if (mer === 'AM' && h === 12) h  = 0;
  return h * 60 + m;
}

function currentMinutes() {
  const n = new Date();
  return n.getHours() * 60 + n.getMinutes();
}

function currentSeconds() {
  const n = new Date();
  return n.getHours() * 3600 + n.getMinutes() * 60 + n.getSeconds();
}

function safeNotificationPermission() {
  try {
    return window.Notification ? Notification.permission : 'unsupported';
  } catch (_) {
    return 'unsupported';
  }
}

// Return exercises for a slot taking active injuries into account.
// Excluded exercises are replaced with injury-specific alternatives when available.
function getEffectiveExercises(slot) {
  const isExcluded = (ex) => ex.exclude && ex.exclude.some(k => activeInjuries.has(k));

  const kept     = slot.exercises.filter(ex => !isExcluded(ex));
  const excluded = slot.exercises.filter(ex =>  isExcluded(ex));

  if (!excluded.length || !slot.injuryAlternatives) return kept;

  const alts   = [];
  const seen   = new Set();

  for (const injKey of activeInjuries) {
    const candidates = slot.injuryAlternatives[injKey];
    if (!candidates) continue;
    // Only add alternatives when this injury actually excluded something
    const triggered = excluded.some(ex => ex.exclude.includes(injKey));
    if (!triggered) continue;

    candidates.forEach(alt => {
      const altExcluded = alt.exclude && alt.exclude.some(k => activeInjuries.has(k));
      if (!seen.has(alt.name) && !altExcluded) {
        alts.push({ ...alt, isAlternative: true });
        seen.add(alt.name);
      }
    });
  }

  return [...kept, ...alts];
}

// ============================================================
// AUTH
// ============================================================

async function checkAuth() {
  try {
    const r = await fetch('/api/auth/me');
    if (r.ok) {
      const data = await r.json();
      currentUser = data.user;
      return true;
    }
  } catch (e) {
    console.error('Auth check failed:', e);
  }
  return false;
}

function initOAuth() {
  const baseUrl     = window.APP_CONFIG?.baseUrl     || window.location.origin;
  const googleId    = window.APP_CONFIG?.googleClientId;
  const microsoftId = window.APP_CONFIG?.microsoftClientId;

  if (!googleId || !microsoftId) {
    const el = document.getElementById('error-message');
    if (el) { el.textContent = 'Application not configured. Please contact the administrator.'; el.style.display = 'block'; }
    return;
  }

  document.getElementById('google-login').addEventListener('click', () => {
    const uri = `${baseUrl}/api/oauth/google/callback`;
    window.location.href =
      `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleId}` +
      `&redirect_uri=${encodeURIComponent(uri)}&response_type=code` +
      `&scope=${encodeURIComponent('openid email profile')}&access_type=offline&prompt=consent`;
  });

  document.getElementById('microsoft-login').addEventListener('click', () => {
    const uri = `${baseUrl}/api/oauth/microsoft/callback`;
    window.location.href =
      `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${microsoftId}` +
      `&redirect_uri=${encodeURIComponent(uri)}&response_type=code` +
      `&scope=${encodeURIComponent('openid email profile User.Read')}&response_mode=query`;
  });

  const err = new URLSearchParams(window.location.search).get('error');
  if (err) {
    const el = document.getElementById('error-message');
    if (el) { el.textContent = 'Login failed. Please try again.'; el.style.display = 'block'; }
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}

async function logout() {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.reload();
  } catch (e) {
    console.error('Logout failed:', e);
  }
}

// ============================================================
// DATA
// ============================================================

async function loadWorkouts() {
  try {
    const r = await fetch(`/api/workouts?week_start=${getWeekStart()}`);
    if (!r.ok) return;
    const data = await r.json();
    workoutData = {};
    (data.workouts || []).forEach(w => {
      workoutData[`${w.day}|${w.time}|${w.exercise}`] = w.completed === 1;
    });
  } catch (e) {
    console.error('Failed to load workouts:', e);
  }
}

async function saveWorkout(day, time, exercise, completed) {
  try {
    await fetch('/api/workouts', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ day, time, exercise, completed, week_start: getWeekStart() }),
    });
  } catch (e) {
    console.error('Failed to save workout:', e);
  }
}

// ============================================================
// GOAL CALCULATION
// ============================================================

function calculateGoals(day) {
  const totals = {};
  Object.keys(DAILY_GOALS).forEach(k => (totals[k] = 0));
  WORKOUT_SCHEDULE.forEach(slot => {
    getEffectiveExercises(slot).forEach(ex => {
      if (ex.goal && workoutData[`${day}|${slot.time}|${ex.name}`]) {
        totals[ex.goal.key] = (totals[ex.goal.key] || 0) + ex.goal.amount;
      }
    });
  });
  return totals;
}

function calculateWeeklyProgress() {
  const days = ['Monday','Tuesday','Wednesday','Thursday','Friday'];
  let completed = 0, total = 0;
  days.forEach(day =>
    WORKOUT_SCHEDULE.forEach(slot =>
      getEffectiveExercises(slot).forEach(ex => {
        total++;
        if (workoutData[`${day}|${slot.time}|${ex.name}`]) completed++;
      })
    )
  );
  return { completed, total };
}

// ============================================================
// NOTIFICATIONS
// ============================================================

function updateNotifBtn() {
  const btn = document.getElementById('notification-btn');
  if (!btn) return;
  if (notifPermission === 'unsupported') {
    btn.textContent = '🔕'; btn.title = 'Notifications not supported in this browser'; return;
  }
  if (notifPermission === 'granted') {
    btn.textContent = '🔔'; btn.title = 'Workout notifications enabled (click to disable)';
    btn.classList.add('notif-active');
  } else if (notifPermission === 'denied') {
    btn.textContent = '🔕'; btn.title = 'Notifications blocked — check browser settings';
    btn.classList.remove('notif-active');
  } else {
    btn.textContent = '🔔'; btn.title = 'Click to enable workout notifications';
    btn.classList.remove('notif-active');
  }
}

async function toggleNotifications() {
  if (notifPermission === 'unsupported') {
    showToast('Desktop notifications are not supported in this browser.', 'error'); return;
  }
  if (notifPermission === 'denied') {
    showToast('Notifications are blocked. Please allow them in your browser settings.', 'warning'); return;
  }
  if (notifPermission === 'granted') {
    if (notifInterval) { clearInterval(notifInterval); notifInterval = null; }
    localStorage.removeItem('notificationsEnabled');
    notifPermission = 'default';   // reset so user can re-enable
    showToast('Workout notifications disabled.', 'info');
    updateNotifBtn();
    return;
  }
  notifPermission = await Notification.requestPermission();
  if (notifPermission === 'granted') {
    startNotifSchedule();
    localStorage.setItem('notificationsEnabled', '1');
    showToast('Workout notifications enabled! You\'ll be reminded at each workout time.', 'success');
  } else {
    showToast('Notification permission not granted.', 'error');
  }
  updateNotifBtn();
}

function startNotifSchedule() {
  if (notifInterval) clearInterval(notifInterval);
  notifInterval = setInterval(checkNotifs, 30_000);
  checkNotifs();
}

function checkNotifs() {
  if (notifPermission !== 'granted') return;
  const now   = new Date();
  const today = now.toISOString().split('T')[0];
  const ch    = now.getHours();
  const cm    = now.getMinutes();

  WORKOUT_SCHEDULE.forEach(slot => {
    const sm = parseTimeToMinutes(slot.time);
    const sh = Math.floor(sm / 60);
    const min = sm % 60;
    // Notify within a 2-minute window
    if (ch === sh && Math.abs(cm - min) <= 1) {
      const key = `notified|${slot.time}|${today}`;
      if (!localStorage.getItem(key)) {
        fireNotification(slot);
        localStorage.setItem(key, '1');
      }
    }
  });
}

function fireNotification(slot) {
  const exs  = getEffectiveExercises(slot).slice(0, 3);
  const body = exs.map(e => `${e.emoji} ${e.name} — ${e.sets}×${e.reps}`).join('\n');
  const n = new Notification(`${slot.emoji} Time for ${slot.category}!`, {
    body,
    tag: `mw-${slot.time}`,
    requireInteraction: true,
  });
  n.onclick = () => { window.focus(); n.close(); };
}

// ============================================================
// TOASTS
// ============================================================

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.textContent = message;
  container.appendChild(t);
  requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add('visible')));
  setTimeout(() => { t.classList.remove('visible'); setTimeout(() => t.remove(), 300); }, 3500);
}

// ============================================================
// INJURIES
// ============================================================

function loadInjuries() {
  try {
    const saved = localStorage.getItem('activeInjuries');
    activeInjuries = saved ? new Set(JSON.parse(saved)) : new Set();
  } catch (_) {
    activeInjuries = new Set();
  }
}

function saveInjuries() {
  localStorage.setItem('activeInjuries', JSON.stringify([...activeInjuries]));
}

function toggleInjury(key) {
  if (activeInjuries.has(key)) activeInjuries.delete(key);
  else                          activeInjuries.add(key);
  saveInjuries();
  renderInjuryGrid();
  renderTodayView();
  updateGoals();
}

// ============================================================
// RENDERING — GOALS RING
// ============================================================

function renderGoalsGrid() {
  const grid = document.getElementById('goals-grid');
  if (!grid) return;
  // circumference of circle r=15.9 ≈ 100, so stroke-dasharray X 100 equals X%
  grid.innerHTML = Object.entries(DAILY_GOALS).map(([key, cfg]) => `
    <div class="goal-card">
      <div class="goal-ring-wrap">
        <svg class="ring-svg" viewBox="0 0 36 36">
          <circle class="ring-track"    cx="18" cy="18" r="15.9" fill="none"/>
          <circle class="ring-progress" cx="18" cy="18" r="15.9" fill="none"
            id="goal-ring-${key}"
            style="stroke:${cfg.color};stroke-dasharray:0 100"
            transform="rotate(-90 18 18)"/>
        </svg>
        <div class="ring-center">
          <div class="ring-count" id="goal-count-${key}">0</div>
          <div class="ring-of">/ ${cfg.displayTarget || cfg.target}</div>
        </div>
      </div>
      <div class="goal-meta">
        <div class="goal-label">${cfg.emoji} ${cfg.label}</div>
        <div class="goal-target">Goal: ${cfg.displayTarget || cfg.target} ${cfg.unit !== 'sec' ? cfg.unit : ''}</div>
        <div class="goal-pct" id="goal-pct-${key}" style="color:${cfg.color}">0%</div>
      </div>
    </div>
  `).join('');
}

function updateGoals() {
  const today  = getCurrentDayName();
  const totals = calculateGoals(today);

  Object.entries(DAILY_GOALS).forEach(([key, cfg]) => {
    const cur = totals[key] || 0;
    const pct = Math.min(100, Math.round((cur / cfg.target) * 100));

    const cntEl  = document.getElementById(`goal-count-${key}`);
    const ringEl = document.getElementById(`goal-ring-${key}`);
    const pctEl  = document.getElementById(`goal-pct-${key}`);

    if (cntEl) {
      if (cfg.unit === 'sec') {
        const m = Math.floor(cur / 60), s = cur % 60;
        cntEl.textContent = m > 0 ? `${m}m${s}s` : `${s}s`;
      } else {
        cntEl.textContent = cur;
      }
    }
    if (ringEl) ringEl.style.strokeDasharray = `${pct} 100`;
    if (pctEl)  pctEl.textContent = `${pct}%`;
  });
}

// ============================================================
// RENDERING — TODAY
// ============================================================

function renderTodayView() {
  const today     = getCurrentDayName();
  const isWeekend = today === 'Saturday' || today === 'Sunday';
  const cards     = document.getElementById('workout-cards');
  const title     = document.getElementById('today-section-title');

  if (!cards) return;

  if (title) title.textContent = isWeekend ? 'Rest Day 🌿' : `${today}'s Plan`;

  if (isWeekend) {
    cards.innerHTML = `
      <div class="rest-day-card">
        <div class="rest-day-emoji">🌿</div>
        <h3>Rest &amp; Recover</h3>
        <p>It's the weekend — your body needs rest to grow stronger.</p>
        <p class="rest-tips">💡 Light walks, yoga or a gentle stretch are always welcome.</p>
      </div>`;
    return;
  }

  cards.innerHTML = WORKOUT_SCHEDULE.map(slot => renderWorkoutCard(slot, today)).join('');
  attachCardListeners(today);
}

function renderWorkoutCard(slot, day) {
  const exercises = getEffectiveExercises(slot);
  const done      = exercises.filter(ex => workoutData[`${day}|${slot.time}|${ex.name}`]).length;
  const total     = exercises.length;
  const pct       = total ? Math.round((done / total) * 100) : 0;

  const slotMins = parseTimeToMinutes(slot.time);
  const now      = currentMinutes();
  const isCurrent  = Math.abs(slotMins - now) <= 60;
  const isNext     = slotMins > now && slotMins - now <= 90;
  const isPastSlot = slotMins + 90 < now;
  const allDone    = done === total;

  let cardClass = 'workout-card';
  if (allDone)  cardClass += ' card-done';
  else if (isCurrent) cardClass += ' card-current';
  else if (isNext)    cardClass += ' card-next';
  else if (isPastSlot && !allDone) cardClass += ' card-missed';

  let badge = '';
  if (allDone)   badge = '<span class="card-badge badge-done">✓ Done</span>';
  else if (isCurrent) badge = '<span class="card-badge badge-now">▶ Now</span>';
  else if (isNext)    badge = '<span class="card-badge badge-next">Up next</span>';
  else                badge = `<span class="card-badge">${done}/${total}</span>`;

  const injMod = exercises.some(e => e.isAlternative);

  return `
    <div class="${cardClass}" data-slot-time="${slot.time}">
      <div class="card-header">
        <div class="card-time">${slot.time}</div>
        <div class="card-category">
          <span class="card-emoji">${slot.emoji}</span>
          ${slot.category}
          ${injMod ? '<span class="injury-badge" title="Modified for your injuries">🩺</span>' : ''}
        </div>
        ${badge}
      </div>
      <div class="card-progress-bar">
        <div class="card-progress-fill" style="width:${pct}%;background:${slot.color}"></div>
      </div>
      <div class="card-exercises">
        ${exercises.map(ex => renderExerciseRow(ex, slot, day)).join('')}
      </div>
    </div>`;
}

function renderExerciseRow(ex, slot, day) {
  const key      = `${day}|${slot.time}|${ex.name}`;
  const checked  = workoutData[key] || false;
  const repLabel = typeof ex.reps === 'number'
    ? `${ex.sets} × ${ex.reps} reps`
    : `${ex.sets} × ${ex.reps}`;
  const goalTag = ex.goal
    ? `<span class="exercise-goal-tag" style="color:${DAILY_GOALS[ex.goal.key].color}">${ex.goal.amount} ${DAILY_GOALS[ex.goal.key].unit === 'sec' ? 'sec' : DAILY_GOALS[ex.goal.key].unit}</span>`
    : '';
  const altTag = ex.isAlternative ? '<span class="alt-tag">Alternative</span>' : '';

  return `
    <label class="exercise-row${checked ? ' exercise-done' : ''}${ex.isAlternative ? ' exercise-alternative' : ''}">
      <input type="checkbox" ${checked ? 'checked' : ''}
        data-day="${day}" data-time="${slot.time}" data-exercise="${ex.name}">
      <span class="exercise-emoji">${ex.emoji}</span>
      <span class="exercise-details">
        <span class="exercise-name">${ex.name}</span>
        <span class="exercise-reps">${repLabel}</span>
      </span>
      ${goalTag}${altTag}
      ${checked ? '<span class="done-tick">✓</span>' : ''}
    </label>`;
}

function attachCardListeners(day) {
  document.querySelectorAll('#workout-cards input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', async e => {
      const { day: d, time, exercise } = e.target.dataset;
      const completed = e.target.checked;
      const key       = `${d}|${time}|${exercise}`;
      workoutData[key] = completed;

      // Update label class instantly
      const label = e.target.closest('.exercise-row');
      if (label) {
        label.classList.toggle('exercise-done', completed);
        // Toggle or remove done-tick span
        const tick = label.querySelector('.done-tick');
        if (completed && !tick) label.insertAdjacentHTML('beforeend', '<span class="done-tick">✓</span>');
        else if (!completed && tick) tick.remove();
      }

      // Update card header badge & progress bar
      const card      = e.target.closest('.workout-card');
      const slot      = WORKOUT_SCHEDULE.find(s => s.time === time);
      if (card && slot) {
        const exercises = getEffectiveExercises(slot);
        const done      = exercises.filter(ex => workoutData[`${d}|${time}|${ex.name}`]).length;
        const total     = exercises.length;
        const pct       = total ? Math.round((done / total) * 100) : 0;
        const fill      = card.querySelector('.card-progress-fill');
        if (fill) fill.style.width = `${pct}%`;
        // Re-render just the badge area
        const allDone = done === total;
        const badgeEl = card.querySelector('.card-badge');
        if (badgeEl && allDone) {
          badgeEl.textContent = '✓ Done';
          badgeEl.className   = 'card-badge badge-done';
          card.classList.add('card-done');
        }
      }

      await saveWorkout(d, time, exercise, completed);
      updateGoals();
    });
  });
}

// ============================================================
// RENDERING — WEEK TABLE
// ============================================================

function renderWeekView() {
  const table = document.getElementById('workout-table');
  if (!table) return;

  const days = ['Monday','Tuesday','Wednesday','Thursday','Friday'];

  const dayProg = {};
  days.forEach(day => {
    let c = 0, t = 0;
    WORKOUT_SCHEDULE.forEach(slot =>
      getEffectiveExercises(slot).forEach(ex => {
        t++;
        if (workoutData[`${day}|${slot.time}|${ex.name}`]) c++;
      })
    );
    dayProg[day] = { c, t, pct: t ? Math.round(c / t * 100) : 0 };
  });

  let html = `<tr>
    <th>Exercise</th>
    ${days.map(d => `<th>
      <div class="week-day-header">
        ${d}<span class="day-pct${dayProg[d].pct === 100 ? ' complete' : ''}">${dayProg[d].pct}%</span>
      </div>
    </th>`).join('')}
  </tr>`;

  WORKOUT_SCHEDULE.forEach(slot => {
    const exercises = getEffectiveExercises(slot);
    exercises.forEach((ex, idx) => {
      const isFirst = idx === 0;
      html += `<tr>`;
      if (isFirst) {
        html += `<td class="time-cell" rowspan="${exercises.length}">
          <div class="time-label">${slot.emoji} ${slot.time}</div>
          <div class="time-category">${slot.category}</div>
        </td>`;
      }
      html += days.map(day => {
        const key     = `${day}|${slot.time}|${ex.name}`;
        const checked = workoutData[key] || false;
        return `<td>
          <label class="week-check${checked ? ' checked' : ''}">
            <input type="checkbox" ${checked ? 'checked' : ''}
              data-day="${day}" data-time="${slot.time}" data-exercise="${ex.name}">
            ${ex.emoji} ${ex.name}
          </label>
        </td>`;
      }).join('');
      html += '</tr>';
    });
  });

  table.innerHTML = html;

  // Progress bar
  const overall = calculateWeeklyProgress();
  const opct    = overall.total ? Math.round((overall.completed / overall.total) * 100) : 0;
  const bar     = document.getElementById('progress');
  if (bar) bar.style.width = `${opct}%`;
  const txt = document.getElementById('progress-text');
  if (txt) txt.textContent = `${overall.completed} of ${overall.total} exercises completed this week (${opct}%)`;

  // Listeners
  table.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', async e => {
      const { day, time, exercise } = e.target.dataset;
      const completed = e.target.checked;
      workoutData[`${day}|${time}|${exercise}`] = completed;
      await saveWorkout(day, time, exercise, completed);
      renderWeekView();
      updateGoals();
    });
  });
}

// ============================================================
// RENDERING — INJURIES
// ============================================================

function renderInjuryGrid() {
  const grid = document.getElementById('injury-grid');
  if (!grid) return;

  grid.innerHTML = INJURIES_CONFIG.map(inj => {
    const active = activeInjuries.has(inj.key);
    return `
      <div class="injury-card${active ? ' injury-active' : ''}" onclick="toggleInjury('${inj.key}')">
        <div class="injury-emoji">${inj.emoji}</div>
        <div class="injury-label">${inj.label}</div>
        <div class="injury-desc">${inj.desc}</div>
        ${active ? '<div class="injury-active-badge">⚠️ Active</div>' : ''}
      </div>`;
  }).join('');

  const badge = document.getElementById('injury-badge');
  if (badge) {
    badge.textContent = activeInjuries.size || '';
    badge.style.display = activeInjuries.size ? 'inline-block' : 'none';
  }
}

// ============================================================
// NEXT-WORKOUT BANNER
// ============================================================

function updateNextWorkoutBanner() {
  const titleEl    = document.getElementById('next-workout-title');
  const timeEl     = document.getElementById('next-workout-time');
  const countdownEl = document.getElementById('next-workout-countdown');
  if (!titleEl) return;

  const nowSec  = currentSeconds();
  let upcoming  = null;

  for (const slot of WORKOUT_SCHEDULE) {
    const slotSec = parseTimeToMinutes(slot.time) * 60;
    if (slotSec > nowSec) { upcoming = { slot, diffSec: slotSec - nowSec }; break; }
  }

  if (!upcoming) {
    titleEl.textContent    = 'All done for today! 🎉';
    if (timeEl) timeEl.textContent = 'Great work — see you tomorrow.';
    if (countdownEl) countdownEl.textContent = '';
    return;
  }

  const { slot, diffSec } = upcoming;
  titleEl.textContent = `${slot.emoji} ${slot.category}`;
  if (timeEl) timeEl.textContent = `at ${slot.time}`;

  if (countdownEl) {
    if (diffSec <= 0) {
      countdownEl.textContent = '▶ Now!';
    } else {
      const h = Math.floor(diffSec / 3600);
      const m = Math.floor((diffSec % 3600) / 60);
      const s = diffSec % 60;
      countdownEl.textContent = h > 0 ? `in ${h}h ${m}m` : m > 0 ? `in ${m}m ${s}s` : `in ${s}s`;
    }
  }
}

// ============================================================
// NAVIGATION
// ============================================================

function showView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('view-active'));
  document.querySelectorAll('.nav-btn, .mobile-nav-btn').forEach(b => b.classList.remove('active'));

  const view = document.getElementById(`view-${name}`);
  if (view) view.classList.add('view-active');

  document.querySelectorAll(`[data-view="${name}"]`).forEach(b => b.classList.add('active'));

  if (name === 'week') renderWeekView();
}

// ============================================================
// RESET
// ============================================================

async function resetWeek() {
  if (!confirm('Reset all workouts for this week?')) return;
  try {
    await fetch(`/api/workouts?week_start=${getWeekStart()}`, { method: 'DELETE' });
    workoutData = {};
    renderTodayView();
    updateGoals();
    renderWeekView();
    showToast('Workout data has been reset.', 'success');
  } catch (e) {
    console.error('Reset failed:', e);
    showToast('Failed to reset. Please try again.', 'error');
  }
}

// ============================================================
// USER INFO
// ============================================================

function displayUserInfo() {
  if (!currentUser) return;
  const nameEl = document.getElementById('user-name');
  if (nameEl) nameEl.textContent = currentUser.name || currentUser.email;
  if (currentUser.picture) {
    const av = document.getElementById('user-avatar');
    if (av) { av.src = currentUser.picture; av.alt = currentUser.name || 'User'; av.style.display = 'inline-block'; }
  }
}

// ============================================================
// INIT
// ============================================================

async function init() {
  loadInjuries();

  const authed = await checkAuth();

  if (authed) {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app-screen').style.display  = 'flex';

    displayUserInfo();
    await loadWorkouts();

    renderGoalsGrid();
    renderTodayView();
    renderInjuryGrid();
    updateGoals();
    updateNextWorkoutBanner();

    // Countdown timer (1-second ticks)
    if (countdownTimer) clearInterval(countdownTimer);
    countdownTimer = setInterval(updateNextWorkoutBanner, 1000);

    // Notification state
    notifPermission = safeNotificationPermission();
    updateNotifBtn();
    if (notifPermission === 'granted' && localStorage.getItem('notificationsEnabled')) {
      startNotifSchedule();
    }

    // Wire up controls
    document.getElementById('reset-button')?.addEventListener('click', resetWeek);
    document.getElementById('logout-button')?.addEventListener('click', logout);
    document.getElementById('notification-btn')?.addEventListener('click', toggleNotifications);
    document.querySelectorAll('.nav-btn, .mobile-nav-btn').forEach(btn =>
      btn.addEventListener('click', () => showView(btn.dataset.view))
    );

  } else {
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('app-screen').style.display  = 'none';
    initOAuth();
  }
}

init();

