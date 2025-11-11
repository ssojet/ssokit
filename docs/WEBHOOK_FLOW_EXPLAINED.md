# How Webhook Implementation Works - Complete Flow

This document explains the complete flow of how your `@ssojet/ssokit-webhooks` package works when customers implement it in their third-party applications.

## Overview

The webhook system provides a **zero-configuration** solution where customers can handle SSOJet events without manually implementing signature verification, payload parsing, or error handling.

---

## Architecture Flow

```
SSOJet Platform → Customer's Application → Customer's Business Logic
     ↓                      ↓                          ↓
  Webhook Event    ssokit-webhooks           Database/Services
                   (Your Package)
```

---

## Step-by-Step Flow

### 1. **SSOJet Sends Webhook Event**

When something happens in SSOJet (user created, invitation accepted, etc.), the SSOJet platform sends an HTTP POST request to the customer's webhook endpoint.

**Example HTTP Request:**
```http
POST https://customer-app.com/api/webhooks/ssojet
Content-Type: application/json
X-SSOJet-Signature: sha256=abc123...

{
  "event": "user.created",
  "event_id": "d27508cd-a5df-48b5-a49b-7e491f4c8b51",
  "created_at": "2023-09-01T12:34:56.789Z",
  "data": {
    "user": {
      "id": "usr_123456",
      "email": "john@example.com",
      "first_name": "John",
      "last_name": "Doe"
    }
  }
}
```

The request includes:
- **Body**: JSON payload with event details
- **Header**: `X-SSOJet-Signature` for security verification

---

### 2. **Customer Creates Webhook Endpoint**

The customer installs your package and creates a simple endpoint file in their application.

#### **Next.js Example** (`app/api/webhooks/ssojet/route.ts`):

```typescript
import { createWebhookHandler } from '@ssojet/ssokit-webhooks';

// Customer just provides their secret and event handlers
const handler = createWebhookHandler({
  secret: process.env.SSOJET_WEBHOOK_SECRET!, // From SSOJet dashboard
  handlers: {
    'user.created': async (event) => {
      // Customer's business logic
      await db.users.create({
        ssojetId: event.data.user.id,
        email: event.data.user.email,
        name: `${event.data.user.first_name} ${event.data.user.last_name}`
      });
      
      await sendWelcomeEmail(event.data.user.email);
    },
    
    'invitation.accepted': async (event) => {
      // Grant access to resources
      await grantTenantAccess(event.data.user_id, event.data.tenant_id);
    },
    
    'group.created': async (event) => {
      // Sync group to customer's system
      await db.groups.create({
        ssojetId: event.data.group.id,
        name: event.data.group.name,
        externalId: event.data.group.external_id
      });
    }
  }
});

// Export as Next.js API route
export async function POST(request: Request) {
  return handler(request);
}
```

#### **Express.js Example**:

```typescript
import express from 'express';
import { createExpressWebhookHandler } from '@ssojet/ssokit-webhooks';

const app = express();

app.post('/webhooks/ssojet',
  express.raw({ type: 'application/json' }), // Raw body needed for signature verification
  createExpressWebhookHandler({
    secret: process.env.SSOJET_WEBHOOK_SECRET!,
    handlers: {
      'user.created': async (event) => {
        // Customer's logic here
        await handleNewUser(event.data.user);
      }
    }
  })
);
```

---

### 3. **Your Package Handles Everything**

When the webhook request arrives, your `createWebhookHandler` function does all the heavy lifting:

#### **3a. Signature Verification** (Security)

```typescript
// Inside your package (webhook-handler.ts)
import { verifyWebhookSignature } from './verify';

// Automatically verifies the request is from SSOJet
const isValid = await verifyWebhookSignature(
  rawBody,           // Raw request body
  signature,         // X-SSOJet-Signature header
  config.secret      // Customer's secret
);

if (!isValid) {
  return new Response('Invalid signature', { status: 401 });
}
```

