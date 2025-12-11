export interface GraphQLRequestConfig {
    query: string
    variables?: Record<string, unknown>
    operationName?: string
}

export interface GraphQLResponse<T = unknown> {
    data: T
    errors?: GraphQLError[]
    extensions?: Record<string, unknown>
}

export interface GraphQLError {
    message: string
    locations?: ReadonlyArray<{
        readonly line: number
        readonly column: number
    }>
    path?: ReadonlyArray<string | number>
    extensions?: {
        code?: string
        [key: string]: unknown
    }
}

export interface GraphQLClientConfig {
    endpoint: string
    accessToken?: string
    headers?: Record<string, string>
    timeout?: number
    retries?: number
}

export class GraphQLRequestError extends Error {
    constructor(
        message: string,
        public readonly errors?: GraphQLError[],
        public readonly statusCode?: number,
        public readonly response?: unknown
    ) {
        super(message)
        this.name = 'GraphQLRequestError'
        Object.setPrototypeOf(this, GraphQLRequestError.prototype)
    }
}
