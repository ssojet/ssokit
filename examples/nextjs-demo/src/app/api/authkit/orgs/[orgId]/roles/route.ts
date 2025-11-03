import { NextRequest } from 'next/server';
import { withAuth, createSSOJetClient } from '@/lib/api-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: { orgId: string } }
) {

   console.log('==== Fetching roles for organization');
  return withAuth(request, params, async (session, { orgId: _orgId }) => {
    const client = createSSOJetClient(session);
    
   
    // Use SSOJet client to get available roles
    return await client.listRoles();
  });
}