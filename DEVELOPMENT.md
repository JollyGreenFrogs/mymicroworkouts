# Development Setup Guide

This guide walks you through setting up the My Micro Workouts application for local development.

## Quick Start

```bash
# 1. Clone and install
git clone <repository-url>
cd mymicroworkouts
npm install

# 2. Set up environment variables
cp .dev.vars.example .dev.vars
# Edit .dev.vars with your OAuth credentials

# 3. Initialize database (local)
chmod +x scripts/init-db.sh
./scripts/init-db.sh local

# 4. Start development server
npm run dev
```

## Detailed Setup

### 1. Prerequisites

Ensure you have:
- Node.js 18+ installed
- npm installed
- Git installed
- A code editor (VS Code recommended)

### 2. Install Dependencies

```bash
npm install
```

This will install:
- `@cloudflare/workers-types` - TypeScript types for Cloudflare Workers
- `hono` - Web framework (optional, for future use)
- `typescript` - TypeScript compiler
- `wrangler` - Cloudflare development CLI

### 3. Configure OAuth Apps (Development)

#### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project: "My Micro Workouts Dev"
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Name: My Micro Workouts Dev
   - Authorized redirect URIs: `http://localhost:8788/api/oauth/google/callback`
5. Copy Client ID and Client Secret

#### Microsoft OAuth

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to Azure Active Directory → App registrations
3. Create new registration:
   - Name: My Micro Workouts Dev
   - Redirect URI: `http://localhost:8788/api/oauth/microsoft/callback`
4. Create a client secret
5. Copy Application (client) ID and Client Secret

### 4. Configure Environment Variables

Create `.dev.vars` file:

```bash
cp .dev.vars.example .dev.vars
```

Edit `.dev.vars` with your credentials:

```bash
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
SESSION_SECRET=$(openssl rand -hex 32)
BASE_URL=http://localhost:8788
```

**Generate Session Secret:**
```bash
openssl rand -hex 32
```

### 5. Update Frontend OAuth Client IDs

Edit `public/app.js`:

```javascript
// Line ~40-41 (Google)
const clientId = 'your-actual-google-client-id';

// Line ~52-53 (Microsoft)
const clientId = 'your-actual-microsoft-client-id';
```

### 6. Initialize Local Database

```bash
# Make script executable
chmod +x scripts/init-db.sh

# Run initialization
./scripts/init-db.sh local
```

This creates the local D1 database and runs migrations.

### 7. Start Development Server

```bash
npm run dev
```

The application will be available at: `http://localhost:8788`

### 8. Test the Application

1. **Open browser**: Navigate to `http://localhost:8788`
2. **Test Google Login**:
   - Click "Sign in with Google"
   - Authorize the application
   - Verify redirect back to app
3. **Test Microsoft Login**:
   - Click "Sign in with Microsoft"
   - Authorize the application
   - Verify redirect back to app
4. **Test Workout Tracking**:
   - Check some workout boxes
   - Refresh page - verify persistence
   - Click "Reset Week" - verify reset works
5. **Test Logout**:
   - Click "Logout"
   - Verify redirect to login screen

## Development Workflow

### File Structure

```
mymicroworkouts/
├── db/                          # Database schemas
│   └── schema.sql               # D1 migration
├── functions/                   # Cloudflare Pages Functions
│   └── api/                     # API endpoints
│       ├── auth/                # Authentication endpoints
│       ├── oauth/               # OAuth callbacks
│       └── workouts/            # Workout CRUD
├── public/                      # Static frontend files
│   ├── index.html               # Main HTML
│   ├── app.js                   # Client-side JavaScript
│   └── styles.css               # Styles
├── src/                         # Shared TypeScript code
│   └── auth.ts                  # Auth utilities
├── scripts/                     # Utility scripts
│   └── init-db.sh               # Database initialization
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript config
└── wrangler.toml                # Cloudflare config
```

### Making Changes

1. **Edit Code**: Make changes to TypeScript or JavaScript files
2. **Build**: Run `npm run build` to compile TypeScript
3. **Test**: The dev server auto-reloads on changes
4. **Commit**: Use git to commit changes

### Common Development Tasks

#### View Database Contents

```bash
# List tables
wrangler d1 execute mymicroworkouts-db --local --command="SELECT name FROM sqlite_master WHERE type='table'"

# View users
wrangler d1 execute mymicroworkouts-db --local --command="SELECT * FROM users"

# View workouts
wrangler d1 execute mymicroworkouts-db --local --command="SELECT * FROM workouts"

# Count records
wrangler d1 execute mymicroworkouts-db --local --command="SELECT 
  (SELECT COUNT(*) FROM users) as users,
  (SELECT COUNT(*) FROM sessions) as sessions,
  (SELECT COUNT(*) FROM workouts) as workouts"
```

#### Clear Database

```bash
# Delete all data (keeps schema)
wrangler d1 execute mymicroworkouts-db --local --command="
  DELETE FROM workouts;
  DELETE FROM sessions;
  DELETE FROM oauth_accounts;
  DELETE FROM users;
"

# Or reset completely
rm -rf .wrangler/state
./scripts/init-db.sh local
```

#### Debug API Requests

Use browser DevTools:
1. Open DevTools (F12)
2. Go to Network tab
3. Perform actions in the app
4. Inspect API requests/responses

#### View Server Logs

The development server shows logs in the terminal where you ran `npm run dev`.

## Troubleshooting

### Port Already in Use

If port 8788 is in use:
```bash
# Find process using port
lsof -i :8788

# Kill process
kill -9 <PID>

# Or use a different port
wrangler pages dev public --port 8789
```

### OAuth "redirect_uri_mismatch"

- Ensure redirect URI in OAuth app matches exactly: `http://localhost:8788/api/oauth/google/callback`
- Check for typos, trailing slashes
- Verify you're using the correct OAuth app (dev vs prod)

### Database Not Found

```bash
# Re-initialize database
./scripts/init-db.sh local

# Check if .wrangler directory exists
ls -la .wrangler/
```

### Session Not Persisting

- Check browser console for errors
- Verify cookies are enabled
- Check that `BASE_URL` in `.dev.vars` is correct
- Clear browser cookies and try again

### TypeScript Errors

```bash
# Rebuild TypeScript
npm run build

# Check for syntax errors
npx tsc --noEmit
```

### Dependencies Issues

```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for vulnerabilities
npm audit
```

## Testing Checklist

Before submitting code, verify:

- [ ] TypeScript builds without errors (`npm run build`)
- [ ] No npm audit critical vulnerabilities
- [ ] Google OAuth login works
- [ ] Microsoft OAuth login works
- [ ] Workouts persist across page refresh
- [ ] Reset week clears all workouts
- [ ] Logout works
- [ ] Database queries work
- [ ] No console errors in browser
- [ ] Code follows existing style

## Code Style

- Use TypeScript for new backend code
- Use vanilla JavaScript for frontend (no frameworks)
- Follow existing naming conventions
- Add comments for complex logic
- Use prepared statements for all database queries
- Validate all user inputs

## Additional Resources

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Cloudflare D1 Docs](https://developers.cloudflare.com/d1/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## Getting Help

If you encounter issues:

1. Check this guide's troubleshooting section
2. Review error messages carefully
3. Check browser console and server logs
4. Search GitHub issues
5. Ask in project discussions

## Next Steps

Once development is working:

1. Read [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment
2. Review [SECURITY.md](./SECURITY.md) for security best practices
3. Check [README.md](./README.md) for project overview
