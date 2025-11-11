# SSOKit Private Installation Guide

This guide explains how to use SSOKit packages in external Next.js projects directly from a private Git repository without publishing to public npm registries.

## Table of Contents

1. [Installation Methods](#installation-methods)
2. [Method 1: Direct Git Dependencies](#method-1-direct-git-dependencies)
3. [Method 2: Local Development with npm link](#method-2-local-development-with-npm-link)
4. [Method 3: Private Git Submodule](#method-3-private-git-submodule)
5. [Method 4: Tarball Distribution](#method-4-tarball-distribution)
6. [Complete Implementation Example](#complete-implementation-example)
7. [Troubleshooting](#troubleshooting)

---

## Installation Methods

There are several ways to use SSOKit packages from a private repository:

| Method | Best For | Pros | Cons |
|--------|----------|------|------|
| Git Dependencies | Production use | Automatic updates, version pinning | Requires Git access |
| npm link | Local development | Fast iteration | Manual setup, dev only |
| Git Submodule | Monorepo setup | Full source access | Complex Git workflow |
| Tarball | Offline/restricted environments | No Git required | Manual distribution |

---

## Method 1: Direct Git Dependencies (Recommended)

### 1.1 Prepare the SSOKit Repository

First, ensure your SSOKit repository is properly set up:

```bash
# In your SSOKit repository
git tag v0.1.0  # Tag a release
git push origin v0.1.0
```

### 1.2 Install in Target Project

In your external Next.js project's `package.json`:

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

### 1.3 Alternative Git URLs

For different Git hosting:

```json
{
  "dependencies": {
    // GitHub (HTTPS)
    "@ssojet/ssokit-core": "git+https://github.com/your-org/ssokit.git#v0.1.0:packages/ssokit-core",
    
    // GitHub (SSH)
    "@ssojet/ssokit-core": "git+ssh://git@github.com/your-org/ssokit.git#v0.1.0:packages/ssokit-core",
    
    // GitLab
    "@ssojet/ssokit-core": "git+https://gitlab.com/your-org/ssokit.git#v0.1.0:packages/ssokit-core",
    
    // Bitbucket
    "@ssojet/ssokit-core": "git+https://bitbucket.org/your-org/ssokit.git#v0.1.0:packages/ssokit-core",
    
    // Private GitLab instance
    "@ssojet/ssokit-core": "git+https://git.yourcompany.com/your-org/ssokit.git#v0.1.0:packages/ssokit-core"
  }
}
```

### 1.4 Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

---

## Method 2: Local Development with npm link

### 2.1 Build and Link SSOKit Packages

In your SSOKit repository:

```bash
# Build all packages
npm run build

# Link each package globally
cd packages/ssokit-core && npm link
cd ../ssokit-next && npm link
cd ../ssokit-react && npm link
cd ../ssokit-team && npm link
cd ../ssokit-css && npm link
```

### 2.2 Link in Target Project

In your external Next.js project:

```bash
npm link @ssojet/ssokit-core
npm link @ssojet/ssokit-next
npm link @ssojet/ssokit-react
npm link @ssojet/ssokit-team
npm link @ssojet/ssokit-css
```

### 2.3 Development Workflow

```bash
# In SSOKit repo - watch for changes
npm run dev

# In target project - normal development
npm run dev
```

---

## Method 3: Private Git Submodule

### 3.1 Add SSOKit as Submodule

In your target project:

```bash
# Add SSOKit as submodule
git submodule add https://github.com/your-org/ssokit.git lib/ssokit
git submodule update --init --recursive
```

### 3.2 Create Build Script

Create `scripts/build-ssokit.js`:

```javascript
const { execSync } = require('child_process');
const path = require('path');

const ssokitPath = path.join(__dirname, '../lib/ssokit');

console.log('Building SSOKit packages...');
execSync('npm ci && npm run build', { 
  cwd: ssokitPath, 
  stdio: 'inherit' 
});

console.log('SSOKit build complete!');
```

### 3.3 Update package.json

```json
{
  "scripts": {
    "prebuild": "node scripts/build-ssokit.js",
    "predev": "node scripts/build-ssokit.js"
  },
  "dependencies": {
    "@ssojet/ssokit-core": "file:./lib/ssokit/packages/ssokit-core",
    "@ssojet/ssokit-next": "file:./lib/ssokit/packages/ssokit-next",
    "@ssojet/ssokit-react": "file:./lib/ssokit/packages/ssokit-react",
    "@ssojet/ssokit-team": "file:./lib/ssokit/packages/ssokit-team",
    "@ssojet/ssokit-css": "file:./lib/ssokit/packages/ssokit-css"
  }
}
```

---

## Method 4: Tarball Distribution

### 4.1 Create Distribution Tarballs

In your SSOKit repository:

```bash
# Build packages
npm run build

# Create tarballs
mkdir dist-tarballs
cd packages/ssokit-core && npm pack && mv *.tgz ../../dist-tarballs/
cd ../ssokit-next && npm pack && mv *.tgz ../../dist-tarballs/
cd ../ssokit-react && npm pack && mv *.tgz ../../dist-tarballs/
cd ../ssokit-team && npm pack && mv *.tgz ../../dist-tarballs/
cd ../ssokit-css && npm pack && mv *.tgz ../../dist-tarballs/
```

### 4.2 Distribute and Install

Copy tarballs to your target project and install:

```bash
# In target project
mkdir lib/ssokit-packages
# Copy .tgz files to lib/ssokit-packages/

# Install from local files
npm install ./lib/ssokit-packages/ssojet-ssokit-core-0.1.0.tgz
npm install ./lib/ssokit-packages/ssojet-ssokit-next-0.1.0.tgz
npm install ./lib/ssokit-packages/ssojet-ssokit-react-0.1.0.tgz
npm install ./lib/ssokit-packages/ssojet-ssokit-team-0.1.0.tgz
npm install ./lib/ssokit-packages/ssojet-ssokit-css-0.1.0.tgz
```

---

## Complete Implementation Example

### Project Structure

```
my-nextjs-app/
├── pages/
│   └── dashboard/
│       └── team.tsx
├── components/
│   └── TeamManagement.tsx
├── lib/
│   └── auth.ts
├── .env.local
└── package.json
```

### Environment Configuration

`.env.local`:
```bash
# SSOJet Configuration
SSOJET_BASE=https://api.ssojet.com
DEFAULT_SSOJET_AUTHORITY=https://your-domain.auth.ssojet.com
DEFAULT_SSOJET_CLIENT_ID=cli_d3vlr9k4
DEFAULT_SSOJET_CLIENT_SECRET=sk_d3
DEFAULT_SSOJET_API_URL=https://api.ssojet.com/api/v1
DEFAULT_SSOJET_REDIRECT_URI=http://localhost:3000/api/auth/callback

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret

# SSOKit Configuration
NEXT_PUBLIC_SSOJET_BASE=https://api.ssojet.com
NEXT_PUBLIC_DEFAULT_SSOJET_CLIENT_ID=cli_d3vlr9k4
NEXT_PUBLIC_SSOKIT_TEAM_MANAGER_ROLES=Owner,Admin
```

### Authentication Setup

`lib/auth.ts`:
```typescript
import NextAuth from 'next-auth';
import { SSOJetProvider } from '@ssojet/ssokit-next';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    SSOJetProvider({
      clientId: process.env.DEFAULT_SSOJET_CLIENT_ID!,
      clientSecret: process.env.DEFAULT_SSOJET_CLIENT_SECRET!,
      issuer: process.env.DEFAULT_SSOJET_AUTHORITY!,
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      return session;
    },
  },
});
```

### TeamManager Component

`components/TeamManagement.tsx`:
```typescript
'use client';

import { TeamManager } from '@ssojet/ssokit-team';
import { SSOJetClient } from '@ssojet/ssokit-next';
import { useSession } from 'next-auth/react';

interface TeamManagementProps {
  organizationId: string;
}

export function TeamManagement({ organizationId }: TeamManagementProps) {
  const { data: session } = useSession();

  if (!session?.accessToken) {
    return <div>Please log in to manage your team.</div>;
  }

  const client = new SSOJetClient(session.accessToken, {
    baseUrl: process.env.NEXT_PUBLIC_SSOJET_BASE,
    clientId: process.env.NEXT_PUBLIC_DEFAULT_SSOJET_CLIENT_ID,
  });

  return (
    <TeamManager
      organizationId={organizationId}
      client={client}
      currentUserId={session.user?.id}
      currentUserEmail={session.user?.email}
      showAuditLog={true}
      managerRoles={['Owner', 'Admin']} // Optional: override env config
      onMemberRemoved={(memberId) => {
        console.log('Member removed:', memberId);
      }}
      onInviteSent={(invite) => {
        console.log('Invite sent:', invite);
      }}
    />
  );
}
```

### Page Implementation

`pages/dashboard/team.tsx`:
```typescript
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import { TeamManagement } from '../../components/TeamManagement';
import { auth } from '../../lib/auth';

interface TeamPageProps {
  organizationId: string;
}

export default function TeamPage({ organizationId }: TeamPageProps) {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Team Management</h1>
      <TeamManagement organizationId={organizationId} />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, auth);

  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  // Get organization ID from user session or query params
  const organizationId = context.query.orgId as string || session.user.organizationId;

  return {
    props: {
      organizationId,
    },
  };
};
```

### CSS Import

`pages/_app.tsx`:
```typescript
import '@ssojet/ssokit-css';
import '../styles/globals.css';

// ... rest of your app configuration
```

---

## Troubleshooting

### Common Issues

1. **Build Errors**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Git Authentication**
   ```bash
   # Use SSH key or personal access token
   git config --global credential.helper store
   ```

3. **Module Resolution**
   ```json
   // tsconfig.json
   {
     "compilerOptions": {
       "moduleResolution": "node",
       "esModuleInterop": true
     }
   }
   ```

4. **Version Conflicts**
   ```bash
   # Pin specific commit/tag
   "@ssojet/ssokit-core": "git+https://github.com/your-org/ssokit.git#abc1234:packages/ssokit-core"
   ```

### Development Tips

1. **Hot Reloading**: Use `npm link` for active development
2. **Version Management**: Use Git tags for stable versions
3. **CI/CD**: Automate builds in your deployment pipeline
4. **Security**: Use SSH keys or deploy tokens for Git access

### Performance Optimization

```json
// next.config.js
{
  "transpilePackages": [
    "@ssojet/ssokit-core",
    "@ssojet/ssokit-next",
    "@ssojet/ssokit-react",
    "@ssojet/ssokit-team"
  ]
}
```

---

## Security Considerations

1. **Git Access**: Use read-only deploy keys for production
2. **Environment Variables**: Never commit secrets to Git
3. **Access Control**: Limit repository access to necessary team members
4. **Audit Trail**: Monitor package usage and updates

---

This guide provides multiple approaches to integrate SSOKit into your projects without public publishing, allowing you to maintain full control over your codebase while enabling seamless integration across your organization.


export PATH=$PATH:~/.npm-global/bin