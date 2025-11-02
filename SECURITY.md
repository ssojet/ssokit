# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to: **security@ssojet.com**

You should receive a response within 48 hours. If for some reason you do not, please follow up via email to ensure we received your original message.

Please include the following information:

- Type of issue (e.g. buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

## Security Best Practices

When using SSOJet AuthKit:

### 1. Environment Variables
- **Never** commit `.env` files to version control
- Store secrets in secure environment variable stores (Vercel, AWS Secrets Manager, etc.)
- Use different API keys for development and production

### 2. API Keys
- Keep `SSOJET_API_KEY` server-side only
- Never expose API keys in client-side code
- Rotate keys periodically
- Use scoped keys with minimal permissions

### 3. Webhook Secrets
- Always verify webhook signatures using `verifySignature()`
- Use `SSOJET_WEBHOOK_SECRET` from environment, never hardcode
- Implement request timeout handling
- Log failed verification attempts for monitoring

### 4. Route Handlers
- Implement authentication middleware for all routes
- Verify user has access to requested organizations
- Rate limit API endpoints
- Validate all input data with Zod schemas
- Use HTTPS only in production

Example middleware:

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  // Verify user session
  const session = await getSession(request);
  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // Extract orgId from path
  const pathParts = request.nextUrl.pathname.split('/');
  const orgIdIndex = pathParts.indexOf('orgs') + 1;
  const orgId = pathParts[orgIdIndex];

  // Verify user has access to this org
  if (!await userHasAccessToOrg(session.userId, orgId)) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/authkit/orgs/:path*',
};
```

### 5. SCIM Integration
- Use TLS/HTTPS for SCIM endpoints
- Store `SCIM_TOKEN` securely
- Validate SCIM responses
- Implement retry logic with exponential backoff
- Monitor SCIM operation failures

### 6. Client-Side
- Only pass safe, public config to `AuthKitProvider`
- Never include API keys in frontend bundles
- Validate user permissions before showing UI elements
- Use Content Security Policy (CSP) headers

### 7. Dependencies
- Keep dependencies up to date
- Run `pnpm audit` regularly
- Use `pnpm audit fix` to patch vulnerabilities
- Review dependency changes in pull requests

## Disclosure Policy

When we receive a security bug report, we will:

1. Confirm the problem and determine affected versions
2. Audit code to find similar problems
3. Prepare fixes for all supported versions
4. Release patched versions as soon as possible

## Comments on this Policy

If you have suggestions on how this process could be improved, please submit a pull request or open an issue to discuss.

---

Thank you for helping keep SSOJet AuthKit and our users safe!
