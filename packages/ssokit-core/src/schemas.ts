import { z } from 'zod';

// ============================================================================
// Organization schemas
// ============================================================================

export const OrganizationSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Organization = z.infer<typeof OrganizationSchema>;

export const OrganizationUpdateSchema = z.object({
  name: z.string().optional(),
  slug: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type OrganizationUpdate = z.infer<typeof OrganizationUpdateSchema>;

// ============================================================================
// Member schemas
// ============================================================================

export const MemberRoleSchema = z.enum(['owner', 'admin', 'member', 'guest']);
export type MemberRole = z.infer<typeof MemberRoleSchema>;

// Updated Member schema to match actual API response from /users endpoint
export const MemberTenantRoleSchema = z.object({
  role_id: z.string(),
  role_name: z.string(),
  permissions: z.null().or(z.array(z.string())),
});

export const MemberTenantSchema = z.object({
  tenant_id: z.string(),
  tenant_name: z.string(),
  roles: z.array(MemberTenantRoleSchema),
  status: z.string(),
});

export const MemberIdentitySchema = z.object({
  id: z.string(),
  provider: z.string(),
  first_name: z.string().optional(),
  created_at: z.string(),
  modified_at: z.string(),
});

export const MemberSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  first_name: z.string().optional(),
  tenants: z.array(MemberTenantSchema),
  identities: z.array(MemberIdentitySchema),
  source: z.string(),
  created_at: z.string(),
  modified_at: z.string(),
  is_active: z.boolean(),
  last_login_at: z.string().optional(),
});

export type Member = z.infer<typeof MemberSchema>;

export const MemberListResponseSchema = z.object({
  limit: z.number(),
  next_cursor: z.string(),
  users: z.array(MemberSchema),
});

export type MemberListResponse = z.infer<typeof MemberListResponseSchema>;

export const AddMemberRequestSchema = z.object({
  email: z.string().email().optional(),
  userId: z.string().optional(),
  role: MemberRoleSchema,
});

export type AddMemberRequest = z.infer<typeof AddMemberRequestSchema>;

export const UpdateMemberRequestSchema = z.object({
  role: MemberRoleSchema,
});

export type UpdateMemberRequest = z.infer<typeof UpdateMemberRequestSchema>;

// ============================================================================
// Invite schemas
// ============================================================================

export const InviteStatusSchema = z.enum(['pending', 'accepted', 'expired', 'revoked']);
export type InviteStatus = z.infer<typeof InviteStatusSchema>;

export const InviteSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  email: z.string().email(),
  role: MemberRoleSchema,
  status: InviteStatusSchema,
  invitedBy: z.string(),
  createdAt: z.string(),
  expiresAt: z.string(),
});

export type Invite = z.infer<typeof InviteSchema>;

export const InviteListResponseSchema = z.object({
  data: z.array(InviteSchema),
  cursor: z.string().optional(),
  hasMore: z.boolean(),
});

export type InviteListResponse = z.infer<typeof InviteListResponseSchema>;

export const CreateInviteRequestSchema = z.object({
  email: z.string().email(),
  role: MemberRoleSchema,
});

export type CreateInviteRequest = z.infer<typeof CreateInviteRequestSchema>;

// ============================================================================
// Audit log schemas
// ============================================================================

export const AuditEventSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  actorId: z.string(),
  actorEmail: z.string().email(),
  eventType: z.string(),
  resourceType: z.string(),
  resourceId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  createdAt: z.string(),
});

export type AuditEvent = z.infer<typeof AuditEventSchema>;

export const AuditListResponseSchema = z.object({
  data: z.array(AuditEventSchema),
  cursor: z.string().optional(),
  hasMore: z.boolean(),
});

export type AuditListResponse = z.infer<typeof AuditListResponseSchema>;

// ============================================================================
// Role schemas
// ============================================================================

export const RoleDefinitionSchema = z.object({
  id: z.string(),
  name: z.string(), // Changed from MemberRoleSchema to allow any role name
  description: z.string(),
  permission_ids: z.array(z.string()), // Changed from permissions to permission_ids
  is_active: z.boolean(),
});

export type RoleDefinition = z.infer<typeof RoleDefinitionSchema>;

export const RoleListResponseSchema = z.object({
  data: z.array(RoleDefinitionSchema),
});

export type RoleListResponse = z.infer<typeof RoleListResponseSchema>;

// ============================================================================
// User organizations schema
// ============================================================================

export const UserOrganizationSchema = z.object({
  organization: OrganizationSchema,
  role: MemberRoleSchema,
  joinedAt: z.string(),
});

export type UserOrganization = z.infer<typeof UserOrganizationSchema>;

export const UserOrganizationsResponseSchema = z.object({
  data: z.array(UserOrganizationSchema),
});

export type UserOrganizationsResponse = z.infer<typeof UserOrganizationsResponseSchema>;

// ============================================================================
// Webhook event schemas
// ============================================================================

export const WebhookEventTypeSchema = z.enum([
  // Legacy team events
  'team.member.added',
  'team.member.removed',
  'team.member.role_updated',
  // User events
  'user.created',
  'user.updated',
  'user.deleted',
  // Directory sync events
  'group.created',
  'group.updated',
  'group.deleted',
  'user.group.added',
  'user.group.removed',
  // Team invite events
  'invitation.sent',
  'invitation.accepted',
  'invitation.revoked',
  // Tenant events
  'tenant.created',
]);

export type WebhookEventType = z.infer<typeof WebhookEventTypeSchema>;

export const WebhookMemberAddedPayloadSchema = z.object({
  organizationId: z.string(),
  memberId: z.string(),
  userId: z.string(),
  email: z.string().email(),
  name: z.string().optional(),
  role: MemberRoleSchema,
});

export type WebhookMemberAddedPayload = z.infer<typeof WebhookMemberAddedPayloadSchema>;

export const WebhookMemberRemovedPayloadSchema = z.object({
  organizationId: z.string(),
  memberId: z.string(),
  userId: z.string(),
  email: z.string().email(),
  role: MemberRoleSchema,
});

export type WebhookMemberRemovedPayload = z.infer<typeof WebhookMemberRemovedPayloadSchema>;

export const WebhookMemberRoleUpdatedPayloadSchema = z.object({
  organizationId: z.string(),
  memberId: z.string(),
  userId: z.string(),
  email: z.string().email(),
  oldRole: MemberRoleSchema,
  newRole: MemberRoleSchema,
});

export type WebhookMemberRoleUpdatedPayload = z.infer<
  typeof WebhookMemberRoleUpdatedPayloadSchema
>;

// User event payloads
export const WebhookUserCreatedPayloadSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.string().email(),
    first_name: z.string().optional(),
    created_at: z.string(),
    source: z.string().optional(),
    metadata: z.record(z.unknown()).optional(),
  }),
});

export type WebhookUserCreatedPayload = z.infer<typeof WebhookUserCreatedPayloadSchema>;

export const WebhookUserUpdatedPayloadSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.string().email(),
    first_name: z.string().optional(),
    modified_at: z.string(),
    metadata: z.record(z.unknown()).optional(),
  }),
});

export type WebhookUserUpdatedPayload = z.infer<typeof WebhookUserUpdatedPayloadSchema>;

export const WebhookUserDeletedPayloadSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.string().email(),
    deleted_at: z.string(),
  }),
});

export type WebhookUserDeletedPayload = z.infer<typeof WebhookUserDeletedPayloadSchema>;

// Group event payloads
export const WebhookGroupCreatedPayloadSchema = z.object({
  group: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    created_at: z.string(),
    external_id: z.string().optional(),
    metadata: z.record(z.unknown()).optional(),
  }),
  source: z.string().optional(),
});

export type WebhookGroupCreatedPayload = z.infer<typeof WebhookGroupCreatedPayloadSchema>;

export const WebhookGroupUpdatedPayloadSchema = z.object({
  group: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    modified_at: z.string(),
    external_id: z.string().optional(),
    metadata: z.record(z.unknown()).optional(),
  }),
  source: z.string().optional(),
});

export type WebhookGroupUpdatedPayload = z.infer<typeof WebhookGroupUpdatedPayloadSchema>;

export const WebhookGroupDeletedPayloadSchema = z.object({
  group: z.object({
    id: z.string(),
    name: z.string(),
    deleted_at: z.string(),
  }),
  source: z.string().optional(),
});

export type WebhookGroupDeletedPayload = z.infer<typeof WebhookGroupDeletedPayloadSchema>;

// User-Group membership event payloads
export const WebhookUserGroupAddedPayloadSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.string().email(),
  }),
  group: z.object({
    id: z.string(),
    name: z.string(),
  }),
  source: z.string().optional(),
});

export type WebhookUserGroupAddedPayload = z.infer<typeof WebhookUserGroupAddedPayloadSchema>;

export const WebhookUserGroupRemovedPayloadSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.string().email(),
  }),
  group: z.object({
    id: z.string(),
    name: z.string(),
  }),
  source: z.string().optional(),
});

