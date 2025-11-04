import type { Member, RoleDefinition } from '@ssojet/ssokit-core';
import { RoleSelector } from './RoleSelector';

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
 * MembersTable - Displays team members with role management
 */
export function MembersTable({
  members,
  roles,
  currentUserId,
  onUpdateRole,
  onRemoveMember,
  onResendInvite,
  isLoading = false,
  emptyMessage = 'No members found',
  className = '',
}: MembersTableProps) {
  if (members.length === 0 && !isLoading) {
    return (
      <div className={`ak-members-table__empty ${className}`}>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`ak-members-table ${className}`}>
      <table className="ak-table" role="table">
        <thead>
          <tr>
            <th scope="col">Member</th>
            <th scope="col">Email</th>
            <th scope="col">Role</th>
            <th scope="col">Status</th>
            <th scope="col">Joined</th>
            <th scope="col" className="ak-table__actions">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => {
            const isCurrentUser = member.userId === currentUserId;
            // Note: Members don't have a status field - they're all active
            // For pending invites, use a separate InvitesTable component

            return (
              <tr key={member.id}>
                <td>
                  <div className="ak-member-cell">
                    <div className="ak-member-cell__avatar">
                      {(member.name?.[0] ?? member.email[0] ?? '?').toUpperCase()}
                    </div>
                    <span className="ak-member-cell__name">
                      {member.name || 'Unknown'}
                      {isCurrentUser && (
                        <span className="ak-badge ak-badge--primary">You</span>
                      )}
                    </span>
                  </div>
                </td>
                <td>{member.email}</td>
                <td>
                  {onUpdateRole && !isCurrentUser ? (
                    <RoleSelector
                      value={member.role}
                      roles={roles}
                      onChange={(role: string) => onUpdateRole(member.id, role)}
                      disabled={isLoading}
                    />
                  ) : (
                    <span className="ak-badge">{member.role}</span>
                  )}
                </td>
                <td>
                  <span className="ak-status-badge ak-status-badge--success">
                    Active
                  </span>
                </td>
                <td>
                  <time dateTime={member.joinedAt}>
                    {new Date(member.joinedAt).toLocaleDateString()}
                  </time>
                </td>
                <td className="ak-table__actions">
                  {onResendInvite ? (
                    <button
                      type="button"
                      onClick={() => onResendInvite(member.id)}
                      className="ak-button ak-button--sm ak-button--secondary"
                      aria-label={`Resend invite to ${member.email}`}
                      disabled={isLoading}
                    >
                      Resend
                    </button>
                  ) : null}
                  {onRemoveMember && !isCurrentUser ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          window.confirm(
                            `Remove ${member.name || member.email} from the team?`
                          )
                        ) {
                          onRemoveMember(member.id);
                        }
                      }}
                      className="ak-button ak-button--sm ak-button--danger"
                      aria-label={`Remove ${member.name || member.email}`}
                      disabled={isLoading}
                    >
                      Remove
                    </button>
                  ) : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
