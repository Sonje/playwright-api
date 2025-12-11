# GraphQL API Testing Template

API testing template with Playwright, TypeScript, GraphQL, and OAuth 2.0 (Authorization Code + PKCE).

## Features

- **Playwright Test Runner** - Powerful API testing framework
- **TypeScript** - Full type safety with strict mode enabled
- **GraphQL Support** - Functional GraphQL client using graphql-request
- **OAuth 2.0 + PKCE** - Secure authentication flow (Azure B2C compatible)
- **Zod Validation** - Environment variable validation
- **Cockatiel Retry Policy** - Professional retry logic with exponential backoff for 401 errors
- **Mutation Helpers** - Type-safe parametrized mutations
- **ESLint + Prettier** - Code quality and formatting
- **Functional Approach** - Pure functions over classes following coding guide
- **ClientError Types** - Proper error handling with graphql-request types

## Requirements

- **Node.js** >=25.0.0
- **npm**, **pnpm**, **bun**

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd playwright-api
```

2. Install dependencies:

```bash
npm install
```

3. Install Playwright:

```bash
npx playwright install
```

## Configuration

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Fill in your credentials in `.env`:

```env
# GraphQL API Endpoint
GRAPHQL_ENDPOINT=https://someapp.com/graphql

# OAuth 2.0 Configuration (Azure B2C)
AUTH_URL=https://someapp.b2clogin.com/.../oauth2/v2.0/authorize
TOKEN_URL=https://someapp.b2clogin.com/.../oauth2/v2.0/token
CLIENT_ID=your-client-id-uuid
REDIRECT_URI=com.someapp://auth/
SCOPE=https://.../.../someapp.Api

# Optional: Pre-configured Access Token (for testing without OAuth)
# ACCESS_TOKEN=your_access_token_here
```

## Project Structure

```
playwright-api/
├── src/
│   ├── config/
│   │   └── env.config.ts          # Environment validation (Zod)
│   ├── types/
│   │   ├── auth.types.ts          # OAuth 2.0 types
│   │   ├── graphql.types.ts       # GraphQL types
│   │   └── api.types.ts           # Common API types
│   ├── helpers/
│   │   ├── auth.helper.ts         # OAuth 2.0 + PKCE (functional)
│   │   ├── graphql.helper.ts      # GraphQL functions (query, mutation)
│   │   ├── mutation.helper.ts     # Parametrized mutation builder
│   │   └── crypto.helper.ts       # PKCE utilities
│   ├── fixtures/
│   │   └── api.fixture.ts         # Playwright test fixtures
│   └── tests/
│       └── example.spec.ts        # Example test file
├── .env.example                    # Environment template
├── .gitignore
├── .prettierrc                     # Prettier config
├── .eslintrc.json                  # ESLint config
├── playwright.config.ts            # Playwright config
├── tsconfig.json                   # TypeScript config
├── package.json
└── README.md
```

## Running Tests

### Run all tests

```bash
npm test
```

### Run tests in debug mode

```bash
npm run test:debug
```

### Open HTML report

```bash
npm run test:report
```

### Run specific test file

```bash
npx playwright test src/tests/example.spec.ts
```

### Run with headed mode (UI)

```bash
npx playwright test --headed
```

## OAuth 2.0 Authentication Flow

This template implements OAuth 2.0 Authorization Code flow with PKCE (Proof Key for Code Exchange) for enhanced security.

### Flow Overview

1. **Generate PKCE parameters** - `code_verifier` and `code_challenge`
2. **Build authorization URL** - Redirect user to OAuth provider
3. **Exchange code for token** - Trade authorization code for access token
4. **Automatic token refresh** - Refresh expired tokens automatically

### Authentication Methods

#### Method 1: Pre-configured Token (Recommended for Testing)

For testing without full OAuth flow, set `ACCESS_TOKEN` in `.env`:

```env
ACCESS_TOKEN=your_bearer_token_here
```

#### Method 2: Full OAuth Flow

Implement complete OAuth flow using provided helpers:

```typescript
import { generatePKCEParams, getAuthorizationUrl, exchangeCodeForToken } from '@helpers/auth.helper'

const pkceParams = generatePKCEParams()
const authUrl = getAuthorizationUrl(pkceParams)
console.log('Visit:', authUrl)

