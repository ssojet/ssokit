import { NextRequest } from 'next/server';
import { withAuth, createSSOJetClient } from '@/lib/api-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: { orgId: string } }
) {
  return withAuth(request, params, async (session, { orgId }) => {
    const client = createSSOJetClient(session);
    
    // Use SSOJet client to get organization invites
    return await client.listInvites(orgId);
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { orgId: string } }
) {
  return withAuth(request, params, async (session, params, body) => {
    const { orgId } = params;
    const client = createSSOJetClient(session);
    
    // Use SSOJet client to create organization invite
    return await client.createInvite(orgId, body);
  });
}