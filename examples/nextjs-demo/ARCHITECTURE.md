# AuthKit API Architecture

## Overview

The AuthKit system now uses a proper client-server architecture where client-side components communicate with SSOJet APIs through Next.js API routes instead of making direct API calls.

## Architecture Flow

```
[TeamManager Component] → [AuthKitClient] → [Next.js API Routes] → [SSOJetClient] → [SSOJet API]
     (Client-side)         (Client-side)      (Server-side)        (Server-side)     (External)
```

## Components

### 1. **AuthKitClient** (Client-side)
- **Location**: `packages/authkit-team/src/api-client.ts`
- **Purpose**: Client-side API wrapper for React components
- **Usage**: Makes requests to Next.js API routes, not directly to SSOJet

```typescript
const apiClient = new AuthKitClient('/api/authkit');
await apiClient.getMembers(organizationId);
```

### 2. **Next.js API Routes** (Server-side)
- **Location**: `examples/nextjs-demo/src/app/api/authkit/orgs/[orgId]/`
- **Purpose**: Authentication middleware and SSOJet API proxy
- **Features**:
  - Session validation with `withAuth` wrapper
  - User access token management
  - Comprehensive logging with request IDs
  - Error handling and sanitization

### 3. **SSOJetClient** (Server-side)
- **Location**: `packages/authkit-next/src/client.ts`
- **Purpose**: Direct communication with SSOJet APIs
- **Features**:
  - Uses user access tokens (not API keys)
  - Automatic token refresh handling
  - Detailed request/response logging
  - Error handling and retries

## API Endpoints

### Members Management
```
GET    /api/authkit/orgs/{orgId}/members
POST   /api/authkit/orgs/{orgId}/members
PATCH  /api/authkit/orgs/{orgId}/members/{memberId}
DELETE /api/authkit/orgs/{orgId}/members/{memberId}
```

### Invitations Management
```
GET    /api/authkit/orgs/{orgId}/invites
POST   /api/authkit/orgs/{orgId}/invites
POST   /api/authkit/orgs/{orgId}/invites/{inviteId}  # Resend
DELETE /api/authkit/orgs/{orgId}/invites/{inviteId}  # Revoke
```

### Roles & Audit
```
GET    /api/authkit/orgs/{orgId}/roles
GET    /api/authkit/orgs/{orgId}/audit-logs
```

## Authentication Flow

1. **User Login**: NextAuth.js handles OIDC authentication with SSOJet
2. **Token Storage**: Access tokens stored in JWT session
3. **API Requests**: Client components call Next.js API routes
4. **Session Validation**: `withAuth` wrapper validates session and extracts access token
5. **SSOJet Calls**: Server-side `SSOJetClient` uses user's access token
6. **Response**: Data flows back through the chain

## Benefits

### 🔐 **Security**
- User access tokens instead of system API keys
- Session-based authentication
- Server-side token management
- No direct external API calls from client

### 📊 **Logging & Debugging**
- Unique request IDs for correlation
- Color-coded logs by component
- Performance timing metrics
- Error tracking and debugging

### 🛠️ **Developer Experience**
- Simple client-side API (`apiClient.getMembers()`)
- Automatic authentication handling
- TypeScript support throughout
- Comprehensive error messages

### 🚀 **Performance**
- Efficient token refresh handling
- Request caching and optimization
- Background logging (production-ready)

## Usage Examples

### In React Components
```typescript
import { AuthKitClient } from '@ssojet/authkit-team';

const apiClient = new AuthKitClient('/api/authkit');

// Fetch members
const members = await apiClient.getMembers(organizationId);

// Add member
await apiClient.createInvite(organizationId, { 
  email: 'user@example.com', 
  role: 'member' 
});
```

### In TeamManager
```typescript
<TeamManager
  organizationId="org123"
  currentUserId="user456"
  apiBase="/api/authkit"  // Uses Next.js API routes
  showAuditLog={true}
/>
```

## Configuration

### Environment Variables
```bash
# Authentication (Required)
SSOJET_CLIENT_ID=your_client_id
SSOJET_CLIENT_SECRET=your_client_secret
SSOJET_ISSUER=https://your-domain.auth.ssojet.com

# API Configuration (Required)
SSOJET_BASE=https://api.ssojet.com

# Debug Logging (Optional)
SSOJET_DEBUG=true
NODE_ENV=development
```

### Next.js Integration
```typescript
// app/api/authkit/orgs/[orgId]/members/route.ts
export async function GET(request: NextRequest, { params }) {
  return withAuth(request, params, async (session, { orgId }) => {
    const client = createSSOJetClient(session);
    return await client.listMembers(orgId);
  });
}
```

This architecture provides a secure, scalable, and maintainable way to integrate SSOJet APIs with React components while maintaining proper authentication and logging throughout the stack.