# SSOJet AuthKit

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://badge.fury.io/js/@ssojet%2Fauthkit-core.svg)](https://www.npmjs.com/package/@ssojet/authkit-core)

**Production-grade team management UI + webhook-driven SCIM provisioning for SSOJet**

SSOJet AuthKit is an open-source, batteries-included solution for building team management experiences powered by [SSOJet](https://ssojet.com) APIs. It features drop-in React widgets, headless hooks, and automatic SCIM 2.0 provisioning triggered by webhooks.

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
| [`@ssojet/authkit-core`](packages/authkit-core) | Types, schemas, errors, config | ![npm](https://img.shields.io/npm/v/@ssojet/authkit-core) |
| [`@ssojet/authkit-react`](packages/authkit-react) | React hooks and providers | ![npm](https://img.shields.io/npm/v/@ssojet/authkit-react) |
| [`@ssojet/authkit-team`](packages/authkit-team) | TeamManager drop-in widget | ![npm](https://img.shields.io/npm/v/@ssojet/authkit-team) |
| [`@ssojet/authkit-next`](packages/authkit-next) | Next.js route handlers | ![npm](https://img.shields.io/npm/v/@ssojet/authkit-next) |
| [`@ssojet/authkit-webhooks`](packages/authkit-webhooks) | Webhook + SCIM provisioning | ![npm](https://img.shields.io/npm/v/@ssojet/authkit-webhooks) |
| [`@ssojet/authkit-css`](packages/authkit-css) | Theming + Tailwind preset | ![npm](https://img.shields.io/npm/v/@ssojet/authkit-css) |

---

## 🚀 Quick Start

### 1. Install Packages

```bash
pnpm add @ssojet/authkit-react @ssojet/authkit-next @ssojet/authkit-webhooks @ssojet/authkit-css
```

### 2. Set Environment Variables

```bash
# .env.local

# SSOJet API (server-side)
SSOJET_BASE=https://api.ssojet.com
SSOJET_API_KEY=sk_live_xxx

# Webhook verification
SSOJET_WEBHOOK_SECRET=whsec_xxx

# SCIM downstream
SCIM_BASE_URL=https://scim.target.com/scim/v2
SCIM_TOKEN=scim_bearer_xxx

# Optional: Client-safe theme
NEXT_PUBLIC_AUTHKIT_THEME='{"primary":"#2563eb","radius":"12px"}'
```

### 3. Setup Next.js Route Handlers

```typescript
// app/api/authkit/orgs/[orgId]/route.ts
import { createRouteHandlers } from '@ssojet/authkit-next/routes';

const handlers = createRouteHandlers();

export const GET = handlers.getOrganization;
export const PATCH = handlers.updateOrganization;
```

```typescript
// app/api/authkit/orgs/[orgId]/members/route.ts
const handlers = createRouteHandlers();

export const GET = handlers.listMembers;
export const POST = handlers.addMember;
```

(See [route setup guide](docs/routes.md) for all routes)

### 4. Setup Webhook Endpoint

```typescript
// app/api/authkit/webhooks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {
  verifySignature,
  parseEvent,
  createScimClient,
  handleEventToSCIM,
} from '@ssojet/authkit-webhooks';
import { readWebhookServerConfig, readScimServerConfig } from '@ssojet/authkit-core/config';

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
import { AuthKitProvider } from '@ssojet/authkit-react';
import { TeamManager } from '@ssojet/authkit-team';
import '@ssojet/authkit-team/styles.css';

function App() {
  return (
    <AuthKitProvider config={{ baseUrl: '/api/authkit' }}>
      <TeamManager
        organizationId="org_123"
        currentUserId="user_456"
        showAuditLog
      />
    </AuthKitProvider>
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
│  │  TeamManager UI  │────────▶│ /api/authkit/orgs/...   │   │
│  │  (@authkit-team) │         │ (@authkit-next routes)  │   │
│  └──────────────────┘         └─────────────────────────┘   │
│           │                              │                    │
│           │                              ▼                    │
│  ┌────────▼────────┐         ┌─────────────────────────┐   │
│  │ AuthKitProvider │         │    SSOJet API Client    │   │
│  │ (@authkit-react)│         │   (SSOJET_API_KEY)      │   │
│  └─────────────────┘         └─────────────────────────┘   │
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
                              │ /api/v1/webhooks   │
                              │ (@authkit-webhooks)     │
                              └─────────────────────────┘
                                           │
                                           ▼
                              ┌─────────────────────────┐
                              │   SCIM 2.0 Endpoint     │
                              │  (Your IdP/Directory)   │
                              └─────────────────────────┘
```

**Flow:**
1. **UI → Your API → SSOJet**: TeamManager calls your Next.js routes, which proxy to SSOJet with server API key
2. **SSOJet → Webhook → SCIM**: Team events trigger webhooks, verified and converted to SCIM operations

---

## 🎨 Theming

AuthKit supports multiple theming approaches:

### 1. Presets
```tsx
<TeamManager theme="dark" />
```

### 2. Custom Tokens
```tsx
<TeamManager theme={{ primary: '#8b5cf6', radius: '16px' }} />
```

### 3. CSS Variables
```css
.ak-root {
  --ak-primary: #2563eb;
  --ak-radius: 12px;
}
```

### 4. Tailwind Integration
```javascript
// tailwind.config.js
module.exports = {
  presets: [require('@ssojet/authkit-css/tailwind/preset.cjs')],
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
- [x] Next.js route handlers
- [x] React hooks and providers
- [x] Theming system
- [ ] TeamManager widget (In Progress)
- [ ] Example application
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
- [GitHub Issues](https://github.com/ssojet/ssojet-authkit/issues)
- [Discord Community](https://discord.gg/ssojet)
- [Email Support](mailto:support@ssojet.com)

---

**Built with ❤️ by the SSOJet team**
