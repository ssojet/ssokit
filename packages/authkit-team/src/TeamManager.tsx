'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAuthKit } from '@ssojet/authkit-react';
import { MembersTable } from './components/MembersTable';
import { InviteDialog } from './components/InviteDialog';
import { AuditLogViewer } from './components/AuditLogViewer';
import '@ssojet/authkit-css';

/**
 * Customizable slots for TeamManager component
 */
export interface TeamManagerSlots {
  /** Custom header component */
  header?: React.ReactNode;
  /** Custom empty state for members */
  emptyMembers?: React.ReactNode;
  /** Custom empty state for invites */
  emptyInvites?: React.ReactNode;
  /** Custom loading indicator */
  loading?: React.ReactNode;
  /** Custom error display */
  error?: (error: Error) => React.ReactNode;
}

/**
 * Props for TeamManager component
 */
export interface TeamManagerProps {
  /** Organization ID to manage */
  organizationId: string;
  /** Current user ID (for permissions) */
  currentUserId?: string;
  /** API base URL (defaults to context config) */
  apiBase?: string;
  /** Show audit log tab */
  showAuditLog?: boolean;
  /** Custom slots for UI customization */
  slots?: TeamManagerSlots;
  /** Additional CSS class */
  className?: string;
  /** Callback when member is removed */
  onMemberRemoved?: (memberId: string) => void;
  /** Callback when invite is sent */
  onInviteSent?: (invite: any) => void;
}

type TabType = 'members' | 'invites' | 'audit';

/**
 * TeamManager - Production-grade team management widget
 */
