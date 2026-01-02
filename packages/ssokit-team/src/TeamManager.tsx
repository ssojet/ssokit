'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { SSOJetClient } from '@ssojet/ssokit-next';
import { ApiError } from '@ssojet/ssokit-core/errors';
import type { RoleDefinition } from '@ssojet/ssokit-core';
import type { UIMember } from './types';
import { MembersTable } from './components/MembersTable';
import { InviteDialog } from './components/InviteDialog';
import { AuditLogViewer } from './components/AuditLogViewer';
import '@ssojet/ssokit-css';

/**
 * Extract error message from API error response
 */
function getErrorMessage(err: unknown): string {
  if (err instanceof ApiError && err.response) {
    const response = err.response as { error_description?: string; message?: string };
    return response.error_description || response.message || err.message;
  }
  return err instanceof Error ? err.message : 'Unknown error';
}

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
  /** Roles that can manage team (invite, remove, update). Defaults to ["Owner"] if not specified or from env var SSOKIT_TEAM_MANAGER_ROLES */
  managerRoles?: string[];
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
  managerRoles,
}: TeamManagerProps) {

  // Determine allowed manager roles from props, env var, or default
  const allowedManagerRoles = useMemo(() => {
    if (managerRoles && managerRoles.length > 0) {
      return managerRoles;
    }
    
    // Check environment variable
    const envRoles = typeof window !== 'undefined' 
      ? process.env.NEXT_PUBLIC_SSOKIT_TEAM_MANAGER_ROLES
      : process.env.SSOKIT_TEAM_MANAGER_ROLES;
    
    if (envRoles) {
      return envRoles.split(',').map(role => role.trim());
    }
    
    // Default to Owner only
    return ['Owner'];
  }, [managerRoles]);

  // State
  const [activeTab, setActiveTab] = useState<TabType>('members');
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [members, setMembers] = useState<UIMember[]>([]);
  const [invites, setInvites] = useState<UIMember[]>([]);
  const [roles, setRoles] = useState<RoleDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({});

  // Get current user's role in this organization
  const currentUserRole = useMemo(() => {
    if (!currentUserId) return null;
    const currentMember = members.find(m => m.userId === currentUserId || m.id === currentUserId);
    return currentMember?.role || null;
  }, [currentUserId, members]);

  // Check if current user has management permissions
  const canManageTeam = useMemo(() => {

      console.log("== Checking management permissions ==");
    console.log("Current User Role:", currentUserRole);
    console.log("Allowed Manager Roles:", allowedManagerRoles);
    if (!currentUserRole) return false;
    return allowedManagerRoles.includes(currentUserRole);
  }, [currentUserRole, allowedManagerRoles]);

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
      status: targetTenant?.status || 'active',
    };
  }, []);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [membersRes, invitationsRes, rolesRes] = await Promise.all([
        client.listMembers(organizationId),
        client.listInvites(organizationId, 'pending'),
        client.listRoles(),
      ]);
      
      console.log('API Responses:', { membersRes, invitationsRes, rolesRes });
      
      // Handle users API response format: { users: [...] }
      const rawUsers = (membersRes as any)?.users || (membersRes as any)?.data || membersRes || [];
      // Handle roles API response format: { roles: [...] }
      const roles = (rolesRes as any)?.roles || (rolesRes as any)?.data || rolesRes || [];
      // Handle invitations API response format: { invitation: [...] }
      const rawInvitations = (invitationsRes as any)?.invitation || [];
      
      // Transform users to active members only
      const allMembers: UIMember[] = [];
      
      if (Array.isArray(rawUsers)) {
        rawUsers.forEach((user: any) => {
          const member = transformUserToMember(user, organizationId);
          
          // Only include active members
          if (member.status === 'active' || !member.status) {
            allMembers.push(member);
          }
        });
      }
      
      // Transform invitations to pending invites
      const pendingInvites: UIMember[] = [];
      if (Array.isArray(rawInvitations)) {
        rawInvitations.forEach((invitation: any) => {
          const invite: UIMember = {
            id: invitation.id,
            email: invitation.email,
            name: invitation.email.split('@')[0], // Use email prefix as name
            role: invitation.roles?.[0]?.role_name || 'Member',
            joinedAt: invitation.created_at,
            updatedAt: invitation.modified_at,
            status: invitation.status,
            organizationId: organizationId,
          };
          pendingInvites.push(invite);
        });
      }
      
      console.log('Processed data:', { 
        activeMembers: allMembers, 
        pendingInvites, 
        roles 
      });
      
      setMembers(allMembers);
      setInvites(pendingInvites);
      setRoles(Array.isArray(roles) ? roles : []);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(new Error(`Failed to load data: ${errorMessage}`));
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
        throw new Error(`Failed to update role: ${getErrorMessage(err)}`);
      }
    },
    [client, organizationId, fetchData, roles]
  );

  const handleRemoveMember = useCallback(
    async (memberId: string) => {
      try {
        await client.removeMember(organizationId, memberId);
        await fetchData();
        onMemberRemoved?.(memberId);
      } catch (err) {
        throw new Error(`Failed to remove member: ${getErrorMessage(err)}`);
      }
    },
    [client, organizationId, fetchData, onMemberRemoved]
  );

    const handleInviteMember = useCallback(
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
        throw new Error(`Failed to send invite: ${getErrorMessage(err)}`);
      }
    },
    [client, organizationId, fetchData, onInviteSent, roles, currentUserEmail]
  );

  const handleResendInvite = useCallback(
    async (userId: string) => {
      const loadingKey = `resend-${userId}`;
      try {
        setActionLoading(prev => ({ ...prev, [loadingKey]: true }));
        setStatusMessage(null);
        // Find the member/invite to get their email and role
        const member = invites.find(inv => inv.id === userId || inv.userId === userId);
        if (!member) {
          throw new Error('Invite not found');
        }

        // Find the role ID by role name
        const selectedRole = roles.find(r => r.name === member.role);
        if (!selectedRole) {
          throw new Error(`Role "${member.role}" not found`);
        }

        // Resend invite with the same payload format as createInvite
        await client.resendInvite(organizationId, {
          invitee: { email: member.email },
          role_ids: [selectedRole.id],
          inviter: { email: currentUserEmail || 'system@example.com' },
          send_invitation_email: true,
          invitation_id: member.id || ''
        });
        await fetchData();
        setStatusMessage({ type: 'success', message: `Invitation resent to ${member.email}` });
        setTimeout(() => setStatusMessage(null), 5000);
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        setStatusMessage({ type: 'error', message: `Failed to resend invite: ${errorMessage}` });
        setTimeout(() => setStatusMessage(null), 5000);
        throw new Error(`Failed to resend invite: ${errorMessage}`);
      } finally {
        setActionLoading(prev => ({ ...prev, [loadingKey]: false }));
      }
    },
    [client, organizationId, fetchData, invites, roles, currentUserEmail]
  );

  const handleDeleteInvite = useCallback(
    async (inviteId: string) => {
      const loadingKey = `delete-${inviteId}`;
      try {
        setActionLoading(prev => ({ ...prev, [loadingKey]: true }));
        setStatusMessage(null);
        const invite = invites.find(inv => inv.id === inviteId);
        if (!invite) {
          throw new Error('Invite not found');
        }

        await client.deleteInvite(organizationId, inviteId);
        await fetchData();
        setStatusMessage({ type: 'success', message: `Invitation to ${invite.email} deleted successfully` });
        setTimeout(() => setStatusMessage(null), 5000);
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        setStatusMessage({ type: 'error', message: `Failed to delete invite: ${errorMessage}` });
        setTimeout(() => setStatusMessage(null), 5000);
        throw new Error(`Failed to delete invite: ${errorMessage}`);
      } finally {
        setActionLoading(prev => ({ ...prev, [loadingKey]: false }));
      }
    },
    [client, organizationId, fetchData, invites]
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
          {canManageTeam && (
            <button
              type="button"
              onClick={() => setIsInviteDialogOpen(true)}
              className="sk-button sk-button--primary"
              aria-label="Invite new member"
            >
              Invite Member
            </button>
          )}
        </div>
      )}

      {/* Status Message */}
      {statusMessage && (
        <div 
          className={`sk-status-message sk-status-message--${statusMessage.type}`}
          role="alert"
          aria-live="polite"
        >
          {statusMessage.message}
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
              onUpdateRole={canManageTeam ? handleUpdateRole : undefined}
              onRemoveMember={canManageTeam ? handleRemoveMember : undefined}
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
              members={invites}
              roles={roles}
              onResendInvite={canManageTeam ? handleResendInvite : undefined}
              onDeleteInvite={canManageTeam ? handleDeleteInvite : undefined}
              actionLoading={actionLoading}
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

      {/* Invite Dialog - Only show if user can manage team */}
      {canManageTeam && (
        <InviteDialog
          isOpen={isInviteDialogOpen}
          onClose={() => setIsInviteDialogOpen(false)}
          onInvite={handleInviteMember}
          roles={roles}
        />
      )}
    </div>
  );
}
