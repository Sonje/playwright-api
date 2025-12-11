import { GraphQLClient, ClientError } from 'graphql-request'
import { retry, ExponentialBackoff, handleType } from 'cockatiel'
import { env } from '@config/env.config'
import { type GraphQLError, GraphQLRequestError } from '../types/graphql.types'
import { getOrRefreshToken } from './auth.helper'

const MAX_RETRY_ATTEMPTS = 3
const INITIAL_DELAY_MS = 1000
const MAX_DELAY_MS = 5000

const retryPolicy = retry(
    handleType(ClientError, (error) => error.response.status === 401),
    {
        maxAttempts: MAX_RETRY_ATTEMPTS,
        backoff: new ExponentialBackoff({ initialDelay: INITIAL_DELAY_MS, maxDelay: MAX_DELAY_MS }),
    }
)

const createAuthenticatedClient = async (): Promise<GraphQLClient> => {
    const token = await getOrRefreshToken()
    const client = new GraphQLClient(env.GRAPHQL_ENDPOINT, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
    return client
}

async function executeRequest<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
    const client = await createAuthenticatedClient()

    try {
        return await client.request<T>(query, variables)
    } catch (error) {
        throw transformError(error)
    }
}

export async function query<T = unknown>(gql: string, variables?: Record<string, unknown>): Promise<T> {
    return retryPolicy.execute(() => executeRequest<T>(gql, variables))
}

export async function mutation<T = unknown>(gql: string, variables?: Record<string, unknown>): Promise<T> {
    return retryPolicy.execute(() => executeRequest<T>(gql, variables))
}

export async function rawRequest<T = unknown>(
    gql: string,
    variables?: Record<string, unknown>,
    headers?: Record<string, string>
): Promise<{ data: T }> {
    const client = new GraphQLClient(env.GRAPHQL_ENDPOINT, {
        headers: headers || {},
    })

    try {
        const data = await client.request<T>(gql, variables)
        return { data }
    } catch (error) {
        throw transformError(error)
    }
}

function transformError(error: unknown): GraphQLRequestError {
    if (error instanceof GraphQLRequestError) {
        return error
    }

    if (error instanceof ClientError) {
        const errors = error.response.errors?.map((err) => ({
            message: err.message,
            locations: err.locations as GraphQLError['locations'],
            path: err.path as GraphQLError['path'],
            extensions: err.extensions,
        }))

        return new GraphQLRequestError(error.message, errors, error.response.status, error.response)
    }

    if (error instanceof Error) {
        return new GraphQLRequestError(error.message, undefined, undefined, error)
    }

    return new GraphQLRequestError('Unknown GraphQL error occurred', undefined, undefined, error)
}
