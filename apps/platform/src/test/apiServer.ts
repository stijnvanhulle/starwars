import { createServer, IncomingMessage } from 'node:http'

import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'


export type ApiTestServer = {
  baseUrl: string
  [Symbol.asyncDispose]: () => Promise<void>
}

/**
 * Collects an `IncomingMessage` body and parses it as JSON. Returns `undefined` when the
 * body is empty, and the raw string when the body is non-empty but not valid JSON.
 */
export async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Array<Buffer> = []
  for await (const chunk of req) chunks.push(chunk as Buffer)
  const raw = Buffer.concat(chunks).toString('utf8')
  if (raw.length === 0) return undefined
  try {
    return JSON.parse(raw)
  } catch {
    return raw
  }
}

/**
 * Builds Next.js's `req.query` shape from a parsed `URL`. Repeated keys collapse to a
 * `string[]`, single keys stay a `string`.
 */
export function parseQuery(url: URL): Record<string, string | Array<string>> {
  const query: Record<string, string | Array<string>> = {}
  for (const key of url.searchParams.keys()) {
    const all = url.searchParams.getAll(key)
    query[key] = all.length > 1 ? all : (all[0] ?? '')
  }
  return query
}


/**
 * Boots a one-handler HTTP server that adapts incoming requests to a Pages Router handler.
 * Tests drive it with real `fetch(server.baseUrl, ...)` calls. MSW's `setupServer` lets
 * 127.0.0.1 traffic through, so the same suite intercepts upstream `starwars-api` calls
 * while exercising the handler end-to-end.
 *
 * Dynamic path params (`[id]`, `[characterId]`) pass via the query string. The handler
 * reads `req.query.id` either way, since Next.js merges path and query params there.
 *
 * Lifetime-bound with `await using`:
 *
 * ```ts
 * await using api = await startApiServer(handler)
 * const res = await fetch(`${api.baseUrl}?id=1`)
 * ```
 */
export async function startApiServer(handler: NextApiHandler): Promise<ApiTestServer> {
  const server = createServer(async (rawReq, rawRes) => {
    const url = new URL(rawReq.url ?? '/', `http://${rawReq.headers.host ?? 'localhost'}`)
    const query = parseQuery(url)
    const body = rawReq.method !== 'GET' && rawReq.method !== 'HEAD' ? await readJsonBody(rawReq) : undefined

    const req = Object.assign(rawReq, { query, body, cookies: {} as Record<string, string> }) as unknown as NextApiRequest
    const res = Object.assign(rawRes, {
      status(code: number) {
        rawRes.statusCode = code
        return res
      },
      json(payload: unknown) {
        rawRes.setHeader('content-type', 'application/json; charset=utf-8')
        rawRes.end(JSON.stringify(payload))
        return res
      },
      send(payload: unknown) {
        rawRes.end(typeof payload === 'string' ? payload : JSON.stringify(payload))
        return res
      },
    }) as unknown as NextApiResponse

    try {
      await handler(req, res)
      if (!rawRes.writableEnded) rawRes.end()
    } catch (err) {
      console.error('[apiServer] handler error', err)
      if (!rawRes.headersSent) rawRes.statusCode = 500
      if (!rawRes.writableEnded) rawRes.end()
    }
  })

  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', resolve)
  })

  const address = server.address()
  const port = typeof address === 'object' && address !== null ? address.port : 0

  return {
    baseUrl: `http://127.0.0.1:${port}`,
    async [Symbol.asyncDispose]() {
      await new Promise<void>((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()))
      })
    },
  }
}
