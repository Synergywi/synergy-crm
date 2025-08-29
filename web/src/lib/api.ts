export type HttpMethod = 'GET'|'POST'|'PUT'|'DELETE'

async function http<T>(method: HttpMethod, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`/api${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`${method} ${path} failed: ${res.status} ${text}`)
  }
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

export default {
  get:  <T>(p: string) => http<T>('GET', p),
  post: <T>(p: string, b?: unknown) => http<T>('POST', p, b),
  put:  <T>(p: string, b?: unknown) => http<T>('PUT', p, b),
  del:  <T>(p: string) => http<T>('DELETE', p),
}
