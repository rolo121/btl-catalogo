'use client'

import { useSyncExternalStore } from 'react'

type CatalogFilters = {
  brand: string | null
  category: string | null
  subcategory: string | null
  searchTerm: string
  sort: string | null
  page: number
  provider: string | null
  color: string | null
}

type CatalogCacheEntry = {
  products: unknown[]
  totalPages: number
  totalProducts: number
  savedAt: number
}

type CatalogState = {
  pathname: string
  search: string
  filters: CatalogFilters
  scrollY: number
  savedAt: number | null
  shouldRestoreScroll: boolean
  catalogCache: Record<string, CatalogCacheEntry>
}

type CatalogContextInput = {
  pathname?: string
  search?: string
  filters?: Partial<CatalogFilters>
  scrollY?: number
}

const STORAGE_KEY = 'catalog-store'
const MAX_CATALOG_CACHE_ENTRIES = 12

const defaultState: CatalogState = {
  pathname: '',
  search: '',
  filters: {
    brand: null,
    category: null,
    subcategory: null,
    searchTerm: '',
    sort: null,
    page: 1,
    provider: null,
    color: null,
  },
  scrollY: 0,
  savedAt: null,
  shouldRestoreScroll: false,
  catalogCache: {},
}

let state: CatalogState = defaultState
let hydrated = false
const listeners = new Set<() => void>()

const emitChange = () => {
  listeners.forEach((listener) => listener())
}

const persistState = () => {
  if (typeof window === 'undefined') return
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

const setState = (nextState: CatalogState) => {
  state = nextState
  persistState()
  emitChange()
}

const hydrateState = () => {
  if (hydrated || typeof window === 'undefined') return
  hydrated = true

  try {
    const stored = window.sessionStorage.getItem(STORAGE_KEY)
    if (!stored) return

    const parsed = JSON.parse(stored) as Partial<CatalogState>
    state = {
      ...defaultState,
      ...parsed,
      filters: {
        ...defaultState.filters,
        ...(parsed.filters || {}),
      },
      catalogCache: parsed.catalogCache || {},
    }
  } catch {
    state = defaultState
  }
}

export const catalogStoreActions = {
  setCatalogContext(input: CatalogContextInput) {
    hydrateState()

    setState({
      ...state,
      pathname: input.pathname ?? state.pathname,
      search: input.search ?? state.search,
      filters: {
        ...state.filters,
        ...(input.filters || {}),
      },
      scrollY: input.scrollY ?? state.scrollY,
      savedAt: Date.now(),
    })
  },

  updateCatalogScroll(scrollY: number) {
    hydrateState()
    setState({
      ...state,
      scrollY,
      savedAt: Date.now(),
    })
  },

  markRestoreScroll(shouldRestoreScroll = true) {
    hydrateState()
    setState({
      ...state,
      shouldRestoreScroll,
    })
  },

  getCatalogCache(cacheKey: string) {
    hydrateState()
    return state.catalogCache[cacheKey] || null
  },

  setCatalogCache(cacheKey: string, entry: Omit<CatalogCacheEntry, 'savedAt'>) {
    hydrateState()

    const nextCatalogCache = {
      ...state.catalogCache,
      [cacheKey]: {
        ...entry,
        savedAt: Date.now(),
      },
    }

    const trimmedCatalogCache = Object.fromEntries(
      Object.entries(nextCatalogCache)
        .sort(([, current], [, next]) => next.savedAt - current.savedAt)
        .slice(0, MAX_CATALOG_CACHE_ENTRIES)
    )

    setState({
      ...state,
      catalogCache: trimmedCatalogCache,
      savedAt: Date.now(),
    })
  },

  clearCatalogCache() {
    hydrateState()
    setState({
      ...state,
      catalogCache: {},
      savedAt: Date.now(),
    })
  },

  clearCatalogContext() {
    hydrateState()
    setState(defaultState)
  },
}

export const getCatalogStoreState = () => {
  hydrateState()
  return state
}

export default function useCatalogStore() {
  hydrateState()

  const snapshot = useSyncExternalStore(
    (listener: () => void) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    () => state,
    () => defaultState
  )

  return {
    ...snapshot,
    ...catalogStoreActions,
  }
}
