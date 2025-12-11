import { test, expect } from '@fixtures/api.fixture'
import { createMutation } from '@helpers/mutation.helper'

test.describe('GraphQL API Tests', () => {
    test('should successfully query with authentication', async ({ graphql }) => {
        test.skip(!process.env.ACCESS_TOKEN, 'Skipping: No ACCESS_TOKEN provided')

        const gqlQuery = `
      query {
        __typename
      }
    `

        try {
            const response: { data?: unknown } = await graphql.query(gqlQuery)
            expect(response).toBeDefined()
        } catch (error) {
            throw error
        }
    })

    test('should have valid auth token', async ({ authToken }) => {
        test.skip(!process.env.ACCESS_TOKEN, 'Skipping: No ACCESS_TOKEN provided')

        expect(authToken).toBeDefined()
        expect(authToken).toBeTruthy()
        expect(typeof authToken).toBe('string')
    })

    test('should query with variables', async ({ graphql }) => {
        test.skip(!process.env.ACCESS_TOKEN, 'Skipping: No ACCESS_TOKEN provided')

        const gqlQuery = `
      query ExampleWithVariables($id: ID!) {
        __typename
      }
    `

        const variables = { id: 'example-id' }

        try {
            const response = await graphql.query(gqlQuery, variables)
            expect(response).toBeDefined()
        } catch (error) {
            throw error
        }
    })

    test('should execute mutation with helper', async () => {
        test.skip(!process.env.ACCESS_TOKEN, 'Skipping: No ACCESS_TOKEN provided')

        interface UpdateUserInput {
            input: string
        }

        interface UpdateUserResponse {
            __typename: string
        }

        const updateUser = createMutation<UpdateUserInput, UpdateUserResponse>(`
      mutation UpdateUser($input: String!) {
        __typename
      }
    `)

        try {
            const response = await updateUser({ input: 'test-data' })
            expect(response).toBeDefined()
        } catch (error) {
            throw error
        }
    })

    test('should execute direct mutation', async ({ graphql }) => {
        test.skip(!process.env.ACCESS_TOKEN, 'Skipping: No ACCESS_TOKEN provided')

        const gqlMutation = `
      mutation ExampleMutation($input: String!) {
        __typename
      }
    `

        try {
            const response = await graphql.mutation(gqlMutation, { input: 'test' })
            expect(response).toBeDefined()
        } catch (error) {
            throw error
        }
    })
})

test.describe('Public API Tests', () => {
    test('should query public endpoint', async ({ graphql }) => {
        const gqlQuery = `
      query PublicQuery {
        __typename
      }
    `

        try {
            const response = await graphql.rawRequest(gqlQuery)
            expect(response).toBeDefined()
        } catch (error) {
            throw error
        }
    })
})