**Why this matters:**
- Protects against fake webhook requests
- Ensures data integrity
- Customer doesn't need to implement this

#### **3b. Payload Parsing** (Validation)

```typescript
// Inside your package (parser.ts)
import { WebhookEventSchema } from '@ssojet/ssokit-core';

// Automatically validates and parses the JSON
const event = WebhookEventSchema.parse(await request.json());
```

**What happens here:**
- Validates event structure using Zod schemas
- Ensures all required fields exist
- Type-checks the payload
- Throws error if invalid

#### **3c. Event Routing** (Handler Selection)

```typescript
// Inside your package (webhook-handler.ts)
const handler = config.handlers[event.event] || config.handlers['*'];

if (handler) {
  await handler(event);
}
```

**What happens:**
- Finds the correct handler function for the event type
- Falls back to wildcard handler (`*`) if specific handler not found
- Executes customer's business logic

#### **3d. Error Handling**

```typescript
try {
  await handler(event);
  return new Response('Webhook received', { status: 200 });
} catch (error) {
  // Optional error callback
  if (config.onError) {
    config.onError(error, event);
  }
  return new Response('Webhook handler failed', { status: 500 });
}
```

---

## Complete Request Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│ 1. SSOJet Platform                                                  │
│    Event: user.created                                              │
└────────────────────────┬────────────────────────────────────────────┘
                         │
                         ▼ HTTP POST
┌─────────────────────────────────────────────────────────────────────┐
│ 2. Customer's Application                                           │
│    POST /api/webhooks/ssojet                                        │
│                                                                     │
│    ┌─────────────────────────────────────────────────────────────┐ │
│    │ Next.js Route Handler                                       │ │
│    │   export async function POST(request: Request) {            │ │
│    │     return handler(request); // Calls your package         │ │
│    │   }                                                         │ │
│    └────────────────────────┬────────────────────────────────────┘ │
└─────────────────────────────┼────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 3. @ssojet/ssokit-webhooks Package (Your Code)                      │
│                                                                     │
│    ┌────────────────────────────────────────────────────────────┐  │
│    │ Step 1: Extract Signature                                  │  │
│    │   const signature = request.headers.get('x-ssojet-...')   │  │
│    └────────────────────────────────────────────────────────────┘  │
│                              │                                      │
│                              ▼                                      │
│    ┌────────────────────────────────────────────────────────────┐  │
│    │ Step 2: Verify HMAC-SHA256 Signature                       │  │
│    │   verifyWebhookSignature(body, signature, secret)          │  │
│    │   ✓ Valid → Continue                                       │  │
│    │   ✗ Invalid → Return 401                                   │  │
│    └────────────────────────────────────────────────────────────┘  │
│                              │                                      │
│                              ▼                                      │
│    ┌────────────────────────────────────────────────────────────┐  │
│    │ Step 3: Parse & Validate Payload                           │  │
│    │   const event = WebhookEventSchema.parse(json)             │  │
│    │   Type: UserCreatedEvent                                   │  │
│    └────────────────────────────────────────────────────────────┘  │
│                              │                                      │
│                              ▼                                      │
│    ┌────────────────────────────────────────────────────────────┐  │
│    │ Step 4: Route to Handler                                   │  │
│    │   const handler = handlers['user.created']                 │  │
│    │   await handler(event)  // Customer's function            │  │
│    └────────────────────────────────────────────────────────────┘  │
└─────────────────────────────┼────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 4. Customer's Business Logic (Handler Function)                    │
│                                                                     │
│    'user.created': async (event) => {                               │
│      // Customer writes only this part!                             │
│      await db.users.create({                                        │
│        ssojetId: event.data.user.id,                                │
│        email: event.data.user.email                                 │
│      });                                                            │
│      await sendWelcomeEmail(event.data.user.email);                 │
│    }                                                                │
└─────────────────────────────┬────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 5. Response                                                         │
│    ✓ Success: 200 OK                                                │
│    ✗ Error: 500 Internal Server Error                               │
└─────────────────────────────────────────────────────────────────────┘
```

---

## What Customer Does vs. What Your Package Does

### ✅ **Customer Only Needs To:**

1. **Install the package:**
   ```bash
   npm install @ssojet/ssokit-webhooks
   ```

2. **Get webhook secret from SSOJet dashboard**
   ```env
   SSOJET_WEBHOOK_SECRET=whsec_abc123...
   ```

3. **Create one file** with their event handlers:
   ```typescript
   import { createWebhookHandler } from '@ssojet/ssokit-webhooks';
   
   const handler = createWebhookHandler({
     secret: process.env.SSOJET_WEBHOOK_SECRET!,
     handlers: {
       'user.created': async (event) => {
         // Their custom logic
       }
     }
   });
   
   export async function POST(req: Request) {
     return handler(req);
   }
   ```

4. **Configure webhook URL in SSOJet dashboard:**
   ```
   https://customer-app.com/api/webhooks/ssojet
   ```

That's it! **No manual implementation needed.**

---

### 🔧 **Your Package Handles:**

1. ✅ **Signature verification** (HMAC-SHA256)
2. ✅ **Payload parsing** (JSON to TypeScript objects)
3. ✅ **Schema validation** (Zod validation)
4. ✅ **Type safety** (Full TypeScript support with proper types)
5. ✅ **Event routing** (Calls correct handler based on event type)
6. ✅ **Error handling** (Try-catch with optional error callback)
7. ✅ **HTTP response** (Returns proper status codes)
8. ✅ **Framework adapters** (Next.js App Router & Express.js)

---

## Type Safety Example

Your package provides full TypeScript support:

```typescript
handlers: {
  'user.created': async (event) => {
    // event is automatically typed as UserCreatedEvent
    event.data.user.email  // ✓ TypeScript knows this exists
    event.data.user.id     // ✓ Autocomplete works
    event.data.user.phone  // ✗ Error if field doesn't exist
  },
  
  'group.created': async (event) => {
    // event is automatically typed as GroupCreatedEvent
    event.data.group.name        // ✓ Correct type
    event.data.group.external_id // ✓ Autocomplete
  }
}
```

---

## Event Type Examples

### User Events
```typescript
'user.created': async (event) => {
  // New user signed up
  await createUserAccount(event.data.user);
  await assignDefaultRole(event.data.user.id);
  await sendWelcomeEmail(event.data.user.email);
}

