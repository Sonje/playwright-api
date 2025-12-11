import * as crypto from 'crypto'

export function generateCodeVerifier(length: number = 128): string {
    if (length < 43 || length > 128) {
        throw new Error('Code verifier length must be between 43 and 128 characters')
    }

    const randomBytes = crypto.randomBytes(length)
    return base64UrlEncode(randomBytes)
}

export function generateCodeChallenge(codeVerifier: string): string {
    const hash = crypto.createHash('sha256').update(codeVerifier).digest()
    return base64UrlEncode(hash)
}

function base64UrlEncode(buffer: Buffer): string {
    return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

export function generateState(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex')
}

export function generateNonce(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex')
}
