import { NextRequest } from 'next/server';
import { withAuth, createSSOJetClient } from '@/lib/api-utils';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { orgId: string; inviteId: string } }
) {
  return withAuth(request, params, async (session, params) => {
    const { orgId, inviteId } = params;
    const client = createSSOJetClient(session);
    
    // Use SSOJet client to revoke organization invite
    return await client.revokeInvite(orgId, inviteId);
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { orgId: string; inviteId: string } }
) {
  return withAuth(request, params, async (session, params) => {
    const { orgId, inviteId } = params;
    const client = createSSOJetClient(session);
    
    // Use SSOJet client to resend organization invite
    return await client.resendInvite(orgId, inviteId);
  });
}