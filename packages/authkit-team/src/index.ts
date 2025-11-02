/**
 * @ssojet/authkit-team
 * 
 * Production-grade TeamManager widget with:
 * - Members table with roles and status
 * - Invite management with email validation
 * - Role assignment and updates
 * - Audit log viewer
 * - Full accessibility (ARIA, keyboard nav)
 * - Theming via CSS custom properties
 * - Internationalization ready
 */

export { TeamManager } from './TeamManager';
export type { TeamManagerProps, TeamManagerSlots } from './TeamManager';

export { MembersTable } from './components/MembersTable';
export { InviteDialog } from './components/InviteDialog';
export { RoleSelector } from './components/RoleSelector';
export { AuditLogViewer } from './components/AuditLogViewer';

export type {
  MembersTableProps,
  InviteDialogProps,
  RoleSelectorProps,
  AuditLogViewerProps,
} from './types';
