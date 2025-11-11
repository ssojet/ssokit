import { useState } from 'react';
import type { MembersTableProps } from '../types';
import { RoleSelector } from './RoleSelector';
import { ConfirmDialog } from './ConfirmDialog';

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
  onDeleteInvite,
  actionLoading = {},
  isLoading = false,
  emptyMessage = 'No members found',
  className = '',
}: MembersTableProps) {
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'remove' | 'delete';
    memberId: string;
    memberName: string;
    memberEmail: string;
  }>({
    isOpen: false,
    type: 'remove',
    memberId: '',
    memberName: '',
    memberEmail: '',
  });

  const handleRemoveClick = (memberId: string, memberName: string, memberEmail: string) => {
    setConfirmDialog({
      isOpen: true,
      type: 'remove',
      memberId,
      memberName,
      memberEmail,
    });
  };

  const handleDeleteClick = (inviteId: string, memberName: string, memberEmail: string) => {
    setConfirmDialog({
      isOpen: true,
      type: 'delete',
      memberId: inviteId,
      memberName,
      memberEmail,
    });
  };

  const handleConfirmRemove = () => {
    if (confirmDialog.type === 'remove' && onRemoveMember && confirmDialog.memberId) {
      onRemoveMember(confirmDialog.memberId);
    } else if (confirmDialog.type === 'delete' && onDeleteInvite && confirmDialog.memberId) {
      onDeleteInvite(confirmDialog.memberId);
    }
    setConfirmDialog({
      isOpen: false,
      type: 'remove',
      memberId: '',
      memberName: '',
      memberEmail: '',
    });
  };

  const handleCancelRemove = () => {
    setConfirmDialog({
      isOpen: false,
      type: 'remove',
      memberId: '',
      memberName: '',
      memberEmail: '',
    });
  };

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
            <th scope="col">Joined</th>
          <th scope="col">Invite Date</th>
            <th scope="col" className="sk-table__actions">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(members) && members.length > 0 ? members.map((member) => {
            const isCurrentUser = member.userId === currentUserId;
            const status = member.status || 'active';

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
                    <span>{member.role}</span>
                  )}
                </td>
                <td>
                  <span className={`sk-status-badge sk-status-badge--${status.toLowerCase()}`}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
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
                      disabled={isLoading || actionLoading[`resend-${member.id}`]}
                    >
                      {actionLoading[`resend-${member.id}`] ? (
                        <>
                          <span className="sk-spinner sk-spinner--sm" role="status" aria-label="Resending..."></span>
                          Resending...
                        </>
                      ) : (
                        'Resend'
                      )}
                    </button>
                  ) : null}
                  {onDeleteInvite ? (
                    <button
                      type="button"
                      onClick={() => handleDeleteClick(member.id, member.name || '', member.email)}
                      className="sk-button sk-button--sm sk-button--danger"
                      aria-label={`Delete invite for ${member.email}`}
                      disabled={isLoading || actionLoading[`delete-${member.id}`]}
                    >
                      {actionLoading[`delete-${member.id}`] ? (
                        <>
                          <span className="sk-spinner sk-spinner--sm" role="status" aria-label="Deleting..."></span>
                          Deleting...
                        </>
                      ) : (
                        'Delete'
                      )}
                    </button>
                  ) : null}
                  {onRemoveMember && !isCurrentUser ? (
                    <button
                      type="button"
                      onClick={() => handleRemoveClick(member.id, member.name || '', member.email)}
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

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.type === 'delete' ? 'Delete Invitation' : 'Remove Team Member'}
        message={
          confirmDialog.type === 'delete'
            ? `Are you sure you want to delete the invitation for ${confirmDialog.memberEmail}? This action cannot be undone.`
            : `Are you sure you want to remove ${confirmDialog.memberName || confirmDialog.memberEmail} from the team? This action cannot be undone.`
        }
        confirmLabel={confirmDialog.type === 'delete' ? 'Delete' : 'Remove'}
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleConfirmRemove}
        onCancel={handleCancelRemove}
      />
    </div>
  );
}
