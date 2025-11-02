# SSOJet AuthKit OIDC Authentication Implementation

This document provides comprehensive implementation guidelines for integrating OIDC authentication with SSOJet in your Next.js application using AuthKit.

## Overview

SSOJet supports standard OIDC (OpenID Connect) authentication flows, providing secure user authentication and authorization. This implementation uses NextAuth.js for seamless integration with Next.js applications.

## Prerequisites

1. **SSOJet Account**: Active SSOJet account with OIDC application configured
2. **OIDC Application Setup**: 
   - Client ID and Client Secret from SSOJet dashboard
   - Redirect URI configured: `http://localhost:3000/api/auth/callback` (for development)
3. **Next.js 13+**: App Router with TypeScript support

## Quick Start Guide

### 1. Install Dependencies

```bash
npm install next-auth openid-client jose
# or
pnpm add next-auth openid-client jose
```

### 2. Environment Configuration

Add the following variables to your `.env.local`:

```bash
# Required: SSOJet OIDC Configuration
SSOJET_CLIENT_ID=your-oidc-client-id
SSOJET_CLIENT_SECRET=your-oidc-client-secret
SSOJET_ISSUER=https://api.ssojet.com
SSOJET_REDIRECT_URI=http://localhost:3000/api/auth/callback

# Required: NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-here

# Optional: SSOJet API (for team management)
SSOJET_BASE=https://api.ssojet.com
SSOJET_API_KEY=sk_live_your_api_key_here
```

### 3. Configure NextAuth

Create `/src/lib/auth.ts`:

```typescript
import { NextAuthOptions } from 'next-auth';
import { JWT } from 'next-auth/jwt';

interface SSOJetProfile {
  sub: string;
  email: string;
  name: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  email_verified?: boolean;
  organizations?: Array<{
    id: string;
    name: string;
    roles: string[];
  }>;
}

export const authOptions: NextAuthOptions = {
  providers: [
    {
      id: 'ssojet',
      name: 'SSOJet',
      type: 'oauth',
      wellKnown: `${process.env.SSOJET_ISSUER}/.well-known/openid_configuration`,
      clientId: process.env.SSOJET_CLIENT_ID!,
      clientSecret: process.env.SSOJET_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid profile email organizations',
          response_type: 'code',
        },
      },
      idToken: true,
      checks: ['pkce', 'state'],
      profile(profile: SSOJetProfile) {
        return {
          id: profile.sub,
          name: profile.name || `${profile.given_name} ${profile.family_name}`.trim(),
          email: profile.email,
          image: profile.picture,
          organizations: profile.organizations || [],
        };
      },
    },
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: account.expires_at ? account.expires_at * 1000 : 0,
          organizations: (profile as SSOJetProfile).organizations || [],
        };
      }

      // Return previous token if access token has not expired
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      // Access token expired, refresh it
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      if (token) {
        session.accessToken = token.accessToken as string;
        session.error = token.error as string;
        session.user.organizations = token.organizations as Array<{
          id: string;
          name: string;
          roles: string[];
        }>;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
};

async function refreshAccessToken(token: JWT) {
  try {
    const url = `${process.env.SSOJET_ISSUER}/oauth/token`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      method: 'POST',
      body: new URLSearchParams({
        client_id: process.env.SSOJET_CLIENT_ID!,
        client_secret: process.env.SSOJET_CLIENT_SECRET!,
        grant_type: 'refresh_token',
        refresh_token: token.refreshToken as string,
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}
```

### 4. Setup API Route

Create `/src/app/api/auth/[...nextauth]/route.ts`:

```typescript
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
```

### 5. Add Authentication Provider

Create `/src/components/AuthProvider.tsx`:

```typescript
'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  return (
    <SessionProvider refetchInterval={5 * 60} refetchOnWindowFocus={true}>
      {children}
    </SessionProvider>
  );
}
```

### 6. Update Root Layout

Update `/src/app/layout.tsx`:

```typescript
import AuthProvider from '@/components/AuthProvider';
import { AuthKitProvider } from '@ssojet/authkit-react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <AuthKitProvider config={{ apiBase: '/api/authkit' }}>
            {children}
          </AuthKitProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
```

### 7. Create User Profile Component

Create `/src/components/UserProfile.tsx`:

```typescript
'use client';

import { signIn, signOut, useSession } from 'next-auth/react';

export default function UserProfile() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    return (
      <button
        onClick={() => signIn('ssojet')}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
      >
        Sign In
      </button>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <span>Welcome, {session.user.name}!</span>
      <button
        onClick={() => signOut()}
        className="text-gray-600 hover:text-gray-800"
      >
        Sign Out
      </button>
    </div>
  );
}
```

### 8. Protect Routes with Middleware

Create `/src/middleware.ts`:

```typescript
import { withAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware(req) {
    // Add custom logic here if needed
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        if (req.nextUrl.pathname.startsWith('/dashboard')) {
          return !!token;
        }
        return true;
      },
    },
    pages: {
      signIn: '/auth/signin',
    },
  }
);

export const config = {
  matcher: ['/dashboard/:path*'],
};
```

### 9. Create Custom Sign-In Page

Create `/src/app/auth/signin/page.tsx`:

```typescript
'use client';

import { signIn, getProviders } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function SignIn() {
  const [providers, setProviders] = useState(null);

  useEffect(() => {
    const setAuthProviders = async () => {
      const res = await getProviders();
      setProviders(res);
    };
    setAuthProviders();
  }, []);

  if (!providers) return <div>Loading...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <div>
          {Object.values(providers).map((provider) => (
            <button
              key={provider.name}
              onClick={() => signIn(provider.id, { callbackUrl: '/dashboard' })}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Sign in with {provider.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
```

