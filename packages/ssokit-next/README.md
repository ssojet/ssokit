# @ssojet/authkit-next

Next.js App Router helpers and route handlers for SSOJet AuthKit.

## Features

- **Pre-built route handlers** for all SSOJet APIs
- **Type-safe** server-side client
- **Environment-based configuration**
- **Error handling** with proper HTTP status codes

## Installation

```bash
pnpm add @ssojet/authkit-next @ssojet/authkit-core
```

## Setup

### 1. Environment Variables

```bash
# .env.local
SSOJET_BASE=https://api.ssojet.com
SSOJET_API_KEY=sk_live_xxx
```

### 2. Create Route Handlers

```typescript
// app/api/authkit/orgs/[orgId]/route.ts
import { createRouteHandlers } from '@ssojet/authkit-next/routes';

const handlers = createRouteHandlers();

export const GET = handlers.getOrganization;
export const PATCH = handlers.updateOrganization;
```

```typescript
// app/api/authkit/orgs/[orgId]/members/route.ts
import { createRouteHandlers } from '@ssojet/authkit-next/routes';

const handlers = createRouteHandlers();

export const GET = handlers.listMembers;
export const POST = handlers.addMember;
```

```typescript
// app/api/authkit/orgs/[orgId]/members/[memberId]/route.ts
import { createRouteHandlers } from '@ssojet/authkit-next/routes';

const handlers = createRouteHandlers();

export const PATCH = handlers.updateMember;
export const DELETE = handlers.removeMember;
```

## Available Handlers

| Handler | Method | Path |
|---------|--------|------|
| `getOrganization` | GET | `/orgs/[orgId]` |
| `updateOrganization` | PATCH | `/orgs/[orgId]` |
| `listMembers` | GET | `/orgs/[orgId]/members` |
| `addMember` | POST | `/orgs/[orgId]/members` |
| `updateMember` | PATCH | `/orgs/[orgId]/members/[memberId]` |
| `removeMember` | DELETE | `/orgs/[orgId]/members/[memberId]` |
| `listInvites` | GET | `/orgs/[orgId]/invites` |
| `createInvite` | POST | `/orgs/[orgId]/invites` |
| `resendInvite` | POST | `/orgs/[orgId]/invites/[inviteId]/resend` |
| `revokeInvite` | DELETE | `/orgs/[orgId]/invites/[inviteId]` |
| `listAuditEvents` | GET | `/orgs/[orgId]/audit` |
| `listRoles` | GET | `/orgs/[orgId]/roles` |
| `listUserOrganizations` | GET | `/me/orgs` |

## Direct Client Usage

```typescript
import { SSOJetClient } from '@ssojet/authkit-next';

const client = new SSOJetClient();

// In a server component or API route
const org = await client.getOrganization('org_123');
const members = await client.listMembers('org_123');
```

## Security

⚠️ **Important:** These route handlers proxy requests to SSOJet using your **server-side API key**. You MUST implement your own authentication and authorization middleware to verify that the requesting user has permission to access the requested organization.

Example middleware:

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const session = await getSession(request);
  const orgId = request.nextUrl.pathname.split('/')[4];
  
  if (!session || !userHasAccessToOrg(session.userId, orgId)) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  
  return NextResponse.next();
}
```

## License

MIT
