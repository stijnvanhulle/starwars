export type RequestConfig<TData = unknown> = {
  url: string
  method?: string
  baseURL?: string
  params?: Record<string, unknown>
  data?: TData
  headers?: Record<string, string>
  signal?: AbortSignal
}

export type ResponseConfig<TData> = {
  data: TData
  status: number
  statusText: string
  headers: Headers
}

export type ResponseErrorConfig<TError> = {
  data: TError
  status: number
  statusText: string
  headers: Headers
}

export type Client = <TData = unknown, _TError = unknown, TVariables = unknown>(config: RequestConfig<TVariables>) => Promise<ResponseConfig<TData>>

export type ApiRequestError = Error & {
  readonly name: 'ApiRequestError'
  readonly status: number
  readonly statusText: string
  readonly body: unknown
}

/**
 * Tagged error thrown on any non-2xx response. The parsed JSON body (if any)
 * lives on `body` so callers can surface contract-shaped `{ code, message }`
 * errors without re-fetching.
 */
export function createApiRequestError(status: number, statusText: string, body: unknown): ApiRequestError {
  const err = new Error(`Request failed: ${status} ${statusText}`) as Error & {
    name: 'ApiRequestError'
    status: number
    statusText: string
    body: unknown
  }
  err.name = 'ApiRequestError'
  err.status = status
  err.statusText = statusText
  err.body = body
  return err
}

export function isApiRequestError(value: unknown): value is ApiRequestError {
  return value instanceof Error && (value as { name?: string }).name === 'ApiRequestError'
}

const client: Client = async function client<TData = unknown, _TError = unknown, TVariables = unknown>(
  config: RequestConfig<TVariables>,
): Promise<ResponseConfig<TData>> {
  const base = config.baseURL ?? ''
  const query = config.params
    ? `?${new URLSearchParams(Object.entries(config.params).flatMap(([k, v]) => (v === undefined || v === null ? [] : [[k, String(v)]]))).toString()}`
    : ''
  const res = await fetch(`${base}${config.url}${query}`, {
    method: config.method ?? 'GET',
    headers: {
      ...(config.data === undefined ? {} : { 'content-type': 'application/json' }),
      ...config.headers,
    },
    body: config.data === undefined ? undefined : JSON.stringify(config.data),
    signal: config.signal,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => undefined)
    throw createApiRequestError(res.status, res.statusText, body)
  }

  const body = res.status === 204 ? (undefined as TData) : ((await res.json()) as TData)

  return {
    data: body,
    status: res.status,
    statusText: res.statusText,
    headers: res.headers,
  }
}

export default client
