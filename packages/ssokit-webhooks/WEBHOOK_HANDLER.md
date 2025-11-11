# SSOJet Webhook Handler

This package provides comprehensive webhook handling for SSOJet events, allowing you to easily integrate SSOJet webhooks into your application without writing boilerplate code.

## Installation

```bash
npm install @ssojet/ssokit-webhooks
# or
pnpm add @ssojet/ssokit-webhooks
```

## Quick Start

### Next.js App Router

Create a webhook endpoint at `app/api/webhooks/ssojet/route.ts`:

```typescript
import { createWebhookHandler } from '@ssojet/ssokit-webhooks';

const handler = createWebhookHandler({
  secret: process.env.SSOJET_WEBHOOK_SECRET!,
  handlers: {
    'user.created': async (event) => {
      console.log('New user created:', event.data.user);
      // Your custom logic here
      // e.g., create user in your database, send welcome email, etc.
    },
    'invitation.accepted': async (event) => {
      console.log('Invitation accepted:', event.data);
      // Handle accepted invitation
    },
    'group.created': async (event) => {
      console.log('New group created:', event.data.group);
      // Sync group to your system
    },
    // Handle all other events
    '*': async (event) => {
      console.log('Unhandled event:', event.event);
    }
  },
  onError: (error, event) => {
    console.error('Webhook error:', error, event);
    // Optional: Send to error tracking service
  }
});

export async function POST(request: Request) {
  return handler(request);
}
```

### Express.js

```typescript
import express from 'express';
import { createExpressWebhookHandler } from '@ssojet/ssokit-webhooks';

const app = express();

// IMPORTANT: Use express.raw() middleware to get raw body for signature verification
app.post('/webhooks/ssojet',
  express.raw({ type: 'application/json' }),
  createExpressWebhookHandler({
    secret: process.env.SSOJET_WEBHOOK_SECRET!,
    handlers: {
      'user.created': async (event) => {
        console.log('New user:', event.data.user);
      },
      'tenant.created': async (event) => {
        console.log('New tenant:', event.data.tenant);
      },
    },
  })
);

app.listen(3000, () => console.log('Server listening on port 3000'));
```

## Supported Events

### User Events
- `user.created` - New user account established
- `user.updated` - User profile or attributes modified
- `user.deleted` - User account permanently removed

### Directory Synchronization Events
- `group.created` - New user group established via SCIM
- `group.updated` - Group attributes or settings modified
- `group.deleted` - User group removed
- `user.group.added` - Group membership assignment
- `user.group.removed` - Group membership removal

### Team Invite Events
- `invitation.sent` - Invite email sent to user
- `invitation.accepted` - User accepted the invite and joined
- `invitation.revoked` - Invite was cancelled or expired

### Tenant Events
- `tenant.created` - New tenant/organization created

## Event Payloads

### user.created

```json
{
  "event": "user.created",
  "event_id": "d27508cd-a5df-48b5-a49b-7e491f4c8b51",
  "created_at": "2023-09-01T12:34:56.789Z",
  "data": {
    "user": {
      "id": "usr_123456",
      "email": "user@example.com",
      "first_name": "John",
      "created_at": "2023-09-01T12:34:56.789Z",
      "source": "manual",
      "metadata": {}
    }
  }
}
```

### group.created

```json
{
  "event": "group.created",
  "event_id": "d27508cd-a5df-48b5-a49b-7e491f4c8b51",
  "created_at": "2023-09-01T12:34:56.789Z",
  "data": {
    "group": {
      "id": "grp_123456",
      "name": "Engineering",
      "description": "Engineering department members",
      "created_at": "2023-09-01T15:45:12.653Z",
      "external_id": "eng_group_1",
      "metadata": {
        "department_code": "ENG-01",
        "access_level": "standard"
      }
    },
    "source": "scim"
  }
}
```

### invitation.accepted

```json
{
  "event": "invitation.accepted",
  "event_id": "d27508cd-a5df-48b5-a49b-7e491f4c8b51",
  "created_at": "2023-09-01T12:34:56.789Z",
  "data": {
    "invitation": {
      "id": "inv_123456",
      "email": "user@example.com",
      "tenant_id": "ten_xyzabcd",
      "accepted_at": "2023-09-01T12:34:56.789Z"
    },
    "user": {
      "id": "usr_123456",
      "email": "user@example.com"
    }
  }
}
```

