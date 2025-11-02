import type {
  Member,
  RoleDefinition,
  AuditEvent,
} from '@ssojet/authkit-core';

/**
 * Props for MembersTable component
 */
export interface MembersTableProps {
  members: Member[];
  roles: RoleDefinition[];
  currentUserId?: string;
  onUpdateRole?: (memberId: string, role: string) => Promise<void>;
  onRemoveMember?: (memberId: string) => Promise<void>;
  onResendInvite?: (inviteId: string) => Promise<void>;
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
}

/**
 * Props for InviteDialog component
 */
export interface InviteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (email: string, role: string) => Promise<void>;
  roles: RoleDefinition[];
  isLoading?: boolean;
}

/**
 * Props for RoleSelector component
 */
export interface RoleSelectorProps {
  value: string;
  roles: RoleDefinition[];
  onChange: (role: string) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Props for AuditLogViewer component
 */
export interface AuditLogViewerProps {
  events: AuditEvent[];
  isLoading?: boolean;
  onLoadMore?: () => Promise<void>;
  hasMore?: boolean;
  emptyMessage?: string;
  className?: string;
}

/**
 * Action types for members and invites
 */
export type MemberAction =
  | { type: 'update-role'; memberId: string; role: string }
  | { type: 'remove'; memberId: string };

export type InviteAction =
  | { type: 'create'; email: string; role: string }
  | { type: 'resend'; inviteId: string }
  | { type: 'revoke'; inviteId: string };
