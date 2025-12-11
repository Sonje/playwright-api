import { test as base, expect as baseExpect } from '@playwright/test'
import * as graphql from '@helpers/graphql.helper'
import { getOrRefreshToken, isAuthenticated } from '@helpers/auth.helper'

interface ApiFixtures {
    authToken: string
    graphql: typeof graphql
}

export const test = base.extend<ApiFixtures>({
    authToken: async ({}, use) => {
        const token = await getOrRefreshToken()
        await use(token)
    },

    graphql: async ({}, use) => {
        if (!isAuthenticated()) {
            throw new Error('Authentication required. Provide ACCESS_TOKEN in .env or complete OAuth flow')
        }
        await use(graphql)
    },
})

export { baseExpect as expect }
export type { ApiFixtures }
