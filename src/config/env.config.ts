import { z } from 'zod'
import * as dotenv from 'dotenv'

dotenv.config()

const envSchema = z.object({
    GRAPHQL_ENDPOINT: z.string().url({
        message: 'GRAPHQL_ENDPOINT must be a valid URL',
    }),
    AUTH_URL: z.string().url({
        message: 'AUTH_URL must be a valid URL (Azure B2C authorization endpoint)',
    }),
    TOKEN_URL: z.string().url({
        message: 'TOKEN_URL must be a valid URL (Azure B2C token endpoint)',
    }),
    CLIENT_ID: z.string().uuid({
        message: 'CLIENT_ID must be a valid UUID',
    }),
    REDIRECT_URI: z.string().min(1, {
        message: 'REDIRECT_URI is required (e.g., com.someApp://auth/)',
    }),
    SCOPE: z.string().min(1, {
        message: 'SCOPE is required (e.g., https://.../.../some.api)',
    }),
    ACCESS_TOKEN: z.string().optional(),
    TEST_TIMEOUT: z.string().regex(/^\d+$/).transform(Number).default(30000),
    TEST_RETRIES: z.string().regex(/^\d+$/).transform(Number).default(2),
})

export type Env = z.infer<typeof envSchema>

export const env: Env = (() => {
    try {
        return envSchema.parse(process.env)
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error('Environment validation failed:')
            error.issues.forEach((issue) => {
                console.error(`  - ${issue.path.join('.')}: ${issue.message}`)
            })
            console.error('\nPlease check your .env file and ensure all required variables are set correctly.')
            console.error('See .env.example for reference.\n')
        }
        throw error
    }
})()
