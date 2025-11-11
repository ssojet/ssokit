# Self-Contained TeamManager Widget

The TeamManager is now completely self-contained and makes direct calls to SSOJet APIs from the browser using user access tokens.

## 🎯 **Your Objective Achieved**

✅ **Single Component**: Just import TeamManager and it works  
✅ **No API Routes**: No need for Next.js API proxy routes  
✅ **Environment Variables**: Simple configuration  
✅ **Direct SSOJet Integration**: Calls SSOJet APIs directly  
✅ **Reusable Anywhere**: Works in any React app  

## 🚀 **Usage**

### Step 1: Install the Package
```bash
npm install @ssojet/authkit-team @ssojet/authkit-css
```

### Step 2: Set Environment Variables
```bash
# Required: SSOJet API Base URL
NEXT_PUBLIC_SSOJET_BASE=https://api.ssojet.com
```

### Step 3: Use the Component
```tsx
import { TeamManager } from '@ssojet/authkit-team';
import '@ssojet/authkit-team/styles.css';

function MyApp() {
  const userAccessToken = 'user_access_token_here'; // From your auth system

  return (
    <TeamManager
      organizationId="org123"
      currentUserId="user456"
      accessToken={userAccessToken}
      showAuditLog={true}
    />
  );
}
```

## 🔧 **Props**

```typescript
interface TeamManagerProps {
  /** Organization ID to manage */
  organizationId: string;
  /** Access token for SSOJet API authentication */
  accessToken?: string;
  /** Current user ID (for permissions) */
  currentUserId?: string;
  /** API base URL (defaults to env var) */
  apiBase?: string;
  /** Show audit log tab */
  showAuditLog?: boolean;
  /** Custom CSS class */
  className?: string;
  /** Callback when member is removed */
  onMemberRemoved?: (memberId: string) => void;
  /** Callback when invite is sent */
  onInviteSent?: (invite: any) => void;
}
```

## 📡 **Direct API Calls**

The widget now makes direct calls to SSOJet APIs:

```typescript
// Members
GET    https://api.ssojet.com/api/v1/tenants/{orgId}/users
POST   https://api.ssojet.com/api/v1/auth/tenants/{orgId}/invitations

// Invitations  
GET    https://api.ssojet.com/api/v1/auth/tenants/{orgId}/invitations
POST   https://api.ssojet.com/api/v1/auth/tenants/{orgId}/invitations/{inviteId}/resend
DELETE https://api.ssojet.com/api/v1/auth/tenants/{orgId}/invitations/{inviteId}

// Roles & Audit
GET    https://api.ssojet.com/api/v1/roles
GET    https://api.ssojet.com/api/v1/tenants/{orgId}/audit
```

## 🔐 **Authentication**

The widget uses the user's access token for all API calls:

```typescript
// Headers sent with every request
Authorization: Bearer {userAccessToken}
Content-Type: application/json
```

## 🌍 **Framework Agnostic**

Works in any React environment:

### Next.js
```tsx
// Get access token from NextAuth session
const { data: session } = useSession();

<TeamManager 
  organizationId="org123"
  accessToken={session?.accessToken}
/>
```

### React + Auth0
```tsx
// Get access token from Auth0
const { getAccessTokenSilently } = useAuth0();
const token = await getAccessTokenSilently();

<TeamManager 
  organizationId="org123"
  accessToken={token}
/>
```

### React + Custom Auth
```tsx
// Get access token from your custom auth
const token = getTokenFromYourAuthSystem();

<TeamManager 
  organizationId="org123"
  accessToken={token}
/>
```

## 🔧 **Configuration Options**

### Environment Variables
```bash
# Required
NEXT_PUBLIC_SSOJET_BASE=https://api.ssojet.com

# Optional: Override via props
NEXT_PUBLIC_DEFAULT_SSOJET_CLIENT_ID=cli_d3vlr9k4
```

### Props Override
```tsx
<TeamManager
  organizationId="org123"
  accessToken={token}
  apiBase="https://custom-api.ssojet.com"  // Override env var
/>
```

## 🎨 **Styling**

Import the CSS styles:
```tsx
import '@ssojet/authkit-team/styles.css';
```

Or customize with your own CSS targeting the `.ak-team-manager` classes.

## ✅ **Benefits**

1. **🚀 Zero Setup**: No API routes to configure
2. **🔧 Portable**: Works in any React app
3. **🔐 Secure**: Uses user access tokens
4. **📦 Self-Contained**: All logic in one component
5. **🎯 Simple**: Just set env vars and import

## 📋 **Migration Guide**

If you were using the old proxy-based approach:

### Before (with API routes)
```tsx
<TeamManager
  organizationId="org123"
  apiBase="/api/authkit"  // Next.js API routes
/>
```

### After (direct SSOJet calls)
```tsx
<TeamManager
  organizationId="org123"
  accessToken={userAccessToken}  // User's access token
  apiBase="https://api.ssojet.com"  // Direct SSOJet API
/>
```

### Delete Old API Routes
You can now delete these files:
- `/api/authkit/orgs/[orgId]/members/route.ts`
- `/api/authkit/orgs/[orgId]/invites/route.ts`
- `/api/authkit/orgs/[orgId]/roles/route.ts`
- `/api/authkit/orgs/[orgId]/audit-logs/route.ts`

## 🎯 **Perfect for Your Use Case**

This achieves exactly what you wanted:
- ✅ Single component with all SSOJet logic
- ✅ No duplication or proxy routes
- ✅ Just import and use anywhere
- ✅ Simple environment configuration
- ✅ Direct SSOJet API integration

Anyone can now use the TeamManager widget by just:
1. Setting `NEXT_PUBLIC_SSOJET_BASE=https://api.ssojet.com`
2. Importing the component
3. Passing the user's access token

That's it! 🎉