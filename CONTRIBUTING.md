# Contributing to Rydo

Thank you for your interest in contributing! This document outlines the process for contributing to the Rydo platform.

## Development Setup

```bash
# Clone and setup
git clone https://github.com/your-org/rydo.git
cd rydo
./scripts/setup.sh
```

## Branch Naming

| Type       | Pattern                  | Example                        |
|------------|--------------------------|--------------------------------|
| Feature    | `feature/<description>`  | `feature/payment-integration`  |
| Bug fix    | `fix/<description>`      | `fix/booking-status-update`    |
| Hot fix    | `hotfix/<description>`   | `hotfix/otp-expiry-check`      |
| Chore      | `chore/<description>`    | `chore/update-dependencies`    |

## Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]
[optional footer]
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Examples:**
```
feat(rides): add women-only ride preference filter
fix(auth): handle expired refresh token gracefully
docs(api): update booking endpoint swagger annotations
```

## Pull Request Process

1. Fork the repository and create your branch from `develop`
2. Ensure your code follows the existing style
3. Add tests for new functionality
4. Ensure all tests pass: `npm test`
5. Update documentation if needed
6. Open a PR against `develop` with a clear description

## Code Style

- **Backend**: Follow NestJS conventions. Use class-validator for DTOs.
- **Frontend**: Use TypeScript strictly. Prefer functional components and hooks.
- **Mobile**: Follow Flutter/Dart style guide. Use Riverpod for state.

## Project Structure

```
rydo/
├── backend/     # NestJS API
├── frontend/    # Next.js Web App
├── mobile/      # Flutter App
├── database/    # Migrations & Seeds
├── nginx/       # Nginx config
└── scripts/     # Dev & deploy scripts
```

## Getting Help

- Open a GitHub issue for bugs or feature requests
- Join our Discord: [discord.gg/rydo](https://discord.gg/rydo)
- Email: dev@rydo.app