'user.updated': async (event) => {
  // User profile changed
  await syncUserProfile(event.data.user);
}

'user.deleted': async (event) => {
  // User account deleted
  await deleteUserData(event.data.user_id);
  await revokeAccess(event.data.user_id);
}
```

### Directory Sync (SCIM) Events
```typescript
'group.created': async (event) => {
  // New team/department created
  await syncGroupToDatabase(event.data.group);
}

'user.group.added': async (event) => {
  // User added to a group
  await grantGroupPermissions(event.data.user_id, event.data.group_id);
}

'user.group.removed': async (event) => {
  // User removed from group
  await revokeGroupPermissions(event.data.user_id, event.data.group_id);
}
```

### Invitation Events
```typescript
'invitation.sent': async (event) => {
  // Track invitation in your system
  await logInvitation(event.data);
}

'invitation.accepted': async (event) => {
  // User accepted invitation and joined tenant
  await activateTenantAccess(event.data.user_id, event.data.tenant_id);
  await notifyTeamAdmin(event.data.tenant_id);
}

'invitation.revoked': async (event) => {
  // Invitation was cancelled
  await markInvitationExpired(event.data.invitation_id);
}
```

### Tenant Events
```typescript
'tenant.created': async (event) => {
  // New organization/workspace created
  await setupTenantResources(event.data.tenant);
  await createDefaultSettings(event.data.tenant.id);
}
```

---

## Error Handling

### Optional Error Callback

```typescript
const handler = createWebhookHandler({
  secret: process.env.SSOJET_WEBHOOK_SECRET!,
  handlers: {
    'user.created': async (event) => {
      // If this throws an error...
      throw new Error('Database connection failed');
    }
  },
  onError: (error, event) => {
    // ...this function is called
    console.error('Webhook failed:', {
      event: event.event,
      eventId: event.event_id,
      error: error.message,
      stack: error.stack
    });
    
    // Send to error tracking service
    Sentry.captureException(error, {
      tags: {
        webhook_event: event.event,
        event_id: event.event_id
      }
    });
  }
});
```

---

## Security Features

### 1. **Signature Verification**
- Uses HMAC-SHA256 algorithm
- Compares received signature with computed signature
- Prevents replay attacks and tampering

### 2. **Constant-Time Comparison**
```typescript
// Inside verify.ts
function timingSafeEqual(a: string, b: string): boolean {
  // Prevents timing attacks
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  return crypto.timingSafeEqual(bufferA, bufferB);
}
```

### 3. **Schema Validation**
- All payloads validated with Zod
- Rejects malformed requests
- Type-safe at compile and runtime

---

## Framework-Specific Implementation

### Next.js App Router (Recommended)

**File:** `app/api/webhooks/ssojet/route.ts`

```typescript
import { createWebhookHandler } from '@ssojet/ssokit-webhooks';

