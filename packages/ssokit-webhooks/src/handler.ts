import type { WebhookEvent, MemberRole } from '@ssojet/ssokit-core';
import type { ScimClient } from './scim.js';
import {
  isMemberAddedEvent,
  isMemberRemovedEvent,
  isMemberRoleUpdatedEvent,
} from './parser.js';

export type OrgIdScopeStrategy = (organizationId: string, role: MemberRole) => string;

export interface HandleEventOptions {
  event: WebhookEvent;
  scimClient: ScimClient;
  orgIdScopeStrategy: OrgIdScopeStrategy;
}

/**
 * Default scope strategy: ${orgId}:${role}s
 * Examples: org_123:admins, org_123:members
 */
export const defaultScopeStrategy: OrgIdScopeStrategy = (orgId, role) => `${orgId}:${role}s`;

/**
 * Handle webhook event and perform corresponding SCIM operations
 * 
 * Strategy:
 * 1. Ensure user exists in SCIM (create if needed)
 * 2. Ensure groups exist for org+role combinations
 * 3. Update group memberships based on event type
 */
export async function handleEventToSCIM({
  event,
  scimClient,
  orgIdScopeStrategy,
}: HandleEventOptions): Promise<void> {
  if (isMemberAddedEvent(event)) {
    await handleMemberAdded(event, scimClient, orgIdScopeStrategy);
  } else if (isMemberRemovedEvent(event)) {
    await handleMemberRemoved(event, scimClient, orgIdScopeStrategy);
  } else if (isMemberRoleUpdatedEvent(event)) {
    await handleMemberRoleUpdated(event, scimClient, orgIdScopeStrategy);
  }
}

/**
 * Handle team.member.added event
 * - Create/activate user
 * - Create group if needed
 * - Add user to group
 */
async function handleMemberAdded(
  event: WebhookEvent & { event: 'team.member.added' },
  scimClient: ScimClient,
  scopeStrategy: OrgIdScopeStrategy
): Promise<void> {
  const data = event.data as {
    userId: string;
    email: string;
    name?: string;
    organizationId: string;
    role: string;
  };
  const { userId, email, name, organizationId, role } = data;

  // Ensure user exists and is active
  let user = await scimClient.getUserByEmail(email);
  
  if (!user) {
    // Create new user
    user = await scimClient.createUser({
      schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
      userName: email,
      emails: [{ value: email, primary: true }],
      displayName: name,
      externalId: userId,
      active: true,
      name: name
        ? {
            formatted: name,
          }
        : undefined,
    });
  } else if (!user.active) {
    // Reactivate existing user
    user = await scimClient.activateUser(user.id!);
  }

  // Ensure group exists
  const groupName = scopeStrategy(organizationId, role as MemberRole);
  let group = await scimClient.getGroupByDisplayName(groupName);
  
  if (!group) {
    group = await scimClient.createGroup({
      schemas: ['urn:ietf:params:scim:schemas:core:2.0:Group'],
      displayName: groupName,
      externalId: groupName,
      members: [],
    });
  }

  // Add user to group (if not already a member)
  const isMember = group.members?.some((m) => m.value === user!.id);
  if (!isMember) {
    await scimClient.addMemberToGroup(group.id!, user.id!, email);
  }
}

/**
 * Handle team.member.removed event
 * - Remove user from group
 * - Optionally deactivate user if they have no other groups
 */
async function handleMemberRemoved(
  event: WebhookEvent & { event: 'team.member.removed' },
  scimClient: ScimClient,
  scopeStrategy: OrgIdScopeStrategy
): Promise<void> {
  const data = event.data as {
    userId: string;
    email: string;
    organizationId: string;
    role: string;
  };
  const { email, organizationId, role } = data;

  // Find user
  const user = await scimClient.getUserByEmail(email);
  if (!user) {
    // User doesn't exist, nothing to do
    return;
  }

  // Find group
  const groupName = scopeStrategy(organizationId, role as MemberRole);
  const group = await scimClient.getGroupByDisplayName(groupName);
  
  if (group) {
    // Remove user from group
    await scimClient.removeMemberFromGroup(group.id!, user.id!);
  }

  // Optional: Deactivate user if they have no other group memberships
  // This is a policy decision - you may want to keep the user active
  // Uncomment if you want to deactivate users with no groups:
  // const allGroups = await scimClient.getGroups();
  // const hasOtherGroups = allGroups.Resources.some(g => 
  //   (g as any).members?.some((m: any) => m.value === user.id)
  // );
  // if (!hasOtherGroups) {
  //   await scimClient.deactivateUser(user.id!);
  // }
}

/**
 * Handle team.member.role_updated event
 * - Remove user from old role group
 * - Add user to new role group
 */
async function handleMemberRoleUpdated(
  event: WebhookEvent & { event: 'team.member.role_updated' },
  scimClient: ScimClient,
  scopeStrategy: OrgIdScopeStrategy
): Promise<void> {
  const data = event.data as {
    userId: string;
    email: string;
    organizationId: string;
    oldRole: string;
    newRole: string;
  };
  const { email, organizationId, oldRole, newRole } = data;

  // Find user
  const user = await scimClient.getUserByEmail(email);
  if (!user) {
    // User doesn't exist, shouldn't happen
    return;
  }

  // Remove from old group
  const oldGroupName = scopeStrategy(organizationId, oldRole as MemberRole);
  const oldGroup = await scimClient.getGroupByDisplayName(oldGroupName);
  if (oldGroup) {
    await scimClient.removeMemberFromGroup(oldGroup.id!, user.id!);
  }

  // Add to new group (create if needed)
  const newGroupName = scopeStrategy(organizationId, newRole as MemberRole);
  let newGroup = await scimClient.getGroupByDisplayName(newGroupName);
  
  if (!newGroup) {
    newGroup = await scimClient.createGroup({
      schemas: ['urn:ietf:params:scim:schemas:core:2.0:Group'],
      displayName: newGroupName,
      externalId: newGroupName,
      members: [],
    });
  }

  await scimClient.addMemberToGroup(newGroup.id!, user.id!, email);
}
