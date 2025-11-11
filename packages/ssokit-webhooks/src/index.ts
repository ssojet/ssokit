export { verifySignature } from './verify.js';
export type { VerifySignatureOptions } from './verify.js';

export {
  parseEvent,
  // Legacy team events
  isMemberAddedEvent,
  isMemberRemovedEvent,
  isMemberRoleUpdatedEvent,
  // User events
  isUserCreatedEvent,
  isUserUpdatedEvent,
  isUserDeletedEvent,
  // Group events
  isGroupCreatedEvent,
  isGroupUpdatedEvent,
  isGroupDeletedEvent,
  // User-group membership events
  isUserGroupAddedEvent,
  isUserGroupRemovedEvent,
  // Invitation events
  isInvitationSentEvent,
  isInvitationAcceptedEvent,
  isInvitationRevokedEvent,
  // Tenant events
  isTenantCreatedEvent,
} from './parser.js';

export { ScimClient, createScimClient } from './scim.js';
export type { ScimClientConfig } from './scim.js';

export { handleEventToSCIM, defaultScopeStrategy } from './handler.js';
export type { HandleEventOptions, OrgIdScopeStrategy } from './handler.js';

export { createWebhookHandler, createExpressWebhookHandler } from './webhook-handler.js';
export type { WebhookHandlerOptions, WebhookEventHandler } from './webhook-handler.js';
