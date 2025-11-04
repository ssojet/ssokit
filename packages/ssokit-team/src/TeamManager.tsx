'use client';

import { useState, useCallback, useEffect } from 'react';
import { SSOJetClient } from '@ssojet/ssokit-next';
import type { RoleDefinition } from '@ssojet/ssokit-core';
import type { UIMember } from './types';
import { MembersTable } from './components/MembersTable';
import { InviteDialog } from './components/InviteDialog';
import { AuditLogViewer } from './components/AuditLogViewer';
import '@ssojet/ssokit-css';

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
  /** SSOJet client instance for API calls */
  client: SSOJetClient;
  /** Current user ID (for permissions) */
  currentUserId?: string;
  /** Current user email (for invitations) */
  currentUserEmail?: string;
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
  client,
  currentUserId,
  currentUserEmail,
  showAuditLog = false,
  slots = {},
  className = '',
  onMemberRemoved,
  onInviteSent,
}: TeamManagerProps) {

  // State
  const [activeTab, setActiveTab] = useState<TabType>('members');
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [members, setMembers] = useState<UIMember[]>([]);
  const [invites, setInvites] = useState<any[]>([]);
  const [roles, setRoles] = useState<RoleDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Helper function to transform API user data to component format
  const transformUserToMember = useCallback((user: any, targetTenantId: string): UIMember => {
    const targetTenant = user.tenants?.find((t: any) => t.tenant_id === targetTenantId);
    const primaryRole = targetTenant?.roles?.[0];
    
    return {
      id: user.id,
      userId: user.id,
      organizationId: targetTenantId,
      email: user.email,
      name: user.first_name || user.email.split('@')[0],
      role: primaryRole?.role_name || 'Member',
      joinedAt: user.created_at,
      updatedAt: user.modified_at,
      isActive: user.is_active,
      lastLoginAt: user.last_login_at,
    };
  }, []);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [membersRes, invitesRes, rolesRes] = await Promise.all([
        client.listMembers(organizationId),
        client.listInvites(organizationId),
        client.listRoles(),
      ]);
      
      console.log('API Responses:', { membersRes, invitesRes, rolesRes });
      
      // Handle users API response format: { users: [...] }
      const rawUsers = (membersRes as any)?.users || (membersRes as any)?.data || membersRes || [];
      const invites = (invitesRes as any)?.data || invitesRes || [];
      // Handle roles API response format: { roles: [...] }
      const roles = (rolesRes as any)?.roles || (rolesRes as any)?.data || rolesRes || [];
      
      // Transform users to members format
      const members = Array.isArray(rawUsers) ? rawUsers.map((user: any) => transformUserToMember(user, organizationId)) : [];
      
      console.log('Processed data:', { members, invites, roles });
      
      setMembers(members);
      setInvites(Array.isArray(invites) ? invites : []);
      setRoles(Array.isArray(roles) ? roles : []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load data'));
    } finally {
      setLoading(false);
    }
  }, [client, organizationId, transformUserToMember]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Actions
  const handleUpdateRole = useCallback(
    async (memberId: string, roleName: string) => {
      try {
        // Find the role ID from the role name
        const role = roles.find(r => r.name === roleName);
        if (!role) {
          throw new Error(`Role "${roleName}" not found`);
        }

        // Update member roles using the new API
        await client.updateMemberRoles(organizationId, memberId, [role.id]);
        await fetchData();
      } catch (err) {
        throw new Error(`Failed to update role: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    },
    [client, organizationId, fetchData, roles]
  );

  const handleRemoveMember = useCallback(
    async (memberId: string) => {
      try {
        await client.removeMember(organizationId, { memberId });
        await fetchData();
        onMemberRemoved?.(memberId);
      } catch (err) {
        throw new Error(`Failed to remove member: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    },
    [client, organizationId, fetchData, onMemberRemoved]
  );

  const handleInvite = useCallback(
    async (email: string, roleName: string) => {
      try {
        // Find the role ID by role name
        const selectedRole = roles.find(r => r.name === roleName);
        if (!selectedRole) {
          throw new Error(`Role "${roleName}" not found`);
        }

        const invite = await client.createInvite(organizationId, {
          invitee: { email },
          role_ids: [selectedRole.id],
          inviter: { email: currentUserEmail || 'system@example.com' },
          send_invitation_email: true
        });
        await fetchData();
        setIsInviteDialogOpen(false);
        onInviteSent?.(invite);
      } catch (err) {
        throw new Error(`Failed to send invite: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    },
    [client, organizationId, fetchData, onInviteSent, roles, currentUserEmail]
  );

  const handleResendInvite = useCallback(
    async (inviteId: string) => {
      try {
        await client.resendInvite(organizationId, inviteId);
        await fetchData();
      } catch (err) {
        throw new Error(`Failed to resend invite: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    },
    [client, organizationId, fetchData]
  );

  // Loading state
  if (loading) {
    return (
      <div className={`sk-team-manager ${className}`} data-loading="true">
        {slots.loading || (
          <div className="sk-team-manager__loading">
            <div className="sk-spinner" role="status" aria-label="Loading team data">
              <span className="sk-sr-only">Loading...</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`sk-team-manager ${className}`} data-error="true">
        {slots.error ? slots.error(error) : (
          <div className="sk-team-manager__error" role="alert">
            {error.message}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`sk-team-manager ${className}`}>
      {/* Header */}
      {slots.header || (
        <div className="sk-team-manager__header">
          <h2 className="sk-team-manager__title">Team Management</h2>
          <button
            type="button"
            onClick={() => setIsInviteDialogOpen(true)}
            className="sk-button sk-button--primary"
            aria-label="Invite new member"
          >
            Invite Member
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="sk-team-manager__tabs" role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === 'members'}
          aria-controls="members-panel"
          onClick={() => setActiveTab('members')}
          className={`sk-tab ${activeTab === 'members' ? 'sk-tab--active' : ''}`}
        >
          Members ({members.length})
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'invites'}
          aria-controls="invites-panel"
          onClick={() => setActiveTab('invites')}
          className={`sk-tab ${activeTab === 'invites' ? 'sk-tab--active' : ''}`}
        >
          Pending Invites ({invites.length})
        </button>
        {showAuditLog && (
          <button
            role="tab"
            aria-selected={activeTab === 'audit'}
            aria-controls="audit-panel"
            onClick={() => setActiveTab('audit')}
            className={`sk-tab ${activeTab === 'audit' ? 'sk-tab--active' : ''}`}
          >
            Audit Log
          </button>
        )}
      </div>

      {/* Tab Panels */}
      <div className="sk-team-manager__content">
        {activeTab === 'members' && (
          <div
            id="members-panel"
            role="tabpanel"
            aria-labelledby="members-tab"
            className="sk-team-manager__panel"
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
            className="sk-team-manager__panel"
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
            className="sk-team-manager__panel"
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
