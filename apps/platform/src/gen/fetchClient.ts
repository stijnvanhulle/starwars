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

/**
 * The single fetch seam every generated Kubb client routes through. Owning this
 * wrapper lets us add tracing, retries, or auth without re-generating code.
 */
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
    throw new Error(`Request failed: ${res.status} ${res.statusText}`)
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
