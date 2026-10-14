import { getCatalogBrowserSafeUrl } from "@/lib/catalogBrowserProxy"

type CommercialCategoriesResponse = {
  data?: unknown
}

type CacheEntry = {
  data: unknown[]
  expiresAt: number
}

export type CommercialCategoryFilters = {
  color?: string | null
  search?: string | null
}

export interface CommercialCategoryItem {
  label: string
  value: string
  type: 'mapped' | 'automatic'
  products_count?: number
  matches?: {
    provider: string
    slug: string
    name: string
    products_count?: number
  }[]
}

const CACHE_TTL_MS = 5 * 60 * 1000
const RATE_LIMIT_COOLDOWN_MS = 30 * 1000

const memoryCache = new Map<string, CacheEntry>()
const pendingRequests = new Map<string, Promise<unknown[]>>()
const rateLimitUntil = new Map<string, number>()

const normalizeProvider = (provider?: string | null) => {
  const value = String(provider || '').trim().toLowerCase()

  if (!value) return null

  /*
   * Compatibilidad exclusivamente de lectura.
   * Nunca enviamos provider=local al backend.
   */
  return value === 'local' ? 'kyte' : value
}

const normalizeFilterValue = (value?: string | null) =>
  String(value || '').trim()

export const getCommercialCategoriesCacheKey = (
  provider?: string | null,
  filters: CommercialCategoryFilters = {},
) => {
  const normalizedProvider = normalizeProvider(provider) || 'all'
  const normalizedColor = normalizeFilterValue(filters.color).toUpperCase()
  const normalizedSearch = normalizeFilterValue(filters.search).toLowerCase()

  return [normalizedProvider, normalizedColor, normalizedSearch].join('|')
}

const getCached = (key: string): unknown[] | null => {
  const entry = memoryCache.get(key)

  if (!entry) return null

  if (entry.expiresAt <= Date.now()) {
    memoryCache.delete(key)
    return null
  }

  return entry.data
}

const parseCategories = (json: unknown): unknown[] => {
  if (Array.isArray(json)) return json

  if (typeof json === 'object' && json !== null) {
    const response = json as CommercialCategoriesResponse
    return Array.isArray(response.data) ? response.data : []
  }

  return []
}

export class CommercialCategoriesError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'CommercialCategoriesError'
    this.status = status
  }
}

export async function getCommercialCategories<T = unknown>(
  provider?: string | null,
  filters: CommercialCategoryFilters = {},
): Promise<T[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL

  if (!apiUrl) {
    throw new CommercialCategoriesError(
      'NEXT_PUBLIC_API_URL no está configurada.',
      0,
    )
  }

  const normalizedProvider = normalizeProvider(provider)
  const normalizedColor = normalizeFilterValue(filters.color)
  const normalizedSearch = normalizeFilterValue(filters.search)
  const cacheKey = getCommercialCategoriesCacheKey(normalizedProvider, {
    color: normalizedColor,
    search: normalizedSearch,
  })
  const cached = getCached(cacheKey)

  if (cached) return cached as T[]

  const currentRequest = pendingRequests.get(cacheKey)
  if (currentRequest) return currentRequest as Promise<T[]>

  const blockedUntil = rateLimitUntil.get(cacheKey) || 0
  if (blockedUntil > Date.now()) {
    throw new CommercialCategoriesError(
      'Las categorías están temporalmente limitadas. Intenta nuevamente en unos segundos.',
      429,
    )
  }

  const params = new URLSearchParams()

  if (normalizedProvider) params.set('provider', normalizedProvider)
  if (normalizedColor) params.set('color', normalizedColor)
  if (normalizedSearch) params.set('search', normalizedSearch)

  const query = params.toString()
  const requestUrl = `${apiUrl}/commercial-categories${query ? `?${query}` : ''}`

  const browserSafeRequestUrl = getCatalogBrowserSafeUrl(requestUrl)

  const request = fetch(browserSafeRequestUrl, {
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
            cacheKey,
            Date.now() + RATE_LIMIT_COOLDOWN_MS,
          )
        }

        throw new CommercialCategoriesError(
          response.status === 429
            ? 'Se alcanzó temporalmente el límite de consultas de categorías.'
            : 'No fue posible cargar las categorías comerciales.',
          response.status,
        )
      }

      const json = (await response.json()) as unknown
      const categories = parseCategories(json)

      memoryCache.set(cacheKey, {
        data: categories,
        expiresAt: Date.now() + CACHE_TTL_MS,
      })

      rateLimitUntil.delete(cacheKey)
      return categories
    })
    .finally(() => {
      pendingRequests.delete(cacheKey)
    })

  pendingRequests.set(cacheKey, request)

  return request as Promise<T[]>
}

export function primeCommercialCategoriesCache<T = unknown>(
  provider: string | null | undefined,
  filters: CommercialCategoryFilters,
  categories: T[],
): void {
  const key = getCommercialCategoriesCacheKey(provider, filters)

  memoryCache.set(key, {
    data: categories as unknown[],
    expiresAt: Date.now() + CACHE_TTL_MS,
  })

  pendingRequests.delete(key)
  rateLimitUntil.delete(key)
}

export function clearCommercialCategoriesCache(
  provider?: string | null,
): void {
  if (provider === undefined) {
    memoryCache.clear()
    pendingRequests.clear()
    rateLimitUntil.clear()
    return
  }

  const key = getCommercialCategoriesCacheKey(provider)
  memoryCache.delete(key)
  pendingRequests.delete(key)
  rateLimitUntil.delete(key)
}
