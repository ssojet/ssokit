# SSOJet AuthKit Next.js Demo

This demo application showcases how to integrate SSOJet AuthKit into a Next.js application with full team management capabilities.

## Features Demonstrated

- ✅ **OIDC Authentication** - Secure login with SSOJet OIDC flow
- ✅ **Protected Routes** - Middleware-based route protection
- ✅ **Session Management** - JWT-based sessions with automatic refresh
- ✅ **Team Management UI** - Complete member and invitation management
- ✅ **Webhook Integration** - Real-time updates via SSOJet webhooks
- ✅ **SCIM Provisioning** - Automatic user provisioning (optional)
- ✅ **Custom Theming** - Multiple theme presets and custom styling
- ✅ **TypeScript Support** - Full type safety
- ✅ **API Route Handlers** - All required Next.js API routes

## Quick Start

### 1. Automated Setup (Recommended)

Run the setup script to automatically configure the demo:

```bash
./setup.sh
```

This will:
- Install all dependencies  
- Create `.env.local` from template
- Generate secure `NEXTAUTH_SECRET`
- Show next steps

### 2. Manual Environment Setup

Alternatively, copy the environment template and fill in your values:

```bash
cp .env.example .env.local
```

Required environment variables:

```bash
# SSOJet API Configuration
SSOJET_BASE=https://api.ssojet.com
SSOJET_API_KEY=sk_live_your_api_key_here
SSOJET_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Optional: SCIM Integration
SCIM_BASE_URL=https://your-scim-provider.com/scim/v2
SCIM_TOKEN=your_scim_bearer_token

# Optional: Theming
NEXT_PUBLIC_AUTHKIT_THEME='{"primary":"#3b82f6","radius":"8px"}'
```

### 2. Install Dependencies

```bash
pnpm install
# or
npm install
```

### 3. Run Development Server

```bash
pnpm dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the demo.

## Demo Pages

### `/` - Home
- Overview of AuthKit features
- Quick links to demo sections
- Authentication status display

### `/auth/signin` - OIDC Sign-In
- SSOJet OIDC authentication flow
- Custom branded sign-in experience
- Automatic redirect after login

### `/dashboard` - Main Dashboard (Protected)
- User profile and organization information  
- Team management interface
- Quick action cards for all features

### `/dashboard/team` - Team Manager Widget (Protected)
- Full-featured team management component
- Members, invites, roles, and audit logs
- Theme customization demo

### `/dashboard/api-test` - API Testing (Protected)
- Test API connectivity
- Validate configuration
- Debug API responses

### `/dashboard/webhooks` - Webhook Testing (Protected)
- Webhook event simulation
- SCIM provisioning testing
- Event log viewer

## Demo Architecture

The demo focuses on **essential integration points only**:

### What the Demo Shows
- ✅ **OIDC Authentication**: Complete sign-in flow with SSOJet
- ✅ **TeamManager Widget**: Direct usage of `@ssojet/authkit-team`
- ✅ **Session Integration**: Organization ID from authenticated user
- ✅ **Environment Setup**: Configuration for SSOJet APIs

### What AuthKit Handles Automatically  
- 🔧 **API Routes**: Team management APIs handled by `@ssojet/authkit-next`
- 🔧 **Data Fetching**: Widget makes direct calls to SSOJet APIs
- 🔧 **SCIM Provisioning**: Webhook processing via `@ssojet/authkit-webhooks`

**Key Point**: You don't need to implement API routes manually - AuthKit packages handle this!

## Testing Webhooks Locally

Use ngrok to expose your local server for webhook testing:

```bash
# Install ngrok if you haven't already
npm install -g ngrok

# Expose local server
ngrok http 3000

# Update webhook URL in SSOJet dashboard to:
# https://your-ngrok-url.ngrok.io/api/authkit/webhooks
```

## Customization Examples

### Custom Theme
See `app/dashboard/team/page.tsx` for theme customization examples.

### Custom Components
Check `components/` directory for custom component implementations.

### API Integration
Review `lib/api.ts` for direct SSOJetClient usage examples.

## Troubleshooting

### Common Issues

1. **Configuration Errors**
   - Visit `/dashboard/api-test` to validate your setup
   - Check environment variables are correctly set

2. **Webhook Issues**
   - Ensure webhook secret matches SSOJet dashboard
   - Check ngrok is properly exposing your local server

3. **SCIM Integration**
   - Verify SCIM endpoint is accessible
   - Check SCIM token has proper permissions

## Production Deployment

This demo is configured for development. For production:

1. Update environment variables for production API endpoints
2. Configure proper webhook URLs (not ngrok)
3. Add proper authentication and authorization
4. Implement error logging and monitoring
5. Add rate limiting and security headers

## Learn More

- [SSOJet Documentation](https://docs.ssojet.com)
- [AuthKit Implementation Guide](../../docs/implementation-guide.md)
- [Next.js Documentation](https://nextjs.org/docs)