### tenant.created

```json
{
  "event": "tenant.created",
  "event_id": "d27508cd-a5df-48b5-a49b-7e491f4c8b51",
  "created_at": "2023-09-01T12:34:56.789Z",
  "data": {
    "tenant": {
      "id": "ten_xyzabcd",
      "name": "Acme Corporation",
      "created_at": "2023-09-01T14:25:36.421Z",
      "domain": "acmecorp.com",
      "metadata": {
        "industry": "Technology",
        "size": "Enterprise",
        "plan": "Business"
      }
    }
  }
}
```

## Type Guards

For custom webhook handling, you can use type guards to check event types:

```typescript
import {
  parseEvent,
  isUserCreatedEvent,
  isGroupCreatedEvent,
  isInvitationAcceptedEvent,
} from '@ssojet/ssokit-webhooks';

const event = parseEvent(rawBody);

if (isUserCreatedEvent(event)) {
  // TypeScript knows event.data.user is available
  console.log(event.data.user.email);
} else if (isGroupCreatedEvent(event)) {
  // TypeScript knows event.data.group is available
  console.log(event.data.group.name);
}
```

## Security

The webhook handler automatically verifies webhook signatures using HMAC-SHA256. Make sure to:

1. Keep your webhook secret secure
2. Never commit it to version control
3. Use environment variables to store it

The signature is expected in the `x-ssojet-signature` or `x-webhook-signature` header with the format:
```
t=<timestamp>,v1=<signature>
```

## Error Handling

```typescript
const handler = createWebhookHandler({
  secret: process.env.SSOJET_WEBHOOK_SECRET!,
  handlers: {
    'user.created': async (event) => {
      // This error will be caught and handled
      throw new Error('Something went wrong');
    },
  },
  onError: (error, event) => {
    // Custom error handling
    console.error('Error processing webhook:', error);
    
    if (event) {
      console.error('Event:', event.event, event.event_id);
    }
    
    // Optional: Send to error tracking service like Sentry
    // Sentry.captureException(error);
  }
});
```

## Testing

You can test webhooks locally using tools like ngrok or the SSOJet CLI:

```bash
# Expose your local server
ngrok http 3000

# Configure the ngrok URL in SSOJet dashboard
https://your-ngrok-url.ngrok.io/api/webhooks/ssojet
```

## Advanced Usage

### Custom Signature Verification

```typescript
import { verifySignature, parseEvent } from '@ssojet/ssokit-webhooks';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('x-ssojet-signature');
  
  const isValid = verifySignature({
    rawBody: body,
    header: signature!,
    secret: process.env.SSOJET_WEBHOOK_SECRET!,
    tolerance: 300, // 5 minutes
  });
  
  if (!isValid) {
    return new Response('Invalid signature', { status: 401 });
  }
  
  const event = parseEvent(body);
  // Handle event...
}
```

### Filtering Events

```typescript
const handler = createWebhookHandler({
  secret: process.env.SSOJET_WEBHOOK_SECRET!,
  handlers: {
    // Only handle user events
    'user.created': async (event) => { /* ... */ },
    'user.updated': async (event) => { /* ... */ },
    'user.deleted': async (event) => { /* ... */ },
    
    // Ignore all other events
    '*': async () => { /* do nothing */ }
  },
});
```

## TypeScript Support

Full TypeScript support with strong typing for all events and payloads:

```typescript
import type { WebhookEvent, WebhookEventHandler } from '@ssojet/ssokit-webhooks';

const myHandler: WebhookEventHandler = async (event: WebhookEvent) => {
  // TypeScript will infer the correct types based on event.event
  switch (event.event) {
    case 'user.created':
      // event.data.user is properly typed
      console.log(event.data.user.email);
      break;
    case 'group.created':
      // event.data.group is properly typed
      console.log(event.data.group.name);
      break;
  }
};
```

## License

MIT
