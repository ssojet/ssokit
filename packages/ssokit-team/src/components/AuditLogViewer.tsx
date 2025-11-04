import type { AuditEvent } from '@ssojet/ssokit-core';

export interface AuditLogViewerProps {
  events: AuditEvent[];
  isLoading?: boolean;
  onLoadMore?: () => Promise<void>;
  hasMore?: boolean;
  emptyMessage?: string;
  className?: string;
}

/**
 * AuditLogViewer - Displays team activity audit log
 */
export function AuditLogViewer({
  events,
  isLoading = false,
  onLoadMore,
  hasMore = false,
  emptyMessage = 'No audit events',
  className = '',
}: AuditLogViewerProps) {
  if (events.length === 0 && !isLoading) {
    return (
      <div className={`ak-audit-log__empty ${className}`}>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  const getEventIcon = (eventType: string) => {
    if (eventType.includes('add') || eventType.includes('invite')) return '➕';
    if (eventType.includes('remove') || eventType.includes('delete')) return '🗑️';
    if (eventType.includes('update') || eventType.includes('change')) return '✏️';
    return '📝';
  };

  const formatEventDescription = (event: AuditEvent): string => {
    const { eventType, actorEmail, metadata } = event;
    
    if (eventType === 'member.added') {
      return `${actorEmail} added ${metadata?.targetEmail || 'a member'}`;
    }
    if (eventType === 'member.removed') {
      return `${actorEmail} removed ${metadata?.targetEmail || 'a member'}`;
    }
    if (eventType === 'member.role_updated') {
      return `${actorEmail} changed role of ${metadata?.targetEmail || 'a member'} to ${metadata?.newRole || 'unknown'}`;
    }
    if (eventType === 'invite.created') {
      return `${actorEmail} invited ${metadata?.email || 'someone'}`;
    }
    if (eventType === 'invite.revoked') {
      return `${actorEmail} revoked invite for ${metadata?.email || 'someone'}`;
    }
    
    return `${actorEmail} performed ${eventType}`;
  };

  return (
    <div className={`ak-audit-log ${className}`}>
      <div className="ak-audit-log__list" role="list">
        {events.map((event) => (
          <div key={event.id} className="ak-audit-log__item" role="listitem">
            <div className="ak-audit-log__icon" aria-hidden="true">
              {getEventIcon(event.eventType)}
            </div>
            <div className="ak-audit-log__content">
              <p className="ak-audit-log__description">
                {formatEventDescription(event)}
              </p>
              <time
                className="ak-audit-log__time"
                dateTime={event.createdAt}
                title={new Date(event.createdAt).toLocaleString()}
              >
                {new Date(event.createdAt).toLocaleString()}
              </time>
            </div>
          </div>
        ))}
      </div>

      {hasMore && onLoadMore && (
        <div className="ak-audit-log__footer">
          <button
            type="button"
            onClick={onLoadMore}
            className="ak-button ak-button--secondary"
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
}
