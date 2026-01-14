-- D1 Database Schema for My Micro Workouts
-- Compatible with Cloudflare D1 (SQLite)

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, -- UUID v4
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  picture TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- OAuth accounts table (supports multiple OAuth providers per user)
CREATE TABLE IF NOT EXISTS oauth_accounts (
  id TEXT PRIMARY KEY, -- UUID v4
  user_id TEXT NOT NULL,
  provider TEXT NOT NULL, -- 'google' or 'microsoft'
  provider_user_id TEXT NOT NULL, -- ID from OAuth provider
  email TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(provider, provider_user_id)
);

CREATE INDEX IF NOT EXISTS idx_oauth_accounts_user_id ON oauth_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_oauth_accounts_provider ON oauth_accounts(provider, provider_user_id);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY, -- Session token (random secure string)
  user_id TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- Workouts table
CREATE TABLE IF NOT EXISTS workouts (
  id TEXT PRIMARY KEY, -- UUID v4
  user_id TEXT NOT NULL,
  day TEXT NOT NULL, -- e.g., 'Monday', 'Tuesday', etc.
  time TEXT NOT NULL, -- e.g., '9:00 AM'
  exercise TEXT NOT NULL, -- Exercise name
  completed INTEGER NOT NULL DEFAULT 0, -- 0 or 1 (boolean)
  week_start TEXT NOT NULL, -- ISO date string (YYYY-MM-DD) for start of week
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_workouts_user_id ON workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_workouts_week ON workouts(user_id, week_start);
CREATE UNIQUE INDEX IF NOT EXISTS idx_workouts_unique ON workouts(user_id, day, time, week_start);

-- Trigger to update updated_at timestamp on users
CREATE TRIGGER IF NOT EXISTS update_users_timestamp 
AFTER UPDATE ON users
BEGIN
  UPDATE users SET updated_at = unixepoch() WHERE id = NEW.id;
END;

-- Trigger to update updated_at timestamp on workouts
CREATE TRIGGER IF NOT EXISTS update_workouts_timestamp 
AFTER UPDATE ON workouts
BEGIN
  UPDATE workouts SET updated_at = unixepoch() WHERE id = NEW.id;
END;
