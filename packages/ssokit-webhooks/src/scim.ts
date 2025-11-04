import type { ScimUser, ScimGroup, ScimListResponse } from '@ssojet/ssokit-core';
import { ScimError } from '@ssojet/ssokit-core/errors';

export interface ScimClientConfig {
  baseUrl: string;
  token: string;
}

/**
 * SCIM 2.0 client for provisioning operations
 */
export class ScimClient {
  private baseUrl: string;
  private token: string;

  constructor(config: ScimClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.token = config.token;
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    
    try {
      const response = await fetch(url, {
        ...init,
        headers: {
          'Content-Type': 'application/scim+json',
          Authorization: `Bearer ${this.token}`,
          ...init?.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new ScimError(
          errorData?.detail || `SCIM request failed with status ${response.status}`,
          response.status,
          errorData?.scimType
        );
      }

      return await response.json();
    } catch (err) {
      if (err instanceof ScimError) {
        throw err;
      }
      throw new ScimError(
        err instanceof Error ? err.message : 'Unknown SCIM error',
        500
      );
    }
  }

  // ============================================================================
  // User operations
  // ============================================================================

  async getUsers(filter?: string): Promise<ScimListResponse> {
    const query = filter ? `?filter=${encodeURIComponent(filter)}` : '';
    return this.request<ScimListResponse>(`/Users${query}`);
  }

  async getUser(id: string): Promise<ScimUser> {
    return this.request<ScimUser>(`/Users/${id}`);
  }

  async getUserByEmail(email: string): Promise<ScimUser | null> {
    const filter = `userName eq "${email}"`;
    const response = await this.getUsers(filter);
    
    if (response.totalResults === 0) {
      return null;
    }
    
    return response.Resources[0] as ScimUser;
  }

  async createUser(user: Omit<ScimUser, 'id' | 'meta'>): Promise<ScimUser> {
    return this.request<ScimUser>('/Users', {
      method: 'POST',
      body: JSON.stringify({
        ...user,
      }),
    });
  }

  async updateUser(id: string, user: Partial<ScimUser>): Promise<ScimUser> {
    return this.request<ScimUser>(`/Users/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        id,
        ...user,
      }),
    });
  }

  async patchUser(id: string, operations: any[]): Promise<ScimUser> {
    return this.request<ScimUser>(`/Users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        schemas: ['urn:ietf:params:scim:api:messages:2.0:PatchOp'],
        Operations: operations,
      }),
    });
  }

  async deactivateUser(id: string): Promise<ScimUser> {
    return this.patchUser(id, [
      {
        op: 'replace',
        path: 'active',
        value: false,
      },
    ]);
  }

  async activateUser(id: string): Promise<ScimUser> {
    return this.patchUser(id, [
      {
        op: 'replace',
        path: 'active',
        value: true,
      },
    ]);
  }

  async deleteUser(id: string): Promise<void> {
    await this.request<void>(`/Users/${id}`, {
      method: 'DELETE',
    });
  }

  // ============================================================================
  // Group operations
  // ============================================================================

  async getGroups(filter?: string): Promise<ScimListResponse> {
    const query = filter ? `?filter=${encodeURIComponent(filter)}` : '';
    return this.request<ScimListResponse>(`/Groups${query}`);
  }

  async getGroup(id: string): Promise<ScimGroup> {
    return this.request<ScimGroup>(`/Groups/${id}`);
  }

  async getGroupByDisplayName(displayName: string): Promise<ScimGroup | null> {
    const filter = `displayName eq "${displayName}"`;
    const response = await this.getGroups(filter);
    
    if (response.totalResults === 0) {
      return null;
    }
    
    return response.Resources[0] as ScimGroup;
  }

  async createGroup(group: Omit<ScimGroup, 'id' | 'meta'>): Promise<ScimGroup> {
    return this.request<ScimGroup>('/Groups', {
      method: 'POST',
      body: JSON.stringify({
        ...group,
      }),
    });
  }

  async updateGroup(id: string, group: Partial<ScimGroup>): Promise<ScimGroup> {
    return this.request<ScimGroup>(`/Groups/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        id,
        ...group,
      }),
    });
  }

  async patchGroup(id: string, operations: any[]): Promise<ScimGroup> {
    return this.request<ScimGroup>(`/Groups/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        schemas: ['urn:ietf:params:scim:api:messages:2.0:PatchOp'],
        Operations: operations,
      }),
    });
  }

  async addMemberToGroup(groupId: string, userId: string, userEmail?: string): Promise<ScimGroup> {
    return this.patchGroup(groupId, [
      {
        op: 'add',
        path: 'members',
        value: [
          {
            value: userId,
            display: userEmail,
          },
        ],
      },
    ]);
  }

  async removeMemberFromGroup(groupId: string, userId: string): Promise<ScimGroup> {
    return this.patchGroup(groupId, [
      {
        op: 'remove',
        path: `members[value eq "${userId}"]`,
      },
    ]);
  }

  async deleteGroup(id: string): Promise<void> {
    await this.request<void>(`/Groups/${id}`, {
      method: 'DELETE',
    });
  }
}

/**
 * Create a SCIM client from config
 */
export function createScimClient(config: ScimClientConfig): ScimClient {
  return new ScimClient(config);
}
