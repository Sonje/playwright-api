export interface OAuthConfig {
    authUrl: string
    tokenUrl: string
    clientId: string
    redirectUri: string
    scope: string
}

export interface PKCEParams {
    codeVerifier: string
    codeChallenge: string
    codeChallengeMethod: 'S256' | 'plain'
}

export interface TokenResponse {
    access_token: string
    token_type: string
    expires_in: number
    refresh_token?: string
    scope?: string
    id_token?: string
}

export interface TokenExchangeParams {
    grant_type: 'authorization_code' | 'refresh_token'
    code?: string
    code_verifier?: string
    redirect_uri?: string
    client_id: string
    refresh_token?: string
    scope?: string
}

export interface AuthorizationParams {
    response_type: 'code'
    client_id: string
    redirect_uri: string
    scope: string
    code_challenge: string
    code_challenge_method: 'S256'
    state?: string
    nonce?: string
}

export interface TokenCache {
    accessToken: string
    refreshToken?: string | undefined
    expiresAt: number
    tokenType: string
}

export class AuthenticationError extends Error {
    constructor(
        message: string,
        public readonly statusCode?: number,
        public readonly originalError?: unknown
    ) {
        super(message)
        this.name = 'AuthenticationError'
        Object.setPrototypeOf(this, AuthenticationError.prototype)
    }
}
