# @ssojet/authkit-team

Production-grade TeamManager widget for SSOJet AuthKit.

## Features

- 🎨 **Fully themed** with CSS custom properties
- ♿ **Accessible** with ARIA, keyboard navigation, and focus management
- 📱 **Responsive** design for mobile and desktop
- 🎯 **Type-safe** with TypeScript
- 🔌 **Composable** - Use the full widget or individual components
- 🎭 **Customizable** with slots for custom UI
- 🌍 **i18n ready** - All labels and messages can be customized

## Installation

```bash
pnpm add @ssojet/authkit-team @ssojet/authkit-react @ssojet/authkit-core @ssojet/authkit-css
```

## Usage

### Full Widget

```tsx
import { AuthKitProvider } from '@ssojet/authkit-react';
import { TeamManager } from '@ssojet/authkit-team';
import '@ssojet/authkit-team/styles.css';

function App() {
  return (
    <AuthKitProvider config={{ apiBase: '/api/authkit' }}>
      <TeamManager
        organizationId="org_123"
        currentUserId="user_456"
        showAuditLog
      />
    </AuthKitProvider>
  );
}
```

### Individual Components

```tsx
import { MembersTable, InviteDialog } from '@ssojet/authkit-team';
import { useMembers, useRoles } from '@ssojet/authkit-react';

function CustomTeamUI() {
  const { data: members } = useMembers('org_123');
  const { data: roles } = useRoles('org_123');
  
  return (
    <MembersTable
      members={members || []}
      roles={roles || []}
      onUpdateRole={async (memberId, role) => {
        // Handle role update
      }}
      onRemoveMember={async (memberId) => {
        // Handle member removal
      }}
    />
  );
}
```

## API

### TeamManager

Main component that orchestrates team management UI.

#### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `organizationId` | `string` | ✅ | Organization ID to manage |
| `currentUserId` | `string` | ❌ | Current user ID (for permissions) |
| `apiBase` | `string` | ❌ | API base URL (defaults to context config) |
| `showAuditLog` | `boolean` | ❌ | Show audit log tab |
| `slots` | `TeamManagerSlots` | ❌ | Custom UI slots |
| `className` | `string` | ❌ | Additional CSS class |
| `onMemberAdded` | `(member: Member) => void` | ❌ | Callback when member is added |
| `onMemberRemoved` | `(memberId: string) => void` | ❌ | Callback when member is removed |
| `onInviteSent` | `(invite: Invite) => void` | ❌ | Callback when invite is sent |

#### Slots

Customize the UI with custom components:

```tsx
<TeamManager
  organizationId="org_123"
  slots={{
    header: <CustomHeader />,
    emptyMembers: <CustomEmptyState />,
    loading: <CustomSpinner />,
    error: (error) => <CustomError error={error} />,
  }}
/>
```

### MembersTable

Displays team members with role management.

#### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `members` | `Member[]` | ✅ | Array of members |
| `roles` | `RoleDefinition[]` | ✅ | Available roles |
| `currentUserId` | `string` | ❌ | Current user ID |
| `onUpdateRole` | `(memberId, role) => Promise<void>` | ❌ | Role update handler |
| `onRemoveMember` | `(memberId) => Promise<void>` | ❌ | Member removal handler |
| `onResendInvite` | `(inviteId) => Promise<void>` | ❌ | Invite resend handler |

### InviteDialog

Modal for inviting new team members.

#### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isOpen` | `boolean` | ✅ | Dialog open state |
| `onClose` | `() => void` | ✅ | Close handler |
| `onInvite` | `(email, role) => Promise<void>` | ✅ | Invite handler |
| `roles` | `RoleDefinition[]` | ✅ | Available roles |

### RoleSelector

Dropdown for selecting member roles.

### AuditLogViewer

Displays team activity audit log.

## Theming

The widget uses CSS custom properties from `@ssojet/authkit-css`. Apply a theme:

```tsx
import { applyThemePreset } from '@ssojet/authkit-css';

applyThemePreset('dark');
```

### Custom Theme

Override CSS variables:

```css
:root {
  --ak-primary: #ff6b6b;
  --ak-radius: 16px;
  --ak-shadow-lg: 0 20px 40px rgba(0, 0, 0, 0.2);
}
```

## Accessibility

The widget includes:

- **ARIA attributes** - Proper roles, labels, and descriptions
- **Keyboard navigation** - Tab, Enter, Escape, Arrow keys
- **Focus management** - Automatic focus on dialog open, focus trapping
- **Screen reader support** - Descriptive labels and status updates
- **Color contrast** - WCAG AA compliant colors

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Tab` | Navigate between elements |
| `Enter` | Activate button/link |
| `Escape` | Close dialog |
| `Space` | Toggle checkbox/select |

## Examples

### Custom Error Handling

```tsx
<TeamManager
  organizationId="org_123"
  slots={{
    error: (error) => (
      <div className="custom-error">
        <h3>Oops!</h3>
        <p>{error.message}</p>
        <button onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    ),
  }}
/>
```

### Custom Empty States

```tsx
<TeamManager
  organizationId="org_123"
  slots={{
    emptyMembers: (
      <div className="empty-state">
        <img src="/empty-team.svg" alt="" />
        <h3>No team members yet</h3>
        <p>Invite your first team member to get started</p>
      </div>
    ),
  }}
/>
```

### Callback Handlers

```tsx
<TeamManager
  organizationId="org_123"
  onMemberAdded={(member) => {
    console.log('New member added:', member);
    analytics.track('member_added', { email: member.email });
  }}
  onMemberRemoved={(memberId) => {
    console.log('Member removed:', memberId);
    showToast('Member removed successfully');
  }}
  onInviteSent={(invite) => {
    console.log('Invite sent:', invite);
    showToast(`Invite sent to ${invite.email}`);
  }}
/>
```

## License

MIT
