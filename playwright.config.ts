import { defineConfig, devices } from '@playwright/test'
import { env } from './src/config/env.config'

/**
 * Playwright configuration for API testing
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
    testDir: './src/tests',
    timeout: env.TEST_TIMEOUT || 30000,

    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? env.TEST_RETRIES || 2 : 0,

    reporter: [
        ['html', { outputFolder: 'playwright-report', open: 'never' }],
        ['list'],
        ['json', { outputFile: 'test-results/results.json' }],
    ],

    use: {
        baseURL: env.GRAPHQL_ENDPOINT,
        trace: 'on-first-retry',
        extraHTTPHeaders: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        ignoreHTTPSErrors: false,
    },

    outputDir: 'test-results',
    projects: [
        {
            name: 'GraphQL API Tests',
            testMatch: '**/*.spec.ts',
        },
    ],

    // Web Server configuration (if you need to start a local server)
    // webServer: {
    //   command: 'npm run start:api',
    //   url: 'http://localhost:3000',
    //   reuseExistingServer: !process.env.CI,
    // },
})
