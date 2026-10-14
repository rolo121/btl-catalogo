'use client'

import { appAsset } from '@/lib/appPaths'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import * as Icon from '@phosphor-icons/react/dist/ssr'
import { useModalQuickviewContext } from '@/context/ModalQuickviewContext'
import { useCompare } from '@/context/CompareContext'
import { useWishlist } from '@/context/WishlistContext'
import { getColorSwatchStyle } from '@/lib/colors'
import { shouldBypassNextImageOptimization } from '@/lib/productImages'
import { getCatalogBrowserSafeUrl } from '@/lib/catalogBrowserProxy'
import { useModalCompareContext } from '@/context/ModalCompareContext'
import useProductFlowStore from '@/store/useProductFlowStore'
import { ProductType } from '@/type/ProductType'

type QuickviewProvider = {
  code?: string | null
  name?: string | null
  default_eta_label?: string | null
}

type QuickviewStockLocation = {
  provider_sku?: string | null
  available_stock?: number | string | null
  incoming_transit?: number | string | null
  stock_controlled?: boolean | number | string | null
  stock_status?: string | null
  dynamic_eta_label?: string | null

  /*
   * Identidad operacional real.
   */
  source_provider?: string | null

  provider?: QuickviewProvider | null
  [key: string]: unknown
}

interface QuickviewVariant {
  id?: string | number | null
  variant_id?: string | number | null
  variantId?: string | number | null
  immediateVariantId?: string | number | null
  color?: string | null
  size?: string | null
  sku?: string | null
  colorCode?: string | null
  colorImage?: string | null
  image?: string | null
  image_url?: string | null
  imageUrl?: string | null
  main_image?: string | null
  mainImage?: string | null
  provider_sku?: string | null
  available_stock?: number | string | null
  total_aggregated_stock?: number | string | null
  stockFisico?: number | string | null
  stockTransito?: number | string | null
  disponibilidadLabel?: string | null
  fechaLlegada?: string | null
  providerCode?: string | null
  providerName?: string | null
  stockControlled?: boolean | null
  stockStatus?: string | null
  stockLocations?: QuickviewStockLocation[] | null
  stock_locations?: QuickviewStockLocation[] | null
  images?: unknown
  [key: string]: unknown
}


type ImmediateQuickviewVariant = QuickviewVariant & {
  stockFisico: number
  stockTransito: number
  fechaLlegada: string
  providerCode: string
  providerName: string
}

type QuickviewCategory = {
  name?: string | null
  provider?: string | null
  [key: string]: unknown
}

type QuickviewFeatures = {
  _linkedImmediateProducts?: unknown[]
  _hasImmediate?: boolean
  _immediateStockTotal?: number | string | null
  _originalImages?: unknown[]
  imagekit?: {
    images?: unknown[]
    catalog?: {
      main?: unknown
      hover?: unknown
    }
  }
  [key: string]: unknown
}

type QuickviewProduct = {
  id?: string | number | null
  slug?: string | null
  sku?: string | null
  name?: string | null
  tag?: string | null
  brand?: string | null

  /*
   * Identidad operacional real.
   */
  source_brand?: string | null
  source_provider?: string | null

  provider?: string | null
  provider_code?: string | null
  codigo_sac?: string | number | null
  ag_producto_id?: string | number | null
  ag_prod_codigo_original?: string | null
  total_stock?: number | string | null
  price?: number | string | null
  originPrice?: number | string | null
  sale?: number | string | null
  description?: string | null
  images?: unknown
  variation?: QuickviewVariant[] | null
  variants?: QuickviewVariant[] | null
  categories?: QuickviewCategory[] | null
  features?: QuickviewFeatures | null
  sizes?: Array<string | null | undefined> | null
  [key: string]: unknown
}

type PromoImages = {
  mainImages: string[]
  variantImages: string[]
  vectorImages: string[]
}

