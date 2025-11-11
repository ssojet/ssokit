import { readSSOJetServerConfig } from '@ssojet/ssokit-core/config';
import { ApiError } from '@ssojet/ssokit-core/errors';

// Lightweight logger for SSOJet client (to avoid circular dependencies)
class SSOJetLogger {
  private static generateRequestId(): string {
    return Math.random().toString(36).substr(2, 8).toUpperCase();
  }

  private static colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    magenta: '\x1b[35m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    gray: '\x1b[90m',
  };

  private static activeRequests = new Map<string, number>();

  static requestStart(method: string, url: string, headers?: any, body?: any): string {
    const requestId = this.generateRequestId();
    const timestamp = new Date().toISOString().replace('T', ' ').replace('Z', '');
    
    console.log(
      `\n${this.colors.magenta}╭─────────────────────────────────────────────────────────────────────────────────╮${this.colors.reset}`
    );
    console.log(
      `${this.colors.magenta}│${this.colors.reset} ${this.colors.bright}${this.colors.magenta}[${requestId}]${this.colors.reset} ${this.colors.bright}SSOJet API${this.colors.reset} ${this.colors.gray}${timestamp}${this.colors.reset} ${this.colors.magenta}│${this.colors.reset}`
    );
    console.log(
      `${this.colors.magenta}├─────────────────────────────────────────────────────────────────────────────────┤${this.colors.reset}`
    );
    console.log(
      `${this.colors.magenta}│${this.colors.reset} ${this.colors.yellow}🚀${this.colors.reset} ${this.colors.bright}${method}${this.colors.reset} ${url} ${this.colors.magenta}│${this.colors.reset}`
    );
    
    if (headers?.Authorization) {
      console.log(
        `${this.colors.magenta}│${this.colors.reset} ${this.colors.blue}🔑${this.colors.reset} Auth: ${headers.Authorization.substring(0, 20)}... ${this.colors.magenta}│${this.colors.reset}`
      );
    }
    
    if (body) {
      const bodyPreview = typeof body === 'string' ? body.substring(0, 100) : JSON.stringify(body).substring(0, 100);
      console.log(
        `${this.colors.magenta}│${this.colors.reset} ${this.colors.yellow}📦${this.colors.reset} Body: ${bodyPreview}${body.length > 100 ? '...' : ''} ${this.colors.magenta}│${this.colors.reset}`
      );
    }
    
    this.activeRequests.set(requestId, Date.now());
    return requestId;
  }

  static requestEnd(requestId: string, status: number, statusText: string, data?: any, error?: any): void {
    const startTime = this.activeRequests.get(requestId);
    if (!startTime) return;
    
    const duration = Date.now() - startTime;
    const durationStr = duration < 1000 ? `${duration}ms` : `${(duration / 1000).toFixed(2)}s`;
    
    if (error || status >= 400) {
      console.log(
        `${this.colors.magenta}│${this.colors.reset} ${this.colors.red}✘${this.colors.reset} ${this.colors.red}${status} ${statusText}${this.colors.reset} (${durationStr}) ${this.colors.magenta}│${this.colors.reset}`
      );
      if (error) {
        const errorMsg = error.message || error;
        console.log(
          `${this.colors.magenta}│${this.colors.reset} ${this.colors.red}🚨${this.colors.reset} ${errorMsg} ${this.colors.magenta}│${this.colors.reset}`
        );
      }
    } else {
      console.log(
        `${this.colors.magenta}│${this.colors.reset} ${this.colors.green}✓${this.colors.reset} ${this.colors.green}${status} ${statusText}${this.colors.reset} (${durationStr}) ${this.colors.magenta}│${this.colors.reset}`
      );
    }
    
    if (data && typeof data === 'object') {
      const dataInfo = Array.isArray(data) 
        ? `Array[${data.length}]`
        : `Object{${Object.keys(data).length} keys}`;
      console.log(
        `${this.colors.magenta}│${this.colors.reset} ${this.colors.blue}📥${this.colors.reset} Data: ${dataInfo} ${this.colors.magenta}│${this.colors.reset}`
      );
    }
    
    console.log(
      `${this.colors.magenta}╰─────────────────────────────────────────────────────────────────────────────────╯${this.colors.reset}\n`
    );
    
    this.activeRequests.delete(requestId);
  }
}

/**
 * SSOJet API client for server-side and client-side operations
 */
export class SSOJetClient {
  private baseUrl: string;
  private accessToken?: string;
  private clientId?: string;

