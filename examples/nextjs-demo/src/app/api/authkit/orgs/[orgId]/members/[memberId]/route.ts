import { NextRequest } from 'next/server';
import { withAuth, createSSOJetClient } from '@/lib/api-utils';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { orgId: string; memberId: string } }
) {
  return withAuth(request, params, async (session, { orgId, memberId }, body) => {
    const client = createSSOJetClient(session);
    
    // Use SSOJet client to update organization member
    return await client.updateMember(orgId, memberId, body);
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { orgId: string; memberId: string } }
) {
  return withAuth(request, params, async (session, params) => {
    const { orgId, memberId } = params;
    const client = createSSOJetClient(session);
    
    // Use SSOJet client to remove organization member
    // The removeMember method expects data payload, so we'll pass the memberId
    return await client.removeMember(orgId, { memberId });
  });
}