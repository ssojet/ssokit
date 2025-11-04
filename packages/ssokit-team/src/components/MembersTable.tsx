import type { MembersTableProps } from '../types';
import { RoleSelector } from './RoleSelector';

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
      <div className={`sk-members-table__empty ${className}`}>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`sk-members-table ${className}`}>
      <table className="sk-table" role="table">
        <thead>
          <tr>
            <th scope="col">Member</th>
            <th scope="col">Email</th>
            <th scope="col">Role</th>
            <th scope="col">Status</th>
            <th scope="col">Joined</th>
            <th scope="col" className="sk-table__actions">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(members) && members.length > 0 ? members.map((member) => {
            const isCurrentUser = member.userId === currentUserId;
            // Note: Members don't have a status field - they're all active
            // For pending invites, use a separate InvitesTable component

            return (
              <tr key={member.id}>
                <td>
                  <div className="sk-member-cell">
                    <div className="sk-member-cell__avatar">
                      {(member.name?.[0] ?? member.email[0] ?? '?').toUpperCase()}
                    </div>
                    <span className="sk-member-cell__name">
                      {member.name || 'Unknown'}
                      {isCurrentUser && (
                        <span className="sk-badge sk-badge--primary">You</span>
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
                    <span className="sk-badge">{member.role}</span>
                  )}
                </td>
                <td>
                  <span className="sk-status-badge sk-status-badge--success">
                    Active
                  </span>
                </td>
                <td>
                  <time dateTime={member.joinedAt}>
                    {new Date(member.joinedAt).toLocaleDateString()}
                  </time>
                </td>
                <td className="sk-table__actions">
                  {onResendInvite ? (
                    <button
                      type="button"
                      onClick={() => onResendInvite(member.id)}
                      className="sk-button sk-button--sm sk-button--secondary"
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
                      className="sk-button sk-button--sm sk-button--danger"
                      aria-label={`Remove ${member.name || member.email}`}
                      disabled={isLoading}
                    >
                      Remove
                    </button>
                  ) : null}
                </td>
              </tr>
            );
          }) : (
            <tr>
              <td colSpan={5} className="sk-table__empty">
                {emptyMessage || 'No members found'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
