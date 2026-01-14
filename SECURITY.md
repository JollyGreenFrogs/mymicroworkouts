# Security Guide

This document outlines the security measures implemented in My Micro Workouts and best practices for maintaining a secure deployment.

## Security Features

### 1. Authentication & Authorization

#### OAuth 2.0 Implementation
- ✅ Industry-standard OAuth 2.0 flow
- ✅ Support for Google and Microsoft identity providers
- ✅ Secure authorization code exchange
- ✅ No password storage (delegated to OAuth providers)

#### Session Management
- ✅ Cryptographically secure session tokens (48 bytes random)
- ✅ HttpOnly cookies (not accessible via JavaScript)
- ✅ Secure flag (HTTPS-only in production)
- ✅ SameSite=Lax (CSRF protection)
- ✅ 30-day expiration
- ✅ Server-side session validation

### 2. Data Protection

#### Database Security
- ✅ Prepared statements (SQL injection prevention)
- ✅ Input validation on all endpoints
- ✅ User data isolation (all queries filtered by user_id)
- ✅ Foreign key constraints
- ✅ Minimal data collection (email, name, picture only)

#### Secrets Management
- ✅ No secrets in source code
- ✅ Environment variables for all sensitive data
- ✅ Separate dev/prod configurations
- ✅ `.gitignore` excludes `.dev.vars`

### 3. Network Security

#### Transport Security
- ✅ HTTPS enforced in production (Cloudflare)
- ✅ Secure cookie transmission
- ✅ TLS 1.2+ for all external API calls

#### CORS & Headers
- ✅ SameSite cookies prevent CSRF
- ✅ Single-origin application (no CORS needed)

### 4. API Security

#### Endpoint Protection
- ✅ All workout endpoints require authentication
- ✅ Session validation on every request
- ✅ User isolation (can't access other users' data)
- ✅ Input validation and sanitization
- ✅ Proper HTTP status codes

#### Rate Limiting
- ⚠️ Cloudflare provides DDoS protection
- ⚠️ Consider adding explicit rate limiting for production

## Security Best Practices

### For Developers

#### Never Commit Secrets
```bash
# Before committing, always check:
git diff --staged

# Ensure .dev.vars is in .gitignore
cat .gitignore | grep .dev.vars
```

#### Rotate Secrets Regularly
1. Generate new session secret every 90 days
2. Update OAuth client secrets annually
3. Immediately rotate if compromised

#### Validate All Inputs
```typescript
// Example: Always validate user input
if (!day || !time || !exercise) {
  return new Response(JSON.stringify({ error: 'Invalid input' }), {
    status: 400
  });
}
```

#### Use Prepared Statements
```typescript
// ✅ GOOD: Prepared statement
await db.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first();

// ❌ BAD: String concatenation (SQL injection risk)
await db.prepare(`SELECT * FROM users WHERE id = '${userId}'`).first();
```

### For Deployment

#### Environment Variables Checklist
- [ ] All secrets set in Cloudflare dashboard
- [ ] `SESSION_SECRET` is cryptographically random (64+ chars)
- [ ] `BASE_URL` matches actual deployment URL
- [ ] OAuth secrets marked as encrypted
- [ ] No secrets in source control

#### OAuth Configuration Checklist
- [ ] Redirect URIs use HTTPS (production)
- [ ] Redirect URIs match exactly (no trailing slashes)
- [ ] OAuth apps restricted to necessary scopes
- [ ] Client secrets stored securely
- [ ] Regular audit of authorized users

#### Database Security Checklist
- [ ] D1 binding configured correctly
- [ ] Migrations run successfully
- [ ] No public endpoints to database
- [ ] Foreign key constraints in place
- [ ] Regular backups configured

## Threat Model

### Protected Against

| Threat | Mitigation |
|--------|-----------|
| SQL Injection | Prepared statements |
| XSS | No user-generated HTML, input validation |
| CSRF | SameSite cookies |
| Session Hijacking | HttpOnly, Secure cookies |
| Password Breaches | No passwords (OAuth only) |
| Data Leakage | User isolation in queries |
| MITM Attacks | HTTPS enforcement |

### Known Limitations

