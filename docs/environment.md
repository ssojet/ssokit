# Environment Setup

This guide covers all environment variables required for SSOJet AuthKit.

## Required Variables (Server-Side)

These variables must be set on the server and **should never be exposed to the client**.

### SSOJet API Configuration

```bash
SSOJET_BASE=https://api.ssojet.com
SSOJET_API_KEY=sk_live_xxxxxxxxxxxxx
```

- `SSOJET_BASE`: Base URL for SSOJet API
  - Production: `https://api.ssojet.com`
  - Staging: `https://api.staging.ssojet.com` (if applicable)
  
- `SSOJET_API_KEY`: Your SSOJet API key
  - Get from: [SSOJet Dashboard → API Keys](https://dashboard.ssojet.com/api-keys)
  - Format: `sk_live_*` (production) or `sk_test_*` (development)
  - ⚠️ **Never commit this to version control**

### Webhook Configuration

```bash
SSOJET_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

- `SSOJET_WEBHOOK_SECRET`: Secret for verifying webhook signatures
  - Get from: [SSOJet Dashboard → Webhooks](https://dashboard.ssojet.com/webhooks)
  - Used to verify HMAC signatures on incoming webhooks
  - ⚠️ **Keep this secret**

### SCIM Configuration

```bash
SCIM_BASE_URL=https://scim.your-idp.com/scim/v2
SCIM_TOKEN=Bearer_token_or_api_key
```

- `SCIM_BASE_URL`: Base URL for your SCIM 2.0 service provider
  - Examples:
    - Okta: `https://{your-domain}.okta.com/scim/v2`
    - Azure AD: `https://graph.microsoft.com/v1.0`
    - Custom: Your SCIM endpoint URL
  
- `SCIM_TOKEN`: Authentication token for SCIM API
  - Format depends on your IdP (Bearer token, API key, etc.)
  - ⚠️ **Never commit this to version control**

## Optional Variables (Client-Safe)

These variables can be exposed to the client and should be prefixed with `NEXT_PUBLIC_`.

### UI Configuration

```bash
NEXT_PUBLIC_AUTHKIT_BASE_URL=/api/authkit
NEXT_PUBLIC_AUTHKIT_THEME='{"primary":"#2563eb","radius":"12px"}'
```

- `NEXT_PUBLIC_AUTHKIT_BASE_URL`: Base path for AuthKit API routes
  - Default: `/api/authkit`
  - Change if you mount routes at a different path
  
- `NEXT_PUBLIC_AUTHKIT_THEME`: Default theme configuration
  - Can be a preset name: `"light"`, `"dark"`, `"minimal"`, `"enterprise"`
  - Or a JSON object with theme tokens:
    ```json
    {
      "primary": "#2563eb",
      "radius": "12px",
      "fontSize": "14px"
    }
    ```

## Environment Files

### Development

Create `.env.local`:

```bash
# .env.local (DO NOT COMMIT)

# SSOJet API
SSOJET_BASE=https://api.ssojet.com
SSOJET_API_KEY=sk_test_xxxxxxxxxxxxx

# Webhooks
SSOJET_WEBHOOK_SECRET=whsec_test_xxxxxxxxxxxxx

# SCIM (can use a test/sandbox IdP)
SCIM_BASE_URL=https://scim.test.com/scim/v2
SCIM_TOKEN=test_token_xxxxxxxxxxxxx

# Client-side (optional)
NEXT_PUBLIC_AUTHKIT_THEME=dark
```

### Production

**Recommended**: Use your hosting platform's environment variable management:

- **Vercel**: Project Settings → Environment Variables
- **Netlify**: Site Settings → Build & Deploy → Environment
- **AWS**: Systems Manager Parameter Store or Secrets Manager
- **Railway**: Project → Variables
- **Render**: Environment → Environment Variables

**Security Checklist:**
- ✅ Different API keys for dev/staging/prod
- ✅ Webhook secrets are unique per environment
- ✅ SCIM tokens use least-privilege access
- ✅ `.env.local` is in `.gitignore`
- ✅ Production secrets are rotated regularly

## Validation

AuthKit will validate your configuration on startup and throw helpful errors:

```
ConfigError: Missing required environment variable: SSOJET_API_KEY.
Get your API key from the SSOJet dashboard.
```

If you see this error, check:
1. `.env.local` file exists and is in the project root
2. Variable names are spelled correctly
3. Values don't have trailing spaces or quotes (unless intended)
4. Next.js dev server was restarted after adding env vars

## Testing Configuration

```typescript
// Test that config is loaded correctly
import { 
  readSSOJetServerConfig,
  readScimServerConfig,
  readWebhookServerConfig 
} from '@ssojet/authkit-core/config';

const ssojetConfig = readSSOJetServerConfig();
console.log('SSOJet Base:', ssojetConfig.baseUrl);

const scimConfig = readScimServerConfig();
console.log('SCIM Base:', scimConfig.baseUrl);

const webhookConfig = readWebhookServerConfig();
console.log('Webhook secret length:', webhookConfig.secret.length);
```

## Troubleshooting

### Error: Cannot find module '@ssojet/authkit-core'

```bash
pnpm install
pnpm -r build
```

### Error: process is not defined

- Check that you're only calling config readers server-side
- Don't import config in client components

### Error: Missing environment variable

- Restart Next.js dev server after adding env vars
- Check variable name spelling
- Ensure `.env.local` is in the correct directory

---

**Next Steps:**
- [Setup Route Handlers](./routes.md)
- [Configure Webhooks](./webhooks.md)
- [Customize Theming](./theming.md)
