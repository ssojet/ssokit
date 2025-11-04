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
 * Type guards for webhook event types
 */
export function isMemberAddedEvent(
  event: WebhookEvent
): event is WebhookEvent & { type: 'team.member.added' } {
  return event.type === 'team.member.added';
}

export function isMemberRemovedEvent(
  event: WebhookEvent
): event is WebhookEvent & { type: 'team.member.removed' } {
  return event.type === 'team.member.removed';
}

export function isMemberRoleUpdatedEvent(
  event: WebhookEvent
): event is WebhookEvent & { type: 'team.member.role_updated' } {
  return event.type === 'team.member.role_updated';
}
