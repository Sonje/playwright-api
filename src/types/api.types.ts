export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface ApiHeaders {
    'Content-Type'?: string
    Authorization?: string
    Accept?: string
    [key: string]: string | undefined
}

export interface ApiResponse<T = unknown> {
    data: T
    status: number
    statusText: string
    headers: Record<string, string>
}

export interface ApiErrorResponse {
    error: {
        message: string
        code?: string
        details?: unknown
    }
    status: number
}

export interface RetryConfig {
    maxRetries: number
    retryDelay: number
    retryableStatuses: number[]
}

export interface ApiClientConfig {
    baseUrl: string
    timeout: number
    headers?: ApiHeaders
    retryConfig?: RetryConfig
}

export interface RequestOptions {
    headers?: ApiHeaders
    timeout?: number
    retry?: boolean
}

export interface PaginationParams {
    page?: number
    limit?: number
    offset?: number
    cursor?: string
}

export interface PaginatedResponse<T> {
    data: T[]
    pagination: {
        total: number
        page: number
        limit: number
        hasNext: boolean
        hasPrevious: boolean
    }
}

export interface SortParams {
    field: string
    order: 'asc' | 'desc'
}

export type FilterParams = Record<string, string | number | boolean | undefined>

export class ApiError extends Error {
    constructor(
        message: string,
        public readonly statusCode: number,
        public readonly response?: unknown,
        public readonly originalError?: unknown
    ) {
        super(message)
        this.name = 'ApiError'
        Object.setPrototypeOf(this, ApiError.prototype)
    }
}
