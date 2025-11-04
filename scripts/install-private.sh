#!/bin/bash

# SSOKit Private Installation Script
# This script helps set up SSOKit packages in external Next.js projects

set -e

echo "🚀 SSOKit Private Installation Script"
echo "======================================"

# Check if we're in a Next.js project
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Make sure you're in your Next.js project root."
    exit 1
fi

if ! grep -q "next" package.json; then
    echo "⚠️  Warning: This doesn't appear to be a Next.js project."
    read -p "Continue anyway? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Get Git repository URL
echo
echo "📝 SSOKit Repository Configuration"
echo "Enter your SSOKit Git repository URL:"
echo "Examples:"
echo "  - https://github.com/your-org/ssokit.git"
echo "  - git@github.com:your-org/ssokit.git"
echo "  - https://gitlab.com/your-org/ssokit.git"
echo
read -p "Repository URL: " REPO_URL

if [ -z "$REPO_URL" ]; then
    echo "❌ Error: Repository URL is required."
    exit 1
fi

# Get version/tag
echo
read -p "Version/Tag (default: main): " VERSION
VERSION=${VERSION:-main}

echo
echo "🔧 Installation Method Selection"
echo "1) Git Dependencies (Recommended for production)"
echo "2) Local npm link (For development)"
echo "3) Git Submodule (For monorepo setup)"
echo
read -p "Choose installation method (1-3): " METHOD

case $METHOD in
    1)
        echo
        echo "📦 Installing via Git dependencies..."
        
        # Backup original package.json
        cp package.json package.json.backup
        echo "✅ Backed up package.json to package.json.backup"
        
        # Add SSOKit dependencies
        echo "Adding SSOKit packages to package.json..."
        
        # Create temporary package.json with SSOKit deps
        node -e "
        const fs = require('fs');
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        
        if (!pkg.dependencies) pkg.dependencies = {};
        
        const ssokitDeps = {
            '@ssojet/ssokit-core': 'git+${REPO_URL}#${VERSION}:packages/ssokit-core',
            '@ssojet/ssokit-next': 'git+${REPO_URL}#${VERSION}:packages/ssokit-next',
            '@ssojet/ssokit-react': 'git+${REPO_URL}#${VERSION}:packages/ssokit-react',
            '@ssojet/ssokit-team': 'git+${REPO_URL}#${VERSION}:packages/ssokit-team',
            '@ssojet/ssokit-css': 'git+${REPO_URL}#${VERSION}:packages/ssokit-css'
        };
        
        Object.assign(pkg.dependencies, ssokitDeps);
        
        fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
        console.log('✅ Updated package.json with SSOKit dependencies');
        "
        
        # Install dependencies
        echo
        echo "📥 Installing dependencies..."
        if command -v pnpm &> /dev/null; then
            pnpm install
        elif command -v yarn &> /dev/null; then
            yarn install
        else
            npm install
        fi
        
        echo "✅ Git dependencies installation complete!"
        ;;
        
    2)
        echo
        echo "🔗 Setting up npm link..."
        echo "Please run these commands in your SSOKit repository first:"
        echo
        echo "cd /path/to/ssokit"
        echo "npm run build"
        echo "cd packages/ssokit-core && npm link"
        echo "cd ../ssokit-next && npm link"
        echo "cd ../ssokit-react && npm link"
        echo "cd ../ssokit-team && npm link"
        echo "cd ../ssokit-css && npm link"
        echo
        read -p "Press Enter when done, or Ctrl+C to cancel..."
        
        # Link packages
        echo "Linking SSOKit packages..."
        npm link @ssojet/ssokit-core
        npm link @ssojet/ssokit-next
        npm link @ssojet/ssokit-react
        npm link @ssojet/ssokit-team
        npm link @ssojet/ssokit-css
        
        echo "✅ npm link setup complete!"
        ;;
        
    3)
        echo
        echo "📂 Setting up Git submodule..."
        
        # Add submodule
        git submodule add $REPO_URL lib/ssokit
        git submodule update --init --recursive
        
        # Create build script
        mkdir -p scripts
        cat > scripts/build-ssokit.js << 'EOF'
const { execSync } = require('child_process');
const path = require('path');

const ssokitPath = path.join(__dirname, '../lib/ssokit');

console.log('Building SSOKit packages...');
try {
    execSync('npm ci && npm run build', { 
        cwd: ssokitPath, 
        stdio: 'inherit' 
    });
    console.log('✅ SSOKit build complete!');
} catch (error) {
    console.error('❌ SSOKit build failed:', error.message);
    process.exit(1);
}
EOF
        
        # Update package.json
        node -e "
        const fs = require('fs');
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        
        if (!pkg.scripts) pkg.scripts = {};
        if (!pkg.dependencies) pkg.dependencies = {};
        
        // Add build scripts
        pkg.scripts.prebuild = 'node scripts/build-ssokit.js';
        pkg.scripts.predev = 'node scripts/build-ssokit.js';
        
        // Add file dependencies
        const ssokitDeps = {
            '@ssojet/ssokit-core': 'file:./lib/ssokit/packages/ssokit-core',
            '@ssojet/ssokit-next': 'file:./lib/ssokit/packages/ssokit-next',
            '@ssojet/ssokit-react': 'file:./lib/ssokit/packages/ssokit-react',
            '@ssojet/ssokit-team': 'file:./lib/ssokit/packages/ssokit-team',
            '@ssojet/ssokit-css': 'file:./lib/ssokit/packages/ssokit-css'
        };
        
        Object.assign(pkg.dependencies, ssokitDeps);
        
        fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
        "
        
        # Build SSOKit
        node scripts/build-ssokit.js
        
        # Install dependencies
        if command -v pnpm &> /dev/null; then
            pnpm install
        elif command -v yarn &> /dev/null; then
            yarn install
        else
            npm install
        fi
        
        echo "✅ Git submodule setup complete!"
        ;;
        
    *)
        echo "❌ Invalid selection. Please run the script again."
        exit 1
        ;;
esac

echo
echo "🎉 SSSoKit installation complete!"
echo
echo "📝 Next Steps:"
echo "1. Create/update your .env.local file with SSOJet configuration"
echo "2. Set up authentication in your app"
echo "3. Import and use SSOKit components"
echo
echo "📖 For detailed implementation examples, see:"
echo "   - PRIVATE_INSTALLATION.md"
echo "   - examples/nextjs-demo/"
echo
echo "🔧 Environment Variables Template:"
echo "# Add these to your .env.local file"
echo "SSOJET_BASE=https://api.ssojet.com"
echo "SSOJET_CLIENT_ID=your-client-id"
echo "SSOJET_CLIENT_SECRET=your-client-secret"
echo "NEXT_PUBLIC_SSOJET_BASE=https://api.ssojet.com"
echo "NEXT_PUBLIC_SSOJET_CLIENT_ID=your-client-id"
echo "NEXT_PUBLIC_SSOKIT_TEAM_MANAGER_ROLES=Owner,Admin"