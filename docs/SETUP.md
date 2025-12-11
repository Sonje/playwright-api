# Quick Setup Guide

## Installation Complete

Your Playwright API testing template has been successfully set up with all the features from the plan.

## Quick Start

1. **Install dependencies** (already done):

```bash
npm install
```

2. **Configure environment**:

```bash
cp .env.example .env
```

Edit `.env` and add your credentials. For testing without VPN, add `ACCESS_TOKEN`.

3. **Run your first test**:

```bash
npm test
```

## What's Included

### Core Files

- `package.json` - dependencies
- `playwright.config.ts` - API-only Playwright configuration
- `.env.example` - Environment template with Azure B2C OAuth config
- `CODING_GUIDE.md` - TypeScript best practices and conventions

### Source Code Structure

```
src/
├── config/
│   └── env.config.ts          Zod validation for environment variables
├── types/
│   ├── auth.types.ts          OAuth 2.0 + PKCE types
│   ├── graphql.types.ts       GraphQL request/response types
│   └── api.types.ts           Common API types
├── helpers/
│   ├── crypto.helper.ts       PKCE generation (SHA-256)
│   ├── auth.helper.ts         OAuth 2.0 flow with token caching
│   └── graphql.helper.ts      GraphQL client with auto-retry
├── fixtures/
│   └── api.fixture.ts         Playwright fixtures for authenticated tests
└── tests/
    └── example.spec.ts        Example test suite
```

## Authentication

The template supports two authentication methods:

### Method 1: Pre-configured Token

Recommended for testing - guards against flakiness and long wait times.

```env
ACCESS_TOKEN=your_bearer_token_here
```

Contact your team lead to obtain a valid access token.

### Method 2: Full OAuth 2.0 Flow

- Authorization Code + PKCE
- Automatic token refresh
- In-memory token caching

### Real Testing Environment

See `.env.local.example` for actual GraphQL endpoint configuration. Copy to `.env` and add credentials.

## Available Scripts

```bash
npm test              # Run all tests
npm run test:debug    # Debug mode with verbose logging
npm run test:report   # Open HTML test report
npm run lint          # Run ESLint
npm run format        # Format code with Prettier
npm run type-check    # TypeScript type checking
```

## Security

Make sure to scan dependencies and update in case of found vulnerabilities. You can use snyk scan for that.

## Next Steps

1. **Add your GraphQL endpoint** to `.env`
2. **Add OAuth credentials** (or ACCESS_TOKEN for testing)
3. **Write your first real test** in `src/tests/`
4. **Define your GraphQL types** in `src/types/graphql.types.ts`
5. **Optional**: Set up `graphql-codegen` for auto-generated types

## Writing Your First Test

```typescript
import { test, expect } from '@fixtures/api.fixture'

test.describe('My API Tests', () => {
    test('should query data', async ({ graphql }) => {
        const query = `
      query GetData {
        myData {
          id
          name
        }
      }
    `

        const response = await graphql.query(query)
        expect(response.myData).toBeDefined()
    })
})
```

### Parametrized Mutations

```typescript
import { createMutation } from '@helpers/mutation.helper'

const updateUser = createMutation<{ id: string; name: string }, { success: boolean }>(`
  mutation UpdateUser($id: ID!, $name: String!) {
    updateUser(id: $id, name: $name) {
      success
    }
  }
`)

test('should update user', async () => {
    const result = await updateUser({ id: '123', name: 'New Name' })
    expect(result.success).toBe(true)
})
```

## Documentation

See [README.md](README.md) for complete documentation including:

- Detailed authentication flow
- GraphQL schema management
- Advanced testing patterns
- Troubleshooting guide

Everything is ready to go! Happy testing!
