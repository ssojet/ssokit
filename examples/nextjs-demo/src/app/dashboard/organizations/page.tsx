'use client';

import { useSession } from 'next-auth/react';
import Navigation from '@/components/Navigation';

export default function OrganizationsPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading organizations...</p>
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
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600">Please sign in to view your organizations.</p>
          </div>
        </div>
      </div>
    );
  }

  const { user } = session;

  return (
    <div>
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Organizations</h1>
          <p className="mt-2 text-gray-600">
            Manage your organization memberships and roles
          </p>
        </div>

        {/* Current Tenant */}
        {user.tenantId && (
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">Current Tenant</h2>
            <p className="text-blue-700">
              <span className="font-medium">Tenant ID:</span> {user.tenantId}
            </p>
          </div>
        )}

        {/* Organizations List */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {user.organizations && user.organizations.length > 0 ? (
            user.organizations.map((org) => (
              <div key={org.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{org.name}</h3>
                    <p className="text-sm text-gray-500">ID: {org.id}</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    org.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {org.status}
                  </span>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Roles:</h4>
                  <div className="flex flex-wrap gap-2">
                    {org.roles.map((role, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v8a7 7 0 11-14 0v-8h5zM8 14V9a4 4 0 118 0v5M8 14h8" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Organizations</h3>
              <p className="text-gray-600">You are not currently a member of any organizations.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}