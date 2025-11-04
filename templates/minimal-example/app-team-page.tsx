// app/team/page.tsx - Team management page (App Router)
import { redirect } from 'next/navigation';
import { auth } from '../../lib/auth';
import { TeamManagement } from '../../components/TeamManagement';

interface TeamPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function TeamPage({ searchParams }: TeamPageProps) {
  // Check authentication server-side
  const session = await auth();
  
  if (!session) {
    redirect('/api/auth/signin');
  }

  // Get organization ID from query params or user session
  const organizationId = Array.isArray(searchParams.orgId) 
    ? searchParams.orgId[0] 
    : searchParams.orgId || session.user?.organizationId;

  if (!organizationId) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h1 className="text-xl font-semibold text-yellow-800 mb-2">
            Organization ID Required
          </h1>
          <p className="text-yellow-700">
            Please provide an organization ID via the orgId query parameter.
          </p>
          <p className="text-sm text-yellow-600 mt-2">
            Example: /team?orgId=your-organization-id
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Team Management</h1>
        <p className="text-gray-600">
          Manage your team members, roles, and permissions.
        </p>
      </div>
      
      <TeamManagement organizationId={organizationId} />
    </div>
  );
}

// Metadata for SEO
export const metadata = {
  title: 'Team Management',
  description: 'Manage your team members and their roles',
};