| Limitation | Impact | Mitigation |
|-----------|--------|-----------|
| No rate limiting | Potential API abuse | Cloudflare DDoS protection |
| No 2FA | Account security | OAuth providers offer 2FA |
| Session fixation | Low risk | Session regeneration on login |
| No audit logging | Limited forensics | Add logging if needed |

## Security Incident Response

### If OAuth Credentials Compromised

1. **Immediate Actions**:
   ```bash
   # Revoke compromised credentials in OAuth provider
   # Generate new credentials
   # Update Cloudflare environment variables
   ```

2. **Update Configuration**:
   - Cloudflare dashboard → Environment variables
   - Replace `GOOGLE_CLIENT_SECRET` or `MICROSOFT_CLIENT_SECRET`
   - Trigger new deployment

3. **Notify Users**:
   - Force logout all sessions
   - Notify users to re-authenticate

### If Session Secret Compromised

1. **Generate New Secret**:
   ```bash
   openssl rand -hex 32
   ```

2. **Update Environment**:
   - Cloudflare dashboard → Update `SESSION_SECRET`
   - Redeploy application

3. **Invalidate Sessions**:
   ```bash
   # Clear all sessions in database
   wrangler d1 execute mymicroworkouts-db --command="DELETE FROM sessions"
   ```

### If Database Breach Suspected

1. **Assess Impact**:
   - Check Cloudflare logs
   - Review recent database queries
   - Identify affected users

2. **Contain**:
   - Temporarily disable application if needed
   - Clear potentially compromised sessions

3. **Investigate**:
   - Review application logs
   - Check for SQL injection attempts
   - Audit all API endpoints

4. **Recover**:
   - Restore from backup if necessary
   - Force password reset (OAuth re-authentication)
   - Update security measures

## Compliance

### Data Privacy

#### GDPR Compliance
- ✅ Minimal data collection
- ✅ Clear data purpose (workout tracking)
- ⚠️ Add privacy policy (recommended)
- ⚠️ Implement data export (optional)
- ⚠️ Implement right to deletion (optional)

#### Data Retention
- Sessions: 30 days (auto-expire)
- User data: Retained until account deletion
- Workouts: Retained indefinitely (user-controlled)

### OAuth Provider Policies

#### Google OAuth
- Must comply with Google API Services User Data Policy
- Scopes limited to: email, profile
- No data sharing with third parties

#### Microsoft OAuth
- Must comply with Microsoft Identity Platform terms
- Scopes limited to: User.Read
- No data sharing with third parties

## Security Audit Checklist

Run this checklist quarterly:

### Code Security
- [ ] All dependencies up to date (`npm audit`)
- [ ] No hardcoded secrets in code
- [ ] All inputs validated
- [ ] All database queries use prepared statements
- [ ] Error messages don't leak sensitive info

### Configuration Security
- [ ] HTTPS enforced everywhere
- [ ] Cookies have correct flags
- [ ] OAuth redirect URIs correct
- [ ] Environment variables set correctly
- [ ] Database backups working

### Operational Security
- [ ] Access logs reviewed
- [ ] No suspicious login patterns
- [ ] Session cleanup working
- [ ] OAuth apps reviewed
- [ ] Team access audited

### Dependency Security
```bash
# Check for vulnerabilities
npm audit

# Update dependencies
npm update

# Check for outdated packages
npm outdated
```

## Reporting Security Issues

If you discover a security vulnerability:

1. **Do NOT** open a public GitHub issue
2. Email security contact (set up a security@yourdomain.com)
3. Include:
   - Description of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

4. Allow 90 days for response before public disclosure

## Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OAuth 2.0 Security Best Practices](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics)
- [Cloudflare Security](https://www.cloudflare.com/security/)
- [Google OAuth Security](https://developers.google.com/identity/protocols/oauth2/web-server#security-considerations)
- [Microsoft Identity Platform Security](https://docs.microsoft.com/en-us/azure/active-directory/develop/security-best-practices)

## Security Updates

| Date | Update | Impact |
|------|--------|--------|
| 2026-01-14 | Initial security implementation | All features |

---

**Last Updated**: 2026-01-14
**Next Review**: 2026-04-14