type QuoteSelectionItem = {
  sku: string
  color: string
  size: string
  quantity: number
  stockFisico: number
  stockTransito: number
  fechaLlegada: string
  image: string
  colorImage: string
  providerCode: string
  providerName: string
  productVariantId?: string | number | null
  stockControlled?: boolean | null
  stockStatus?: string | null
  source: 'immediate' | 'provider'
  isImmediateVariant: boolean
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

const isImmediateProduct = (
  product: QuickviewProduct | null | undefined
) => {
  const sourceBrand = String(
    product?.source_brand || ''
  ).trim().toLowerCase()

  const sourceProvider = String(
    product?.source_provider || ''
  ).trim().toLowerCase()

  const legacyBrand = String(
    product?.brand || ''
  ).trim().toLowerCase()

  const legacyProvider = String(
    product?.provider ||
    product?.provider_code ||
    ''
  ).trim().toLowerCase()

  return (
    sourceBrand === 'kyte' ||
    sourceProvider === 'kyte' ||
    legacyBrand === 'local' ||
    legacyProvider === 'local'
  )
}

const getCleanProductName = (product: QuickviewProduct | null | undefined) => {
  const rawName = String(product?.name || 'Producto').trim()
  const originalCode = String(product?.ag_prod_codigo_original || '').trim()

  if (originalCode && rawName.startsWith(`${originalCode} - `)) {
    return rawName.replace(`${originalCode} - `, '').trim()
  }

  return rawName.replace(/^\s*\d{2}-\d{3}-\d{3}-\d{3}\s*-\s*/i, '').trim()
}

const getVariantStockLocations = (variant: QuickviewVariant | null | undefined): QuickviewStockLocation[] => {
  if (Array.isArray(variant?.stockLocations)) return variant.stockLocations
  if (Array.isArray(variant?.stock_locations)) return variant.stock_locations
  return []
}

const getStockLocationProviderCode = (
  location: QuickviewStockLocation
) => {
  return String(
    location?.source_provider ||
    location?.provider?.code ||
    ''
  ).trim().toLowerCase()
}

const isImmediateProviderCode = (code: unknown) => {
  const normalized = String(code || '')
    .trim()
    .toLowerCase()

  return (
    normalized === 'kyte' ||
    normalized === 'local'
  )
}


const getImmediateFallbackStock = (variant: QuickviewVariant | null | undefined, product: QuickviewProduct | null | undefined) => {
  return Number(
    variant?.available_stock ??
    variant?.total_aggregated_stock ??
    variant?.stockFisico ??
    product?.total_stock ??
    product?.features?._immediateStockTotal ??
    0
  ) || 0
}


const getFirstStockLocation = (variant: QuickviewVariant | null | undefined): QuickviewStockLocation => {
  return variant?.stockLocations?.[0] || variant?.stock_locations?.[0] || {}
}

const getVariantProviderSku = (variant: QuickviewVariant | null | undefined) => {
  const location = getFirstStockLocation(variant)

  return String(
    location?.provider_sku ||
    variant?.provider_sku ||
    variant?.sku ||
    ''
  ).trim()
}

const getFileNameFromUrl = (url: unknown) => {
  return String(url || '')
    .split('?')[0]
    .split('#')[0]
    .split('/')
    .pop() || ''
}

const normalizeImageToken = (value: unknown) => {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
}

const getMakitoColorCodeFromProviderSku = (providerSku: unknown) => {
  const digits = String(providerSku || '').replace(/\D/g, '')

  if (digits.length >= 6) {
    return digits.slice(-6, -3)
  }

  return ''
}

const getMakitoRef = (product: QuickviewProduct, imageUrls: string[]) => {
  const slug = String(product?.slug || '').trim()

  if (slug.toUpperCase().startsWith('MAK-')) {
    return slug.replace(/^MAK-/i, '')
  }

  const firstVariantImage = imageUrls.find((url) => String(url).includes('/variantes/'))
  const fileName = getFileNameFromUrl(firstVariantImage)
  const matchFromImage = fileName.match(/^([^-]+)-/)

  if (matchFromImage?.[1]) {
    return matchFromImage[1]
  }

  const firstSku = String(product?.variants?.[0]?.sku || '')
  const matchFromSku = firstSku.match(/^(\d+)/)

  return matchFromSku?.[1] || ''
}

const resolveMakitoVariantImage = (product: QuickviewProduct, variant: QuickviewVariant, imageUrls: string[]) => {
  const ref = getMakitoRef(product, imageUrls)
  const providerSku = getVariantProviderSku(variant)
  const colorCode = getMakitoColorCodeFromProviderSku(providerSku)

  if (!ref || !colorCode) {
    return null
  }

  return (
    imageUrls.find((url) => {
      const cleanUrl = String(url || '')
      const fileName = getFileNameFromUrl(cleanUrl)

      return (
        cleanUrl.includes('/variantes/') &&
        fileName.toLowerCase().includes(`${ref.toLowerCase()}-${colorCode.toLowerCase()}-`)
      )
    }) ||
    imageUrls.find((url) => getFileNameFromUrl(url).toLowerCase().includes(`-${colorCode.toLowerCase()}-`)) ||
    null
  )
}

const getPromoVariantSuffix = (variant: QuickviewVariant) => {
  const rawSku = getVariantProviderSku(variant) || variant?.sku || ''
  const parts = String(rawSku)
    .trim()
    .replace(/\//g, ' ')
    .split(/[\s-]+/)
    .filter(Boolean)

  return parts[parts.length - 1] || ''
}

const resolvePromoVariantImage = (variant: QuickviewVariant, promoImages: PromoImages) => {
  const suffix = getPromoVariantSuffix(variant)
  const variantImages = Array.isArray(promoImages?.variantImages)
    ? promoImages.variantImages
    : []

  if (!suffix || !variantImages.length) {
    return null
  }

  const escapedSuffix = suffix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const exactRegex = new RegExp(`-${escapedSuffix}\\.[a-z0-9]+$`, 'i')
  const exactMatch = variantImages.find((url: string) => exactRegex.test(getFileNameFromUrl(url)))

  if (exactMatch) {
    return exactMatch
  }

  const looseRegex = new RegExp(`-${escapedSuffix}(?:_\\d+)?\\.[a-z0-9]+$`, 'i')
  const looseMatch = variantImages.find((url: string) => looseRegex.test(getFileNameFromUrl(url)))

  if (looseMatch) {
    return looseMatch
  }

  const normalizedSku = normalizeImageToken(variant?.sku)
  const normalizedProviderSku = normalizeImageToken(getVariantProviderSku(variant))

  return (
    variantImages.find((url: string) => {
      const normalizedFile = normalizeImageToken(getFileNameFromUrl(url))

      return (
        (Boolean(normalizedSku) && normalizedFile.includes(normalizedSku)) ||
        (Boolean(normalizedProviderSku) && normalizedFile.includes(normalizedProviderSku))
      )
    }) || null
  )
}

const resolveQuickviewVariantImage = (
  product: QuickviewProduct,
  variant: QuickviewVariant,
  imageUrls: string[],
  promoImages: PromoImages,
  fallbackImage: string
) => {
  const explicitImage =
    variant?.image ||
    variant?.image_url ||
    variant?.imageUrl ||
    variant?.main_image ||
    variant?.mainImage ||
    variant?.colorImage ||
    null

  if (explicitImage) {
    return String(explicitImage)
  }

  const firstLocation = getFirstStockLocation(variant)
  const providerCode = String(firstLocation?.provider?.code || product?.provider || product?.brand || '')
    .trim()
    .toLowerCase()
  const brand = String(product?.brand || '').trim().toUpperCase()

  if (providerCode === 'promo' || brand === 'PROMO') {
    return resolvePromoVariantImage(variant, promoImages) || fallbackImage
  }

  if (providerCode === 'makito' || brand === 'MAKITO') {
    return resolveMakitoVariantImage(product, variant, imageUrls) || fallbackImage
  }

  return fallbackImage
}

const ModalQuickview = () => {
  const router = useRouter()
  const { selectedProduct, closeQuickview } = useModalQuickviewContext()
  const { openModalCompare } = useModalCompareContext()
  const { setQuoteSelection } = useProductFlowStore()
  const { addToCompare, compareState } = useCompare()

  const { addToWishlist, removeFromWishlist, wishlistState } = useWishlist()

  const [quantity, setQuantity] = useState<number>(1)
  const [quantityInput, setQuantityInput] = useState<string>('1')
  const [activeColor, setActiveColor] = useState<string>('')
  const [activeSize, setActiveSize] = useState<string>('')
  const [activeImage, setActiveImage] = useState<string>('')
  const [quickviewProduct, setQuickviewProduct] = useState<QuickviewProduct | null>(null)
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false)
  const [selectedDeliveryMode, setSelectedDeliveryMode] = useState<'immediate' | 'provider'>('provider')
  const [failedQuickviewImages, setFailedQuickviewImages] = useState<Record<string, boolean>>({})
  const [isQuickviewVisible, setIsQuickviewVisible] = useState(false)
  const detailsScrollRef = useRef<HTMLDivElement | null>(null)

  const productAny = (quickviewProduct || (selectedProduct as unknown as QuickviewProduct | null))


  useEffect(() => {
    if (!selectedProduct) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [selectedProduct])

  useEffect(() => {
    if (!selectedProduct) {
      setIsQuickviewVisible(false)
      return
    }

    const animationFrame = window.requestAnimationFrame(() => {
      setIsQuickviewVisible(true)
    })

    return () => window.cancelAnimationFrame(animationFrame)
  }, [selectedProduct])



  useEffect(() => {
    if (!selectedProduct?.slug) {
      setQuickviewProduct(null)
      return
    }

    const fetchQuickviewProduct = async () => {
      try {
        setIsLoadingDetail(true)

        const apiBase = process.env.NEXT_PUBLIC_API_URL
        if (!apiBase) {
          setQuickviewProduct(selectedProduct as unknown as QuickviewProduct)
          return
        }

        const detailUrl = getCatalogBrowserSafeUrl(
          `${apiBase}/catalog/${encodeURIComponent(selectedProduct.slug)}`
        )

        const res = await fetch(detailUrl, {
          cache: 'no-store',
        })

        if (!res.ok) {
          throw new Error('No se pudo cargar el detalle del producto')
        }

        const json = (await res.json()) as {
          product?: QuickviewProduct | null
          immediate_inventory?: {
            items?: unknown[]
            has_match?: unknown
            total_stock?: unknown
          } | null
        }
        const productRaw = json?.product || null

        if (!productRaw) {
          setQuickviewProduct(selectedProduct as unknown as QuickviewProduct)
          return
        }

        const immediateInventory =
          json?.immediate_inventory ||
          {}

const linkedImmediateProductsRaw = Array.isArray(immediateInventory?.items)
  ? immediateInventory.items
  : [];

        let parsedFeatures: QuickviewFeatures = {}
        const rawFeatures = productRaw.features as unknown

        try {
          parsedFeatures =
            typeof rawFeatures === 'string'
              ? (JSON.parse(rawFeatures) as QuickviewFeatures)
              : (isRecord(rawFeatures) ? (rawFeatures as QuickviewFeatures) : {})
        } catch {
          parsedFeatures = {}
        }

        const images = productRaw?.images || (selectedProduct as unknown as QuickviewProduct)?.images || []

        const normalizeImageUrls = (input: unknown): string[] => {
          if (!input) return []

          if (typeof input === 'string') {
            return input.trim() ? [input.trim()] : []
          }

          if (Array.isArray(input)) {
            return input.flatMap((img: unknown) => normalizeImageUrls(img)).filter(Boolean)
          }

          if (isRecord(input)) {
            const direct = [
              input.url,
              input.src,
              input.image,
              input.image_url,
              input.imageUrl,
              input.main_image,
              input.mainImage,
              input.thumbnail,
              input.picture,
              input.file,
              input.path,
            ].flatMap((img: unknown) => normalizeImageUrls(img))

            const nested = [
              input.mainImages,
              input.variantImages,
              input.vectorImages,
              input.images,
              input.gallery,
              input.media,
            ].flatMap((img: unknown) => normalizeImageUrls(img))

            return [...direct, ...nested].filter(Boolean)
          }

          return []
        }

        const promoImages = {
          mainImages: normalizeImageUrls(isRecord(productRaw?.images) ? productRaw.images.mainImages : undefined),
          variantImages: normalizeImageUrls(isRecord(productRaw?.images) ? productRaw.images.variantImages : undefined),
          vectorImages: normalizeImageUrls(isRecord(productRaw?.images) ? productRaw.images.vectorImages : undefined),
        }

        const originalResolvedImages = normalizeImageUrls(images)

        const imagekitImages = Array.isArray(parsedFeatures?.imagekit?.images)
          ? normalizeImageUrls(parsedFeatures.imagekit.images).filter((url) => !url.includes('/areas/'))
          : []

        const imagekitCatalogMain =
          typeof parsedFeatures?.imagekit?.catalog?.main === 'string'
            ? parsedFeatures.imagekit.catalog.main
            : ''

        const imagekitCatalogHover =
          typeof parsedFeatures?.imagekit?.catalog?.hover === 'string'
            ? parsedFeatures.imagekit.catalog.hover
            : ''

        const resolvedImages = Array.from(
          new Set(
            [
              imagekitCatalogMain || imagekitImages[0] || originalResolvedImages[0],
              imagekitCatalogHover || imagekitImages[1] || originalResolvedImages[1],
              ...imagekitImages,
              ...originalResolvedImages,
            ].filter((url): url is string => typeof url === 'string' && url.trim() !== '')
          )
        )

        const variation = Array.isArray(productRaw?.variants)
          ? productRaw.variants.map((v: QuickviewVariant) => {
              const stockLocations = getVariantStockLocations(v)

              const providerStockLocations =
                stockLocations.filter(
                  (loc: QuickviewStockLocation) =>
                    !isImmediateProviderCode(
                      getStockLocationProviderCode(loc)
                    )
                )

              const immediateStockLocations =
                stockLocations.filter(
                  (loc: QuickviewStockLocation) =>
                    isImmediateProviderCode(
                      getStockLocationProviderCode(loc)
                    )
                )

              // Si el producto es LOCAL puro, sus existencias vienen como provider local.
              // Antes se filtraban fuera y por eso QuickView mostraba 0 stock y deshabilitaba COTIZAR.
              const effectiveStockLocations = providerStockLocations.length > 0
                ? providerStockLocations
                : immediateStockLocations

              const fallbackStock = getImmediateFallbackStock(v, productRaw)
              const variantAvailableStock = effectiveStockLocations.length > 0
                ? effectiveStockLocations.reduce(
                    (sum: number, loc: QuickviewStockLocation) => sum + Number(loc?.available_stock || 0),
                    0
                  )
                : fallbackStock

              const variantTransitStock = effectiveStockLocations.reduce(
                (sum: number, loc: QuickviewStockLocation) => sum + Number(loc?.incoming_transit || 0),
                0
              )

              const firstProviderLocation = effectiveStockLocations[0] || {}
              const providerCode =
                getStockLocationProviderCode(
                  firstProviderLocation
                ) ||
                (
                  isImmediateProduct(productRaw)
                    ? 'kyte'
                    : ''
                )
              const stockFisico = variantAvailableStock

              const variantImages = normalizeImageUrls(v?.images).filter((url) => !url.includes('/areas/'))
              const variantImagePool = Array.from(
                new Set([...imagekitImages, ...variantImages, ...resolvedImages].filter((url): url is string => typeof url === 'string' && url.trim() !== ''))
              )
              const imageCandidate = resolveQuickviewVariantImage(
                productRaw,
                v,
                variantImagePool,
                promoImages,
                resolvedImages[0] || variantImages[0] || String(v?.image || '') || appAsset('/images/product/1000x1000.png')
              )

              return {
                color: String(v?.color || 'Sin color'),
                size: String(v?.size || 'S/T'),
                sku: String(v?.sku || ''),
                colorCode: String(v?.color || 'Sin color'),
                colorImage: imageCandidate,
                image: imageCandidate,
                stockFisico,
                stockTransito: variantTransitStock,
                disponibilidadLabel:
                  isImmediateProviderCode(providerCode)
                    ? (stockFisico > 0 ? 'Inmediata' : 'Sin stock')
                    : providerCode === 'makito'
                    ? (
                        String(firstProviderLocation?.provider?.default_eta_label || '').trim() ||
                        'Sin fecha'
                      )
                    : (
                        stockFisico > 0
                          ? 'Inmediata'
                          : (
                              String(firstProviderLocation?.dynamic_eta_label || '').trim() ||
                              String(firstProviderLocation?.provider?.default_eta_label || '').trim() ||
                              'Sin fecha'
                            )
                      ),
                fechaLlegada:
                  String(firstProviderLocation?.dynamic_eta_label || '').trim() ||
                  String(firstProviderLocation?.provider?.default_eta_label || '').trim() ||
                  'Sin fecha',
                stockLocations: effectiveStockLocations,
                providerCode,
              }
            })
          : (selectedProduct as unknown as QuickviewProduct)?.variation || []

 const selectedQuickviewProduct = selectedProduct as unknown as QuickviewProduct

const nextQuickviewProduct: QuickviewProduct = {
  ...selectedQuickviewProduct,
  ...productRaw,
  images:
    resolvedImages.length > 0
      ? resolvedImages
      : selectedQuickviewProduct.images || [],
  variation,
  variants: Array.isArray(productRaw.variants) ? productRaw.variants : [],
  categories: Array.isArray(productRaw.categories) ? productRaw.categories : [],
  features: {
    ...parsedFeatures,
    _linkedImmediateProducts: linkedImmediateProductsRaw,
    _hasImmediate: Boolean(immediateInventory?.has_match),
    _immediateStockTotal: Number(immediateInventory?.total_stock) || 0,
    _originalImages: originalResolvedImages,
  },
}

setQuickviewProduct(nextQuickviewProduct)
      } catch (error) {
        console.error('Error cargando quickview:', error)
        setQuickviewProduct(selectedProduct as unknown as QuickviewProduct)
      } finally {
        setIsLoadingDetail(false)
      }
    }

    fetchQuickviewProduct()
  }, [selectedProduct])

  useEffect(() => {
    if (!productAny) {
      setActiveColor('')
      setActiveSize('')
      setActiveImage('')
      return
    }

    const firstVariant =
      Array.isArray(productAny?.variation) && productAny.variation.length > 0
        ? productAny.variation[0]
        : null

    const initialColor = String(firstVariant?.color || '')
    const initialSize = String(firstVariant?.size || productAny?.sizes?.[0] || 'S/T')
    const initialImage =
      String(firstVariant?.colorImage || firstVariant?.image || '') ||
      (Array.isArray(productAny?.images) ? String(productAny.images[0] || '') : '')

    setActiveColor(initialColor)
    setActiveSize(initialSize)
    setActiveImage(initialImage)
    setQuantity(1)
    setQuantityInput('1')
    setFailedQuickviewImages({})
  }, [productAny])

  const productId = String(productAny?.id || productAny?.slug || '')
  const isInWishlist = wishlistState.wishlistArray.some(item => String(item.id) === productId)
  const isInCompare = compareState.compareArray.some(item => String(item.id) === productId)

  const variations: QuickviewVariant[] = useMemo(() => {
  return Array.isArray(productAny?.variation)
    ? productAny.variation
    : []
}, [productAny?.variation])

 const colors = useMemo(() => {
  return Array.from(
    new Map(
      variations
        .filter(v => v?.color)
        .map(v => [String(v.color), v])
    ).values()
  )
}, [variations])

  const sizes = useMemo(() => {
  return Array.from(
    new Set(
      variations
        .filter(v => {
          if (!activeColor) return true
          return String(v?.color || '') === activeColor
        })
        .map(v => String(v?.size || 'S/T'))
    )
  )
}, [variations, activeColor])

  const selectedVariant = useMemo(() => {
    if (!variations.length) return null

    return (
      variations.find(v => {
        const colorOk = activeColor ? String(v?.color || '') === activeColor : true
        const sizeOk = activeSize ? String(v?.size || 'S/T') === activeSize : true
        return colorOk && sizeOk
      }) || null
    )
  }, [variations, activeColor, activeSize])

  const linkedImmediateProducts = useMemo<QuickviewProduct[]>(() => {
  return Array.isArray(productAny?.features?._linkedImmediateProducts)
    ? (productAny.features._linkedImmediateProducts as QuickviewProduct[])
    : []
}, [productAny?.features?._linkedImmediateProducts])

  const immediateVariations = useMemo<ImmediateQuickviewVariant[]>(() => {
    const variationsMap: Record<string, ImmediateQuickviewVariant> = {}
    const immediateSources = [productAny, ...linkedImmediateProducts].filter(Boolean)

    immediateSources.forEach((immediateProduct) => {
      const variants = Array.isArray(immediateProduct?.variants)
        ? immediateProduct.variants
        : Array.isArray(immediateProduct?.variation)
        ? immediateProduct.variation
        : []

      variants.forEach((variant: QuickviewVariant, index: number) => {
        const stockLocations = getVariantStockLocations(variant)
        const variantFallbackStock = getImmediateFallbackStock(variant, immediateProduct)

        if (stockLocations.length === 0 && isImmediateProduct(immediateProduct)) {
          const color = String(variant?.color || 'Sin color')
          const size = String(variant?.size || 'S/T')
          const sku = String(variant?.sku || `${color}-${size}-${index}`)
          const key = `${color}__${size}__${sku}`

          variationsMap[key] = {
            color,
            size,
            sku,
            stockFisico: variantFallbackStock,
            stockTransito: Number(variant?.stockTransito || 0),
            fechaLlegada: variantFallbackStock > 0 ? 'Entrega Inmediata' : 'Sin stock',
            providerCode: 'kyte',
            providerName: 'KYTE',
          }

          return
        }

        stockLocations.forEach((location: QuickviewStockLocation) => {
          const rawProviderCode =
            getStockLocationProviderCode(location)

          const providerCode =
            isImmediateProviderCode(rawProviderCode) ||
            (
              !rawProviderCode &&
              isImmediateProduct(immediateProduct)
            )
              ? 'kyte'
              : rawProviderCode

          if (
            !isImmediateProviderCode(providerCode) &&
            !isImmediateProduct(immediateProduct)
          ) {
            return
          }

          const color = String(variant?.color || 'Sin color')
          const size = String(variant?.size || 'S/T')
          const sku = String(variant?.sku || `${color}-${size}-${index}`)
          const key = `${color}__${size}__${sku}`

          if (!variationsMap[key]) {
            variationsMap[key] = {
              color,
              size,
              sku,
              stockFisico: 0,
              stockTransito: 0,
              fechaLlegada:
                String(location?.dynamic_eta_label || '').trim() ||
                String(location?.provider?.default_eta_label || '').trim() ||
                'Sin fecha',
              providerCode,
              providerName:
                isImmediateProviderCode(providerCode)
                  ? 'KYTE'
                  : (location?.provider?.name || ''),
            }
          }

          variationsMap[key].stockFisico += Number(location?.available_stock) || variantFallbackStock || 0
          variationsMap[key].stockTransito += Number(location?.incoming_transit) || 0
        })
      })
    })

    return Object.values(variationsMap)
  }, [productAny, linkedImmediateProducts])

 const selectedImmediateVariant = useMemo(() => {
  if (!immediateVariations.length) return null

  const currentColor = String(activeColor || '').trim().toLowerCase()
  const currentSize = String(activeSize || 'S/T').trim().toLowerCase()

  const exactMatch = immediateVariations.find((variant) => {
    const localColor = String(variant?.color || '').trim().toLowerCase()
    const localSize = String(variant?.size || 'S/T').trim().toLowerCase()

    return localColor === currentColor && localSize === currentSize
  })

  if (exactMatch) return exactMatch

  const sizeMatch = immediateVariations.find((variant) => {
    const localSize = String(variant?.size || 'S/T').trim().toLowerCase()
    return localSize === currentSize && Number(variant?.stockFisico || 0) > 0
  })

  if (sizeMatch) return sizeMatch

  return (
    immediateVariations.find((variant) => Number(variant?.stockFisico || 0) > 0) ||
    immediateVariations[0]
  )
}, [immediateVariations, activeColor, activeSize])

  const isCurrentImmediateProduct = isImmediateProduct(productAny)
  const providerStock = isCurrentImmediateProduct ? 0 : Number(selectedVariant?.stockFisico ?? 0)
  const providerAvailability =
    String(selectedVariant?.disponibilidadLabel || '').trim() ||
    String(selectedVariant?.fechaLlegada || '').trim() ||
    'Sin stock'

  const immediateStock = Number(
    selectedImmediateVariant?.stockFisico ||
    (isCurrentImmediateProduct ? selectedVariant?.stockFisico : 0) ||
    (isCurrentImmediateProduct ? productAny?.total_stock : 0) ||
    0
  )
  const immediateAvailability =
    immediateStock > 0
      ? 'Inmediata'
      : String(selectedImmediateVariant?.fechaLlegada || '').trim() || 'Sin stock'

  const hasImmediateDelivery = isCurrentImmediateProduct || immediateStock > 0
  const hasProviderDelivery = !isCurrentImmediateProduct && (providerStock > 0 || providerAvailability !== 'Sin stock')
  const activeDeliveryMode =
    (selectedDeliveryMode === 'immediate' && hasImmediateDelivery) || isCurrentImmediateProduct ? 'immediate' : 'provider'
  const activeDeliveryStock = activeDeliveryMode === 'immediate' ? immediateStock : providerStock
  const activeDeliveryLabel =
    activeDeliveryMode === 'immediate' ? immediateAvailability : providerAvailability

  useEffect(() => {
    if (hasImmediateDelivery) {
      setSelectedDeliveryMode('immediate')
      return
    }

    setSelectedDeliveryMode('provider')
  }, [selectedVariant?.sku, selectedImmediateVariant?.sku, hasImmediateDelivery])

  useEffect(() => {
  const maxAllowed = Math.max(1, activeDeliveryStock || 1)

  setQuantity(prev => {
    const nextQuantity = Math.min(prev, maxAllowed)
    setQuantityInput(String(nextQuantity))
    return nextQuantity
  })
}, [activeDeliveryStock, activeDeliveryMode])


  useEffect(() => {
    if (!selectedProduct) return

    const resetDetailsScroll = () => {
      if (detailsScrollRef.current) {
        detailsScrollRef.current.scrollTop = 0
      }
    }

    resetDetailsScroll()

    const frame = window.requestAnimationFrame(resetDetailsScroll)
    const timer = window.setTimeout(resetDetailsScroll, 180)

    return () => {
      window.cancelAnimationFrame(frame)
      window.clearTimeout(timer)
    }
  }, [selectedProduct, quickviewProduct?.id, quickviewProduct?.slug])

  const galleryImages = useMemo(() => {
    const images: string[] = []
    const seen = new Set<string>()

    const normalizeGalleryUrl = (value: unknown) => {
      const url = String(value || '').trim()

      if (!url || url.includes('/areas/')) return ''

      return url
    }

    const getGalleryKey = (url: string) => {
      const cleanUrl = url.split('?')[0].split('#')[0]
      const decodedUrl = (() => {
        try {
          return decodeURIComponent(cleanUrl)
        } catch {
          return cleanUrl
        }
      })()

      const fileName = getFileNameFromUrl(decodedUrl)
      const fileKey = normalizeImageToken(fileName)

      return fileKey || normalizeImageToken(decodedUrl)
    }

    const pushUniqueImage = (value: unknown) => {
      const url = normalizeGalleryUrl(value)

      if (!url) return

      const key = getGalleryKey(url)

      if (!key || seen.has(key)) return

      seen.add(key)
      images.push(url)
    }

    const baseImages = Array.isArray(productAny?.images) ? productAny.images : []

    baseImages.forEach(pushUniqueImage)

    variations.forEach((variant) => {
      pushUniqueImage(variant?.colorImage)
      pushUniqueImage(variant?.image)
    })

    return images.length > 0 ? images : [appAsset('/images/product/1000x1000.png')]
  }, [productAny, variations])

  const getQuickviewImageFallback = (currentImage: string, index: number) => {
    const originalImages = Array.isArray(productAny?.features?._originalImages)
      ? productAny.features._originalImages
      : []

    const originalByIndex = String(originalImages[index] || '').trim()

    if (originalByIndex && originalByIndex !== currentImage) {
      return originalByIndex
    }

    return appAsset('/images/product/1000x1000.png')
  }

  const getClampedQuantity = (value: string | number) => {
  const numericValue = Number(String(value).replace(/\D/g, ''))
  const maxAllowed = Math.max(1, activeDeliveryStock || 1)

  if (!Number.isFinite(numericValue) || numericValue <= 0) return 1
  return Math.min(numericValue, maxAllowed)
}

const handleDecreaseQuantity = () => {
  const nextQuantity = Math.max(1, quantity - 1)
  setQuantity(nextQuantity)
  setQuantityInput(String(nextQuantity))
}

const handleIncreaseQuantity = () => {
  const maxAllowed = Math.max(1, activeDeliveryStock || 1)
  const nextQuantity = Math.min(maxAllowed, quantity + 1)
  setQuantity(nextQuantity)
  setQuantityInput(String(nextQuantity))
}

const handleQuantityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const rawValue = e.target.value.replace(/[^\d]/g, '')

  setQuantityInput(rawValue)

  if (rawValue === '') return

  const nextQuantity = getClampedQuantity(rawValue)
  setQuantity(nextQuantity)
}

const handleQuantityInputBlur = () => {
  const nextQuantity = getClampedQuantity(quantityInput)
  setQuantity(nextQuantity)
  setQuantityInput(String(nextQuantity))
}

  const handleClose = () => {
    setIsQuickviewVisible(false)

    window.setTimeout(() => {
      closeQuickview()
      setQuickviewProduct(null)
    }, 420)
  }

  const handleGoToQuote = () => {
  if (!productAny || activeDeliveryStock <= 0) return

  const finalQuantity = getClampedQuantity(quantityInput)
  const slug = String(productAny?.slug || productAny?.id || '')
  const currentProductId = String(productAny?.id || productAny?.slug || '')
  const currentProvider = Array.isArray(productAny?.categories) && productAny.categories.length > 0
    ? String(productAny.categories[0]?.provider || '').trim().toLowerCase()
    : String(productAny?.brand || '').trim().toLowerCase()

  const selectedQuoteVariant = activeDeliveryMode === 'immediate'
    ? selectedImmediateVariant
    : selectedVariant

  const source = activeDeliveryMode === 'immediate' ? 'immediate' : 'provider'
  const selectedSku = String(
    selectedQuoteVariant?.sku ||
    selectedVariant?.sku ||
    selectedImmediateVariant?.sku ||
    productAny?.sku ||
    slug
  )

  const items: QuoteSelectionItem[] = [
    {
      sku: selectedSku,
      color: String(selectedQuoteVariant?.color || activeColor || ''),
      size: String(selectedQuoteVariant?.size || activeSize || 'S/T'),
      quantity: finalQuantity,
      stockFisico: Number(selectedQuoteVariant?.stockFisico || activeDeliveryStock || 0),
      stockTransito: Number(selectedQuoteVariant?.stockTransito || 0),
      fechaLlegada: String(selectedQuoteVariant?.fechaLlegada || activeDeliveryLabel || ''),
      image: String(selectedQuoteVariant?.image || selectedQuoteVariant?.colorImage || activeImage || ''),
      colorImage: String(selectedQuoteVariant?.colorImage || selectedQuoteVariant?.image || activeImage || ''),
      providerCode: String(selectedQuoteVariant?.providerCode || currentProvider || ''),
      providerName: String(selectedQuoteVariant?.providerName || ''),
      productVariantId:
        selectedQuoteVariant?.immediateVariantId ??
        selectedQuoteVariant?.variantId ??
        selectedQuoteVariant?.variant_id ??
        selectedQuoteVariant?.id ??
        null,
      stockControlled:
        typeof selectedQuoteVariant?.stockControlled === 'boolean'
          ? selectedQuoteVariant.stockControlled
          : null,
      stockStatus: String(selectedQuoteVariant?.stockStatus || '') || null,
      source,
      isImmediateVariant: source === 'immediate',
    },
  ]

  setQuantity(finalQuantity)
  setQuantityInput(String(finalQuantity))

  setQuoteSelection({
    productId: currentProductId,
    slug,
    provider: currentProvider,
    quantity: finalQuantity,
    items,
  })

  const params = new URLSearchParams()
  params.set('qty', String(finalQuantity))
  params.set('items', JSON.stringify(items))

  closeQuickview()
  router.push(`/cotizar/${slug}?${params.toString()}`)
}

  const handleWishlistToggle = () => {
    if (!productAny || !productId) return

    const productForActions = {
      ...productAny,
      id: productId,
    } as unknown as ProductType

    if (isInWishlist) {
      removeFromWishlist(productId)
    } else {
      addToWishlist(productForActions)
    }
  }

  const handleCompareToggle = () => {
    if (!productAny || !productId) return

    const productForActions = {
      ...productAny,
      id: productId,
    } as unknown as ProductType

    if (compareState.compareArray.length >= 3 && !isInCompare) {
      alert('Compara hasta 3 productos.')
      return
    }

    if (!isInCompare) {
      addToCompare(productForActions)
    }

    closeQuickview()

    setTimeout(() => {
      openModalCompare()
    }, 120)
  }

  const handleViewProduct = () => {
    const slug = String(productAny?.slug || productAny?.id || '').trim()
    if (!slug) return

    handleClose()

    setTimeout(() => {
      router.push(`/producto/${encodeURIComponent(slug)}`)
    }, 120)
  }

  if (!selectedProduct) return null

  return (
    <div
      className={`fixed inset-0 z-[100] bg-[#071A33]/58 backdrop-blur-[3px] transition-opacity duration-300 ${
        isQuickviewVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleClose}
      role="presentation"
    >
      <div
        className={`absolute inset-y-0 right-0 flex h-dvh w-full flex-col overflow-hidden border-l border-[#DCE6EA] bg-white shadow-[-24px_0_70px_rgba(7,26,51,.24)] transition-transform duration-[420ms] ease-[cubic-bezier(.22,1,.36,1)] sm:w-[94vw] md:w-[88vw] lg:w-[980px] lg:max-w-[72vw] lg:flex-row ${
          isQuickviewVisible ? 'translate-x-0' : 'translate-x-full'
        }`}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Vista rápida de ${getCleanProductName(productAny)}`}
      >
        <button
          type="button"
          onClick={handleClose}
          aria-label="Cerrar vista rápida"
          className="absolute right-4 top-4 z-40 grid h-11 w-11 place-items-center rounded-full bg-[#F7FAFB] text-[#1F2E53] shadow-[0_8px_20px_rgba(31,46,83,.10)] transition hover:bg-[#21577B] hover:text-white sm:right-5 sm:top-5"
        >
          <Icon.X size={19} weight="bold" />
        </button>

        {/* Galería: permanece fija en desktop, como el modal original */}
        <div className="relative h-[390px] shrink-0 border-b border-[#E7EEF1] bg-[#FBFCFC] sm:h-[460px] lg:h-full lg:w-[44%] lg:border-b-0 lg:border-r">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#21577B] via-[#38A0A2] to-[#8DBC21]" />

          <div className="flex h-full flex-col p-5 pt-7 sm:p-7 sm:pt-8 lg:p-8">
            <div className="mb-4 flex items-center justify-between pr-12">
              <span className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[.15em] text-[#38A0A2]">
                <Icon.Eye size={15} weight="bold" />
                Vista rápida
              </span>

              {isLoadingDetail ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8492A6]">
                  <Icon.CircleNotch size={15} className="animate-spin" />
                  Actualizando
                </span>
              ) : null}
            </div>

            <div className="relative min-h-[250px] flex-1 overflow-hidden rounded-[22px] bg-white sm:min-h-[300px] lg:min-h-0">
              <Image
                src={
                  failedQuickviewImages[activeImage || galleryImages[0]]
                    ? getQuickviewImageFallback(activeImage || galleryImages[0], 0)
                    : activeImage || galleryImages[0]
                }
                alt={getCleanProductName(productAny)}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 500px"
                unoptimized={shouldBypassNextImageOptimization(
                  activeImage || galleryImages[0],
                )}
                onError={() => {
                  const image = activeImage || galleryImages[0]
                  if (!image) return

                  setFailedQuickviewImages((current) => ({
                    ...current,
                    [image]: true,
                  }))
                }}
                className="object-contain p-3 sm:p-6 lg:p-8"
              />
            </div>

            {galleryImages.length > 1 ? (
              <div className="mt-4 flex shrink-0 gap-2 overflow-x-auto pb-1">
                {galleryImages.slice(0, 8).map((item, index) => {
                  const thumbSrc = failedQuickviewImages[item]
                    ? getQuickviewImageFallback(item, index)
                    : item
                  const selected = (activeImage || galleryImages[0]) === item

                  return (
                    <button
                      type="button"
                      key={`${item}-${index}`}
                      onClick={() => setActiveImage(item)}
                      className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border bg-white transition ${
                        selected
                          ? 'border-[#38A0A2] ring-2 ring-[#38A0A2]/15'
                          : 'border-[#DCE6EA] hover:border-[#38A0A2]'
                      }`}
                      aria-label={`Ver imagen ${index + 1}`}
                    >
                      <Image
                        src={thumbSrc}
                        alt=""
                        fill
                        sizes="64px"
                        unoptimized={shouldBypassNextImageOptimization(thumbSrc)}
                        className="object-contain p-2"
                      />
                    </button>
                  )
                })}
              </div>
            ) : null}
          </div>
        </div>

        {/* Información: todo permanece al lado derecho y esta columna es la que hace scroll */}
        <div
          ref={detailsScrollRef}
          className="min-h-0 flex-1 overflow-y-auto bg-white"
          style={{ overflowAnchor: 'none' }}
        >
          <div className="p-5 pb-8 pt-7 sm:p-7 sm:pb-9 sm:pt-8 lg:p-9 lg:pb-10 lg:pr-10 lg:pt-16">
            <div className="pr-12">
              <p className="text-xs font-bold uppercase tracking-[.14em] text-[#8492A6]">
                {String(productAny?.tag || productAny?.category || 'General')}
              </p>

              <h2 className="mt-2 max-w-[620px] text-3xl font-black leading-[1.08] text-[#17233F]">
                {getCleanProductName(productAny)}
              </h2>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {selectedVariant?.sku || productAny?.sku ? (
                  <span className="rounded-full bg-[#F2F6F8] px-3 py-1.5 text-xs font-extrabold text-[#52637A]">
                    Código: {String(selectedVariant?.sku || productAny?.sku)}
                  </span>
                ) : null}

                {activeDeliveryMode === 'immediate' && immediateStock > 0 ? (
                  <span className="rounded-full bg-[#8DBC21]/12 px-3 py-1.5 text-xs font-extrabold text-[#648B12]">
                    Entrega inmediata
                  </span>
                ) : (
                  <span className="rounded-full bg-[#38A0A2]/10 px-3 py-1.5 text-xs font-extrabold text-[#21577B]">
                    Bajo pedido
                  </span>
                )}
              </div>

              {productAny?.description ? (
                <p className="mt-5 max-w-[650px] text-sm leading-7 text-[#6B7A90] max-sm:line-clamp-4">
                  {productAny.description}
                </p>
              ) : null}
            </div>

            <div className="mt-7 border-t border-[#E7EEF1] pt-6">
              {sizes.length > 0 ? (
                <section>
                  <div className="mb-3 flex items-baseline gap-2">
                    <h3 className="text-lg font-black text-[#1F2E53]">Talla:</h3>
                    <span className="text-sm font-extrabold text-[#52637A]">
                      {activeSize || 'S/T'}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    {sizes.map((size, index) => (
                      <button
                        key={`${size}-${index}`}
                        type="button"
                        onClick={() => setActiveSize(size)}
                        className={`min-w-12 rounded-full border px-4 py-2 text-sm font-extrabold transition ${
                          activeSize === size
                            ? 'border-[#1F2E53] bg-[#1F2E53] text-white'
                            : 'border-[#DCE6EA] bg-white text-[#52637A] hover:border-[#21577B] hover:text-[#21577B]'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </section>
              ) : null}

              {colors.length > 0 ? (
                <section className={sizes.length > 0 ? 'mt-6' : ''}>
                  <div className="mb-3 flex items-baseline gap-2">
                    <h3 className="text-lg font-black text-[#1F2E53]">Colores:</h3>
                    <span className="text-sm font-extrabold text-[#52637A]">
                      {activeColor || 'Sin color'}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    {colors.map((item: QuickviewVariant, index) => {
                      const colorName = String(item?.color || 'Sin color')
                      const isActive = activeColor === colorName

                      return (
                        <button
                          key={`${colorName}-${index}`}
                          type="button"
                          onClick={() => {
                            setActiveColor(colorName)

                            const firstMatch = variations.find(
                              (variation) =>
                                String(variation?.color || '') === colorName,
                            )

                            if (firstMatch?.size) {
                              setActiveSize(String(firstMatch.size))
                            }

                            if (firstMatch?.colorImage || firstMatch?.image) {
                              setActiveImage(
                                String(firstMatch.colorImage || firstMatch.image),
                              )
                            }
                          }}
                          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-extrabold transition ${
                            isActive
                              ? 'border-[#1F2E53] bg-[#1F2E53] text-white'
                              : 'border-[#DCE6EA] bg-white text-[#52637A] hover:border-[#38A0A2] hover:text-[#21577B]'
                          }`}
                        >
                          <span
                            className="h-4 w-4 rounded-full border border-black/10 bg-white"
                            style={getColorSwatchStyle(colorName)}
                          />
                          {colorName}
                        </button>
                      )
                    })}
                  </div>
                </section>
              ) : null}
            </div>

            <section className="mt-7 border-t border-[#E7EEF1] pt-6">
              <h3 className="text-lg font-black text-[#1F2E53]">
                Modalidad de entrega
              </h3>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {hasImmediateDelivery ? (
                  <button
                    type="button"
                    onClick={() => setSelectedDeliveryMode('immediate')}
                    className={`rounded-2xl border p-4 text-left transition ${
                      activeDeliveryMode === 'immediate'
                        ? 'border-[#8DBC21] bg-[#F4F9E8]'
                        : 'border-[#DCE6EA] bg-white hover:border-[#8DBC21]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon.Lightning
                        size={18}
                        weight="fill"
                        className="text-[#8DBC21]"
                      />
                      <span className="text-sm font-black text-[#1F2E53]">
                        Entrega inmediata
                      </span>
                    </div>
                    <p className="mt-2 text-xs font-bold leading-5 text-[#6B7A90]">
                      {immediateStock > 0
                        ? `${immediateStock.toLocaleString()} unidades disponibles`
                        : 'Disponibilidad por confirmar'}
                    </p>
                  </button>
                ) : null}

                {hasProviderDelivery ? (
                  <button
                    type="button"
                    onClick={() => setSelectedDeliveryMode('provider')}
                    className={`rounded-2xl border p-4 text-left transition ${
                      activeDeliveryMode === 'provider'
                        ? 'border-[#38A0A2] bg-[#EFF8F8]'
                        : 'border-[#DCE6EA] bg-white hover:border-[#38A0A2]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon.Package
                        size={18}
                        weight="fill"
                        className="text-[#38A0A2]"
                      />
                      <span className="text-sm font-black text-[#1F2E53]">
                        Bajo pedido
                      </span>
                    </div>

                    <p className="mt-2 text-xs font-bold leading-5 text-[#6B7A90]">
                      {providerStock > 0
                        ? `${providerStock.toLocaleString()} unidades · ${providerAvailability}`
                        : `Entrega estimada: ${providerAvailability}`}
                    </p>
                  </button>
                ) : null}
              </div>

              <div className="mt-4 flex items-start gap-2.5 text-sm leading-6">
                <Icon.Clock
                  size={18}
                  weight="fill"
                  className="mt-0.5 shrink-0 text-[#21577B]"
                />
                <p className="text-[#6B7A90]">
                  <span className="font-extrabold text-[#1F2E53]">
                    {activeDeliveryMode === 'immediate'
                      ? 'Entrega inmediata'
                      : 'Bajo pedido'}
                  </span>
                  <span>
                    {' · '}
                    {activeDeliveryMode === 'immediate' && activeDeliveryStock > 0
                      ? `${activeDeliveryStock.toLocaleString()} unidades disponibles`
                      : activeDeliveryLabel}
                  </span>
                </p>
              </div>
            </section>

            <section className="mt-7 border-t border-[#E7EEF1] pt-6">
              <div className="mb-3 flex items-center justify-between gap-4">
                <h3 className="text-lg font-black text-[#1F2E53]">Cantidad</h3>
                <span className="text-xs font-bold text-[#8492A6]">
                  {activeDeliveryStock > 0
                    ? `Máximo ${activeDeliveryStock.toLocaleString()}`
                    : 'Disponibilidad por confirmar'}
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-[174px_1fr]">
                <div className="flex h-[54px] w-full items-center overflow-hidden rounded-xl border border-[#DCE6EA] bg-white sm:min-w-[174px]">
                  <button
                    type="button"
                    className="grid h-full w-12 place-items-center text-[#52637A] transition hover:bg-[#F1F7F8] hover:text-[#21577B]"
                    onClick={handleDecreaseQuantity}
                    aria-label="Disminuir cantidad"
                  >
                    <Icon.Minus size={15} weight="bold" />
                  </button>

                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={quantityInput}
                    onChange={handleQuantityInputChange}
                    onBlur={handleQuantityInputBlur}
                    className="h-full min-w-14 flex-1 border-x border-[#E7EEF1] bg-white text-center text-base font-black text-[#1F2E53] outline-none"
                    aria-label="Cantidad"
                  />

                  <button
                    type="button"
                    className="grid h-full w-12 place-items-center text-[#52637A] transition hover:bg-[#F1F7F8] hover:text-[#21577B]"
                    onClick={handleIncreaseQuantity}
                    aria-label="Aumentar cantidad"
                  >
                    <Icon.Plus size={15} weight="bold" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleGoToQuote}
                  disabled={activeDeliveryStock <= 0}
                  className="inline-flex min-h-[56px] w-full items-center justify-center gap-2 rounded-xl bg-[#21577B] px-5 text-base font-extrabold text-white transition hover:bg-[#1F2E53] disabled:cursor-not-allowed disabled:bg-[#BCC7CF]"
                >
                  <Icon.FileText size={17} weight="bold" />
                  Cotizar producto
                </button>
              </div>
            </section>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleWishlistToggle}
                className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-extrabold transition ${
                  isInWishlist
                    ? 'border-[#21577B] bg-[#EEF4F7] text-[#21577B]'
                    : 'border-[#DCE6EA] text-[#52637A] hover:border-[#21577B] hover:text-[#21577B]'
                }`}
              >
                <Icon.Heart
                  size={16}
                  weight={isInWishlist ? 'fill' : 'regular'}
                />
                {isInWishlist ? 'En favoritos' : 'Favorito'}
              </button>

              <button
                type="button"
                onClick={handleCompareToggle}
                className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-extrabold transition ${
                  isInCompare
                    ? 'border-[#38A0A2] bg-[#EFF8F8] text-[#21577B]'
                    : 'border-[#DCE6EA] text-[#52637A] hover:border-[#38A0A2] hover:text-[#21577B]'
                }`}
              >
                <Icon.ArrowsCounterClockwise size={16} weight="bold" />
                {isInCompare ? 'En comparación' : 'Comparar'}
              </button>
            </div>

            <button
              type="button"
              onClick={handleViewProduct}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#21577B] px-5 py-3 text-sm font-extrabold text-[#21577B] transition hover:bg-[#21577B] hover:text-white"
            >
              Ver producto completo
              <Icon.ArrowRight size={16} weight="bold" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModalQuickview
