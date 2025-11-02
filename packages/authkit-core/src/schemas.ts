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

export const MemberSchema = z.object({
  id: z.string(),
  userId: z.string(),
  organizationId: z.string(),
  role: MemberRoleSchema,
  email: z.string().email(),
  name: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  joinedAt: z.string(),
  updatedAt: z.string(),
});

export type Member = z.infer<typeof MemberSchema>;

export const MemberListResponseSchema = z.object({
  data: z.array(MemberSchema),
  cursor: z.string().optional(),
  hasMore: z.boolean(),
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
  name: MemberRoleSchema,
  description: z.string(),
  permissions: z.array(z.string()),
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
  'team.member.added',
  'team.member.removed',
  'team.member.role_updated',
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

export const WebhookEventSchema = z.object({
  id: z.string(),
  type: WebhookEventTypeSchema,
  data: z.union([
    WebhookMemberAddedPayloadSchema,
    WebhookMemberRemovedPayloadSchema,
    WebhookMemberRoleUpdatedPayloadSchema,
  ]),
  createdAt: z.string(),
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
