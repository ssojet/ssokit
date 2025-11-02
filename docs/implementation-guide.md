# SSOJet AuthKit Implementation Guide

This guide provides step-by-step instructions for implementing SSOJet AuthKit in your Next.js application.

## API Endpoints Reference

SSOJet AuthKit uses the following API endpoints:

### Base URLs
- **Production**: `https://api.ssojet.com`
- **Staging**: `https://staging-api.ssojet.com` (if available)

### API Routes

#### Tenant Management
- `GET /api/v1/tenants/{orgId}` - Get organization details
- `PUT /api/v1/tenants/{orgId}` - Update organization
- `GET /api/v1/tenants/{orgId}/users` - List organization members
- `GET /api/v1/tenants/{orgId}/audit` - List audit events

#### Authentication & Invitations
- `POST /api/v1/auth/tenants/{orgId}/invitations` - Create/Send invitation
- `GET /api/v1/auth/tenants/{orgId}/invitations` - List invitations
- `PATCH /api/v1/auth/tenants/{orgId}/invitations/{inviteId}` - Update invitation
- `DELETE /api/v1/auth/tenants/{orgId}/invitations/{inviteId}` - Revoke invitation
- `POST /api/v1/auth/tenants/{orgId}/invitations/{inviteId}/resend` - Resend invitation

#### Roles & Users
- `GET /api/v1/roles` - List available roles
- `GET /api/v1/users/{userId}/tenants` - List user organizations

## Prerequisites

Before you start, ensure you have:

1. **SSOJet Account**: Sign up at [ssojet.com](https://ssojet.com)
2. **API Credentials**: 
   - API Key (`SSOJET_API_KEY`)
   - Webhook Secret (`SSOJET_WEBHOOK_SECRET`)
3. **Next.js Application**: Version 13+ with App Router
4. **Node.js**: Version 18+ recommended

## Installation

### 1. Install Required Packages

```bash
pnpm add @ssojet/authkit-react @ssojet/authkit-next @ssojet/authkit-webhooks @ssojet/authkit-css
# or
npm install @ssojet/authkit-react @ssojet/authkit-next @ssojet/authkit-webhooks @ssojet/authkit-css
# or
yarn add @ssojet/authkit-react @ssojet/authkit-next @ssojet/authkit-webhooks @ssojet/authkit-css
```

### 2. Configure Environment Variables

Create a `.env.local` file in your project root:

```bash
# Required: SSOJet API Configuration
SSOJET_BASE=https://api.ssojet.com
SSOJET_API_KEY=sk_live_your_api_key_here

# Required: Webhook Security
SSOJET_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Optional: SCIM Integration (for automatic provisioning)
SCIM_BASE_URL=https://your-scim-provider.com/scim/v2
SCIM_TOKEN=your_scim_bearer_token

# Optional: Client-side Theme Configuration
NEXT_PUBLIC_AUTHKIT_THEME='{"primary":"#2563eb","radius":"12px"}'
NEXT_PUBLIC_AUTHKIT_BASE_URL=/api/authkit
```

## Implementation Steps

### Step 1: Setup API Route Handlers

Create the following API route handlers in your Next.js app:

#### Organization Routes

```typescript
// app/api/authkit/orgs/[orgId]/route.ts
import { createRouteHandlers } from '@ssojet/authkit-next/routes';

const handlers = createRouteHandlers();

export const GET = handlers.getOrganization;
export const PATCH = handlers.updateOrganization;
```

#### Members Routes

```typescript
// app/api/authkit/orgs/[orgId]/members/route.ts
import { createRouteHandlers } from '@ssojet/authkit-next/routes';

const handlers = createRouteHandlers();

export const GET = handlers.listMembers;
export const POST = handlers.addMember;
export const DELETE = handlers.removeMember;
```

#### Invitations Routes

```typescript
// app/api/authkit/orgs/[orgId]/invites/route.ts
import { createRouteHandlers } from '@ssojet/authkit-next/routes';

const handlers = createRouteHandlers();

export const GET = handlers.listInvites;
export const POST = handlers.createInvite;
```

```typescript
// app/api/authkit/orgs/[orgId]/invites/[inviteId]/route.ts
import { createRouteHandlers } from '@ssojet/authkit-next/routes';

const handlers = createRouteHandlers();

export const DELETE = handlers.revokeInvite;
```

```typescript
// app/api/authkit/orgs/[orgId]/invites/[inviteId]/resend/route.ts
import { createRouteHandlers } from '@ssojet/authkit-next/routes';

const handlers = createRouteHandlers();

export const POST = handlers.resendInvite;
```

#### Audit Routes

```typescript
// app/api/authkit/orgs/[orgId]/audit/route.ts
import { createRouteHandlers } from '@ssojet/authkit-next/routes';

const handlers = createRouteHandlers();

export const GET = handlers.listAuditEvents;
```

#### Roles Routes

```typescript
// app/api/authkit/roles/route.ts
import { createRouteHandlers } from '@ssojet/authkit-next/routes';

const handlers = createRouteHandlers();

export const GET = handlers.listRoles;
```

### Step 2: Setup Webhook Handler (Optional but Recommended)

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
    // 1. Verify webhook signature for security
    const webhookConfig = readWebhookServerConfig();
    verifySignature({ 
      rawBody, 
      header: signature, 
      secret: webhookConfig.secret 
    });

    // 2. Parse the webhook event
    const event = parseEvent(rawBody.toString('utf8'));
    console.log('Received SSOJet event:', event.type);

    // 3. Optional: Handle SCIM provisioning
    if (process.env.SCIM_BASE_URL && process.env.SCIM_TOKEN) {
      const scimConfig = readScimServerConfig();
      const scim = createScimClient(scimConfig);
      
      await handleEventToSCIM({
        event,
        scimClient: scim,
        orgIdScopeStrategy: (orgId, role) => `${orgId}:${role}`,
      });
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Webhook processing error:', err);
    return NextResponse.json(
      { error: err.message }, 
      { status: 400 }
    );
  }
}
```

### Step 3: Setup React Provider

Wrap your application with the AuthKit provider:

```tsx
// app/layout.tsx or app/providers.tsx
import { AuthKitProvider } from '@ssojet/authkit-react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthKitProvider 
          config={{ 
            apiBase: '/api/authkit' 
          }}
        >
          {children}
        </AuthKitProvider>
      </body>
    </html>
  );
}
```

### Step 4: Use Team Management Components

```tsx
// app/dashboard/team/page.tsx
import { TeamManager } from '@ssojet/authkit-team';
import '@ssojet/authkit-team/styles.css';

