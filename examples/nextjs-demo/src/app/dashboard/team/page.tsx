'use client';

import { useSession } from 'next-auth/react';
import { TeamManager } from '@ssojet/authkit-team';
import Navigation from '@/components/Navigation';
import '@ssojet/authkit-team/styles.css';

export default function TeamPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading team management...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
            <p className="text-gray-600 mb-6">Please sign in to access team management.</p>
          </div>
        </div>
      </div>
    );
  }

  // Get the first organization from the user's organizations
  const userOrganizations = session.user.organizations || [];
  
  if (userOrganizations.length === 0) {
    return (
      <div>
        <Navigation />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    No Organizations Found
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      You don't have access to any organizations. Please contact your administrator 
                      to get access to an organization before using team management features.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const primaryOrg = userOrganizations[0];
  const organizationId = primaryOrg.id;
  const currentUserId = session.user.id;
  const hasAdminRole = primaryOrg.roles.some(role => 
    ['admin', 'owner', 'Admin', 'Owner'].includes(role)
  );

  return (
    <div>
      <Navigation />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
            <p className="mt-2 text-gray-600">
              Manage members, invitations, and roles for <strong>{primaryOrg.name}</strong>
            </p>
          </div>

          {/* Organization Selector (if multiple orgs) */}
          {userOrganizations.length > 1 && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    <strong>Multiple Organizations:</strong> You have access to {userOrganizations.length} organizations. 
                    Currently managing <strong>{primaryOrg.name}</strong>. 
                    <span className="block mt-1">
                      Organizations: {userOrganizations.map(org => org.name).join(', ')}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* User Permissions Info */}
          <div className="mb-6 bg-gray-50 rounded-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Your Access Level</h3>
                <div className="mt-1 flex flex-wrap gap-1">
                  {primaryOrg.roles.map((role) => (
                    <span
                      key={role}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        ['admin', 'owner', 'Admin', 'Owner'].includes(role)
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
              {!hasAdminRole && (
                <div className="text-sm text-gray-500">
                  <span className="inline-flex items-center">
                    <svg className="h-4 w-4 text-gray-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    Read-only access
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* TeamManager Widget */}
          <div className="bg-white shadow rounded-lg">
            <TeamManager
              organizationId={organizationId}
              currentUserId={currentUserId}
              apiBase='https://api.ssojet.com'
              showAuditLog={hasAdminRole}
              onMemberRemoved={(memberId) => {
                console.log('Member removed:', memberId);
              }}
              onInviteSent={(invite) => {
                console.log('Invite sent:', invite);
              }}
            />
          </div>

          {/* Debug Info (Development Only) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-8 bg-gray-100 rounded-md p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Debug Information</h4>
              <div className="text-xs text-gray-600 space-y-1">
                <div><strong>Organization ID:</strong> {organizationId}</div>
                <div><strong>Current User ID:</strong> {currentUserId}</div>
                <div><strong>User Roles:</strong> {primaryOrg.roles.join(', ')}</div>
                <div><strong>Admin Access:</strong> {hasAdminRole ? 'Yes' : 'No'}</div>
                <div><strong>API Base:</strong> /api/authkit</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}