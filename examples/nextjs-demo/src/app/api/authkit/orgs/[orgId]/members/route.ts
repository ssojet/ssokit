import { NextRequest } from 'next/server';
import { withAuth, createSSOJetClient } from '@/lib/api-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: { orgId: string } }
) {
  return withAuth(request, params, async (session, { orgId }) => {
    const client = createSSOJetClient(session);
    
    // Use SSOJet client to fetch organization members
    return await client.listMembers(orgId);
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { orgId: string } }
) {
  return withAuth(request, params, async (session, params, body) => {
    const { orgId } = params;
    const client = createSSOJetClient(session);
    
    // Use SSOJet client to add organization member
    return await client.addMember(orgId, body);
  });
}