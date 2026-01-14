# My Micro Workouts

A production-ready workout tracking web application deployed on Cloudflare infrastructure with OAuth authentication, D1 database persistence, and serverless API.

## Overview

**My Micro Workouts** helps users track their daily workout progress throughout the week. The application features:
- ✅ Google and Microsoft OAuth authentication
- ✅ Cloudflare D1 database for persistent storage
- ✅ Cloudflare Pages Functions for serverless API
- ✅ Secure session management
- ✅ Weekly workout tracking with progress visualization

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Cloudflare Edge                         │
│                                                              │
│  ┌──────────────┐         ┌──────────────┐                 │
│  │   Static     │         │    Pages     │                 │
│  │   Frontend   │────────▶│   Functions  │                 │
│  │  (HTML/CSS)  │         │     (API)    │                 │
│  └──────────────┘         └───────┬──────┘                 │
│                                    │                         │
│                                    ▼                         │
│                           ┌─────────────┐                   │
│                           │  D1 Database │                   │
│                           │   (SQLite)   │                   │
│                           └─────────────┘                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
         │                              │
         │ OAuth Flow                   │
         ▼                              ▼
┌──────────────────┐          ┌──────────────────┐
│  Google OAuth    │          │ Microsoft OAuth  │
│  (Gmail)         │          │  (Outlook)       │
└──────────────────┘          └──────────────────┘
```

## Tech Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Cloudflare Pages Functions (TypeScript)
- **Database**: Cloudflare D1 (SQLite)
- **Authentication**: OAuth 2.0 (Google & Microsoft)
- **Deployment**: Cloudflare Pages
- **Development**: Wrangler CLI, TypeScript

## Prerequisites

- Node.js 18+ and npm
- Cloudflare account
- Google Cloud Console account (for OAuth)
- Microsoft Azure account (for OAuth)
- Wrangler CLI (`npm install -g wrangler`)

## Local Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up OAuth Applications

#### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure OAuth consent screen
6. Create OAuth client ID:
   - Application type: **Web application**
   - Authorized redirect URIs: 
     - `http://localhost:8788/api/oauth/google/callback` (development)
     - `https://your-domain.pages.dev/api/oauth/google/callback` (production)
7. Note your **Client ID** and **Client Secret**

#### Microsoft OAuth Setup

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to **Azure Active Directory** → **App registrations**
3. Click **New registration**
4. Configure:
   - Name: My Micro Workouts
   - Supported account types: **Accounts in any organizational directory and personal Microsoft accounts**
   - Redirect URI: 
     - `http://localhost:8788/api/oauth/microsoft/callback` (development)
     - `https://your-domain.pages.dev/api/oauth/microsoft/callback` (production)
5. After registration, go to **Certificates & secrets** → Create new client secret
6. Note your **Application (client) ID** and **Client Secret**

### 3. Configure Environment Variables

Create a `.dev.vars` file in the root directory (for local development):

```bash
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
SESSION_SECRET=your-random-secure-string
BASE_URL=http://localhost:8788
```

**Important**: Never commit `.dev.vars` to version control!

### 4. Update OAuth Client IDs in Frontend

Edit `public/index.html` and update the `APP_CONFIG` object:

```javascript
window.APP_CONFIG = {
  googleClientId: 'your-actual-google-client-id',
  microsoftClientId: 'your-actual-microsoft-client-id',
  baseUrl: window.location.origin
};
```

### 5. Create D1 Database

```bash
# Create D1 database
wrangler d1 create mymicroworkouts-db

# Note the database_id from output and update wrangler.toml
```

Update `wrangler.toml` with your database ID:

```toml
[[d1_databases]]
binding = "DB"
database_name = "mymicroworkouts-db"
database_id = "your-database-id-here"
```

### 6. Run Database Migrations

```bash
# For local development
npm run db:migrate:local

# For production
npm run db:migrate
```

### 7. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:8788`

## Production Deployment

### 1. Deploy to Cloudflare Pages

```bash
# First deployment
npm run deploy

# The CLI will prompt you to create a new project
# Follow the prompts and note your deployment URL
```

### 2. Configure Production Environment Variables

In the Cloudflare dashboard:

1. Go to **Pages** → Your project → **Settings** → **Environment variables**
2. Add the following variables for **Production**:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `MICROSOFT_CLIENT_ID`
   - `MICROSOFT_CLIENT_SECRET`
   - `SESSION_SECRET` (generate a secure random string)
   - `BASE_URL` (your production URL, e.g., `https://your-app.pages.dev`)

### 3. Update OAuth Redirect URIs

Update both Google and Microsoft OAuth applications with your production redirect URIs:
- Google: `https://your-app.pages.dev/api/oauth/google/callback`
- Microsoft: `https://your-app.pages.dev/api/oauth/microsoft/callback`

### 4. Update Frontend OAuth URLs

Update `public/app.js` to use the production client IDs, or better yet, make them configurable via environment variables injected at build time.

### 5. Run Production Migrations

```bash
npm run db:migrate
```

## Database Schema

The application uses four main tables:

### Users
- `id`: UUID primary key
- `email`: Unique user email
- `name`: User's display name
- `picture`: Profile picture URL
- `created_at`, `updated_at`: Timestamps

### OAuth Accounts
- Links users to OAuth providers (Google/Microsoft)
- Stores provider-specific user IDs

### Sessions
- `id`: Session token (secure random string)
- `user_id`: Reference to user
- `expires_at`: Session expiration (30 days)

### Workouts
- `id`: UUID primary key
- `user_id`: Reference to user
- `day`: Day of week (Monday-Friday)
- `time`: Time slot (e.g., "9:00 AM")
- `exercise`: Exercise name
- `completed`: Boolean (0/1)
- `week_start`: Week start date (Monday)

## API Endpoints

### Authentication
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/logout` - Logout and delete session

### OAuth
- `GET /api/oauth/google/callback` - Google OAuth callback
- `GET /api/oauth/microsoft/callback` - Microsoft OAuth callback

### Workouts
- `GET /api/workouts?week_start=YYYY-MM-DD` - Get workouts for week
- `POST /api/workouts` - Create or update workout
- `DELETE /api/workouts?week_start=YYYY-MM-DD` - Reset week's workouts

## Security Best Practices

✅ **Implemented:**
- HTTPS-only in production
- HttpOnly, Secure cookies for sessions
- OAuth secrets never exposed to client
- CSRF protection via SameSite cookies
- Input validation on all API endpoints
- SQL injection prevention via prepared statements
- Session expiration (30 days)

## Known Limitations

### Cloudflare D1 Considerations
- **Eventual consistency**: D1 is eventually consistent, not strongly consistent
- **Query limits**: Maximum 1000 rows per query result
- **Concurrency**: Limited write throughput compared to traditional databases
- **No transactions**: D1 doesn't support multi-statement transactions yet

For this use case (personal workout tracking), these limitations are acceptable.

## Troubleshooting

### OAuth Fails with "redirect_uri_mismatch"
- Ensure redirect URIs in OAuth apps match exactly (including http/https)
- Check for trailing slashes

### Database Errors
- Verify migrations ran successfully
- Check D1 binding name in `wrangler.toml` matches code

### Session Not Persisting
- Ensure cookies are enabled
- Check that `BASE_URL` environment variable is correct
- Verify HTTPS in production

## Development Commands

```bash
npm run dev              # Start development server
npm run build            # Build TypeScript
npm run deploy           # Deploy to Cloudflare Pages
npm run db:migrate       # Run migrations (production)
npm run db:migrate:local # Run migrations (local)
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Submit a pull request

## License

MIT