const token = await exchangeCodeForToken(authorizationCode, pkceParams.codeVerifier)
```

## Writing Tests

### Basic Test Example

```typescript
import { test, expect } from '@fixtures/api.fixture'

test.describe('User API Tests', () => {
    test('should fetch user data', async ({ graphql }) => {
        const query = `
            query GetUser($id: ID!) {
                user(id: $id) {
                    id
                    name
                    email
                }
            }
        `

        const variables = { id: '123' }
        const response = await graphql.query(query, variables)

        expect(response.user).toBeDefined()
        expect(response.user.id).toBe('123')
    })
})
```

### Using Fixtures

The template provides these fixtures:

- `authToken` - Access token string
- `graphql` - GraphQL functions (query, mutation, rawRequest)

```typescript
test('should use auth token', async ({ authToken }) => {
    expect(authToken).toBeDefined()
})

test('should query graphql', async ({ graphql }) => {
    const data = await graphql.query('{ __typename }')
    expect(data).toBeDefined()
})
```

### Mutations Example

#### Direct Mutation

```typescript
test('should create user', async ({ graphql }) => {
    const mutation = `
        mutation CreateUser($input: CreateUserInput!) {
            createUser(input: $input) {
                id
                name
            }
        }
    `

    const variables = {
        input: {
            name: 'John Doe',
            email: 'john@example.com',
        },
    }

    const response = await graphql.mutation(mutation, variables)
    expect(response.createUser.id).toBeDefined()
})
```

#### Parametrized Mutation with Helper

```typescript
import { createMutation } from '@helpers/mutation.helper'

interface CreateUserInput {
    input: {
        name: string
        email: string
    }
}

interface CreateUserResponse {
    createUser: {
        id: string
        name: string
    }
}

const createUser = createMutation<CreateUserInput, CreateUserResponse>(`
    mutation CreateUser($input: CreateUserInput!) {
        createUser(input: $input) {
            id
            name
        }
    }
`)

test('should create user with helper', async () => {
    const response = await createUser({
        input: {
            name: 'John Doe',
            email: 'john@example.com',
        },
    })

    expect(response.createUser.id).toBeDefined()
})
```

## Development

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

### Formatting

```bash
npm run format
```

### Format Check

```bash
npm run format:check
```

## GraphQL Schema & Types

### Auto-generate Types (Optional)

For production use, consider using `graphql-codegen` to auto-generate types:

1. Install:

```bash
npm install -D @graphql-codegen/cli @graphql-codegen/typescript
```

2. Create `codegen.yml`:

```yaml
schema: ${GRAPHQL_ENDPOINT}
documents: 'src/**/*.graphql'
generates:
    src/types/generated/graphql.ts:
        plugins:
            - typescript
            - typescript-operations
```

3. Generate types:

```bash
npx graphql-codegen
```

## Security Best Practices

- Never commit `.env` file (already in `.gitignore`)
- Use PKCE for OAuth flows (implemented)
- Rotate access tokens regularly
- Store sensitive data securely
- Use HTTPS endpoints only
- Validate environment variables (Zod)
- Proper error handling with typed errors from graphql-request

## Troubleshooting

### Environment Validation Errors

If you see Zod validation errors on startup:

```
Environment validation failed:
  - GRAPHQL_ENDPOINT: Invalid url
```

Check your `.env` file and ensure all required variables are set correctly.

### Authentication Errors

If authentication fails:

1. Verify `ACCESS_TOKEN` in `.env` is valid
2. Check token expiration
3. Ensure OAuth credentials are correct
4. Verify network/VPN access to auth endpoints

### TypeScript Path Aliases Not Working

If imports like `@helpers/*` don't resolve:

1. Restart your IDE/editor
2. Run `npm run type-check` to verify
3. Check `tsconfig.json` paths configuration

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [GraphQL Documentation](https://graphql.org/)
- [OAuth 2.0 PKCE](https://oauth.net/2/pkce/)
- [TypeScript Handbook](https://www.typescriptlang.org/)
- [Zod Documentation](https://zod.dev/)
- [Cockatiel Documentation](https://github.com/connor4312/cockatiel) - Resilience and retry policies
- [Project Coding Guide](CODING_GUIDE.md) - TypeScript best practices for this project

## License

ISC

---

Happy Testing!
