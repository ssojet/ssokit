import { NextRequest } from 'next/server';
import { withAuth, createSSOJetClient } from '@/lib/api-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: { orgId: string } }
) {
  return withAuth(request, params, async (session, params) => {
    const { orgId } = params;
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor') || undefined;
    
    const client = createSSOJetClient(session);
    
    // Use SSOJet client to get organization audit logs
    return await client.listAuditEvents(orgId, cursor);
  });
}