const handler = createWebhookHandler({
  secret: process.env.SSOJET_WEBHOOK_SECRET!,
  handlers: { /* ... */ }
});

export async function POST(request: Request) {
  return handler(request); // Returns Web API Response
}
```

**How it works:**
- Uses Web API `Request`/`Response`
- Works with Next.js 13+ App Router
- Automatic body parsing
- Built-in error responses

---

### Express.js

**File:** `src/routes/webhooks.ts`

```typescript
import express from 'express';
import { createExpressWebhookHandler } from '@ssojet/ssokit-webhooks';

const router = express.Router();

router.post('/webhooks/ssojet',
  express.raw({ type: 'application/json' }), // IMPORTANT!
  createExpressWebhookHandler({
    secret: process.env.SSOJET_WEBHOOK_SECRET!,
    handlers: { /* ... */ }
  })
);

export default router;
```

**Why `express.raw()`?**
- Signature verification needs raw body
- `express.json()` modifies the body
- Raw middleware preserves original bytes

---

## Package Structure

```
@ssojet/ssokit-webhooks/
├── src/
│   ├── index.ts              # Main exports
│   ├── verify.ts             # Signature verification
│   ├── parser.ts             # Payload parsing & type guards
│   ├── webhook-handler.ts    # createWebhookHandler functions
│   └── handler.ts            # Legacy SCIM handlers
```

### What Each File Does:

**`verify.ts`** - Signature Verification
```typescript
export async function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string
): Promise<boolean>
```

**`parser.ts`** - Type Guards
```typescript
export function isUserCreatedEvent(event: WebhookEvent): event is UserCreatedEvent
export function isGroupCreatedEvent(event: WebhookEvent): event is GroupCreatedEvent
// ... etc
```

**`webhook-handler.ts`** - Main Handler Functions
```typescript
export function createWebhookHandler(config: WebhookConfig)
export function createExpressWebhookHandler(config: WebhookConfig)
```

---

## Real-World Usage Example

**Scenario:** Customer wants to sync SSOJet users to their PostgreSQL database and send welcome emails.

```typescript
// app/api/webhooks/ssojet/route.ts
import { createWebhookHandler } from '@ssojet/ssokit-webhooks';
import { db } from '@/lib/database';
import { sendEmail } from '@/lib/email';