export type WebhookUserGroupRemovedPayload = z.infer<typeof WebhookUserGroupRemovedPayloadSchema>;

// Invitation event payloads
export const WebhookInvitationSentPayloadSchema = z.object({
  invitation: z.object({
    id: z.string(),
    email: z.string().email(),
    tenant_id: z.string(),
    tenant_name: z.string().optional(),
    role: z.string(),
    sent_at: z.string(),
    expires_at: z.string().optional(),
  }),
});

export type WebhookInvitationSentPayload = z.infer<typeof WebhookInvitationSentPayloadSchema>;

export const WebhookInvitationAcceptedPayloadSchema = z.object({
  invitation: z.object({
    id: z.string(),
    email: z.string().email(),
    tenant_id: z.string(),
    accepted_at: z.string(),
  }),
  user: z.object({
    id: z.string(),
    email: z.string().email(),
  }),
});

export type WebhookInvitationAcceptedPayload = z.infer<typeof WebhookInvitationAcceptedPayloadSchema>;

export const WebhookInvitationRevokedPayloadSchema = z.object({
  invitation: z.object({
    id: z.string(),
    email: z.string().email(),
    tenant_id: z.string(),
    revoked_at: z.string(),
    reason: z.string().optional(),
  }),
});

export type WebhookInvitationRevokedPayload = z.infer<typeof WebhookInvitationRevokedPayloadSchema>;

// Tenant event payloads
export const WebhookTenantCreatedPayloadSchema = z.object({
  tenant: z.object({
    id: z.string(),
    name: z.string(),
    created_at: z.string(),
    domain: z.string().optional(),
    metadata: z.record(z.unknown()).optional(),
  }),
});

export type WebhookTenantCreatedPayload = z.infer<typeof WebhookTenantCreatedPayloadSchema>;

export const WebhookEventSchema = z.object({
  event: WebhookEventTypeSchema,
  event_id: z.string(),
  created_at: z.string(),
  data: z.union([
    WebhookMemberAddedPayloadSchema,
    WebhookMemberRemovedPayloadSchema,
    WebhookMemberRoleUpdatedPayloadSchema,
    WebhookUserCreatedPayloadSchema,
    WebhookUserUpdatedPayloadSchema,
    WebhookUserDeletedPayloadSchema,
    WebhookGroupCreatedPayloadSchema,
    WebhookGroupUpdatedPayloadSchema,
    WebhookGroupDeletedPayloadSchema,
    WebhookUserGroupAddedPayloadSchema,
    WebhookUserGroupRemovedPayloadSchema,
    WebhookInvitationSentPayloadSchema,
    WebhookInvitationAcceptedPayloadSchema,
    WebhookInvitationRevokedPayloadSchema,
    WebhookTenantCreatedPayloadSchema,
  ]),
});

export type WebhookEvent = z.infer<typeof WebhookEventSchema>;

// ============================================================================
// SCIM schemas
// ============================================================================

export const ScimUserSchema = z.object({
  schemas: z.array(z.string()),
  id: z.string().optional(),
  externalId: z.string().optional(),
  userName: z.string(),
  name: z
    .object({
      givenName: z.string().optional(),
      familyName: z.string().optional(),
      formatted: z.string().optional(),
    })
    .optional(),
  displayName: z.string().optional(),
  emails: z.array(
    z.object({
      value: z.string().email(),
      type: z.string().optional(),
      primary: z.boolean().optional(),
    })
  ),
  active: z.boolean(),
  meta: z
    .object({
      resourceType: z.string().optional(),
      created: z.string().optional(),
      lastModified: z.string().optional(),
      location: z.string().optional(),
    })
    .optional(),
});

export type ScimUser = z.infer<typeof ScimUserSchema>;

export const ScimGroupSchema = z.object({
  schemas: z.array(z.string()),
  id: z.string().optional(),
  externalId: z.string().optional(),
  displayName: z.string(),
  members: z
    .array(
      z.object({
        value: z.string(),
        $ref: z.string().optional(),
        display: z.string().optional(),
      })
    )
    .optional(),
  meta: z
    .object({
      resourceType: z.string().optional(),
      created: z.string().optional(),
      lastModified: z.string().optional(),
      location: z.string().optional(),
    })
    .optional(),
});

export type ScimGroup = z.infer<typeof ScimGroupSchema>;

export const ScimListResponseSchema = z.object({
  schemas: z.array(z.string()),
  totalResults: z.number(),
  startIndex: z.number(),
  itemsPerPage: z.number(),
  Resources: z.array(z.unknown()),
});

export type ScimListResponse = z.infer<typeof ScimListResponseSchema>;
