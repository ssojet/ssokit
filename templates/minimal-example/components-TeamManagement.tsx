// components/TeamManagement.tsx - Team management component
'use client';

import { TeamManager } from '@ssojet/ssokit-team';
import { SSOJetClient } from '@ssojet/ssokit-next';
import { useSession } from 'next-auth/react';

interface TeamManagementProps {
  organizationId: string;
}

export function TeamManagement({ organizationId }: TeamManagementProps) {
  const { data: session } = useSession();

  // Show loading state while session is loading
  if (session === undefined) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!session?.accessToken) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Authentication Required</h2>
        <p className="text-gray-600 mb-4">Please log in to manage your team.</p>
        <button
          onClick={() => window.location.href = '/api/auth/signin'}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Sign In
        </button>
      </div>
    );
  }

  // Create SSOJet client with user's access token
  const client = new SSOJetClient(session.accessToken, {
    baseUrl: process.env.NEXT_PUBLIC_SSOJET_BASE,
    clientId: process.env.NEXT_PUBLIC_SSOJET_CLIENT_ID,
  });

  return (
    <div className="w-full">
      <TeamManager
        organizationId={organizationId}
        client={client}
        currentUserId={session.user?.id}
        currentUserEmail={session.user?.email}
        showAuditLog={true}
        // Optional: Override default role permissions
        // managerRoles={['Owner', 'Admin', 'Manager']}
        onMemberRemoved={(memberId) => {
          console.log('Member removed successfully:', memberId);
          // Optional: Show success notification
        }}
        onInviteSent={(invite) => {
          console.log('Invite sent successfully:', invite);
          // Optional: Show success notification
        }}
      />
    </div>
  );
}