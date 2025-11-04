# @ssojet/authkit-webhooks

Webhook verification and SCIM 2.0 provisioning for SSOJet AuthKit.

## Features

- **Webhook signature verification** with HMAC SHA-256
- **Full SCIM 2.0 client** for Users and Groups
- **Automatic provisioning** from webhook events to SCIM operations
- **Customizable org/role → group mapping** strategy

## Installation

```bash
pnpm add @ssojet/authkit-webhooks @ssojet/authkit-core
```

## Webhook Verification

```typescript
import { verifySignature } from '@ssojet/authkit-webhooks';

const isValid = verifySignature({
  rawBody: request.body, // Raw Buffer or string
  header: request.headers['ssojet-signature'],
  secret: process.env.SSOJET_WEBHOOK_SECRET,
  tolerance: 300, // 5 minutes
});
```

## SCIM Client

```typescript
import { createScimClient } from '@ssojet/authkit-webhooks';

const scim = createScimClient({
  baseUrl: process.env.SCIM_BASE_URL,
  token: process.env.SCIM_TOKEN,
});

// User operations
const user = await scim.getUserByEmail('user@example.com');
await scim.createUser({ userName: 'user@example.com', ... });
await scim.activateUser(userId);
await scim.deactivateUser(userId);

// Group operations
const group = await scim.getGroupByDisplayName('org_123:admins');
await scim.createGroup({ displayName: 'org_123:admins', ... });
await scim.addMemberToGroup(groupId, userId);
await scim.removeMemberFromGroup(groupId, userId);
```

## Webhook → SCIM Handler

```typescript
import { 
  verifySignature, 
  parseEvent, 
  createScimClient, 
  handleEventToSCIM 
} from '@ssojet/authkit-webhooks';

// In your webhook route handler
const rawBody = await request.arrayBuffer();
const signature = request.headers.get('ssojet-signature');

// 1. Verify signature
verifySignature({
  rawBody: Buffer.from(rawBody),
  header: signature,
  secret: process.env.SSOJET_WEBHOOK_SECRET,
});

// 2. Parse event
const event = parseEvent(Buffer.from(rawBody).toString('utf8'));

// 3. Create SCIM client
const scim = createScimClient({
  baseUrl: process.env.SCIM_BASE_URL,
  token: process.env.SCIM_TOKEN,
});

// 4. Handle event
await handleEventToSCIM({
  event,
  scimClient: scim,
  orgIdScopeStrategy: (orgId, role) => `${orgId}:${role}s`,
});
```

## Event Types

### `team.member.added`
- Creates or activates user in SCIM
- Creates group if it doesn't exist
- Adds user to group

### `team.member.removed`
- Removes user from group
- Optionally deactivates user (configurable)

### `team.member.role_updated`
- Removes user from old role group
- Adds user to new role group

## Custom Group Naming Strategy

```typescript
// Default: org_123:admins, org_123:members
const defaultStrategy = (orgId, role) => `${orgId}:${role}s`;

// Custom: my-org-admin, my-org-member
const customStrategy = (orgId, role) => `my-org-${role}`;

await handleEventToSCIM({
  event,
  scimClient: scim,
  orgIdScopeStrategy: customStrategy,
});
```

## License

MIT
