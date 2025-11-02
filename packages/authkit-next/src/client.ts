import { readSSOJetServerConfig } from '@ssojet/authkit-core/config';
import { ApiError } from '@ssojet/authkit-core/errors';

/**
 * SSOJet API client for server-side operations
 */
export class SSOJetClient {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    const config = readSSOJetServerConfig();
    this.baseUrl = config.baseUrl;
    this.apiKey = config.apiKey;
  }

  async request<T>(path: string, init?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${path}`;

    try {
      const response = await fetch(url, {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
          ...init?.headers,
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new ApiError(
          errorData.message || `API request failed with status ${response.status}`,
          response.status,
          errorData
        );
      }

      return await response.json();
    } catch (err) {
      if (err instanceof ApiError) {
        throw err;
      }
      throw new ApiError(err instanceof Error ? err.message : 'Unknown API error', 500);
    }
  }

  // Organizations
  async getOrganization(orgId: string) {
    return this.request(`/api/v1/tenants/${orgId}`);
  }

  async updateOrganization(orgId: string, data: any) {
    return this.request(`/api/v1/tenants/${orgId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Members
  async listMembers(orgId: string, params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/tenants/${orgId}/users${query}`);
  }

  async addMember(orgId: string, data: any) {
    return this.request(`/api/v1/auth/tenants/${orgId}/invitations`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMember(orgId: string, memberId: string, data: any) {
    return this.request(`/api/v1/auth/tenants/${orgId}/invitations/${memberId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async removeMember(orgId: string, data: any) {
    return this.request(`/api/v1/auth/tenants/${orgId}/invitations`, {
      method: 'DELETE',
       body: JSON.stringify(data),
    });
  }

  // Invites
  async listInvites(orgId: string) {
    return this.request(`/api/v1/auth/tenants/${orgId}/invitations`);
  }

  async createInvite(orgId: string, data: any) {
    return this.request(`/api/v1/auth/tenants/${orgId}/invitations`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async resendInvite(orgId: string, inviteId: string) {
    return this.request(`/api/v1/auth/tenants/${orgId}/invitations/${inviteId}/resend`, {
      method: 'POST',
    });
  }

  async revokeInvite(orgId: string, inviteId: string) {
    return this.request(`/api/v1/auth/tenants/${orgId}/invitations/${inviteId}`, {
      method: 'DELETE',
    });
  }

  // Audit
  async listAuditEvents(orgId: string, cursor?: string) {
    const query = cursor ? `?cursor=${cursor}` : '';
    return this.request(`/api/v1/tenants/${orgId}/audit${query}`);
  }

  // Roles
  async listRoles() {
    return this.request(`/api/v1/roles`);
  }

  // User organizations
  async listUserOrganizations(userId: string) {
    return this.request(`/api/v1/users/${userId}/tenants`);
  }
}
