#!/bin/bash

# SSOJet AuthKit Demo Setup Script
# This script helps set up the Next.js demo application

set -e

echo "🚀 SSOJet AuthKit Demo Setup"
echo "=================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the demo directory."
    echo "   Expected path: examples/nextjs-demo/"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
if command -v pnpm &> /dev/null; then
    pnpm install
elif command -v yarn &> /dev/null; then
    yarn install
else
    npm install
fi

# Create .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "⚙️  Creating .env.local from template..."
    cp .env.example .env.local
    echo "✅ Created .env.local file"
    echo ""
    echo "🔧 IMPORTANT: Edit .env.local with your SSOJet credentials:"
    echo "   - DEFAULT_SSOJET_CLIENT_ID=cli_d3vlr9k4"
    echo "   - DEFAULT_SSOJET_CLIENT_SECRET=sk_d3"
    echo "   - DEFAULT_SSOJET_AUTHORITY=https://dns-mo.auth.ssojet.com"
    echo "   - NEXTAUTH_SECRET=your-nextauth-secret-key"
    echo "   - SSOJET_API_KEY=sk_live_your_api_key"
    echo ""
else
    echo "✅ .env.local already exists"
fi

# Generate NEXTAUTH_SECRET if not set
if ! grep -q "NEXTAUTH_SECRET=" .env.local || grep -q "NEXTAUTH_SECRET=your-nextauth-secret-key-here" .env.local; then
    echo "🔑 Generating secure NEXTAUTH_SECRET..."
    if command -v openssl &> /dev/null; then
        SECRET=$(openssl rand -base64 32)
        # Update the .env.local file
        if grep -q "NEXTAUTH_SECRET=" .env.local; then
            sed -i.bak "s/NEXTAUTH_SECRET=.*/NEXTAUTH_SECRET=$SECRET/" .env.local && rm .env.local.bak
        else
            echo "NEXTAUTH_SECRET=$SECRET" >> .env.local
        fi
        echo "✅ Generated and saved NEXTAUTH_SECRET"
    else
        echo "⚠️  OpenSSL not found. Please manually generate a secure NEXTAUTH_SECRET."
    fi
fi

echo ""
echo "🎯 Setup Complete!"
echo ""
echo "Next steps:"
echo "1. 📝 Edit .env.local with your SSOJet credentials"
echo "2. 🌐 Configure SSOJet OIDC application:"
echo "   - Redirect URI: http://localhost:3000/api/auth/callback"
echo "   - Scopes: openid profile email organizations"
echo "3. 🚀 Start the development server:"

if command -v pnpm &> /dev/null; then
    echo "   pnpm dev"
elif command -v yarn &> /dev/null; then
    echo "   yarn dev"
else
    echo "   npm run dev"
fi

echo "4. 🌍 Open http://localhost:3000"
echo ""
echo "📚 Documentation:"
echo "   - Implementation Guide: ../../docs/implementation-guide.md"
echo "   - OIDC Setup Guide: ../../docs/oidc-implementation-guide.md"
echo "   - Demo README: ./README.md"
echo ""
echo "🐛 Troubleshooting:"
echo "   - Check that all environment variables are set correctly"
echo "   - Verify SSOJet dashboard configuration matches local settings"
echo "   - Enable debug mode with: NEXTAUTH_DEBUG=1 pnpm dev"