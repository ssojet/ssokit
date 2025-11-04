export { verifySignature } from './verify.js';
export type { VerifySignatureOptions } from './verify.js';

export {
  parseEvent,
  isMemberAddedEvent,
  isMemberRemovedEvent,
  isMemberRoleUpdatedEvent,
} from './parser.js';

export { ScimClient, createScimClient } from './scim.js';
export type { ScimClientConfig } from './scim.js';

export { handleEventToSCIM, defaultScopeStrategy } from './handler.js';
export type { HandleEventOptions, OrgIdScopeStrategy } from './handler.js';