## OIDC Flow Details

### 1. Authorization Request

When users click "Sign In", they're redirected to SSOJet's authorization endpoint:

```
https://api.ssojet.com/oauth/authorize?
  client_id=your-client-id&
  response_type=code&
  scope=openid profile email organizations&
  redirect_uri=http://localhost:3000/api/auth/callback&
  state=random-state&
  code_challenge=challenge&
  code_challenge_method=S256
```

### 2. Authorization Response

After authentication, SSOJet redirects back with an authorization code:

```
http://localhost:3000/api/auth/callback?code=auth-code&state=random-state
```

### 3. Token Exchange

NextAuth exchanges the authorization code for tokens:

```typescript
POST https://api.ssojet.com/oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&
code=auth-code&
redirect_uri=http://localhost:3000/api/auth/callback&
client_id=your-client-id&
client_secret=your-client-secret&
code_verifier=verifier
```

### 4. User Info Retrieval

The ID token contains user information, or fetch from userinfo endpoint:

```typescript
GET https://api.ssojet.com/oauth/userinfo
Authorization: Bearer access-token
```

## Advanced Features

### Organization-Based Access Control

```typescript
// In your protected component
const { data: session } = useSession();

const userOrganizations = session?.user?.organizations || [];
const hasAdminRole = userOrganizations.some(org => 
  org.roles.includes('admin')
);

if (hasAdminRole) {
  // Show admin features
}
```

### Token Refresh

```typescript
// Automatic token refresh is handled by NextAuth
// Custom refresh logic in auth.ts refreshAccessToken function
```

### Logout

```typescript
import { signOut } from 'next-auth/react';

// Client-side logout
await signOut({ callbackUrl: '/' });

// Server-side logout (optional)
const logoutUrl = `${process.env.SSOJET_ISSUER}/oauth/logout?post_logout_redirect_uri=${encodeURIComponent(process.env.NEXTAUTH_URL)}`;
```

## Security Considerations

### 1. Environment Variables

- Never expose client secrets in client-side code
- Use different credentials for development/staging/production
- Rotate secrets regularly

### 2. Session Security

```typescript
// In auth.ts
session: {
  strategy: 'jwt',
  maxAge: 24 * 60 * 60, // 24 hours
  updateAge: 60 * 60,   // Update every hour
},
```

### 3. CSRF Protection

NextAuth.js includes built-in CSRF protection. Ensure you're using secure cookies in production:

```typescript
cookies: {
  sessionToken: {
    name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
    options: {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
    },
  },
},
```

## Testing

### 1. Test Configuration

Create a test route to verify your setup:

```typescript
// /src/app/api/test-auth/route.ts
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  const session = await getServerSession(authOptions);
  return Response.json({ session });
}
```

### 2. Local Development

```bash
# Start your development server
npm run dev

# Visit test endpoints
curl http://localhost:3000/api/test-auth
curl http://localhost:3000/api/auth/providers
```

### 3. Production Checklist

- [ ] Update `NEXTAUTH_URL` to production domain
- [ ] Configure production redirect URIs in SSOJet dashboard  
- [ ] Use secure session cookies
- [ ] Enable HTTPS
- [ ] Test token refresh functionality
- [ ] Verify logout behavior

## Troubleshooting

### Common Issues

1. **"Invalid redirect_uri"**
   - Ensure redirect URI in SSOJet dashboard matches exactly
   - Include protocol (https://) and port if needed

2. **"Invalid client credentials"**
   - Verify `SSOJET_CLIENT_ID` and `SSOJET_CLIENT_SECRET`
   - Check for extra whitespace in environment variables

3. **"Session not found"**
   - Verify `NEXTAUTH_SECRET` is set and consistent
   - Check that AuthProvider wraps your app

4. **"Token refresh failed"**
   - Ensure refresh token is being stored correctly
   - Verify SSOJet supports refresh tokens for your application

### Debug Mode

Enable NextAuth debug logging:

```bash
NEXTAUTH_DEBUG=1 npm run dev
```

## Production Deployment

### Environment Variables

```bash
# Production environment
NEXTAUTH_URL=https://yourapp.com
SSOJET_ISSUER=https://api.ssojet.com
SSOJET_REDIRECT_URI=https://yourapp.com/api/auth/callback

# Generate secure secret
NEXTAUTH_SECRET=$(openssl rand -base64 32)
```

### SSOJet Dashboard Configuration

1. Add production redirect URI: `https://yourapp.com/api/auth/callback`
2. Configure allowed origins if using CORS
3. Set up webhook URLs for real-time updates
4. Test authentication flow in production environment

## Integration with SSOJet AuthKit

Once authentication is configured, integrate with AuthKit components:

```typescript
// Protected team management page
'use client';

import { useSession } from 'next-auth/react';
import { TeamManager } from '@ssojet/authkit-team';

export default function TeamPage() {
  const { data: session } = useSession();
  
  if (!session?.user?.organizations?.[0]) {
    return <div>No organization found</div>;
  }

  const orgId = session.user.organizations[0].id;

  return (
    <div>
      <h1>Team Management</h1>
      <TeamManager orgId={orgId} />
    </div>
  );
}
```

This completes the OIDC authentication integration with SSOJet AuthKit. The implementation provides secure authentication, session management, and seamless integration with team management features.