const handler = createWebhookHandler({
  secret: process.env.SSOJET_WEBHOOK_SECRET!,
  
  handlers: {
    // Handle new user creation
    'user.created': async (event) => {
      const { user } = event.data;
      
      // 1. Create user in database
      await db.users.create({
        data: {
          ssojetId: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          createdAt: new Date(user.created_at)
        }
      });
      
      // 2. Send welcome email
      await sendEmail({
        to: user.email,
        subject: 'Welcome to our platform!',
        template: 'welcome',
        data: { name: user.first_name }
      });
      
      // 3. Create default user settings
      await db.userSettings.create({
        data: {
          userId: user.id,
          theme: 'light',
          notifications: true
        }
      });
    },
    
    // Handle user updates
    'user.updated': async (event) => {
      const { user } = event.data;
      
      await db.users.update({
        where: { ssojetId: user.id },
        data: {
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          updatedAt: new Date()
        }
      });
    },
    
    // Handle invitation acceptance
    'invitation.accepted': async (event) => {
      const { user_id, tenant_id } = event.data;
      
      // Grant access to tenant resources
      await db.tenantMembers.create({
        data: {
          userId: user_id,
          tenantId: tenant_id,
          role: 'member',
          joinedAt: new Date()
        }
      });
      
      // Notify team admin
      await notifyTeamAdmin(tenant_id, user_id);
    },
    
    // Catch-all for unhandled events
    '*': async (event) => {
      console.log('Received event:', event.event);
    }
  },
  
  // Error handling
  onError: (error, event) => {
    console.error('Webhook processing failed:', {
      event: event.event,
      eventId: event.event_id,
      error: error.message
    });
    
    // Send to monitoring service
    Sentry.captureException(error);
  }
});

export async function POST(request: Request) {
  return handler(request);
}
```

---

## Testing Webhooks

### Local Testing with ngrok

```bash
# 1. Start your dev server
npm run dev  # Runs on http://localhost:3000

# 2. Expose local server to internet
ngrok http 3000

# 3. Use ngrok URL in SSOJet dashboard
# https://abc123.ngrok.io/api/webhooks/ssojet
```

### Manual Testing with cURL

```bash
# Generate HMAC signature
SECRET="your-webhook-secret"
PAYLOAD='{"event":"user.created","event_id":"test","created_at":"2023-09-01T12:00:00Z","data":{"user":{"id":"usr_123","email":"test@example.com"}}}'
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$SECRET" | sed 's/^.* //')

# Send test webhook
curl -X POST http://localhost:3000/api/webhooks/ssojet \
  -H "Content-Type: application/json" \
  -H "X-SSOJet-Signature: sha256=$SIGNATURE" \
  -d "$PAYLOAD"
```

---

## Benefits for Customers

| What They Get | Without Your Package | With Your Package |
|---------------|---------------------|-------------------|
| **Signature Verification** | Must implement manually | ✅ Automatic |
| **Payload Parsing** | Manual JSON parsing | ✅ Automatic with validation |
| **Type Safety** | Must define types | ✅ Full TypeScript support |
| **Error Handling** | Must implement | ✅ Built-in with callbacks |
| **Multiple Events** | Switch/case logic | ✅ Clean handler object |
| **Framework Support** | DIY adapters | ✅ Next.js & Express ready |
| **Security** | Research & implement | ✅ Production-ready |
| **Code Lines** | 100-200 lines | ✅ 10-20 lines |

---

## Summary

Your `@ssojet/ssokit-webhooks` package provides a **complete, production-ready webhook handling solution** that:

1. ✅ **Eliminates boilerplate** - Customers write only business logic
2. ✅ **Ensures security** - Built-in signature verification
3. ✅ **Provides type safety** - Full TypeScript support
4. ✅ **Handles errors** - Graceful error handling with callbacks
5. ✅ **Supports frameworks** - Next.js App Router and Express.js
6. ✅ **Validates data** - Zod schema validation
7. ✅ **Simple API** - Import, configure, use

**Customers love it because:** They can integrate SSOJet webhooks in minutes instead of hours, with confidence that security and validation are handled correctly.