  constructor(accessToken?: string, options?: { baseUrl?: string; clientId?: string }) {
    // For client-side usage, baseUrl can be passed via options or NEXT_PUBLIC env var
    // For server-side usage, it reads from server config
    let serverConfig: ReturnType<typeof readSSOJetServerConfig> | null = null;
    
    if (options?.baseUrl) {
      this.baseUrl = options.baseUrl;
    } else if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_SSOJET_BASE) {
      // Client-side: use public env var
      this.baseUrl = process.env.NEXT_PUBLIC_SSOJET_BASE;
    } else {
      // Server-side: use server config
      serverConfig = readSSOJetServerConfig();
      this.baseUrl = serverConfig.baseUrl;
    }
    
    // Set client ID from options or environment variables
    if (options?.clientId) {
      this.clientId = options.clientId;
    } else if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_DEFAULT_SSOJET_CLIENT_ID) {
      // Client-side: use public env var
      this.clientId = process.env.NEXT_PUBLIC_DEFAULT_SSOJET_CLIENT_ID;
    } else if (serverConfig?.clientId) {
      // Server-side: use from server config
      this.clientId = serverConfig.clientId;
    } else if (process.env.DEFAULT_SSOJET_CLIENT_ID) {
      // Fallback: direct env var
      this.clientId = process.env.DEFAULT_SSOJET_CLIENT_ID;
    }
    
    this.accessToken = accessToken;
  }

  async request<T>(path: string, init?: RequestInit): Promise<T> {
    // Build URL with client_id query parameter
    const url = new URL(`${this.baseUrl}${path}`);
    if (this.clientId) {
      url.searchParams.set('client_id', this.clientId);
    }
    
    const finalUrl = url.toString();
    const isDebugEnabled = process.env.SSOJET_DEBUG === 'true' || process.env.NODE_ENV === 'development';

    const requestOptions = {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(this.accessToken && { Authorization: `Bearer ${this.accessToken}` }),
        ...init?.headers,
      },
      cache: 'no-store' as RequestCache,
    };

    let requestId = '';
    if (isDebugEnabled) {
      requestId = SSOJetLogger.requestStart(
        init?.method || 'GET', 
        finalUrl, 
        requestOptions.headers,
        init?.body
      );
    }

    try {
      const response = await fetch(finalUrl, requestOptions);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        
        if (isDebugEnabled) {
          SSOJetLogger.requestEnd(requestId, response.status, response.statusText, null, errorData);
        }
        
        throw new ApiError(
          errorData.message || `API request failed with status ${response.status}`,
          response.status,
          errorData
        );
      }

      const responseData = await response.json();
      
      if (isDebugEnabled) {
        SSOJetLogger.requestEnd(requestId, response.status, response.statusText, responseData);
      }

      return responseData;
    } catch (err) {
      if (isDebugEnabled && requestId) {
        SSOJetLogger.requestEnd(requestId, 0, 'Request Failed', null, err);
      }
      
      if (err instanceof ApiError) {
        throw err;
      }
      throw new ApiError(err instanceof Error ? err.message : 'Unknown API error', 500);
    }
  }

  // Organizations
  async getOrganization(orgId: string) {
    return this.request(`/api/v1/auth/tenants/${orgId}`);
  }

  async updateOrganization(orgId: string, data: any) {
    return this.request(`/api/v1/auth/tenants/${orgId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Members
  async listMembers(orgId: string, params?: Record<string, string>) {
    console.log("=== ssojet");
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/auth/tenants/${orgId}/users${query}`);
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

  async removeMember(tenantId: string, userId: string) {
    console.log('==== Removing member from SSOJetClient', { tenantId, userId });
    return this.request(`/api/v1/auth/tenants/${tenantId}/users`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_ids: [userId]
      })
    });
  }

  // Invites
  async listInvites(orgId: string) {
    console.log('==== Listing invites from SSOJetClient');
    return this.request(`/api/v1/auth/tenants/${orgId}/users`);
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
    return this.request(`/api/v1/auth/tenants/${orgId}/audit${query}`);
  }

  // Roles
  async listRoles() {
    console.log('==== Listing roles from SSOJetClient');
    return this.request(`/api/v1/auth/roles`);
  }

  // Update member roles
  async updateMemberRoles(tenantId: string, userId: string, roleIds: string[]) {
    console.log('==== Updating member roles from SSOJetClient', { tenantId, userId, roleIds });
    return this.request(`/api/v1/auth/tenants/${tenantId}/users/${userId}/roles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role_ids: roleIds
      })
    });
  }

  // User organizations
  async listUserOrganizations(userId: string) {
    return this.request(`/api/v1/auth/users/${userId}/tenants`);
  }
}