export default function TeamPage() {
  const orgId = 'your-organization-id'; // Get from your auth system

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Team Management</h1>
      <TeamManager orgId={orgId} />
    </div>
  );
}
```

### Step 5: Custom Theme (Optional)

```tsx
// app/dashboard/team/page.tsx with custom theme
import { TeamManager } from '@ssojet/authkit-team';
import '@ssojet/authkit-team/styles.css';

const customTheme = {
  primary: '#3b82f6',
  secondary: '#64748b',
  radius: '8px',
  fontFamily: 'system-ui, sans-serif',
};

export default function TeamPage() {
  return (
    <TeamManager 
      orgId="your-org-id" 
      theme={customTheme}
    />
  );
}
```

## Testing Your Implementation

### 1. Environment Setup Test

Create a simple API route to test your configuration:

```typescript
// app/api/test-config/route.ts
import { NextResponse } from 'next/server';
import { readSSOJetServerConfig } from '@ssojet/authkit-core/config';

export async function GET() {
  try {
    const config = readSSOJetServerConfig();
    return NextResponse.json({ 
      status: 'OK',
      baseUrl: config.baseUrl,
      hasApiKey: !!config.apiKey 
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message }, 
      { status: 500 }
    );
  }
}
```

### 2. API Integration Test

Test your API connection:

```typescript
// utils/test-api.ts
import { SSOJetClient } from '@ssojet/authkit-next/client';

export async function testApiConnection() {
  try {
    const client = new SSOJetClient();
    const roles = await client.listRoles();
    console.log('API connection successful:', roles);
    return true;
  } catch (error) {
    console.error('API connection failed:', error);
    return false;
  }
}
```

### 3. Webhook Test

Use a tool like ngrok to test webhooks locally:

```bash
# Install ngrok
npm install -g ngrok

# Expose your local server
ngrok http 3000

# Update webhook URL in SSOJet dashboard to:
# https://your-ngrok-url.ngrok.io/api/authkit/webhooks
```

## Troubleshooting

### Common Issues

1. **Missing Environment Variables**
   - Check that all required env vars are set
   - Use the test API route to validate configuration

2. **API Authentication Errors**
   - Verify your API key is correct
   - Ensure the key has necessary permissions

3. **CORS Issues**
   - Ensure API routes are properly configured
   - Check Next.js middleware configuration

4. **Webhook Signature Verification Failed**
   - Verify webhook secret matches SSOJet dashboard
   - Check that raw body is being passed correctly

### Debug Mode

Enable debug logging:

```typescript
// Add to your environment
DEBUG=ssojet:*
```

## Next Steps

1. **Customize UI Components**: Override default styles and components
2. **Add Role-based Access**: Implement permission checks
3. **Setup SCIM Integration**: Automate user provisioning
4. **Monitor Webhooks**: Add logging and monitoring
5. **Production Deployment**: Configure for production environment

## Support

- **Documentation**: [docs.ssojet.com](https://docs.ssojet.com)
- **GitHub Issues**: [github.com/ssojet/authkit](https://github.com/ssojet/authkit)
- **Discord Community**: [discord.gg/ssojet](https://discord.gg/ssojet)