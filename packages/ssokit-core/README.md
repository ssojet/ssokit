# @ssojet/authkit-core

Core types, schemas, error classes, and configuration utilities for SSOJet AuthKit.

## Features

- **Zod schemas** for runtime validation of SSOJet APIs, webhook events, and SCIM resources
- **Type-safe configuration readers** with helpful error messages
- **Custom error classes** for different failure scenarios
- **Zero client-side secrets** - server config is never exposed to the browser

## Installation

```bash
pnpm add @ssojet/authkit-core zod
```

## Usage

### Configuration

```typescript
import {
  readSSOJetServerConfig,
  readScimServerConfig,
  readWebhookServerConfig,
  readPublicConfig,
} from '@ssojet/authkit-core/config';

// Server-side only
const ssojetConfig = readSSOJetServerConfig();
// { baseUrl: 'https://api.ssojet.com', apiKey: 'sk_live_xxx' }

const scimConfig = readScimServerConfig();
// { baseUrl: 'https://scim.target.com/scim/v2', token: 'scim_xxx' }

const webhookConfig = readWebhookServerConfig();
// { secret: 'whsec_xxx' }

// Client-safe config (no secrets)
const publicConfig = readPublicConfig();
// { baseUrl: '/api/authkit', defaultTheme: { primary: '#2563eb' } }
```

### Schemas

```typescript
import { MemberSchema, WebhookEventSchema } from '@ssojet/authkit-core';

const member = MemberSchema.parse(apiResponse);
const event = WebhookEventSchema.parse(webhookPayload);
```

### Errors

```typescript
import { ConfigError, ApiError, ValidationError } from '@ssojet/authkit-core/errors';

try {
  const config = readSSOJetServerConfig();
} catch (err) {
  if (err instanceof ConfigError) {
    console.error('Configuration error:', err.message);
  }
}
```

## Environment Variables

**Server-side (required):**

- `SSOJET_BASE` - SSOJet API base URL
- `SSOJET_API_KEY` - SSOJet API key (starts with `sk_`)
- `SSOJET_WEBHOOK_SECRET` - Webhook signature secret
- `SCIM_BASE_URL` - SCIM service provider endpoint
- `SCIM_TOKEN` - SCIM bearer token

**Client-safe (optional):**

- `NEXT_PUBLIC_AUTHKIT_BASE_URL` - Base URL for AuthKit routes (default: `/api/authkit`)
- `NEXT_PUBLIC_AUTHKIT_THEME` - Default theme (JSON or preset name)

## License

MIT
