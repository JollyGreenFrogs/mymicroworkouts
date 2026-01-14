# Deployment Guide

This guide provides step-by-step instructions for deploying My Micro Workouts to Cloudflare.

## Prerequisites Checklist

- [ ] Cloudflare account created
- [ ] Wrangler CLI installed (`npm install -g wrangler`)
- [ ] Wrangler authenticated (`wrangler login`)
- [ ] Google OAuth app created and configured
- [ ] Microsoft OAuth app created and configured
- [ ] Repository cloned locally

## Step 1: Initial Setup

### 1.1 Install Dependencies

```bash
cd mymicroworkouts
npm install
```

### 1.2 Authenticate with Cloudflare

```bash
wrangler login
```

This will open a browser window for authentication.

## Step 2: Create D1 Database

### 2.1 Create the Database

```bash
wrangler d1 create mymicroworkouts-db
```

You'll see output like:

```
✅ Successfully created DB 'mymicroworkouts-db'

[[d1_databases]]
binding = "DB"
database_name = "mymicroworkouts-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### 2.2 Update wrangler.toml

Copy the `database_id` from the output and update `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "mymicroworkouts-db"
database_id = "paste-your-database-id-here"  # ← Update this
```

### 2.3 Run Database Migration

```bash
wrangler d1 execute mymicroworkouts-db --file=./db/schema.sql
```

Verify the migration succeeded:

```bash
wrangler d1 execute mymicroworkouts-db --command="SELECT name FROM sqlite_master WHERE type='table'"
```

You should see: `users`, `oauth_accounts`, `sessions`, `workouts`

## Step 3: Configure OAuth Applications

### 3.1 Google OAuth

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create/select project
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - **Authorized redirect URIs**: `https://your-app-name.pages.dev/api/oauth/google/callback`
5. Save Client ID and Client Secret

### 3.2 Microsoft OAuth

