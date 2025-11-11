import { WebhookEventSchema, type WebhookEvent } from '@ssojet/ssokit-core';
import { ValidationError } from '@ssojet/ssokit-core/errors';

/**
 * Parse and validate webhook event payload
 * 
 * @throws {ValidationError} if payload doesn't match expected schema
 */
export function parseEvent(rawPayload: string): WebhookEvent {
  try {
    const payload = JSON.parse(rawPayload);
    return WebhookEventSchema.parse(payload);
  } catch (err) {
    if (err instanceof SyntaxError) {
      throw new ValidationError('Invalid JSON in webhook payload');
    }
    throw new ValidationError('Webhook payload validation failed', err as any);
  }
}

/**
 * Type guards for legacy team webhook event types
 */
export function isMemberAddedEvent(
  event: WebhookEvent
): event is WebhookEvent & { event: 'team.member.added' } {
  return event.event === 'team.member.added';
}

export function isMemberRemovedEvent(
  event: WebhookEvent
): event is WebhookEvent & { event: 'team.member.removed' } {
  return event.event === 'team.member.removed';
}

export function isMemberRoleUpdatedEvent(
  event: WebhookEvent
): event is WebhookEvent & { event: 'team.member.role_updated' } {
  return event.event === 'team.member.role_updated';
}

/**
 * Type guards for user event types
 */
export function isUserCreatedEvent(
  event: WebhookEvent
): event is WebhookEvent & { event: 'user.created' } {
  return event.event === 'user.created';
}

export function isUserUpdatedEvent(
  event: WebhookEvent
): event is WebhookEvent & { event: 'user.updated' } {
  return event.event === 'user.updated';
}

export function isUserDeletedEvent(
  event: WebhookEvent
): event is WebhookEvent & { event: 'user.deleted' } {
  return event.event === 'user.deleted';
}

/**
 * Type guards for group event types
 */
export function isGroupCreatedEvent(
  event: WebhookEvent
): event is WebhookEvent & { event: 'group.created' } {
  return event.event === 'group.created';
}

export function isGroupUpdatedEvent(
  event: WebhookEvent
): event is WebhookEvent & { event: 'group.updated' } {
  return event.event === 'group.updated';
}

export function isGroupDeletedEvent(
  event: WebhookEvent
): event is WebhookEvent & { event: 'group.deleted' } {
  return event.event === 'group.deleted';
}

/**
 * Type guards for user-group membership event types
 */
export function isUserGroupAddedEvent(
  event: WebhookEvent
): event is WebhookEvent & { event: 'user.group.added' } {
  return event.event === 'user.group.added';
}

export function isUserGroupRemovedEvent(
  event: WebhookEvent
): event is WebhookEvent & { event: 'user.group.removed' } {
  return event.event === 'user.group.removed';
}

/**
 * Type guards for invitation event types
 */
export function isInvitationSentEvent(
  event: WebhookEvent
): event is WebhookEvent & { event: 'invitation.sent' } {
  return event.event === 'invitation.sent';
}

export function isInvitationAcceptedEvent(
  event: WebhookEvent
): event is WebhookEvent & { event: 'invitation.accepted' } {
  return event.event === 'invitation.accepted';
}

export function isInvitationRevokedEvent(
  event: WebhookEvent
): event is WebhookEvent & { event: 'invitation.revoked' } {
  return event.event === 'invitation.revoked';
}

/**
 * Type guards for tenant event types
 */
export function isTenantCreatedEvent(
  event: WebhookEvent
): event is WebhookEvent & { event: 'tenant.created' } {
  return event.event === 'tenant.created';
}
