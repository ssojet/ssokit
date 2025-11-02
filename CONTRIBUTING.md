# Contributing to SSOJet AuthKit

Thank you for your interest in contributing to SSOJet AuthKit! This document provides guidelines and instructions for contributing.

## 📋 Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm 8+
- Git

### Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/ssojet-authkit.git
   cd ssojet-authkit
   ```

3. Install dependencies:
   ```bash
   pnpm install
   ```

4. Build all packages:
   ```bash
   pnpm -r build
   ```

5. Run tests:
   ```bash
   pnpm test
   ```

## 🏗️ Project Structure

```
ssojet-authkit/
├── packages/
│   ├── authkit-core/       # Types, schemas, errors, config
│   ├── authkit-react/      # React hooks and providers
│   ├── authkit-team/       # TeamManager widget
│   ├── authkit-next/       # Next.js route handlers
│   ├── authkit-webhooks/   # Webhook + SCIM provisioning
│   └── authkit-css/        # Theming and CSS tokens
├── examples/
│   └── next-app/           # Example Next.js application
└── docs/                   # Documentation
```

## 💻 Development Workflow

### Making Changes

1. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following our coding standards

3. Add/update tests for your changes

4. Run linting and tests:
   ```bash
   pnpm lint
   pnpm test
   pnpm typecheck
   ```

5. Build packages:
   ```bash
   pnpm -r build
   ```

### Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

Example:
```
feat(authkit-team): add member search filter

- Add search input to members table
- Implement debounced search
- Update tests
```

### Pull Requests

1. Push your branch to your fork
2. Open a Pull Request against `main`
3. Fill out the PR template
4. Ensure all CI checks pass
5. Request review from maintainers

**PR Guidelines:**
- Keep PRs focused on a single concern
- Include tests for new features
- Update documentation as needed
- Add changeset for version bumps (see below)

## 📦 Changesets

We use [Changesets](https://github.com/changesets/changesets) for version management.

### Adding a Changeset

After making changes, add a changeset:

```bash
pnpm changeset
```

Follow the prompts:
1. Select packages affected by your changes
2. Choose bump type (major/minor/patch)
3. Write a summary of your changes

Example changeset:
```markdown
---
"@ssojet/authkit-team": minor
"@ssojet/authkit-react": patch
---

Add search functionality to TeamManager widget and fix useMembers hook pagination
```

## 🧪 Testing

### Unit Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests for specific package
pnpm -F @ssojet/authkit-core test
```

### E2E Tests

```bash
pnpm test:e2e
```

### Test Coverage

Aim for >80% coverage for new code:

```bash
pnpm test:coverage
```

## 📝 Documentation

- Update README.md for user-facing changes
- Add JSDoc comments for public APIs
- Update docs/ for guides and tutorials
- Include code examples where helpful

## 🎨 Code Style

We use ESLint and Prettier for code formatting:

```bash
# Check formatting
pnpm format:check

# Auto-fix formatting
pnpm format

# Run linter
pnpm lint
```

**Style Guidelines:**
- Use TypeScript strict mode
- Prefer named exports over default exports
- Use async/await over promises
- Write descriptive variable names
- Add comments for complex logic

## 🐛 Reporting Bugs

Create an issue with:
- Clear title and description
- Steps to reproduce
- Expected vs actual behavior
- Environment details (Node version, OS, etc.)
- Code samples/screenshots if applicable

## 💡 Feature Requests

We welcome feature requests! Please:
- Check existing issues first
- Describe the use case
- Explain why this would benefit other users
- Be open to discussion and feedback

## 🔐 Security

Report security vulnerabilities to security@ssojet.com. Do not create public issues for security concerns.

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## ❓ Questions?

- Join our [Discord](https://discord.gg/ssojet)
- Check the [docs](https://docs.ssojet.com)
- Create a [GitHub Discussion](https://github.com/ssojet/ssojet-authkit/discussions)

---

Thank you for contributing to SSOJet AuthKit! 🎉
