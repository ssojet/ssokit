import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { SSOJetClient } from '@ssojet/authkit-next';
import { Logger } from '@/lib/logger';

const isDebugEnabled = process.env.SSOJET_DEBUG === 'true' || process.env.NODE_ENV === 'development';

// Legacy functions for backward compatibility
export function debugLog(message: string, data?: any) {
  Logger.debug('API', message, data);
}

export function debugError(message: string, error: any) {
  Logger.debug('API ERROR', message, error);
}

export function createSSOJetClient(session: any): SSOJetClient {
  if (!session?.accessToken) {
    throw new Error('No access token available in session');
  }
  return new SSOJetClient(session.accessToken);
}

export async function withAuth<T>(
  request: NextRequest,
  params: any,
  handler: (session: any, params: any, body?: any) => Promise<T>
): Promise<NextResponse> {
  const method = request.method;
  const url = new URL(request.url).pathname;
  
  const requestId = Logger.apiRouteStart(method, url, params);
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      Logger.apiRouteLog(requestId, 'Authentication failed - no session');
      Logger.apiRouteEnd(requestId, null, new Error('Unauthorized'));
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!session.accessToken) {
      Logger.apiRouteLog(requestId, 'Authentication failed - no access token in session');
      Logger.apiRouteEnd(requestId, null, new Error('No access token available'));
      return NextResponse.json({ 
        error: 'No access token available', 
        authError: session.error || 'TOKEN_MISSING',
        message: 'Please sign in again'
      }, { status: 401 });
    }

    if (session.error) {
      Logger.apiRouteLog(requestId, `Authentication error: ${session.error}`);
      Logger.apiRouteEnd(requestId, null, new Error(`Auth error: ${session.error}`));
      return NextResponse.json({ 
        error: 'Authentication error', 
        authError: session.error,
        message: 'Please sign in again'
      }, { status: 401 });
    }

    Logger.authLog('Session validated', { 
      userId: session.user?.id, 
      email: session.user?.email,
      organizations: session.user?.organizations?.length || 0
    });

    // Parse body if it's a POST/PUT/PATCH request
    let body;
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      try {
        body = await request.json();
        Logger.apiRouteLog(requestId, 'Request body received', body);
      } catch (e) {
        Logger.apiRouteLog(requestId, 'No JSON body or failed to parse body');
      }
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    if (Object.keys(queryParams).length > 0) {
      Logger.apiRouteLog(requestId, 'Query parameters', queryParams);
    }

    const result = await handler(session, params, body);
    
    Logger.apiRouteEnd(requestId, result);
    return NextResponse.json(result);
  } catch (error) {
    Logger.apiRouteEnd(requestId, null, error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: error instanceof Error ? error.message : 'Unknown error',
        ...(isDebugEnabled && { stack: error instanceof Error ? error.stack : undefined })
      }, 
      { status: 500 }
    );
  }
}