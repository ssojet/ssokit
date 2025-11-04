import { NextRequest, NextResponse } from 'next/server';
import { SSOJetClient } from '../client.js';

/**
 * Factory for creating Next.js App Router route handlers
 */
export function createRouteHandlers() {
  const client = new SSOJetClient();

  return {
    // GET /api/authkit/orgs/[orgId]
    async getOrganization(_req: NextRequest, { params }: { params: { orgId: string } }) {
      try {
        const data = await client.getOrganization(params.orgId);
        return NextResponse.json(data);
      } catch (err: any) {
        return NextResponse.json(
          { error: err.message },
          { status: err.statusCode || 500 }
        );
      }
    },

    // PATCH /api/authkit/orgs/[orgId]
    async updateOrganization(req: NextRequest, { params }: { params: { orgId: string } }) {
      try {
        const body = await req.json();
        const data = await client.updateOrganization(params.orgId, body);
        return NextResponse.json(data);
      } catch (err: any) {
        return NextResponse.json(
          { error: err.message },
          { status: err.statusCode || 500 }
        );
      }
    },

    // GET /api/authkit/orgs/[orgId]/members
    async listMembers(req: NextRequest, { params }: { params: { orgId: string } }) {
      try {
        const { searchParams } = new URL(req.url);
        const queryParams: Record<string, string> = {};
        searchParams.forEach((value, key) => {
          queryParams[key] = value;
        });
        
        const data = await client.listMembers(params.orgId, queryParams);
        return NextResponse.json(data);
      } catch (err: any) {
        return NextResponse.json(
          { error: err.message },
          { status: err.statusCode || 500 }
        );
      }
    },

    // POST /api/authkit/orgs/[orgId]/members
    async addMember(req: NextRequest, { params }: { params: { orgId: string } }) {
      try {
        const body = await req.json();
        const data = await client.addMember(params.orgId, body);
        return NextResponse.json(data);
      } catch (err: any) {
        return NextResponse.json(
          { error: err.message },
          { status: err.statusCode || 500 }
        );
      }
    },

    // PATCH /api/authkit/orgs/[orgId]/members/[memberId]
    async updateMember(
      req: NextRequest,
      { params }: { params: { orgId: string; memberId: string } }
    ) {
      try {
        const body = await req.json();
        const data = await client.updateMember(params.orgId, params.memberId, body);
        return NextResponse.json(data);
      } catch (err: any) {
        return NextResponse.json(
          { error: err.message },
          { status: err.statusCode || 500 }
        );
      }
    },

    // DELETE /api/authkit/orgs/[orgId]/members/[memberId]
    async removeMember(
      _req: NextRequest,
      { params }: { params: { orgId: string; memberId: string } }
    ) {
      try {
        // Remove member using the new API signature
        const result = await client.removeMember(params.orgId, params.memberId);
        return NextResponse.json(result);
      } catch (err: any) {
        return NextResponse.json(
          { error: err.message },
          { status: err.statusCode || 500 }
        );
      }
    },

    // GET /api/authkit/orgs/[orgId]/invites
    async listInvites(_req: NextRequest, { params }: { params: { orgId: string } }) {
      try {
        const data = await client.listInvites(params.orgId);
        return NextResponse.json(data);
      } catch (err: any) {
        return NextResponse.json(
          { error: err.message },
          { status: err.statusCode || 500 }
        );
      }
    },

    // POST /api/authkit/orgs/[orgId]/invites
    async createInvite(req: NextRequest, { params }: { params: { orgId: string } }) {
      try {
        const body = await req.json();
        const data = await client.createInvite(params.orgId, body);
        return NextResponse.json(data);
      } catch (err: any) {
        return NextResponse.json(
          { error: err.message },
          { status: err.statusCode || 500 }
        );
      }
    },

    // POST /api/authkit/orgs/[orgId]/invites/[inviteId]/resend
    async resendInvite(
      _req: NextRequest,
      { params }: { params: { orgId: string; inviteId: string } }
    ) {
      try {
        const data = await client.resendInvite(params.orgId, params.inviteId);
        return NextResponse.json(data);
      } catch (err: any) {
        return NextResponse.json(
          { error: err.message },
          { status: err.statusCode || 500 }
        );
      }
    },

    // DELETE /api/authkit/orgs/[orgId]/invites/[inviteId]
    async revokeInvite(
      _req: NextRequest,
      { params }: { params: { orgId: string; inviteId: string } }
    ) {
      try {
        const data = await client.revokeInvite(params.orgId, params.inviteId);
        return NextResponse.json(data);
      } catch (err: any) {
        return NextResponse.json(
          { error: err.message },
          { status: err.statusCode || 500 }
        );
      }
    },

    // GET /api/authkit/orgs/[orgId]/audit
    async listAuditEvents(req: NextRequest, { params }: { params: { orgId: string } }) {
      try {
        const { searchParams } = new URL(req.url);
        const cursor = searchParams.get('cursor') || undefined;
        const data = await client.listAuditEvents(params.orgId, cursor);
        return NextResponse.json(data);
      } catch (err: any) {
        return NextResponse.json(
          { error: err.message },
          { status: err.statusCode || 500 }
        );
      }
    },

    // GET /api/authkit/orgs/[orgId]/roles
    async listRoles(_req: NextRequest, _params: { params: { orgId: string } }) {
      try {
       
        const data = await client.listRoles();
        return NextResponse.json(data);
      } catch (err: any) {
        return NextResponse.json(
          { error: err.message },
          { status: err.statusCode || 500 }
        );
      }
    },

        // GET /api/authkit/users/[userId]/orgs
    async listUserOrganizations(_req: NextRequest, { params }: { params: { userId: string } }) {
      try {
        const data = await client.listUserOrganizations(params.userId);
        return NextResponse.json(data);
      } catch (err: any) {
        return NextResponse.json(
          { error: err.message },
          { status: err.statusCode || 500 }
        );
      }
    },
  };
}
