'use client'

import { useSyncExternalStore } from 'react'

type QuoteItem = {
  sku: string
  color: string
  size: string
  quantity: number
  stockFisico: number
  stockTransito: number
  fechaLlegada: string
  image?: string
  colorImage?: string
  providerCode?: string
  providerName?: string
  productVariantId?: string | number | null
  stockControlled?: boolean | null
  stockStatus?: string | null
  source?: string
  isImmediateVariant?: boolean

  /*
   * Compatibilidad de lectura para sesiones previas a B2B.
   */
  isLocalVariant?: boolean
}

type ProductFlowStep = 'detail' | 'quote' | 'finalize'

type ProductFlowState = {
  productId: string
  slug: string
  provider: string
  quantity: number
  items: QuoteItem[]
  currentStep: ProductFlowStep
}

const STORAGE_KEY = 'product-flow-store'

const defaultState: ProductFlowState = {
  productId: '',
  slug: '',
  provider: '',
  quantity: 1,
  items: [],
  currentStep: 'detail',
}

const normalizeQuoteItem = (item: QuoteItem): QuoteItem => {
  const {
    isLocalVariant,
    ...rest
  } = item

  const rawSource = String(item.source || '')
    .trim()
    .toLowerCase()

  const source =
    rawSource === 'local'
      ? 'immediate'
      : rawSource || item.source

  return {
    ...rest,
    source,
    isImmediateVariant: Boolean(
      item.isImmediateVariant ||
      isLocalVariant ||
      source === 'immediate'
    ),
  }
}

const normalizeQuoteItems = (value: unknown): QuoteItem[] => {
  if (!Array.isArray(value)) return []

  return value
    .filter(
      (item): item is QuoteItem =>
        typeof item === 'object' &&
        item !== null
    )
    .map(normalizeQuoteItem)
}

let state: ProductFlowState = defaultState
let hydrated = false
const listeners = new Set<() => void>()

const emitChange = () => {
  listeners.forEach((listener) => listener())
}

const persistState = () => {
  if (typeof window === 'undefined') return
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

const setState = (nextState: ProductFlowState) => {
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
    const parsed =
      JSON.parse(stored) as Partial<ProductFlowState>

    state = {
      ...defaultState,
      ...parsed,
      items: normalizeQuoteItems(parsed.items),
    }
  } catch {
    state = defaultState
  }
}

export const productFlowStoreActions = {
  setActiveProduct(payload: { productId: string; slug: string; provider?: string }) {
    hydrateState()

    const isSameProduct =
      state.productId === payload.productId &&
      state.slug === payload.slug &&
      state.provider === (payload.provider || state.provider)

    if (isSameProduct) return

    setState({
      ...defaultState,
      productId: payload.productId,
      slug: payload.slug,
      provider: payload.provider || '',
      currentStep: 'detail',
    })
  },

  setQuoteSelection(payload: { productId: string; slug: string; provider?: string; quantity: number; items: QuoteItem[] }) {
    hydrateState()
    setState({
      ...state,
      productId: payload.productId,
      slug: payload.slug,
      provider: payload.provider || state.provider,
      quantity: payload.quantity,
      items: normalizeQuoteItems(payload.items),
      currentStep: 'quote',
    })
  },

  setCurrentStep(currentStep: ProductFlowStep) {
    hydrateState()
    setState({
      ...state,
      currentStep,
    })
  },

  resetProductFlow() {
    hydrateState()
    setState(defaultState)
  },
}

export const getProductFlowStoreState = () => {
  hydrateState()
  return state
}

export default function useProductFlowStore() {
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
    ...productFlowStoreActions,
  }
}
