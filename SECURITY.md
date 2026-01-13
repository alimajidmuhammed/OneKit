# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability within OneKit, please send an email to security@onekit.app. All security vulnerabilities will be promptly addressed.

Please include the following in your report:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

## Security Measures

OneKit implements the following security measures:

### Authentication & Authorization
- Supabase Auth with secure session management
- Row Level Security (RLS) on all database tables
- Role-based access control (RBAC) for admin features
- Middleware-based route protection

### API Security
- Rate limiting on all endpoints
- Authentication required for sensitive operations
- Input validation and sanitization
- CORS origin whitelist

### Data Protection
- All data encrypted in transit (HTTPS)
- Database encryption at rest (Supabase)
- Secure file upload with type validation
- No sensitive data in client-side code

### Headers & Configuration
- X-Frame-Options: DENY (clickjacking protection)
- X-Content-Type-Options: nosniff (MIME sniffing protection)
- Referrer-Policy: strict-origin-when-cross-origin
- X-XSS-Protection: 1; mode=block

### Monitoring
- API request logging
- Security event logging
- Automated dependency scanning (Dependabot)
- Daily automated backups

## Security Updates

Security updates are released as soon as possible after a vulnerability is confirmed. Users are encouraged to:
- Keep dependencies up to date
- Enable Dependabot alerts
- Review security advisories regularly
