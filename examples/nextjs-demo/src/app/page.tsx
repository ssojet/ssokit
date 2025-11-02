import Link from 'next/link';
import Navigation from '@/components/Navigation';

export default function Home() {
  return (
    <div>
      <Navigation />
      <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          SSOJet AuthKit Demo
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Experience the power of SSOJet AuthKit with this comprehensive demo showcasing 
          team management, webhooks, SCIM provisioning, and more.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Team Management</h3>
          <p className="text-gray-600 mb-4">
            Complete team management interface with members, invitations, roles, and audit logs.
          </p>
          <Link 
            href="/dashboard/team" 
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            View Team Manager →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">API Integration</h3>
          <p className="text-gray-600 mb-4">
            Test API connectivity and explore all SSOJet AuthKit endpoints.
          </p>
          <Link 
            href="/dashboard/api-test" 
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Test APIs →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Webhook Events</h3>
          <p className="text-gray-600 mb-4">
            Real-time webhook integration with SCIM provisioning capabilities.
          </p>
          <Link 
            href="/dashboard/webhooks" 
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            View Webhooks →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Custom Theming</h3>
          <p className="text-gray-600 mb-4">
            Explore multiple theme presets and custom styling options.
          </p>
          <Link 
            href="/dashboard/themes" 
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            View Themes →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">SCIM Provisioning</h3>
          <p className="text-gray-600 mb-4">
            Automatic user provisioning with SCIM 2.0 integration.
          </p>
          <Link 
            href="/dashboard/scim" 
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            View SCIM →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Full Dashboard</h3>
          <p className="text-gray-600 mb-4">
            Complete dashboard view with all AuthKit features integrated.
          </p>
          <Link 
            href="/dashboard" 
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Open Dashboard →
          </Link>
        </div>
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Getting Started</h2>
        <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
          This demo requires SSOJet API credentials. Make sure you've configured your 
          environment variables before exploring the features.
        </p>
        <div className="flex justify-center space-x-4">
          <Link 
            href="/dashboard/api-test" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Test Configuration
          </Link>
          <Link 
            href="/dashboard/team" 
            className="border border-gray-300 hover:border-gray-400 text-gray-700 px-6 py-3 rounded-lg font-medium"
          >
            Start Demo
          </Link>
        </div>
      </div>
    </div>
    </div>
  );
}