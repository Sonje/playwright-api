import { env } from '@config/env.config'
import {
    type OAuthConfig,
    type PKCEParams,
    type TokenResponse,
    type TokenExchangeParams,
    type AuthorizationParams,
    type TokenCache,
    AuthenticationError,
} from '../types/auth.types'
import { generateCodeChallenge, generateCodeVerifier, generateState } from './crypto.helper'

let tokenCache: TokenCache | null = null

export function getOAuthConfig(): OAuthConfig {
    return {
        authUrl: env.AUTH_URL,
        tokenUrl: env.TOKEN_URL,
        clientId: env.CLIENT_ID,
        redirectUri: env.REDIRECT_URI,
        scope: env.SCOPE,
    }
}

export function generatePKCEParams(): PKCEParams {
    const codeVerifier = generateCodeVerifier()
    const codeChallenge = generateCodeChallenge(codeVerifier)

    return {
        codeVerifier,
        codeChallenge,
        codeChallengeMethod: 'S256',
    }
}

export function getAuthorizationUrl(pkceParams: PKCEParams, state?: string): string {
    const config = getOAuthConfig()
    const stateParam = state || generateState()

    const params: AuthorizationParams = {
        response_type: 'code',
        client_id: config.clientId,
        redirect_uri: config.redirectUri,
        scope: config.scope,
        code_challenge: pkceParams.codeChallenge,
        code_challenge_method: 'S256',
        state: stateParam,
    }

    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
            searchParams.append(key, String(value))
        }
    })
    return `${config.authUrl}?${searchParams.toString()}`
}

export async function exchangeCodeForToken(code: string, codeVerifier: string): Promise<TokenResponse> {
    const config = getOAuthConfig()

    const params: TokenExchangeParams = {
        grant_type: 'authorization_code',
        code,
        code_verifier: codeVerifier,
        redirect_uri: config.redirectUri,
        client_id: config.clientId,
    }

    try {
        const body = new URLSearchParams()
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
                body.append(key, String(value))
            }
        })

        const response = await fetch(config.tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body,
        })

        if (!response.ok) {
            const errorText = await response.text()
            throw new AuthenticationError(
                `Token exchange failed: ${response.status} ${response.statusText}`,
                response.status,
                errorText
            )
        }

        const tokenResponse = (await response.json()) as TokenResponse
        cacheToken(tokenResponse)

        return tokenResponse
    } catch (error) {
        if (error instanceof AuthenticationError) {
            throw error
        }
        const message = error instanceof Error ? error.message : 'Failed to exchange code for token'
        throw new AuthenticationError(message, undefined, error)
    }
}

export async function refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
    const config = getOAuthConfig()

    const params: TokenExchangeParams = {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: config.clientId,
    }

    try {
        const body = new URLSearchParams()
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
                body.append(key, String(value))
            }
        })

        const response = await fetch(config.tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body,
        })

        if (!response.ok) {
            const errorText = await response.text()
            throw new AuthenticationError(
                `Token refresh failed: ${response.status} ${response.statusText}`,
                response.status,
                errorText
            )
        }

        const tokenResponse = (await response.json()) as TokenResponse
        cacheToken(tokenResponse)

        return tokenResponse
    } catch (error) {
        if (error instanceof AuthenticationError) {
            throw error
        }
        const message = error instanceof Error ? error.message : 'Failed to refresh access token'
        throw new AuthenticationError(message, undefined, error)
    }
}

function cacheToken(tokenResponse: TokenResponse): void {
    const expiresAt = Date.now() + tokenResponse.expires_in * 1000

    tokenCache = {
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token,
        expiresAt,
        tokenType: tokenResponse.token_type,
    }
}

export function getCachedToken(): string | null {
    if (env.ACCESS_TOKEN) {
        return env.ACCESS_TOKEN
    }

    if (tokenCache && tokenCache.expiresAt > Date.now()) {
        return tokenCache.accessToken
    }

    return null
}

export async function getOrRefreshToken(): Promise<string> {
    if (env.ACCESS_TOKEN) {
        return env.ACCESS_TOKEN
    }

    if (tokenCache) {
        const bufferTime = 60 * 1000
        const isExpiringSoon = tokenCache.expiresAt - bufferTime < Date.now()

        if (!isExpiringSoon) {
            return tokenCache.accessToken
        }

        if (tokenCache.refreshToken) {
            try {
                const newToken = await refreshAccessToken(tokenCache.refreshToken)
                return newToken.access_token
            } catch (error) {
                const message =
                    error instanceof Error ? error.message : 'Token expired and refresh failed. Please re-authenticate.'
                throw new AuthenticationError(message, undefined, error)
            }
        }
    }

    throw new AuthenticationError(
        'No valid access token available. Please authenticate first or provide ACCESS_TOKEN in .env file.'
    )
}

export function clearTokenCache(): void {
    tokenCache = null
}

export function isAuthenticated(): boolean {
    return getCachedToken() !== null
}
