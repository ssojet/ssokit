# Environment Variable Migration Guide

## Overview

The SSOKit AuthKit project has been updated to use new standardized environment variable names for OIDC authentication configuration. This migration aligns with the default SSOJet environment variable naming convention.

## Migration Summary

### Old Environment Variables (Deprecated)
```bash
SSOJET_CLIENT_ID=your-oidc-client-id
SSOJET_CLIENT_SECRET=your-oidc-client-secret
SSOJET_ISSUER=https://dns-mo.auth.ssojet.com
SSOJET_REDIRECT_URI=http://localhost:3000/api/auth/callback
```

### New Environment Variables (Current)
```bash
DEFAULT_SSOJET_AUTHORITY=https://dns-mo.auth.ssojet.com
DEFAULT_SSOJET_CLIENT_ID=cli_d3vlr9k4
DEFAULT_SSOJET_CLIENT_SECRET=sk_d3
DEFAULT_SSOJET_API_URL=https://api.ssojet.com/api/v1
DEFAULT_SSOJET_REDIRECT_URI=http://localhost:3000/api/auth/callback
```

## Changes by Variable

| Old Variable | New Variable | Purpose |
|-------------|--------------|---------|
| `SSOJET_CLIENT_ID` | `DEFAULT_SSOJET_CLIENT_ID` | OIDC Client ID |
| `SSOJET_CLIENT_SECRET` | `DEFAULT_SSOJET_CLIENT_SECRET` | OIDC Client Secret |
| `SSOJET_ISSUER` | `DEFAULT_SSOJET_AUTHORITY` | OIDC Authority/Issuer URL |
| `SSOJET_REDIRECT_URI` | `DEFAULT_SSOJET_REDIRECT_URI` | OAuth2 Redirect URI |
| N/A (New) | `DEFAULT_SSOJET_API_URL` | SSOJet API Base URL |

### Client-Side Variables

For browser/client-side usage:

| Old Variable | New Variable |
|-------------|--------------|
| `NEXT_PUBLIC_SSOJET_CLIENT_ID` | `NEXT_PUBLIC_DEFAULT_SSOJET_CLIENT_ID` |

## What Was Updated

### 1. Environment Configuration Files
- ✅ `examples/nextjs-demo/.env.example`
- ✅ `templates/.env.example`

### 2. Core Package Files
- ✅ `packages/ssokit-core/src/config.ts` - Updated client ID reference
- ✅ `packages/ssokit-next/src/client.ts` - Updated public and private client ID references

### 3. Application Code
- ✅ `examples/nextjs-demo/src/lib/auth.ts` - Updated all OIDC configuration references

### 4. Template Files
- ✅ `templates/minimal-example/lib-auth.ts` - Updated auth provider configuration
- ✅ `templates/minimal-example/components-TeamManagement.tsx` - Updated client initialization

### 5. Documentation Files
- ✅ `PRIVATE_INSTALLATION.md` - Updated installation guide
- ✅ `examples/nextjs-demo/IMPLEMENTATION_SUMMARY.md` - Updated implementation docs
- ✅ `examples/nextjs-demo/ARCHITECTURE.md` - Updated architecture docs
- ✅ `examples/nextjs-demo/setup.sh` - Updated setup script
- ✅ `packages/ssokit-team/SELF_CONTAINED.md` - Updated team widget docs

## Migration Steps for Existing Projects

If you're using an older version of SSOKit AuthKit, follow these steps:

### Step 1: Update Your .env.local File

Replace your old environment variables with the new ones:

```bash
# Old (remove these)
# SSOJET_CLIENT_ID=your-old-client-id
# SSOJET_CLIENT_SECRET=your-old-secret
# SSOJET_ISSUER=https://your-domain.auth.ssojet.com

# New (add these)
DEFAULT_SSOJET_AUTHORITY=https://dns-mo.auth.ssojet.com
DEFAULT_SSOJET_CLIENT_ID=cli_d3vlr9k4
DEFAULT_SSOJET_CLIENT_SECRET=sk_d3
DEFAULT_SSOJET_API_URL=https://api.ssojet.com/api/v1
DEFAULT_SSOJET_REDIRECT_URI=http://localhost:3000/api/auth/callback
```

### Step 2: Update Your Code

#### For NextAuth Configuration

**Before:**
```typescript
SSOJetProvider({
  clientId: process.env.SSOJET_CLIENT_ID!,
  clientSecret: process.env.SSOJET_CLIENT_SECRET!,
  issuer: process.env.SSOJET_ISSUER!,
})
```

**After:**
```typescript
SSOJetProvider({
  clientId: process.env.DEFAULT_SSOJET_CLIENT_ID!,
  clientSecret: process.env.DEFAULT_SSOJET_CLIENT_SECRET!,
  issuer: process.env.DEFAULT_SSOJET_AUTHORITY!,
})
```

#### For Client-Side Components

**Before:**
```typescript
const client = new SSOJetClient(accessToken, {
  clientId: process.env.NEXT_PUBLIC_SSOJET_CLIENT_ID,
});
```

**After:**
```typescript
const client = new SSOJetClient(accessToken, {
  clientId: process.env.NEXT_PUBLIC_DEFAULT_SSOJET_CLIENT_ID,
});
```

### Step 3: Update Package Dependencies

Pull the latest version of SSOKit packages:

```bash
pnpm install
# or
npm install
```

### Step 4: Rebuild Your Application

```bash
pnpm run build
# or
npm run build
```

## Default Values

The new environment variables come with default/example values:

- **Authority**: `https://dns-mo.auth.ssojet.com`
- **Client ID**: `cli_d3vlr9k4`
- **Client Secret**: `sk_d3`
- **API URL**: `https://api.ssojet.com/api/v1`

> **Note**: These are example values. Replace them with your actual SSOJet credentials from your dashboard.

## Backward Compatibility

The packages have been updated to prioritize the new variable names but maintain fallback support where possible:

```typescript
// Priority order:
// 1. New variable: DEFAULT_SSOJET_CLIENT_ID
// 2. Old variable: SSOJET_CLIENT_ID (fallback)
const clientId = process.env.DEFAULT_SSOJET_CLIENT_ID || process.env.SSOJET_CLIENT_ID;
```

However, it's recommended to update to the new variable names to ensure long-term compatibility.

## Benefits of the New Naming

1. **Consistency**: Aligns with SSOJet's standard naming convention
2. **Clarity**: `DEFAULT_SSOJET_AUTHORITY` is clearer than `SSOJET_ISSUER`
3. **Extensibility**: The `DEFAULT_` prefix allows for multiple configurations
4. **Completeness**: Includes `DEFAULT_SSOJET_API_URL` for API base URL

## Need Help?

If you encounter issues during migration:

1. Check that all environment variables are set correctly
2. Ensure you're using the latest version of SSOKit packages
3. Review the build output for any missing environment variable warnings
4. Refer to the example in `examples/nextjs-demo/` for a working implementation

## Build Verification

After migration, verify that your project builds successfully:

```bash
pnpm run build
```

All packages should compile without errors:
- ✅ @ssojet/ssokit-core
- ✅ @ssojet/ssokit-next
- ✅ @ssojet/ssokit-react
- ✅ @ssojet/ssokit-team
- ✅ @ssojet/ssokit-webhooks
- ✅ @ssojet/ssokit-css

---

**Migration Date**: November 10, 2025  
**Updated By**: SSOKit Team
