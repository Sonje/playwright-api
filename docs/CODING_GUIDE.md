# TypeScript Coding Guide

## Introduction

This guide provides conventions and best practices for writing consistent, maintainable TypeScript code for GraphQL API testing with Playwright.

## Table of Contents

- [Core Principles](#core-principles)
- [Types](#types)
- [Functions](#functions)
- [Variables](#variables)
- [Naming Conventions](#naming-conventions)
- [Testing Best Practices](#testing-best-practices)

## Core Principles

### Functional Programming When Possible

- Prefer pure functions over stateful classes
- Strive for immutability
- Avoid side effects where possible
- Keep functions small and focused

### Type Safety

- Embrace TypeScript strict mode (enabled in this project)
- Let TypeScript infer types when possible
- Explicitly declare types only when it helps narrow them
- Avoid `any` type - use `unknown` if type is truly unknown

## Types

### Type Inference

Explicitly declare types only when it helps to narrow them:

```typescript
// Avoid - redundant type declaration
const isActive: boolean = false
const [userRole, setUserRole] = useState<string>('admin')

// Prefer - let TypeScript infer
const isActive = false
const USER_ROLE = 'admin' // Inferred as literal type 'admin'

// Use explicit types when needed to narrow
const employees = new Map<string, number>()
type UserRole = 'admin' | 'guest'
const [userRole, setUserRole] = useState<UserRole>('admin')
```

### Data Immutability

Strive for immutability using `Readonly` and `ReadonlyArray`:

```typescript
// Avoid mutations
const removeFirstUser = (users: Array<User>) => {
    users.splice(1)
    return users
}

// Prefer immutable operations
const removeFirstUser = (users: ReadonlyArray<User>) => {
    if (users.length === 0) return users
    return users.slice(1)
}
```

### Required vs Optional Properties

Make the majority of object properties required. Use optional properties sparingly:

```typescript
// Avoid too many optional properties
type User = {
    id?: number
    email?: string
    role?: 'admin' | 'user'
    permissions?: string[]
}

// Prefer discriminated unions
type AdminUser = {
    role: 'admin'
    id: number
    email: string
    permissions: ReadonlyArray<string>
}

type RegularUser = {
    role: 'user'
    id: number
    email: string
}

type User = AdminUser | RegularUser
```

### Discriminated Unions

Embrace discriminated unions for complex data structures:

```typescript
type SuccessResponse<T> = {
    status: 'success'
    data: T
}

type ErrorResponse = {
    status: 'error'
    message: string
    code: number
}

type ApiResponse<T> = SuccessResponse<T> | ErrorResponse

function handleResponse<T>(response: ApiResponse<T>) {
    if (response.status === 'success') {
        return response.data
    }
    throw new Error(`${response.code}: ${response.message}`)
}
```

### Type Assertions

Avoid type assertions (`as`) in favor of proper type definitions:

```typescript
// Avoid
const data = response as UserData

// Prefer type guards
function isUserData(data: unknown): data is UserData {
    return typeof data === 'object' && data !== null && 'id' in data && 'email' in data
}

if (isUserData(response)) {
    // TypeScript knows response is UserData here
}
```

## Functions

### Pure Functions

Strive for pure functions - same input always produces same output with no side effects:

```typescript
// Avoid - impure function with side effects
let total = 0
function addToTotal(value: number) {
    total += value
    return total
}

// Prefer - pure function
function add(a: number, b: number): number {
    return a + b
}
```

### Single Responsibility

Each function should have one clear purpose:

```typescript
// Avoid - doing too much
function processUserData(user: User) {
    validateUser(user)
    saveToDatabase(user)
    sendEmail(user)
    logActivity(user)
}

// Prefer - split into focused functions
function validateUser(user: User): boolean { ... }
function saveUser(user: User): Promise<void> { ... }
function notifyUser(user: User): Promise<void> { ... }

async function processUser(user: User) {
    if (!validateUser(user)) {
        throw new Error('Invalid user')
    }
    await saveUser(user)
    await notifyUser(user)
}
```

### Function Arguments

Use objects for multiple parameters to improve readability and flexibility:

```typescript
// Avoid - many positional arguments
function createUser(name: string, email: string, age: number, role: string) { ... }

// Prefer - object parameter
type CreateUserParams = {
    name: string
    email: string
    age: number
    role: string
}

function createUser(params: CreateUserParams) { ... }
```

### Avoid Side Effects

Keep side effects explicit and minimal:

```typescript
// Avoid - hidden side effects
function processData(data: Data[]) {
    data.sort()
    data.forEach((item) => {
        item.processed = true
    })
    saveToCache(data)
    return data
}

// Prefer - explicit and immutable
function processData(data: ReadonlyArray<Data>): Data[] {
    return [...data].sort().map((item) => ({ ...item, processed: true }))
}

async function processAndSave(data: ReadonlyArray<Data>): Promise<void> {
    const processed = processData(data)
    await saveToCache(processed)
}
```

## Variables

### Const by Default

Use `const` for all declarations unless reassignment is necessary:

```typescript
// Avoid
let apiUrl = 'https://api.example.com'
let maxRetries = 3

// Prefer
const API_URL = 'https://api.example.com'
const MAX_RETRIES = 3
```

### Const Assertions

Use `as const` for literal types:

```typescript
// Avoid - inferred as string[]
const userRoles = ['admin', 'user', 'guest']

// Prefer - inferred as readonly ['admin', 'user', 'guest']
const USER_ROLES = ['admin', 'user', 'guest'] as const
type UserRole = (typeof USER_ROLES)[number]
```

## Naming Conventions

### Variables and Functions

Use descriptive, clear names in camelCase:

```typescript
// Avoid
const d = new Date()
const usr = getUsr()

// Prefer
const currentDate = new Date()
const user = getUser()
```

### Constants

Use UPPER_SNAKE_CASE for true constants:

```typescript
const MAX_RETRY_ATTEMPTS = 3
const API_TIMEOUT_MS = 30000
const DEFAULT_PAGE_SIZE = 20
```

### Types and Interfaces

Use PascalCase for types and interfaces:

```typescript
type UserRole = 'admin' | 'user'
interface ApiResponse { ... }
type GraphQLQuery = { ... }
```

### Boolean Variables

Prefix with `is`, `has`, `should`:

```typescript
const isAuthenticated = true
const hasPermission = checkPermission()
const shouldRetry = attempt < MAX_RETRIES
```

## Testing Best Practices

### Test Structure (AAA Pattern)

Follow Arrange-Act-Assert pattern:

```typescript
test('should return user when valid ID is provided', async ({ graphql }) => {
    // Arrange
    const userId = '123'
    const query = `query GetUser($id: ID!) { user(id: $id) { id, name } }`

    // Act
    const response = await graphql.query(query, { id: userId })

    // Assert
    expect(response.user.id).toBe(userId)
})
```

### Test Naming

Use descriptive names following `should ... when ...` pattern:

```typescript
// Avoid
test('user test', ...)
test('gets user', ...)

// Prefer
test('should return user data when valid ID is provided', ...)
test('should throw error when user does not exist', ...)
```

### Test Independence

Each test should be independent and not rely on other tests:

```typescript
// Avoid - tests depend on order
let userId: string

test('should create user', async () => {
    userId = await createUser()
})

test('should get user', async () => {
    const user = await getUser(userId) // Depends on previous test
})

// Prefer - independent tests
test('should create user', async () => {
    const userId = await createUser()
    expect(userId).toBeDefined()
})

test('should get user', async () => {
    const userId = await createUser() // Each test sets up its own data
    const user = await getUser(userId)
    expect(user).toBeDefined()
})
```

### What to Test

- Test business logic and user-facing behavior
- Test error handling and edge cases
- Don't test implementation details
- Don't test third-party libraries

```typescript
// Avoid - testing implementation details
test('should call fetch with correct parameters', ...)

// Prefer - testing behavior
test('should return user data when authentication succeeds', ...)
test('should throw AuthenticationError when token is invalid', ...)
```

## What to Avoid

### Avoid Classes When Functions Suffice

```typescript
// Avoid - unnecessary class
class UserValidator {
    validate(user: User): boolean {
        return user.email.includes('@')
    }
}

// Prefer - simple function
function validateUser(user: User): boolean {
    return user.email.includes('@')
}
```

### Avoid `any` Type

```typescript
// Avoid
function processData(data: any) { ... }

// Prefer
function processData(data: unknown) {
    if (isValidData(data)) {
        // TypeScript knows the type here
    }
}
```

### Avoid Enums

Use const objects or union types instead:

```typescript
// Avoid
enum UserRole {
    Admin = 'admin',
    User = 'user',
}

// Prefer
const USER_ROLES = {
    ADMIN: 'admin',
    USER: 'user',
} as const

type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES]

// Or simple union type
type UserRole = 'admin' | 'user'
```

### Avoid Implicit Returns in Complex Logic

Be explicit for better readability:

```typescript
// Avoid - hard to read
const getStatus = (code: number) => (code === 200 ? 'success' : code === 404 ? 'not found' : 'error')

// Prefer - explicit and clear
function getStatus(code: number): string {
    if (code === 200) return 'success'
    if (code === 404) return 'not found'
    return 'error'
}
```

## Summary

- Embrace functional programming principles
- Use TypeScript's type system effectively
- Keep functions pure and focused
- Write clear, descriptive tests
- Prefer immutability and const assertions
- Avoid classes, enums, and type assertions when simpler alternatives exist
- Use professional libraries (cockatiel, zod) instead of reinventing the wheel
