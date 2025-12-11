import { createMutation } from '@helpers/mutation.helper'
import { mutation } from '@helpers/graphql.helper'

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
        email: string
    }
}

export const createUser = createMutation<CreateUserInput, CreateUserResponse>(`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      name
      email
    }
  }
`)

interface UpdateUserInput {
    id: string
    name: string
}

interface UpdateUserResponse {
    updateUser: {
        success: boolean
        user: {
            id: string
            name: string
        }
    }
}

export const updateUser = createMutation<UpdateUserInput, UpdateUserResponse>(`
  mutation UpdateUser($id: ID!, $name: String!) {
    updateUser(id: $id, name: $name) {
      success
      user {
        id
        name
      }
    }
  }
`)

export async function directMutation<T>(gql: string, variables: Record<string, unknown>): Promise<T> {
    return mutation<T>(gql, variables)
}
