// My Micro Workouts - Client-side application
// Integrates with Cloudflare Pages Functions API

const workouts = {
  "9:00 AM": ["Plank (2x20–30 sec)", "Russian Twists (2x12)"],
  "10:30 AM": ["Bench Press (3x8–10)", "Bent-Over Rows (3x8–10)"],
  "12:30 PM": ["Squats (3x8–10)", "Lunges (3x8/leg)"],
  "2:30 PM": ["Overhead Press (3x10–12)", "Bicep Curls (3x10–12)"],
  "4:30 PM": ["Deadlifts (3x8)", "Sit-ups (3x10–12)"],
  "6:30 PM": ["Barbell Complex (3x6)", "Barbell Complex (3x6)"],
  "8:00 PM": ["Hip Openers (20–30 sec)", "Shoulder Rolls (20–30 sec)"]
};

let currentUser = null;
let workoutData = {};

// Get week start date (Monday)
function getWeekStart() {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split('T')[0];
}

// Check authentication status
async function checkAuth() {
  try {
    const response = await fetch('/api/auth/me');
    if (response.ok) {
      const data = await response.json();
      currentUser = data.user;
      return true;
    }
  } catch (err) {
    console.error('Auth check failed:', err);
  }
  return false;
}

// Initialize OAuth login
function initOAuth() {
  const baseUrl = window.APP_CONFIG?.baseUrl || window.location.origin;
  const googleClientId = window.APP_CONFIG?.googleClientId;
  const microsoftClientId = window.APP_CONFIG?.microsoftClientId;
  
  // Validate configuration
  if (!googleClientId || !microsoftClientId) {
    console.error('OAuth client IDs not configured. Please set APP_CONFIG in index.html');
    const errorMessage = document.getElementById('error-message');
    if (errorMessage) {
      errorMessage.textContent = 'Application not configured. Please contact the administrator.';
      errorMessage.style.display = 'block';
    }
    return;
  }
  
  document.getElementById('google-login').addEventListener('click', () => {
    const redirectUri = `${baseUrl}/api/oauth/google/callback`;
    const scope = 'openid email profile';
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${googleClientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(scope)}&` +
      `access_type=offline&` +
      `prompt=consent`;
    
    window.location.href = authUrl;
  });
  
  document.getElementById('microsoft-login').addEventListener('click', () => {
    const redirectUri = `${baseUrl}/api/oauth/microsoft/callback`;
    const scope = 'openid email profile User.Read';
    const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
      `client_id=${microsoftClientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(scope)}&` +
      `response_mode=query`;
    
    window.location.href = authUrl;
  });
  
  // Check for OAuth errors in URL
  const urlParams = new URLSearchParams(window.location.search);
  const error = urlParams.get('error');
  if (error) {
    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = 'Login failed. Please try again.';
    errorMessage.style.display = 'block';
    // Clean URL
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}

// Logout
async function logout() {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.reload();
  } catch (err) {
    console.error('Logout failed:', err);
  }
}

// Load workouts from API
async function loadWorkouts() {
  try {
    const weekStart = getWeekStart();
    const response = await fetch(`/api/workouts?week_start=${weekStart}`);
    if (response.ok) {
      const data = await response.json();
      workoutData = {};
      data.workouts.forEach(workout => {
        const key = `${workout.day}-${workout.time}`;
        workoutData[key] = workout.completed === 1;
      });
    }
  } catch (err) {
    console.error('Failed to load workouts:', err);
  }
}

// Save workout to API
async function saveWorkout(day, time, exercise, completed) {
  try {
    const weekStart = getWeekStart();
    await fetch('/api/workouts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        day,
        time,
        exercise,
        completed,
        week_start: weekStart
      })
    });
  } catch (err) {
    console.error('Failed to save workout:', err);
  }
}

// Build table
function buildTable() {
  const table = document.getElementById("workout-table");
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  let html = `<tr><th>Time</th>${days.map(day => `<th>${day}</th>`).join("")}</tr>`;

  for (const [time, exercises] of Object.entries(workouts)) {
    let row = `<tr><td>${time}</td>`;
    days.forEach(day => {
      const key = `${day}-${time}`;
      const isChecked = workoutData[key] || false;
      row += `<td><input type="checkbox" ${isChecked ? 'checked' : ''} data-day="${day}" data-time="${time}" data-exercise="${exercises[0]}"> ${exercises[0]}</td>`;
    });
    row += `</tr>`;
    html += row;
  }
  
  table.innerHTML = html;
  
  document.querySelectorAll("input[type='checkbox']").forEach(cb => {
    cb.addEventListener("change", async (e) => {
      const checkbox = e.target;
      const day = checkbox.dataset.day;
      const time = checkbox.dataset.time;
      const exercise = checkbox.dataset.exercise;
      const completed = checkbox.checked;
      
      // Update local data
      const key = `${day}-${time}`;
      workoutData[key] = completed;
      
      // Save to API
      await saveWorkout(day, time, exercise, completed);
      
      // Update progress bar
      updateProgressBar();
    });
  });
  
  updateProgressBar();
}

// Update progress bar
function updateProgressBar() {
  const checkboxes = document.querySelectorAll("input[type='checkbox']");
  const completed = Array.from(checkboxes).filter(cb => cb.checked).length;
  const total = checkboxes.length;
  const percent = Math.round((completed / total) * 100);
  document.getElementById("progress").style.width = `${percent}%`;
  document.getElementById("progress-text").textContent = `${percent}% done`;
}

// Reset week
async function resetWeek() {
  if (!confirm('Are you sure you want to reset all workouts for this week?')) {
    return;
  }
  
  try {
    const weekStart = getWeekStart();
    await fetch(`/api/workouts?week_start=${weekStart}`, {
      method: 'DELETE'
    });
    
    // Clear local data
    workoutData = {};
    
    // Rebuild table
    buildTable();
  } catch (err) {
    console.error('Failed to reset week:', err);
    alert('Failed to reset week. Please try again.');
  }
}

// Show user info
function displayUserInfo() {
  if (currentUser) {
    document.getElementById('user-name').textContent = currentUser.name || currentUser.email;
    
    if (currentUser.picture) {
      const avatar = document.getElementById('user-avatar');
      avatar.src = currentUser.picture;
      avatar.alt = currentUser.name || 'User';
      avatar.style.display = 'inline-block';
    }
  }
}

// Initialize app
async function init() {
  const isAuthenticated = await checkAuth();
  
  if (isAuthenticated) {
    // Show app
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app-screen').style.display = 'block';
    
    displayUserInfo();
    await loadWorkouts();
    buildTable();
    
    document.getElementById('reset-button').addEventListener('click', resetWeek);
    document.getElementById('logout-button').addEventListener('click', logout);
  } else {
    // Show login
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('app-screen').style.display = 'none';
    
    initOAuth();
  }
}

// Start the app
init();
