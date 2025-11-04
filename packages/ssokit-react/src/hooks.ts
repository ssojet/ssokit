'use client';

import { useState, useCallback } from 'react';
import { useAuthKit } from './context.js';
import type {
  Organization,
  OrganizationUpdate,
  MemberListResponse,
  AddMemberRequest,
  UpdateMemberRequest,
  InviteListResponse,
  CreateInviteRequest,
  AuditListResponse,
  RoleDefinition,
  UserOrganization,
} from '@ssojet/ssokit-core';

interface UseApiOptions {
  onError?: (error: Error) => void;
}

/**
 * Generic API hook for making requests to AuthKit routes
 */
export function useApi<T>(options?: UseApiOptions) {
  const { baseUrl, fetch: customFetch } = useAuthKit();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const request = useCallback(
    async (path: string, init?: RequestInit): Promise<T> => {
      setLoading(true);
      setError(null);

      try {
        const url = `${baseUrl}${path}`;
        const response = await customFetch(url, {
          ...init,
          headers: {
            'Content-Type': 'application/json',
            ...init?.headers,
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: response.statusText }));
          throw new Error(errorData.message || `Request failed with status ${response.status}`);
        }

        const data = await response.json();
        return data as T;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error occurred');
        setError(error);
        options?.onError?.(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [baseUrl, customFetch, options]
  );

  return { request, loading, error };
}

/**
 * Hook for organization operations
 */
export function useOrganization(organizationId: string) {
  const { request, loading, error } = useApi<Organization>();

  const get = useCallback(() => {
    return request(`/orgs/${organizationId}`);
  }, [organizationId, request]);

  const update = useCallback(
    (data: OrganizationUpdate) => {
      return request(`/orgs/${organizationId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    [organizationId, request]
  );

  return { get, update, loading, error };
}

/**
 * Hook for member operations
 */
export function useMembers(organizationId: string) {
  const { request, loading, error } = useApi<MemberListResponse>();

  const list = useCallback(
    (params?: { query?: string; role?: string; cursor?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.query) searchParams.set('query', params.query);
      if (params?.role) searchParams.set('role', params.role);
      if (params?.cursor) searchParams.set('cursor', params.cursor);

      const query = searchParams.toString();
      return request(`/orgs/${organizationId}/members${query ? `?${query}` : ''}`);
    },
    [organizationId, request]
  );

  const add = useCallback(
    (data: AddMemberRequest) => {
      return request(`/orgs/${organizationId}/members`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    [organizationId, request]
  );

  const update = useCallback(
    (memberId: string, data: UpdateMemberRequest) => {
      return request(`/orgs/${organizationId}/members/${memberId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    [organizationId, request]
  );

  const remove = useCallback(
    (memberId: string) => {
      return request(`/orgs/${organizationId}/members/${memberId}`, {
        method: 'DELETE',
      });
    },
    [organizationId, request]
  );

  return { list, add, update, remove, loading, error };
}

/**
 * Hook for invite operations
 */
export function useInvites(organizationId: string) {
  const { request, loading, error } = useApi<InviteListResponse>();

  const list = useCallback(() => {
    return request(`/orgs/${organizationId}/invites`);
  }, [organizationId, request]);

  const create = useCallback(
    (data: CreateInviteRequest) => {
      return request(`/orgs/${organizationId}/invites`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    [organizationId, request]
  );

  const resend = useCallback(
    (inviteId: string) => {
      return request(`/orgs/${organizationId}/invites/${inviteId}/resend`, {
        method: 'POST',
      });
    },
    [organizationId, request]
  );

  const revoke = useCallback(
    (inviteId: string) => {
      return request(`/orgs/${organizationId}/invites/${inviteId}`, {
        method: 'DELETE',
      });
    },
    [organizationId, request]
  );

  return { list, create, resend, revoke, loading, error };
}

/**
 * Hook for audit log operations
 */
export function useAuditLog(organizationId: string) {
  const { request, loading, error } = useApi<AuditListResponse>();

  const list = useCallback(
    (cursor?: string) => {
      const query = cursor ? `?cursor=${cursor}` : '';
      return request(`/orgs/${organizationId}/audit${query}`);
    },
    [organizationId, request]
  );

  return { list, loading, error };
}

/**
 * Hook for role definitions
 */
export function useRoles(organizationId: string) {
  const { request, loading, error } = useApi<{ data: RoleDefinition[] }>();

  const list = useCallback(() => {
    return request(`/orgs/${organizationId}/roles`);
  }, [organizationId, request]);

  return { list, loading, error };
}

/**
 * Hook for user's organizations
 */
export function useUserOrganizations() {
  const { request, loading, error } = useApi<{ data: UserOrganization[] }>();

  const list = useCallback(() => {
    return request('/me/orgs');
  }, [request]);

  return { list, loading, error };
}
