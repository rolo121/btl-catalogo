import { getCatalogBrowserSafeUrl } from "@/lib/catalogBrowserProxy"

type CatalogJson = Record<string, unknown>

type CacheEntry = {
  data: CatalogJson
  expiresAt: number
}

const CACHE_TTL_MS = 5 * 60 * 1000
const RATE_LIMIT_COOLDOWN_MS = 30 * 1000

const responseCache = new Map<string, CacheEntry>()
const pendingRequests = new Map<string, Promise<CatalogJson>>()
const rateLimitUntil = new Map<string, number>()

const getCached = (url: string): CatalogJson | null => {
  const entry = responseCache.get(url)

  if (!entry) return null

  if (entry.expiresAt <= Date.now()) {
    responseCache.delete(url)
    return null
  }

  return entry.data
}

export class CatalogRequestError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'CatalogRequestError'
    this.status = status
  }
}

export async function getCatalogJson<T = CatalogJson>(
  url: string,
): Promise<T> {
  const normalizedUrl = String(url || '').trim()

  if (!normalizedUrl) {
    throw new CatalogRequestError(
      'La URL del catálogo no está configurada.',
      0,
    )
  }

  const cached = getCached(normalizedUrl)
  if (cached) return cached as T

  const pending = pendingRequests.get(normalizedUrl)
  if (pending) return pending as Promise<T>

  const blockedUntil = rateLimitUntil.get(normalizedUrl) || 0

  if (blockedUntil > Date.now()) {
    throw new CatalogRequestError(
      'El catálogo está temporalmente limitado. Intenta nuevamente en unos segundos.',
      429,
    )
  }

  const requestUrl = getCatalogBrowserSafeUrl(normalizedUrl)

  const request = fetch(requestUrl, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    cache: 'no-store',
  })
    .then(async (response) => {
      if (!response.ok) {
        if (response.status === 429) {
          rateLimitUntil.set(
            normalizedUrl,
            Date.now() + RATE_LIMIT_COOLDOWN_MS,
          )
        }

        throw new CatalogRequestError(
          response.status === 429
            ? 'Se alcanzó temporalmente el límite de consultas del catálogo.'
            : 'No fue posible cargar el catálogo.',
          response.status,
        )
      }

      const json = (await response.json()) as CatalogJson

      responseCache.set(normalizedUrl, {
        data: json,
        expiresAt: Date.now() + CACHE_TTL_MS,
      })

      rateLimitUntil.delete(normalizedUrl)

      return json
    })
    .finally(() => {
      pendingRequests.delete(normalizedUrl)
    })

  pendingRequests.set(normalizedUrl, request)

  return request as Promise<T>
}

export function clearCatalogRequestCache(url?: string): void {
  if (!url) {
    responseCache.clear()
    pendingRequests.clear()
    rateLimitUntil.clear()
    return
  }

  responseCache.delete(url)
  pendingRequests.delete(url)
  rateLimitUntil.delete(url)
}
