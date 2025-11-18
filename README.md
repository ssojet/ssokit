# SSOJet SSOKit

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://badge.fury.io/js/@ssojet%2Fssokit-core.svg)](https://www.npmjs.com/package/@ssojet/ssokit-core)

**Production-grade team management UI + webhook-driven SCIM provisioning for SSOJet**

SSOJet SSOKit is an open-source, batteries-included solution for building team management experiences powered by [SSOJet](https://ssojet.com) APIs. It features drop-in React widgets, headless hooks, and automatic SCIM 2.0 provisioning triggered by webhooks.

---

## 🎯 Features

### 🧑‍🤝‍🧑 Team Management UI
- **Drop-in TeamManager widget** with members, invites, roles, and audit logs
- **Fully themed** with 4 presets (light, dark, minimal, enterprise) + custom tokens
- **Headless hooks** for building custom UIs
- **Type-safe** with full TypeScript support

### 🔗 Webhook → SCIM Provisioning
- **Signature verification** for secure webhook handling
- **Automatic SCIM sync** from team events (member added/removed/role changed)
- **Full SCIM 2.0 client** for Users and Groups
- **Customizable mapping** strategies

### ⚙️ Environment-Driven Configuration
- **Zero hardcoded secrets** - everything from env vars
- **Client-safe** config injection
- **Helpful error messages** for missing configuration

---

## 📦 Packages

| Package | Description | Version |
|---------|-------------|---------|
| [`@ssojet/ssokit-core`](packages/ssokit-core) | Types, schemas, errors, config | ![npm](https://img.shields.io/npm/v/@ssojet/ssokit-core) |
| [`@ssojet/ssokit-react`](packages/ssokit-react) | React hooks and providers | ![npm](https://img.shields.io/npm/v/@ssojet/ssokit-react) |
| [`@ssojet/ssokit-team`](packages/ssokit-team) | TeamManager drop-in widget | ![npm](https://img.shields.io/npm/v/@ssojet/ssokit-team) |
| [`@ssojet/ssokit-next`](packages/ssokit-next) | Next.js route handlers | ![npm](https://img.shields.io/npm/v/@ssojet/ssokit-next) |
| [`@ssojet/ssokit-webhooks`](packages/ssokit-webhooks) | Webhook + SCIM provisioning | ![npm](https://img.shields.io/npm/v/@ssojet/ssokit-webhooks) |
| [`@ssojet/ssokit-css`](packages/ssokit-css) | Theming + Tailwind preset | ![npm](https://img.shields.io/npm/v/@ssojet/ssokit-css) |

---

## 🚀 Quick Start

### 1. Install Packages

```bash
pnpm add @ssojet/ssokit-react @ssojet/ssokit-next @ssojet/ssokit-webhooks @ssojet/ssokit-css
```

### 2. Set Environment Variables

```bash
# .env.local

# SSOJet API (server-side)
DEFAULT_SSOJET_API_URL=https://api.ssojet.com
DEFAULT_SSOJET_CLIENT_ID=your-client-id
DEFAULT_SSOJET_CLIENT_SECRET=your-client-secret
DEFAULT_SSOJET_AUTHORITY=https://api.ssojet.com

# Webhook verification
SSOJET_WEBHOOK_SECRET=whsec_xxx

# SCIM downstream
SCIM_BASE_URL=https://scim.target.com/scim/v2
SCIM_TOKEN=scim_bearer_xxx

# Optional: Client-safe config
NEXT_PUBLIC_DEFAULT_SSOJET_CLIENT_ID=your-client-id
NEXT_PUBLIC_DEFAULT_SSOJET_AUTHORITY=https://api.ssojet.com
```

### 3. Setup Next.js Route Handlers

```typescript
// app/api/ssokit/orgs/[orgId]/route.ts
import { createRouteHandlers } from '@ssojet/ssokit-next/routes';

const handlers = createRouteHandlers();

export const GET = handlers.getOrganization;
export const PATCH = handlers.updateOrganization;
```

```typescript
// app/api/ssokit/orgs/[orgId]/members/route.ts
const handlers = createRouteHandlers();

export const GET = handlers.listMembers;
export const POST = handlers.addMember;
```

(See [route setup guide](docs/routes.md) for all routes)

### 4. Setup Webhook Endpoint

```typescript
// app/api/ssokit/webhooks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {
  verifySignature,
  parseEvent,
  createScimClient,
  handleEventToSCIM,
} from '@ssojet/ssokit-webhooks';
import { readWebhookServerConfig, readScimServerConfig } from '@ssojet/ssokit-core/config';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const rawBody = Buffer.from(await req.arrayBuffer());
  const signature = req.headers.get('ssojet-signature') || '';

  try {
    // 1. Verify signature
    const webhookConfig = readWebhookServerConfig();
    verifySignature({ rawBody, header: signature, secret: webhookConfig.secret });

    // 2. Parse event
    const event = parseEvent(rawBody.toString('utf8'));

    // 3. Handle SCIM provisioning
    const scimConfig = readScimServerConfig();
    const scim = createScimClient(scimConfig);
    
    await handleEventToSCIM({
      event,
      scimClient: scim,
      orgIdScopeStrategy: (orgId, role) => `${orgId}:${role}s`,
    });

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Webhook error:', err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
```

### 5. Use TeamManager Widget

```tsx
import { SSOJetClient } from '@ssojet/ssokit-next';
import { TeamManager } from '@ssojet/ssokit-team';
import '@ssojet/ssokit-css';

function TeamPage() {
  const client = new SSOJetClient(accessToken);
  
  return (
    <TeamManager
      organizationId="org_123"
      client={client}
      currentUserId="user_456"
      currentUserEmail="user@example.com"
      showAuditLog
    />
  );
}
```

---

## 📚 Documentation

- [Environment Setup](docs/environment.md)
- [Route Handlers Guide](docs/routes.md)
- [Webhook Integration](docs/webhooks.md)
- [Theming Guide](docs/theming.md)
- [API Reference](docs/api-reference.md)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Your Next.js App                      │
│                                                               │
│  ┌──────────────────┐         ┌─────────────────────────┐   │
│  │  TeamManager UI  │────────▶│ SSOJetClient            │   │
│  │  (@ssokit-team)  │         │ (@ssokit-next)          │   │
│  └──────────────────┘         └─────────────────────────┘   │
│                                          │                    │
│                                          ▼                    │
│                              ┌─────────────────────────┐   │
│                              │    SSOJet API Client    │   │
│                              │   (CLIENT_ID/SECRET)    │   │
│                              └─────────────────────────┘   │
│                                          │                    │
└──────────────────────────────────────────┼───────────────────┘
                                           │
                                           ▼
                              ┌─────────────────────────┐
                              │   SSOJet API (Cloud)    │
                              │  api.ssojet.com/v1/...  │
                              └─────────────────────────┘
                                           │
                                           │ Webhook Events
                                           ▼
                              ┌─────────────────────────┐
                              │ /api/v1/webhooks        │
                              │ (@ssokit-webhooks)      │
                              └─────────────────────────┘
                                           │
                                           ▼
                              ┌─────────────────────────┐
                              │   SCIM 2.0 Endpoint     │
                              │  (Your IdP/Directory)   │
                              └─────────────────────────┘
```

**Flow:**
1. **UI → SSOJet Client → SSOJet API**: TeamManager uses SSOJetClient directly to communicate with SSOJet APIs
2. **SSOJet → Webhook → SCIM**: Team events trigger webhooks, verified and converted to SCIM operations

---

## 🎨 Theming

SSOKit supports multiple theming approaches:

### 1. Presets
```tsx
import '@ssojet/ssokit-css/presets/dark.css';
```

### 2. Custom Tokens
```css
import '@ssojet/ssokit-css/tokens.css';
```

### 3. CSS Variables
```css
.sk-root {
  --sk-primary: #2563eb;
  --sk-radius: 12px;
}
```

### 4. Tailwind Integration
```javascript
// tailwind.config.js
module.exports = {
  presets: [require('@ssojet/ssokit-css/tailwind/preset.cjs')],
};
```

---

## 🔒 Security

- **Server-side API key** never exposed to client
- **HMAC signature verification** for webhooks
- **Timing-safe comparisons** prevent timing attacks
- **Type-safe validation** with Zod schemas

⚠️ **Important**: Implement authentication middleware to verify users can access requested organizations.

---

## 🧪 Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm -r build

# Run tests
pnpm test

# Run example app
cd examples/next-app
pnpm dev
```

---

## 📋 Roadmap

- [x] Core types and schemas
- [x] Webhook verification + SCIM client
- [x] SSOJet API client
- [x] Theming system with CSS presets
- [x] TeamManager widget with full functionality
- [x] Example Next.js application
- [ ] E2E tests
- [ ] Storybook components
- [ ] SDK documentation site

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## 📄 License

MIT © [SSOJet Team](https://ssojet.com)

---

## 💬 Support

- [Documentation](https://docs.ssojet.com)
- [GitHub Issues](https://github.com/ssojet/ssojet-ssokit/issues)
- [Discord Community](https://discord.gg/ssojet)
- [Email Support](mailto:support@ssojet.com)

---

**Built with ❤️ by the SSOJet team**
