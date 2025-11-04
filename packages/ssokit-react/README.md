# @ssojet/authkit-react

React hooks and context providers for SSOJet AuthKit.

## Features

- **AuthKitProvider** - Context provider for configuration
- **Headless hooks** for organization, member, invite, and audit operations
- **Type-safe** with full TypeScript support
- **Bring your own fetch** - customizable HTTP client

## Installation

```bash
pnpm add @ssojet/authkit-react @ssojet/authkit-core
```

## Usage

### Setup Provider

```tsx
import { AuthKitProvider } from '@ssojet/authkit-react';

function App() {
  return (
    <AuthKitProvider
      baseUrl="/api/authkit"
      defaultTheme="dark"
    >
      <YourApp />
    </AuthKitProvider>
  );
}
```

### Use Hooks

```tsx
import { useMembers, useInvites } from '@ssojet/authkit-react';

function TeamPage({ organizationId }: { organizationId: string }) {
  const members = useMembers(organizationId);
  const invites = useInvites(organizationId);

  useEffect(() => {
    members.list();
    invites.list();
  }, [organizationId]);

  const handleAddMember = async (email: string, role: string) => {
    await members.add({ email, role });
    members.list(); // Refresh
  };

  const handleInvite = async (email: string, role: string) => {
    await invites.create({ email, role });
    invites.list(); // Refresh
  };

  return (
    <div>
      {/* Render your UI */}
    </div>
  );
}
```

## Available Hooks

### `useOrganization(organizationId)`
Get and update organization details.

### `useMembers(organizationId)`
List, add, update, and remove members.

### `useInvites(organizationId)`
List, create, resend, and revoke invites.

### `useAuditLog(organizationId)`
List audit events with pagination.

### `useRoles(organizationId)`
Get available role definitions.

### `useUserOrganizations()`
List organizations for the current user.

## Custom Fetch

```tsx
<AuthKitProvider
  baseUrl="/api/authkit"
  fetch={customFetch}
>
  {children}
</AuthKitProvider>
```

## License

MIT
