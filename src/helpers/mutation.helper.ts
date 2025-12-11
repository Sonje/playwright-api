import { mutation as executeMutation } from './graphql.helper'

export type MutationBuilder<TVariables, TResponse> = (variables: TVariables) => Promise<TResponse>

export function createMutation<TVariables = Record<string, unknown>, TResponse = unknown>(
    gql: string
): MutationBuilder<TVariables, TResponse> {
    return async (variables: TVariables) => {
        return executeMutation<TResponse>(gql, variables as Record<string, unknown>)
    }
}

export const mutationBuilder = {
    create: createMutation,
    execute: executeMutation,
}