export function TeamManager({
  organizationId,
  currentUserId,
  apiBase,
  showAuditLog = false,
  slots = {},
  className = '',
  onMemberRemoved,
  onInviteSent,
}: TeamManagerProps) {
  const { baseUrl: contextBaseUrl } = useAuthKit();
  const baseUrl = apiBase || contextBaseUrl;

  // State
  const [activeTab, setActiveTab] = useState<TabType>('members');
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [invites, setInvites] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [membersRes, invitesRes, rolesRes] = await Promise.all([
        fetch(`${baseUrl}/orgs/${organizationId}/members`).then(r => r.json()),
        fetch(`${baseUrl}/orgs/${organizationId}/invites`).then(r => r.json()),
        fetch(`${baseUrl}/orgs/${organizationId}/roles`).then(r => r.json()),
      ]);
      
      setMembers(membersRes.data || []);
      setInvites(invitesRes.data || []);
      setRoles(rolesRes.data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load data'));
    } finally {
      setLoading(false);
    }
  }, [baseUrl, organizationId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Actions
  const handleUpdateRole = useCallback(
    async (memberId: string, role: string) => {
      const res = await fetch(
        `${baseUrl}/orgs/${organizationId}/members/${memberId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role }),
        }
      );
      if (!res.ok) {
        throw new Error(`Failed to update role: ${res.statusText}`);
      }
      await fetchData();
    },
    [baseUrl, organizationId, fetchData]
  );

  const handleRemoveMember = useCallback(
    async (memberId: string) => {
      const res = await fetch(
        `${baseUrl}/orgs/${organizationId}/members/${memberId}`,
        { method: 'DELETE' }
      );
      if (!res.ok) {
        throw new Error(`Failed to remove member: ${res.statusText}`);
      }
      await fetchData();
      onMemberRemoved?.(memberId);
    },
    [baseUrl, organizationId, fetchData, onMemberRemoved]
  );

  const handleInvite = useCallback(
    async (email: string, role: string) => {
      const res = await fetch(`${baseUrl}/orgs/${organizationId}/invites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      });
      if (!res.ok) {
        throw new Error(`Failed to send invite: ${res.statusText}`);
      }
      const invite = await res.json();
      await fetchData();
      setIsInviteDialogOpen(false);
      onInviteSent?.(invite);
    },
    [baseUrl, organizationId, fetchData, onInviteSent]
  );

  const handleResendInvite = useCallback(
    async (inviteId: string) => {
      const res = await fetch(
        `${baseUrl}/orgs/${organizationId}/invites/${inviteId}/resend`,
        { method: 'POST' }
      );
      if (!res.ok) {
        throw new Error(`Failed to resend invite: ${res.statusText}`);
      }
      await fetchData();
    },
    [baseUrl, organizationId, fetchData]
  );

  // Loading state
  if (loading) {
    return (
      <div className={`ak-team-manager ${className}`} data-loading="true">
        {slots.loading || (
          <div className="ak-team-manager__loading">
            <div className="ak-spinner" role="status" aria-label="Loading team data">
              <span className="ak-sr-only">Loading...</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`ak-team-manager ${className}`} data-error="true">
        {slots.error?.(error) || (
          <div className="ak-team-manager__error" role="alert">
            <p>Failed to load team members: {error.message}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`ak-team-manager ${className}`}>
      {/* Header */}
      {slots.header || (
        <div className="ak-team-manager__header">
          <h2 className="ak-team-manager__title">Team Management</h2>
          <button
            type="button"
            onClick={() => setIsInviteDialogOpen(true)}
            className="ak-button ak-button--primary"
            aria-label="Invite new member"
          >
            Invite Member
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="ak-team-manager__tabs" role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === 'members'}
          aria-controls="members-panel"
          onClick={() => setActiveTab('members')}
          className={`ak-tab ${activeTab === 'members' ? 'ak-tab--active' : ''}`}
        >
          Members ({members.length})
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'invites'}
          aria-controls="invites-panel"
          onClick={() => setActiveTab('invites')}
          className={`ak-tab ${activeTab === 'invites' ? 'ak-tab--active' : ''}`}
        >
          Pending Invites ({invites.length})
        </button>
        {showAuditLog && (
          <button
            role="tab"
            aria-selected={activeTab === 'audit'}
            aria-controls="audit-panel"
            onClick={() => setActiveTab('audit')}
            className={`ak-tab ${activeTab === 'audit' ? 'ak-tab--active' : ''}`}
          >
            Audit Log
          </button>
        )}
      </div>

      {/* Tab Panels */}
      <div className="ak-team-manager__content">
        {activeTab === 'members' && (
          <div
            id="members-panel"
            role="tabpanel"
            aria-labelledby="members-tab"
            className="ak-team-manager__panel"
          >
            <MembersTable
              members={members}
              roles={roles}
              currentUserId={currentUserId}
              onUpdateRole={handleUpdateRole}
              onRemoveMember={handleRemoveMember}
              emptyMessage={
                typeof slots.emptyMembers === 'string'
                  ? slots.emptyMembers
                  : 'No members yet'
              }
            />
          </div>
        )}

        {activeTab === 'invites' && (
          <div
            id="invites-panel"
            role="tabpanel"
            aria-labelledby="invites-tab"
            className="ak-team-manager__panel"
          >
            <MembersTable
              members={
                invites.map((inv: any) => ({
                  id: inv.id,
                  userId: inv.id,
                  organizationId,
                  email: inv.email,
                  role: inv.role,
                  joinedAt: inv.createdAt,
                  updatedAt: inv.updatedAt || inv.createdAt,
                }))
              }
              roles={roles}
              onResendInvite={handleResendInvite}
              emptyMessage={
                typeof slots.emptyInvites === 'string'
                  ? slots.emptyInvites
                  : 'No pending invites'
              }
            />
          </div>
        )}

        {activeTab === 'audit' && showAuditLog && (
          <div
            id="audit-panel"
            role="tabpanel"
            aria-labelledby="audit-tab"
            className="ak-team-manager__panel"
          >
            <AuditLogViewer
              events={[]}
              emptyMessage="No audit events yet"
            />
          </div>
        )}
      </div>

      {/* Invite Dialog */}
      <InviteDialog
        isOpen={isInviteDialogOpen}
        onClose={() => setIsInviteDialogOpen(false)}
        onInvite={handleInvite}
        roles={roles}
      />
    </div>
  );
}
