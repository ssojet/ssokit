# SSOKit Private Repository Integration

This directory contains everything you need to integrate SSOKit packages into your Next.js projects directly from a private Git repository, without publishing to public npm registries.

## 📁 Directory Structure

```
/
├── PRIVATE_INSTALLATION.md       # Comprehensive installation guide
├── scripts/
│   └── install-private.sh        # Automated installation script  
├── templates/
│   ├── package.json              # Package.json template with SSOKit deps
│   ├── .env.example              # Environment variables template
│   └── minimal-example/          # Minimal implementation examples
│       ├── lib-auth.ts           # Authentication setup
│       ├── components-TeamManagement.tsx  # Team management component
│       └── app-team-page.tsx     # Team management page
└── README.md                     # This file
```

## 🚀 Quick Start

### Option 1: Automated Installation (Recommended)

Run the installation script in your Next.js project:

```bash
# Download and run the installation script
curl -sSL https://raw.githubusercontent.com/your-org/ssokit/main/scripts/install-private.sh | bash

# Or if you have the SSOKit repository locally
cd /path/to/your/nextjs/project
/path/to/ssokit/scripts/install-private.sh
```

### Option 2: Manual Installation

1. **Add Git Dependencies to package.json:**

```json
{
  "dependencies": {
    "@ssojet/ssokit-core": "git+https://github.com/your-org/ssokit.git#v0.1.0:packages/ssokit-core",
    "@ssojet/ssokit-next": "git+https://github.com/your-org/ssokit.git#v0.1.0:packages/ssokit-next",
    "@ssojet/ssokit-react": "git+https://github.com/your-org/ssokit.git#v0.1.0:packages/ssokit-react",
    "@ssojet/ssokit-team": "git+https://github.com/your-org/ssokit.git#v0.1.0:packages/ssokit-team",
    "@ssojet/ssokit-css": "git+https://github.com/your-org/ssokit.git#v0.1.0:packages/ssokit-css"
  }
}
```

2. **Install dependencies:**

```bash
npm install
```

3. **Set up environment variables:**

```bash
cp templates/.env.example .env.local
# Edit .env.local with your actual values
```

## 📖 Implementation Guide

### 1. Authentication Setup

Copy `templates/minimal-example/lib-auth.ts` to your project's `lib/auth.ts`:

```typescript
import NextAuth from 'next-auth';
import { SSOJetProvider } from '@ssojet/ssokit-next';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    SSOJetProvider({
      clientId: process.env.SSOJET_CLIENT_ID!,
      clientSecret: process.env.SSOJET_CLIENT_SECRET!,
      issuer: process.env.SSOJET_ISSUER!,
    }),
  ],
  // ... additional configuration
});
```

### 2. Team Management Component

Copy `templates/minimal-example/components-TeamManagement.tsx` to your project:

```typescript
import { TeamManager } from '@ssojet/ssokit-team';
import { SSOJetClient } from '@ssojet/ssokit-next';

export function TeamManagement({ organizationId }: { organizationId: string }) {
  const { data: session } = useSession();
  
  const client = new SSOJetClient(session.accessToken, {
    baseUrl: process.env.NEXT_PUBLIC_SSOJET_BASE,
    clientId: process.env.NEXT_PUBLIC_SSOJET_CLIENT_ID,
  });

  return (
    <TeamManager
      organizationId={organizationId}
      client={client}
      currentUserId={session.user?.id}
      currentUserEmail={session.user?.email}
    />
  );
}
```

### 3. CSS Imports

Add to your `_app.tsx` or `layout.tsx`:

```typescript
import '@ssojet/ssokit-css';
```

## 🔧 Configuration

### Environment Variables

All required environment variables are documented in `templates/.env.example`:

- **SSOJET_BASE**: SSOJet API base URL
- **SSOJET_CLIENT_ID**: Your SSOJet client ID
- **SSOJET_CLIENT_SECRET**: Your SSOJet client secret
- **NEXTAUTH_SECRET**: NextAuth.js secret key
- **NEXT_PUBLIC_SSOKIT_TEAM_MANAGER_ROLES**: Roles that can manage teams

### Role-Based Permissions

Control who can manage teams by setting manager roles:

```bash
# Environment variable
NEXT_PUBLIC_SSOKIT_TEAM_MANAGER_ROLES=Owner,Admin

# Or via component props
<TeamManager managerRoles={['Owner', 'Admin']} />
```

## 📚 Available Installation Methods

| Method | Use Case | Command |
|--------|----------|---------|
| **Git Dependencies** | Production | Automatic via package.json |
| **npm link** | Development | Manual linking for hot reloading |
| **Git Submodule** | Monorepo | Full source code integration |
| **Tarball** | Offline | Manual distribution |

See `PRIVATE_INSTALLATION.md` for detailed instructions on each method.

## 🔒 Security Considerations

1. **Repository Access**: Use deploy keys or personal access tokens
2. **Environment Variables**: Never commit secrets to Git
3. **Version Pinning**: Use specific Git tags for production
4. **Access Control**: Limit repository access to necessary team members

## 📋 Dependencies

SSOKit requires these peer dependencies in your project:

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "next-auth": "^4.24.0"
  }
}
```

## 🔄 Updates and Versioning

### Update to Latest Version

```bash
# Update package.json with new version tag
# Replace v0.1.0 with latest version
npm install
```

### Development Updates

For active development, use the `main` branch:

```json
{
  "dependencies": {
    "@ssojet/ssokit-team": "git+https://github.com/your-org/ssokit.git#main:packages/ssokit-team"
  }
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Module not found errors**: Ensure all SSOKit packages are installed
2. **Build failures**: Check TypeScript compatibility
3. **Authentication issues**: Verify environment variables
4. **Git access denied**: Check repository permissions

### Debug Mode

Enable debug logging:

```bash
SSOJET_DEBUG=true
NEXTAUTH_DEBUG=true
```

## 📞 Support

For issues with SSOKit integration:

1. Check the `PRIVATE_INSTALLATION.md` guide
2. Review the `examples/nextjs-demo/` implementation
3. Verify environment configuration
4. Check Git repository access

## 🎯 Next Steps

1. ✅ Install SSOKit packages
2. ✅ Configure environment variables  
3. ✅ Set up authentication
4. ✅ Implement team management
5. 🔄 Test in development
6. 🚀 Deploy to production

---

**Happy coding!** 🎉