/** @type {import('next').NextConfig} */
const nextConfig = {
  // experimental: {
  //   // Server Actions are now enabled by default in Next.js 14
  // },
  typescript: {
    // Type checking during build
    ignoreBuildErrors: false,
  },
  eslint: {
    // ESLint during build
    ignoreDuringBuilds: false,
  },
  // API route configuration
  async rewrites() {
    return [
      // Optional: Add any API route rewrites here
    ];
  },
  // Environment variables
  env: {
    // Add any custom environment variables here
  },
};

module.exports = nextConfig;