1. Visit [Azure Portal](https://portal.azure.com/)
2. Go to Azure Active Directory → App registrations
3. Create new registration:
   - **Redirect URI**: `https://your-app-name.pages.dev/api/oauth/microsoft/callback`
4. Create client secret under Certificates & secrets
5. Save Application ID and Client Secret

**Note**: You'll update these URIs after first deployment when you know your actual Pages URL.

## Step 4: First Deployment

### 4.1 Deploy to Cloudflare Pages

```bash
wrangler pages deploy public
```

On first run, you'll be prompted:

```
? Enter the name of your new project: › mymicroworkouts
? Enter the production branch name: › main
```

After deployment completes, note your deployment URL:

```
✨ Deployment complete! Take a peek over at https://mymicroworkouts.pages.dev
```

### 4.2 Bind D1 Database to Pages

```bash
wrangler pages project create mymicroworkouts
```

Then in the Cloudflare dashboard:
1. Go to **Pages** → **mymicroworkouts** → **Settings** → **Functions**
2. Add D1 database binding:
   - Variable name: `DB`
   - D1 database: `mymicroworkouts-db`

## Step 5: Configure Environment Variables

### 5.1 Set Production Secrets

In Cloudflare dashboard (Pages → mymicroworkouts → Settings → Environment variables):

Add these variables for **Production** environment:

| Variable Name | Value | Example |
|--------------|-------|---------|
| `GOOGLE_CLIENT_ID` | From Google Console | `123456789.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | From Google Console | `GOCSPX-xxxxx` |
| `MICROSOFT_CLIENT_ID` | From Azure Portal | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |
| `MICROSOFT_CLIENT_SECRET` | From Azure Portal | `xxx~xxxxxxxxxxxx` |
| `SESSION_SECRET` | Random 64-char string | Generate with: `openssl rand -hex 32` |
| `BASE_URL` | Your Pages URL | `https://mymicroworkouts.pages.dev` |

**Important**: Mark all secrets as "Encrypt" in the dashboard!

### 5.2 Generate Session Secret

```bash
openssl rand -hex 32
```

Copy the output and use it as `SESSION_SECRET`.

## Step 6: Update OAuth Redirect URIs

Now that you have your production URL, update your OAuth apps:

### 6.1 Update Google OAuth App

1. Go to Google Cloud Console → Credentials
2. Edit your OAuth 2.0 Client ID
3. Add to **Authorized redirect URIs**:
   - `https://mymicroworkouts.pages.dev/api/oauth/google/callback`
4. Save

### 6.2 Update Microsoft OAuth App

1. Go to Azure Portal → App registrations
2. Select your app → Authentication
3. Add **Redirect URI**:
   - `https://mymicroworkouts.pages.dev/api/oauth/microsoft/callback`
4. Save

## Step 7: Update Frontend Configuration

Edit `public/index.html` and update the `APP_CONFIG` object:

```javascript
window.APP_CONFIG = {
  googleClientId: 'your-actual-google-client-id',
  microsoftClientId: 'your-actual-microsoft-client-id',
  baseUrl: window.location.origin
};
```

Commit and redeploy:

```bash
git add public/index.html
git commit -m "Update OAuth client IDs for production"
wrangler pages deploy public
```

## Step 8: Test Deployment

### 8.1 Test OAuth Login

1. Visit `https://mymicroworkouts.pages.dev`
2. Click "Sign in with Google" or "Sign in with Microsoft"
3. Complete OAuth flow
4. Verify you're redirected back and logged in

### 8.2 Test Workout Tracking

1. Check/uncheck some workout boxes
2. Refresh page - progress should persist
3. Click "Reset Week" and confirm workouts clear
4. Test logout

### 8.3 Verify Database

```bash
wrangler d1 execute mymicroworkouts-db --command="SELECT COUNT(*) as user_count FROM users"
wrangler d1 execute mymicroworkouts-db --command="SELECT COUNT(*) as workout_count FROM workouts"
```

## Step 9: Set Up Custom Domain (Optional)

### 9.1 Add Custom Domain

1. In Cloudflare dashboard: Pages → mymicroworkouts → Custom domains
2. Click "Set up a custom domain"
3. Enter your domain (e.g., `workouts.yourdomain.com`)
4. Follow DNS setup instructions

### 9.2 Update Environment Variables

Update `BASE_URL` to your custom domain:

```
BASE_URL=https://workouts.yourdomain.com
```

### 9.3 Update OAuth Redirect URIs

Add custom domain redirect URIs to both Google and Microsoft OAuth apps.

## Step 10: Enable CI/CD (Optional)

### 10.1 Connect GitHub Repository

1. In Cloudflare dashboard: Pages → mymicroworkouts → Settings → Builds & deployments
2. Click "Connect to Git"
3. Authorize Cloudflare to access your repository
4. Select the repository

### 10.2 Configure Build Settings

- **Build command**: `npm run build` (if using TypeScript compilation)
- **Build output directory**: `public`
- **Root directory**: `/`

Now every push to `main` will trigger automatic deployment!

## Rollback Procedure

If something goes wrong:

### Quick Rollback

1. Go to Pages → mymicroworkouts → Deployments
2. Find the last working deployment
3. Click "..." → "Rollback to this deployment"

### Manual Redeploy

```bash
git revert HEAD
git push origin main
```

Or redeploy a specific commit:

```bash
git checkout <commit-hash>
wrangler pages deploy public
```

## Monitoring and Logs

### View Deployment Logs

1. Cloudflare dashboard → Pages → mymicroworkouts
2. Click on a deployment to see build logs

### View Function Logs (Real-time)

```bash
wrangler pages deployment tail
```

### Check Database Health

```bash
# Count records
wrangler d1 execute mymicroworkouts-db --command="SELECT 
  (SELECT COUNT(*) FROM users) as users,
  (SELECT COUNT(*) FROM sessions) as sessions,
  (SELECT COUNT(*) FROM workouts) as workouts"
```

## Troubleshooting Deployment

### Issue: "D1 binding not found"

**Solution**: Ensure D1 database is bound in Pages settings:
- Pages → Settings → Functions → D1 database bindings

### Issue: OAuth redirect fails

**Solution**: 
1. Check redirect URIs match exactly in OAuth apps
2. Verify `BASE_URL` environment variable is correct
3. Ensure no trailing slashes in URLs

### Issue: Environment variables not working

**Solution**:
1. Check variables are set for "Production" environment
2. Trigger a new deployment (env vars require redeploy)
3. Verify variable names match exactly (case-sensitive)

### Issue: Database migration failed

**Solution**:
```bash
# Check if tables exist
wrangler d1 execute mymicroworkouts-db --command="SELECT name FROM sqlite_master WHERE type='table'"

# If empty, re-run migration
wrangler d1 execute mymicroworkouts-db --file=./db/schema.sql
```

## Maintenance

### Regular Tasks

1. **Monitor sessions**: Clean up expired sessions periodically
2. **Backup database**: Export D1 data regularly
3. **Update dependencies**: Keep npm packages up to date
4. **Review logs**: Check for errors or unusual patterns

### Backup Database

```bash
# Export all data
wrangler d1 execute mymicroworkouts-db --command="SELECT * FROM users" > backup-users.json
wrangler d1 execute mymicroworkouts-db --command="SELECT * FROM workouts" > backup-workouts.json
```

## Success Checklist

Deployment is complete when:

- [ ] Database created and migrated
- [ ] Application deployed to Cloudflare Pages
- [ ] Environment variables configured
- [ ] OAuth apps configured with correct redirect URIs
- [ ] Google OAuth login works
- [ ] Microsoft OAuth login works
- [ ] Workouts persist across sessions
- [ ] Reset week functionality works
- [ ] Logout works
- [ ] Custom domain configured (if applicable)
- [ ] CI/CD pipeline set up (if applicable)

## Support Resources

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Cloudflare D1 Docs](https://developers.cloudflare.com/d1/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)
- [Google OAuth Docs](https://developers.google.com/identity/protocols/oauth2)
- [Microsoft OAuth Docs](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow)
