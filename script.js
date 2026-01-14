// Workout data
const workouts = {
  "9:00 AM": ["Plank (2x20–30 sec)", "Russian Twists (2x12)"],
  "10:30 AM": ["Bench Press (3x8–10)", "Bent-Over Rows (3x8–10)"],
  "12:30 PM": ["Squats (3x8–10)", "Lunges (3x8/leg)"],
  "2:30 PM": ["Overhead Press (3x10–12)", "Bicep Curls (3x10–12)"],
  "4:30 PM": ["Deadlifts (3x8)", "Sit-ups (3x10–12)"],
  "6:30 PM": ["Barbell Complex (3x6)", "Barbell Complex (3x6)"],
  "8:00 PM": ["Hip Openers (20–30 sec)", "Shoulder Rolls (20–30 sec)"]
};

// Build table
function buildTable() {
  const table = document.getElementById("workout-table");
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  let html = `<tr><th>Time</th>${days.map(day => `<th>${day}</th>`).join("")}</tr>`;

  for (const [time, exercises] of Object.entries(workouts)) {
    let row = `<tr><td>${time}</td>`;
    days.forEach(day => {
      row += `<td><input type="checkbox" data-day="${day}" data-time="${time}" data-exercise="${exercises[0]}"> ${exercises[0]}</td>`;
    });
    row += `</tr>`;
    html += row;
  }
  
  table.innerHTML = html;
  loadProgress();
  document.querySelectorAll("input[type='checkbox']").forEach(cb => {
    cb.addEventListener("change", saveProgress);
  });
}

// Save/load progress
function saveProgress() {
  const checkboxes = document.querySelectorAll("input[type='checkbox']");
  const progress = {};
  checkboxes.forEach(cb => {
    progress[`${cb.dataset.day}-${cb.dataset.time}`] = cb.checked;
  });
  localStorage.setItem("workoutProgress", JSON.stringify(progress));
  updateProgressBar();
}

function loadProgress() {
  let progress = {};
  try {
    progress = JSON.parse(localStorage.getItem("workoutProgress")) || {};
  } catch (e) {
    // If localStorage data is corrupted, start fresh
    localStorage.removeItem("workoutProgress");
  }
  document.querySelectorAll("input[type='checkbox']").forEach(cb => {
    const key = `${cb.dataset.day}-${cb.dataset.time}`;
    cb.checked = progress[key] || false;
  });
  updateProgressBar();
}

function updateProgressBar() {
  const checkboxes = document.querySelectorAll("input[type='checkbox']");
  const completed = Array.from(checkboxes).filter(cb => cb.checked).length;
  const total = checkboxes.length;
  const percent = Math.round((completed / total) * 100);
  document.getElementById("progress").style.width = `${percent}%`;
  document.getElementById("progress-text").textContent = `${percent}% done`;
}

function resetWeek() {
  localStorage.removeItem("workoutProgress");
  loadProgress();
}

// Initialize
buildTable();
document.getElementById("reset-button").addEventListener("click", resetWeek);
