'use client'

import { appAsset } from '@/lib/appPaths'
import React, { useState, useEffect, useRef } from 'react'
import Default from '@/components/Product/Detail/Default'
import { ProductFeatureObject, ProductType } from '@/type/ProductType'
import { getColorHex } from '@/lib/colors'
import { apiRequest, initializeCsrf } from '@/lib/apiClient'
import ProductDetailSkeleton from '@/components/Product/Detail/ProductDetailSkeleton'
import BtlHeroHeader from '@/components/BTL/BtlHeroHeader'
import BtlCatalogFooter from '@/components/BTL/BtlCatalogFooter'
import { getCatalogBrowserSafeUrl } from '@/lib/catalogBrowserProxy'
import { getCommercialCategories } from '@/lib/commercialCategories'

type ProductDetailCategory = {
    id?: string | number | null
    name?: string | null
    slug?: string | null
    provider?: string | null
    external_id?: string | number | null
    lang?: string | number | null
}

type ProductDetailProvider = {
    code?: string | null
    name?: string | null
    default_eta_label?: string | null
}

type ProductDetailStockLocation = {
    provider_sku?: string | null
    available_stock?: string | number | null
    incoming_transit?: string | number | null
    stock_controlled?: boolean | number | string | null
    stock_status?: string | null
    dynamic_eta_label?: string | null
    last_synced_at?: string | null

    /*
     * Identidad operacional real del stock.
     */
    source_provider?: string | null

    provider?: ProductDetailProvider | null
    [key: string]: unknown
}

type ProductDetailVariant = {
    id?: string | number | null
    sku?: string | null
    provider_sku?: string | null
    color?: string | null
    size?: string | null
    base_price?: string | number | null
    currency?: string | null
    total_aggregated_stock?: string | number | null
    available_stock?: string | number | null
    image?: string | null
    image_url?: string | null
    imageUrl?: string | null
    main_image?: string | null
    mainImage?: string | null
    colorImage?: string | null
    stockLocations?: ProductDetailStockLocation[] | null
    stock_locations?: ProductDetailStockLocation[] | null
    [key: string]: unknown
}

type ProductDetailRaw = {
    id?: string | number | null
    slug?: string | null
    product_slug?: string | null
    codigo_sac?: string | null
    codigo?: string | null
    sku?: string | null
    name?: string | null
    nombre?: string | null
    product_name?: string | null
    descripcion?: string | null
    description?: string | null
    brand?: string | null
    marca?: string | null

    /*
     * Identidad operacional real.
     * LOCAL/local permanecen temporalmente como contrato legacy.
     */
    source_brand?: string | null
    source_provider?: string | null

    provider?: string | { code?: string | null } | null
    provider_code?: string | null
    local_inventory_id?: string | number | null
    is_local?: boolean | number | string | null
    images?: unknown
    features?: unknown
    variants?: ProductDetailVariant[] | null
    categories?: ProductDetailCategory[] | null
    available_stock?: string | number | null
    stock?: string | number | null
    existencia?: string | number | null
    cantidad?: string | number | null
    color?: string | null
    size?: string | null
    talla?: string | null
    [key: string]: unknown
}

type ProductImmediateInventory = {
    items?: unknown[]
    has_match?: boolean | number | string | null
    total_stock?: string | number | null
    [key: string]: unknown
}

type ProductDetailResponse = {
    product?: ProductDetailRaw | null
    immediate_inventory?: ProductImmediateInventory | null
}

type RelatedCommercialCategoryMatch = {
    provider?: string | null
    slug?: string | null
}

type RelatedCommercialCategory = {
    label?: string | null
    value?: string | null
    slug?: string | null
    matches?: RelatedCommercialCategoryMatch[] | null
}

type RelatedProductsPayload = {
    data?: unknown
    commercial_categories?: unknown
    [key: string]: unknown
}

type CatalogProductsPayload = {
    data?: unknown
    [key: string]: unknown
}

type ProductStockSnapshotVariant = {
    variant_id?: string | number | null
    sku?: string | null
    color?: string | null
    size?: string | null
    total_aggregated_stock?: string | number | null
    stock_locations?: ProductDetailStockLocation[] | null
}

type ProductStockLocalItem = {
    id?: string | number | null
    slug?: string | null
    name?: string | null
    variants?: ProductStockSnapshotVariant[] | null
    [key: string]: unknown
}

type ProductStockSnapshot = {
    product_id?: string | number | null
    provider?: string | null
    stock_synced_at?: string | null
    refresh_required?: boolean | null
    refresh_after?: string | null
    ttl_minutes?: number | null
    freshness_status?: string | null
    variants?: ProductStockSnapshotVariant[] | null

    immediate_inventory?: {
        has_match?: boolean | number | string | null
        total_stock?: string | number | null
        items_count?: string | number | null
        items?: ProductStockLocalItem[] | null
    } | null
}

type ProductStockResponse = {
    status?: string | null
    provider?: string | null
    stock?: ProductStockSnapshot | null
}

type PromoImages = {
    mainImages: string[]
    variantImages: string[]
    vectorImages: string[]
}

type DetailVariation = ProductType['variation'][number] & {
    variantId?: string | number | null
    base_price?: string | number | null
    currency?: string | null
    disponibilidadLabel?: string
    providerCode?: string
    providerName?: string
    stockLocations?: ProductDetailStockLocation[]
}

export type ExtendedProductType = Omit<ProductType, 'features' | 'variation' | 'variants'> & {
    backendId?: string | number | null
    features?: ProductFeatureObject | null
    variation: DetailVariation[]
    variants?: ProductDetailVariant[]
    categories?: ProductDetailCategory[]
}

type ProductoClientProps = {
    slug: string
    initialProductResponse: unknown | null
}

const productDetailCache = new Map<string, ProductDetailResponse>()
const productDetailPromiseCache = new Map<string, Promise<ProductDetailResponse>>()

const PLACEHOLDER_IMAGE = appAsset('/images/product-placeholder.webp')

const getApiBaseUrl = () => process.env.NEXT_PUBLIC_API_URL || ''

const isRecord = (value: unknown): value is Record<string, unknown> => {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
}

const normalizeText = (value: unknown) => String(value || '').trim()

const isProductDetailResponse = (value: unknown): value is ProductDetailResponse => {
    return isRecord(value)
}

const getProviderCodeFromProduct = (product: ProductDetailRaw) => {
    if (typeof product.provider === 'string') {
        return normalizeText(product.provider).toLowerCase()
    }

    if (isRecord(product.provider)) {
        return normalizeText(product.provider.code).toLowerCase()
    }

    return normalizeText(product.provider_code).toLowerCase()
}

const getProductDetail = async (slug: string): Promise<ProductDetailResponse> => {
    const apiBaseUrl = getApiBaseUrl()

    if (!apiBaseUrl) {
        throw new Error('NEXT_PUBLIC_API_URL no está configurado')
    }

    const cachedProduct = productDetailCache.get(slug)
    if (cachedProduct) {
        return cachedProduct
    }

    const cachedProductPromise = productDetailPromiseCache.get(slug)
    if (cachedProductPromise) {
        return cachedProductPromise
    }

    const productPromise = fetch(`${apiBaseUrl}/catalog/${slug}`)
        .then(async (response) => {
            if (!response.ok) {
                throw new Error('Producto no encontrado')
            }

            const json = await response.json() as unknown

            if (!isProductDetailResponse(json)) {
                throw new Error('Respuesta inválida del catálogo')
            }

            productDetailCache.set(slug, json)
            return json
        })
        .catch((error) => {
            productDetailPromiseCache.delete(slug)
            throw error
        })

    productDetailPromiseCache.set(slug, productPromise)
    return productPromise
}

const normalizeRelatedProvider = (value: unknown) => {
    const normalized = String(value || '').trim().toLowerCase()

    if (normalized === 'local' || normalized === 'kyte') return 'kyte'
    if (normalized === 'premium') return 'promo'
    if (normalized === 'ecoline') return 'makito'

    return normalized
}

const fetchCatalogPath = async <T = unknown>(path: string): Promise<T | null> => {
    const apiBaseUrl = getApiBaseUrl()

    if (!apiBaseUrl) {
        throw new Error('NEXT_PUBLIC_API_URL no está configurado')
    }

    const normalizedPath = path.startsWith('/') ? path : `/${path}`
    const requestUrl = getCatalogBrowserSafeUrl(`${apiBaseUrl}${normalizedPath}`)

    const response = await fetch(requestUrl, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
        },
        cache: 'no-store',
    })

    if (!response.ok) {
        return null
    }

    return await response.json() as T
}

const getRelatedProducts = async (
    slug: string,
    limit = 4,
): Promise<ProductDetailRaw[]> => {
    const encodedSlug = encodeURIComponent(slug)
    const json = await fetchCatalogPath<RelatedProductsPayload | ProductDetailRaw[]>(
        `/catalog/${encodedSlug}/related?limit=${limit}&random=1`,
    )

    if (!json) {
        console.warn('No se pudieron cargar los productos relacionados')
        return []
    }

    if (isRecord(json) && Array.isArray(json.data)) {
        return json.data.filter(isRecord) as ProductDetailRaw[]
    }

    if (Array.isArray(json)) {
        return json.filter(isRecord) as ProductDetailRaw[]
    }

    return []
}

const resolveRelatedCommercialCategory = (
    product: ProductDetailRaw,
    categories: RelatedCommercialCategory[],
): RelatedCommercialCategory | null => {
    const productCategories = Array.isArray(product.categories)
        ? product.categories
        : []

    const categoryKeys = productCategories
        .map((category) => ({
            provider: normalizeRelatedProvider(category?.provider),
            slug: String(category?.slug || '').trim().toLowerCase(),
        }))
        .filter((category) => category.slug !== '')

    if (categoryKeys.length === 0) {
        return null
    }

    return categories.find((category) => {
        const matches = Array.isArray(category?.matches)
            ? category.matches
            : []

        return matches.some((match) => {
            const matchProvider = normalizeRelatedProvider(match?.provider)
            const matchSlug = String(match?.slug || '').trim().toLowerCase()

            return categoryKeys.some((productCategory) => {
                if (productCategory.slug !== matchSlug) return false

                // Algunos mapeos legacy no traen provider. En ese caso el slug
                // sigue siendo suficiente para resolver la categoría comercial.
                return (
                    !productCategory.provider ||
                    !matchProvider ||
                    productCategory.provider === matchProvider
                )
            })
        })
    }) || null
}

const getRelatedProductsByCommercialCategory = async (
    product: ProductDetailRaw,
    currentSlug: string,
    limit = 4,
): Promise<ProductDetailRaw[]> => {
    try {
        const commercialCategories =
            await getCommercialCategories<RelatedCommercialCategory>()

        const commercialCategory = resolveRelatedCommercialCategory(
            product,
            commercialCategories,
        )

        const categorySlug = String(
            commercialCategory?.slug ||
            commercialCategory?.value ||
            '',
        ).trim()

        if (!categorySlug) {
            return []
        }

        const params = new URLSearchParams()
        params.set('page', '1')
        params.set('commercial_category', categorySlug)

        const json = await fetchCatalogPath<CatalogProductsPayload>(
            `/catalog?${params.toString()}`,
        )

        if (!json || !isRecord(json) || !Array.isArray(json.data)) {
            return []
        }

        const currentSlugNormalized = currentSlug.trim().toLowerCase()
        const seen = new Set<string>()

        return json.data
            .filter(isRecord)
            .filter((item) => {
                const itemSlug = String(item?.slug || '').trim()
                const itemId = String(item?.id || '').trim()
                const key = (itemSlug || itemId).toLowerCase()

                if (!key) return false
                if (itemSlug.toLowerCase() === currentSlugNormalized) return false
                if (seen.has(key)) return false

                seen.add(key)
                return true
            })
            .slice(0, limit) as ProductDetailRaw[]
    } catch (error) {
        console.error(
            'Error cargando fallback de relacionados por categoría comercial:',
            error,
        )
        return []
    }
}

const loadRelatedProducts = async (
    product: ProductDetailRaw,
    slug: string,
    limit = 4,
): Promise<ProductDetailRaw[]> => {
    const primary = await getRelatedProducts(slug, limit)
    const seen = new Set<string>()
    const currentSlug = slug.trim().toLowerCase()

    const appendUnique = (
        target: ProductDetailRaw[],
        source: ProductDetailRaw[],
    ) => {
        for (const item of source) {
            const itemSlug = String(item?.slug || '').trim()
            const itemId = String(item?.id || '').trim()
            const key = (itemSlug || itemId).toLowerCase()

            if (!key) continue
            if (itemSlug.toLowerCase() === currentSlug) continue
            if (seen.has(key)) continue

            seen.add(key)
            target.push(item)

            if (target.length >= limit) break
        }
    }

    const resolved: ProductDetailRaw[] = []
    appendUnique(resolved, primary)

    if (resolved.length < limit) {
        const fallback = await getRelatedProductsByCommercialCategory(
            product,
            slug,
            limit - resolved.length,
        )

        appendUnique(resolved, fallback)
    }

    return resolved.slice(0, limit)
}

const fetchProductStock = async ({
    productId,
    method,
    signal,
}: {
    productId: string | number
    method: 'GET' | 'POST'
    signal: AbortSignal
}): Promise<ProductStockResponse | null> => {
    const encodedProductId = encodeURIComponent(String(productId))
    const suffix = method === 'POST' ? '/refresh' : ''
    const path = `/catalog/products/${encodedProductId}/stock${suffix}`

    if (method === 'POST') {
        await initializeCsrf()
    }

    return apiRequest<ProductStockResponse>(path, {
        method,
        cache: 'no-store',
        signal,
    })
}

const waitForStockPoll = (milliseconds: number, signal: AbortSignal) => {
    return new Promise<void>((resolve, reject) => {
        if (signal.aborted) {
            reject(new DOMException('Solicitud cancelada', 'AbortError'))
            return
        }

        let timer = 0
        const abort = () => {
            window.clearTimeout(timer)
            signal.removeEventListener('abort', abort)
            reject(new DOMException('Solicitud cancelada', 'AbortError'))
        }
        const finish = () => {
            signal.removeEventListener('abort', abort)
            resolve()
        }

        timer = window.setTimeout(finish, milliseconds)
        signal.addEventListener('abort', abort, { once: true })
    })
}


const isImmediateProduct = (product: ProductDetailRaw) => {
    const sourceBrand = normalizeText(
        product.source_brand
    ).toLowerCase()

    const sourceProvider = normalizeText(
        product.source_provider
    ).toLowerCase()

    const legacyBrand = normalizeText(
        product.brand || product.marca
    ).toLowerCase()

    const legacyProvider =
        getProviderCodeFromProduct(product)

    /*
     * La identidad nueva manda.
     *
     * LOCAL/local y los indicadores históricos permanecen
     * únicamente como fallback mientras termina la migración.
     */
    return (
        sourceBrand === 'kyte' ||
        sourceProvider === 'kyte' ||
        legacyBrand === 'local' ||
        legacyProvider === 'local' ||
        Boolean(product.codigo_sac) ||
        Boolean(product.local_inventory_id) ||
        Boolean(product.is_local)
    )
}

const cleanImmediateName = (name: unknown) => {
    const value = normalizeText(name)

    if (!value) return 'Producto local'

    return value
        .replace(/^[A-Za-z0-9]+(?:-[A-Za-z0-9]+){1,}\s*-\s*/, '')
        .trim() || value
}

const resolveProductName = (product: ProductDetailRaw, isImmediate: boolean) => {
    const rawName =
        product.name ||
        product.nombre ||
        product.product_name ||
        product.descripcion ||
        product.description ||
        ''

    return isImmediate ? cleanImmediateName(rawName) : (normalizeText(rawName) || 'Producto promocional')
}

const resolveProductSlug = (product: ProductDetailRaw) => {
    const rawSlug =
        product.slug ||
        product.product_slug ||
        product.codigo_sac ||
        product.codigo ||
        product.sku ||
        product.id

    return normalizeText(rawSlug)
}

function getVariantStockLocations(variant: ProductDetailVariant): ProductDetailStockLocation[] {
    if (Array.isArray(variant.stockLocations)) return variant.stockLocations
    if (Array.isArray(variant.stock_locations)) return variant.stock_locations

    return []
}

function getFirstStockLocation(variant: ProductDetailVariant): ProductDetailStockLocation {
    return getVariantStockLocations(variant)[0] || {}
}

function getVariantProviderCode(product: ProductDetailRaw, variant: ProductDetailVariant) {
    const location = getFirstStockLocation(variant)

    return String(
        location.provider?.code ||
        product.provider ||
        product.brand ||
        ''
    )
        .trim()
        .toLowerCase()
}

function getVariantProviderSku(variant: ProductDetailVariant) {
    const location = getFirstStockLocation(variant)

    return String(
        location.provider_sku ||
        variant.provider_sku ||
        variant.sku ||
        ''
    ).trim()
}

function getFileNameFromUrl(url: unknown) {
    return String(url || '')
        .split('?')[0]
        .split('#')[0]
        .split('/')
        .pop() || ''
}

function normalizeImageToken(value: unknown) {
    return String(value ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '')
}

function getMakitoRef(product: ProductDetailRaw, imageUrls: string[]) {
    const slug = String(product.slug || '').trim()

    if (slug.toUpperCase().startsWith('MAK-')) {
        return slug.replace(/^MAK-/i, '')
    }

    const firstVariantImage = imageUrls.find((url) =>
        String(url).includes('/variantes/')
    )

    const fileName = getFileNameFromUrl(firstVariantImage)
    const matchFromImage = fileName.match(/^([^-]+)-/)

    if (matchFromImage?.[1]) {
        return matchFromImage[1]
    }

    const firstSku = String(product.variants?.[0]?.sku || '')
    const matchFromSku = firstSku.match(/^(\d+)/)

    return matchFromSku?.[1] || ''
}

function getMakitoColorCodeFromProviderSku(providerSku: unknown) {
    const digits = String(providerSku || '').replace(/\D/g, '')

    if (digits.length >= 6) {
        return digits.slice(-6, -3)
    }

    return ''
}

function resolveMakitoVariantImage(
    product: ProductDetailRaw,
    variant: ProductDetailVariant,
    imageUrls: string[]
) {
    const ref = getMakitoRef(product, imageUrls)
    const providerSku = getVariantProviderSku(variant)
    const colorCode = getMakitoColorCodeFromProviderSku(providerSku)

    if (!ref || !colorCode) {
        return null
    }

    const exactMatch = imageUrls.find((url) => {
        const cleanUrl = String(url || '')
        const fileName = getFileNameFromUrl(cleanUrl)

        return (
            cleanUrl.includes('/variantes/') &&
            fileName.toLowerCase().includes(`${ref.toLowerCase()}-${colorCode.toLowerCase()}-`)
        )
    })

    if (exactMatch) {
        return exactMatch
    }

    return (
        imageUrls.find((url) => {
            const fileName = getFileNameFromUrl(url).toLowerCase()
            return fileName.includes(`-${colorCode.toLowerCase()}-`)
        }) || null
    )
}

function getPromoVariantSuffix(variant: ProductDetailVariant) {
    const rawSku = getVariantProviderSku(variant) || variant.sku || ''
    const parts = String(rawSku)
        .trim()
        .replace(/\//g, ' ')
        .split(/[\s-]+/)
        .filter(Boolean)

    return parts[parts.length - 1] || ''
}

function resolvePromoVariantImage(
    variant: ProductDetailVariant,
    promoImages: PromoImages
) {
    const suffix = getPromoVariantSuffix(variant)
    const variantImages = promoImages.variantImages

    if (!suffix || !variantImages.length) {
        return null
    }

    const escapedSuffix = suffix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

    const exactRegex = new RegExp(`-${escapedSuffix}\\.[a-z0-9]+$`, 'i')
    const exactMatch = variantImages.find((url) =>
        exactRegex.test(getFileNameFromUrl(url))
    )

    if (exactMatch) {
        return exactMatch
    }

    const looseRegex = new RegExp(`-${escapedSuffix}(?:_\\d+)?\\.[a-z0-9]+$`, 'i')
    const looseMatch = variantImages.find((url) =>
        looseRegex.test(getFileNameFromUrl(url))
    )

    if (looseMatch) {
        return looseMatch
    }

    const normalizedSku = normalizeImageToken(variant.sku)
    const normalizedProviderSku = normalizeImageToken(getVariantProviderSku(variant))

    return (
        variantImages.find((url) => {
            const normalizedFile = normalizeImageToken(getFileNameFromUrl(url))

            return (
                Boolean(normalizedSku) &&
                normalizedFile.includes(normalizedSku)
            ) || (
                Boolean(normalizedProviderSku) &&
                normalizedFile.includes(normalizedProviderSku)
            )
        }) || null
    )
}

function resolveVariantImage(
    product: ProductDetailRaw,
    variant: ProductDetailVariant,
    imageUrls: string[],
    promoImages: PromoImages
) {
    const explicitImage =
        variant.image ||
        variant.image_url ||
        variant.imageUrl ||
        variant.main_image ||
        variant.mainImage ||
        variant.colorImage ||
        null

    if (explicitImage) {
        return String(explicitImage)
    }

    const providerCode = getVariantProviderCode(product, variant)
    const brand = String(product.brand || '').toUpperCase()

    if (providerCode === 'promo' || brand === 'PROMO') {
        return resolvePromoVariantImage(variant, promoImages) || imageUrls[0] || null
    }

    if (providerCode === 'makito' || brand === 'MAKITO') {
        return resolveMakitoVariantImage(product, variant, imageUrls) || imageUrls[0] || null
    }

    return imageUrls[0] || null
}

const isValidImageUrl = (url: unknown): url is string => {
    return (
        typeof url === 'string' &&
        url.trim() !== '' &&
        !url.includes('/areas/')
    )
}

const isKnownPlaceholderImage = (url: unknown): boolean => {
    if (typeof url !== 'string') return false

    const normalized = url
        .trim()
        .toLowerCase()
        .split('#')[0]
        .split('?')[0]

    return (
        normalized.endsWith('/images/product-placeholder.webp') ||
        normalized.includes('via.placeholder.com/')
    )
}

const isDirectKyteProduct = (product: ProductDetailRaw): boolean => {
    const brand = normalizeText(
        product.brand || product.marca
    ).toLowerCase()

    return brand === 'kyte' || brand === 'local'
}

const sanitizeImageUrls = (
    value: unknown,
    excludePlaceholders = false
): string[] => {
    if (!Array.isArray(value)) return []

    return Array.from(
        new Set(
            value
                .filter(isValidImageUrl)
                .map((url) => url.trim())
                .filter(
                    (url) =>
                        !excludePlaceholders ||
                        !isKnownPlaceholderImage(url)
                )
        )
    )
}

const parseProductImages = (
    product: ProductDetailRaw,
    excludePlaceholders = false
) => {
    let imageUrls: string[] = []
    let promoImages: PromoImages = {
        mainImages: [],
        variantImages: [],
        vectorImages: [],
    }

    try {
        let imgs = product.images

        if (typeof imgs === 'string') {
            imgs = JSON.parse(imgs) as unknown
        }

        if (Array.isArray(imgs) && imgs.length > 0) {
            imageUrls = sanitizeImageUrls(
                imgs,
                excludePlaceholders
            )
            promoImages.mainImages = imageUrls
        } else if (isRecord(imgs)) {
            const mainImages = sanitizeImageUrls(
                imgs.mainImages,
                excludePlaceholders
            )
            const variantImages = sanitizeImageUrls(
                imgs.variantImages,
                excludePlaceholders
            )
            const vectorImages = sanitizeImageUrls(
                imgs.vectorImages
            )

            promoImages = {
                mainImages,
                variantImages,
                vectorImages,
            }

            imageUrls = Array.from(
                new Set([
                    ...promoImages.mainImages,
                    ...promoImages.variantImages,
                ])
            )
        }

        if (!imageUrls.length && !excludePlaceholders) {
            imageUrls = [PLACEHOLDER_IMAGE]
        }
    } catch (error) {
        console.error('Error parseando imágenes', error)
        imageUrls = excludePlaceholders
            ? []
            : [PLACEHOLDER_IMAGE]
    }

    return { imageUrls, promoImages }
}

const parseFeatures = (features: ProductDetailRaw['features']): ProductFeatureObject => {
    try {
        const parsed =
            typeof features === 'string'
                ? (JSON.parse(features) as unknown)
                : features || {}

        return isRecord(parsed) ? (parsed as ProductFeatureObject) : {}
    } catch {
        return {}
    }
}

const getImageKitImages = (
    features: ProductFeatureObject,
    excludePlaceholders = false
) => {
    const imagekit = isRecord(features.imagekit) ? features.imagekit : null

    return Array.isArray(imagekit?.images)
        ? imagekit.images
              .filter(isValidImageUrl)
              .map((url) => url.trim())
              .filter(
                  (url) =>
                      !excludePlaceholders ||
                      !isKnownPlaceholderImage(url)
              )
        : []
}

const getImageKitCatalogImage = (
    features: ProductFeatureObject,
    key: 'main' | 'hover',
    excludePlaceholders = false
) => {
    const imagekit = isRecord(features.imagekit) ? features.imagekit : null
    const catalog = isRecord(imagekit?.catalog) ? imagekit.catalog : null
    const value = catalog?.[key]

    if (typeof value !== 'string') return ''

    const cleanValue = value.trim()

    if (!cleanValue) return ''
    if (
        excludePlaceholders &&
        isKnownPlaceholderImage(cleanValue)
    ) {
        return ''
    }

    return cleanValue
}

const getStockLocationProviderCode = (
    location: ProductDetailStockLocation
) => {
    /*
     * source_provider representa la identidad real.
     * provider.code puede seguir llegando como local
     * mientras exista el adaptador legacy del backend.
     */
    return normalizeText(
        location.source_provider ||
        location.provider?.code
    ).toLowerCase()
}

const isControlledStockLocation = (
    location: ProductDetailStockLocation | null | undefined
) => {
    return (
        location?.stock_controlled === true ||
        location?.stock_controlled === 1 ||
        String(location?.stock_controlled ?? '').toLowerCase() === 'true'
    )
}


const isImmediateProviderCode = (code: unknown) => {
    const normalized =
        normalizeText(code).toLowerCase()

    return (
        normalized === 'kyte' ||
        normalized === 'local'
    )
}

const mapVariantToVariation = ({
    product,
    variant,
    isImmediate,
    mainDisplayImage,
    imagekitImages,
    imageUrls,
    promoImages,
}: {
    product: ProductDetailRaw
    variant: ProductDetailVariant
    isImmediate: boolean
    mainDisplayImage: string
    imagekitImages: string[]
    imageUrls: string[]
    promoImages: PromoImages
}): DetailVariation => {
    const locations = getVariantStockLocations(variant)

    const immediateLocation = locations.find((location) => {
        return isImmediateProviderCode(
            getStockLocationProviderCode(location)
        )
    })

    const externalLocations = locations.filter((location) => {
        const code = getStockLocationProviderCode(location)
        return Boolean(code) &&
            !isImmediateProviderCode(code)
    })

    const fallbackExternalLocation =
        externalLocations.find((location) => {
            return getStockLocationProviderCode(location) === 'makito'
        }) ||
        externalLocations.find((location) => {
            return getStockLocationProviderCode(location) === 'promo'
        }) ||
        externalLocations[0] ||
        {}

    const location = isImmediate ? (immediateLocation || fallbackExternalLocation) : (immediateLocation || fallbackExternalLocation)
    const providerCode = getStockLocationProviderCode(location)
    const stockControlled = isControlledStockLocation(location)
    const hasKnownStock =
        stockControlled &&
        location.available_stock !== null &&
        location.available_stock !== undefined
    const stockFisico = hasKnownStock
        ? Math.max(0, Number(location.available_stock) || 0)
        : 0
    const stockTransito = Math.max(0, Number(location.incoming_transit) || 0)
    const variantImageUrls = imagekitImages.length > 0 ? imagekitImages : imageUrls
    const variantImage = resolveVariantImage(product, variant, variantImageUrls, promoImages) || mainDisplayImage

    const disponibilidadLabel =
        isImmediateProviderCode(providerCode)
            ? (
                !stockControlled
                    ? 'Disponibilidad por confirmar'
                    : (stockFisico > 0 ? 'Inmediata' : 'Sin stock')
            )
            : (
                location.provider?.default_eta_label ||
                (stockFisico > 0 ? 'Disponible' : 'Sin fecha')
            )

    const fechaLlegada =
        providerCode === 'promo' && stockTransito > 0
            ? 'En tránsito'
            : (
                isImmediateProviderCode(providerCode)
                    ? (
                        !stockControlled
                            ? 'Disponibilidad por confirmar'
                            : (stockFisico > 0 ? 'Inmediata' : 'Sin stock')
                    )
                    : (
                        location.dynamic_eta_label ||
                        location.provider?.default_eta_label ||
                        'Sin fecha'
                    )
            )

    return {
        variantId: variant.id ?? null,
        immediateVariantId:
            isImmediateProviderCode(providerCode)
                ? (variant.id ?? null)
                : null,
        color: String(variant.color || ''),
        colorCode: getColorHex(variant.color || ''),
        colorImage: variantImage,
        image: variantImage,
        sku: String(variant.sku || ''),
        size: String(variant.size || '-'),
        base_price: variant.base_price ?? null,
        currency: variant.currency ?? null,
        stockFisico,
        stockTransito,
        stockControlled,
        stockStatus: location.stock_status || null,
        disponibilidadLabel,
        fechaLlegada,
        providerCode,
        providerName:
            isImmediateProviderCode(providerCode)
                ? 'KYTE'
                : (location.provider?.name || ''),
        stockLocations: locations,
    }
}

const mapImmediateFallbackVariation = ({
    product,
    resolvedSlug,
    mainDisplayImage,
}: {
    product: ProductDetailRaw
    resolvedSlug: string
    mainDisplayImage: string
}): DetailVariation => {
    const stockFisico = Number(
        product.available_stock ||
        product.stock ||
        product.existencia ||
        product.cantidad ||
        0
    )

    return {
        color: product.color || 'S/C',
        colorCode: getColorHex(product.color || ''),
        colorImage: mainDisplayImage,
        image: mainDisplayImage,
        sku: String(product.sku || product.codigo_sac || resolvedSlug),
        size: String(product.size || product.talla || 'S/T'),
        stockFisico,
        stockTransito: 0,
        disponibilidadLabel: stockFisico > 0 ? 'Inmediata' : 'Sin stock',
        fechaLlegada: stockFisico > 0 ? 'Inmediata' : 'Sin stock',
        providerCode: 'kyte',
        providerName: 'KYTE',
    }
}

const mapLaravelToAnvogue = (product: ProductDetailRaw): ExtendedProductType => {
    const isImmediate = isImmediateProduct(product)
    const isDirectKyte = isDirectKyteProduct(product)
    const resolvedSlug = resolveProductSlug(product)
    const resolvedName = resolveProductName(product, isImmediate)
    const { imageUrls, promoImages } = parseProductImages(
        product,
        isDirectKyte
    )
    const parsedRawFeatures = parseFeatures(product.features)
    const imagekitImages = getImageKitImages(
        parsedRawFeatures,
        isDirectKyte
    )

    const imagekitCatalogMain = getImageKitCatalogImage(
        parsedRawFeatures,
        'main',
        isDirectKyte
    )
    const imagekitCatalogHover = getImageKitCatalogImage(
        parsedRawFeatures,
        'hover',
        isDirectKyte
    )

    const catalogImages = Array.from(
        new Set(
            [
                imagekitCatalogMain || imagekitImages[0] || imageUrls[0],
                imagekitCatalogHover || imagekitImages[1] || imageUrls[1],
            ].filter(isValidImageUrl)
        )
    )

    const mainDisplayImage =
        catalogImages[0] ||
        imageUrls[0] ||
        PLACEHOLDER_IMAGE

    const parsedFeatures: ProductFeatureObject = {
        ...parsedRawFeatures,
        _promoImages: promoImages,
        _isImmediate: isImmediate,
        _isDirectKyte: isDirectKyte,
        _rawName: product.name || product.nombre || '',
    } as ProductFeatureObject

    const basePrice = product.variants?.[0]?.base_price
        ? parseFloat(String(product.variants[0].base_price))
        : 0

    let mappedVariations: DetailVariation[] =
        product.variants?.map((variant) =>
            mapVariantToVariation({
                product,
                variant,
                isImmediate,
                mainDisplayImage,
                imagekitImages,
                imageUrls,
                promoImages,
            })
        ) || []

    if (isImmediate && mappedVariations.length === 0) {
        mappedVariations = [
            mapImmediateFallbackVariation({
                product,
                resolvedSlug,
                mainDisplayImage,
            }),
        ]
    }

    return {
        id: resolvedSlug || String(product.id || resolvedName),
        backendId: product.id ?? null,
        name: resolvedName,
        price: basePrice,
        originPrice: basePrice > 0 ? basePrice * 1.2 : 0,
        brand: isImmediate
            ? 'KYTE'
            : (
                product.brand === 'PROMO'
                    ? 'Premium'
                    : (
                        product.brand === 'MAKITO'
                            ? 'EcoLine'
                            : (product.brand || 'Producto')
                    )
            ),
        category: 'Promocional',
        images: imageUrls,
        thumbImage:
            catalogImages.length > 1
                ? [catalogImages[0], catalogImages[1]]
                : [catalogImages[0] || imageUrls[0] || PLACEHOLDER_IMAGE],
        rate: 5,
        quantity: mappedVariations.reduce((sum, variation) => sum + (variation.stockFisico || 0), 0),
        description: product.description || product.descripcion || 'Producto promocional de alta calidad',
        slug: resolvedSlug || String(product.id || resolvedName),
        variation: mappedVariations,
        features: parsedFeatures,
        variants: product.variants || [],
        categories: Array.isArray(product.categories) ? product.categories : [],
        type: 'General',
        gender: 'Unisex',
        sizes: ['S/T'],
        action: 'add to cart',
        sold: 0,
        quantityPurchase: 1,
        new: false,
        sale: false,
    }
}

const normalizeStockSku = (value: unknown) => {
    return String(value || '').trim().toUpperCase()
}

const findSnapshotVariant = (
    variants: ProductStockSnapshotVariant[],
    variantId: unknown,
    sku: unknown
) => {
    const normalizedId = String(variantId ?? '').trim()
    const normalizedSku = normalizeStockSku(sku)

    return variants.find((variant) => {
        const candidateId = String(variant.variant_id ?? '').trim()
        const candidateSku = normalizeStockSku(variant.sku)

        return (
            Boolean(normalizedId) && candidateId === normalizedId
        ) || (
            Boolean(normalizedSku) && candidateSku === normalizedSku
        )
    })
}

const normalizeSnapshotVariant = (
    variant: ProductStockSnapshotVariant
): ProductDetailVariant => {
    const locations = Array.isArray(variant.stock_locations)
        ? variant.stock_locations
        : []

    return {
        id: variant.variant_id ?? null,
        sku: variant.sku || '',
        color: variant.color || '',
        size: variant.size || null,
        total_aggregated_stock: Number(variant.total_aggregated_stock) || 0,
        stockLocations: locations,
        stock_locations: locations,
    }
}

const mergeRawVariants = (
    currentVariants: ProductDetailVariant[] | undefined,
    snapshotVariants: ProductStockSnapshotVariant[]
): ProductDetailVariant[] => {
    const current = Array.isArray(currentVariants) ? currentVariants : []

    if (current.length === 0) {
        return snapshotVariants.map(normalizeSnapshotVariant)
    }

    return current.map((variant) => {
        const snapshot = findSnapshotVariant(
            snapshotVariants,
            variant.id,
            variant.sku
        )

        if (!snapshot) return variant

        const locations = Array.isArray(snapshot.stock_locations)
            ? snapshot.stock_locations
            : []

        return {
            ...variant,
            id: variant.id ?? snapshot.variant_id ?? null,
            total_aggregated_stock:
                Number(snapshot.total_aggregated_stock) || 0,
            stockLocations: locations,
            stock_locations: locations,
        }
    })
}

const getRelevantStockLocations = (
    variation: DetailVariation,
    locations: ProductDetailStockLocation[]
) => {
    const preferredProvider = normalizeText(variation.providerCode).toLowerCase()
    const matchingLocations = preferredProvider
        ? locations.filter((location) => {
              return getStockLocationProviderCode(location) === preferredProvider
          })
        : []

    return matchingLocations.length > 0 ? matchingLocations : locations
}

const mergeDetailVariations = (
    variations: DetailVariation[],
    snapshotVariants: ProductStockSnapshotVariant[]
): DetailVariation[] => {
    return variations.map((variation) => {
        const snapshot = findSnapshotVariant(
            snapshotVariants,
            variation.variantId,
            variation.sku
        )

        if (!snapshot) return variation

        const locations = Array.isArray(snapshot.stock_locations)
            ? snapshot.stock_locations
            : []
        const relevantLocations = getRelevantStockLocations(variation, locations)
        const firstLocation = relevantLocations[0] || locations[0] || {}
        const providerCode = getStockLocationProviderCode(firstLocation) ||
            normalizeText(variation.providerCode).toLowerCase()
        const stockFisico = relevantLocations.reduce(
            (sum, location) => sum + Math.max(0, Number(location.available_stock) || 0),
            0
        )
        const stockTransito = relevantLocations.reduce(
            (sum, location) => sum + Math.max(0, Number(location.incoming_transit) || 0),
            0
        )
        const disponibilidadLabel = isImmediateProviderCode(providerCode)
            ? (stockFisico > 0 ? 'Inmediata' : 'Sin stock')
            : (
                firstLocation.provider?.default_eta_label ||
                (stockFisico > 0 ? 'Disponible' : 'Sin fecha')
            )
        const fechaLlegada = providerCode === 'promo' && stockTransito > 0
            ? 'En tránsito'
            : isImmediateProviderCode(providerCode)
                ? (stockFisico > 0 ? 'Inmediata' : 'Sin stock')
                : (
                    firstLocation.dynamic_eta_label ||
                    firstLocation.provider?.default_eta_label ||
                    'Sin fecha'
                )

        return {
            ...variation,
            variantId: variation.variantId ?? snapshot.variant_id ?? null,
            stockFisico,
            stockTransito,
            disponibilidadLabel,
            fechaLlegada,
            providerCode: firstLocation.provider?.code || variation.providerCode || '',
            providerName: firstLocation.provider?.name || variation.providerName || '',
            stockLocations: locations,
        }
    })
}

const mergeLinkedImmediateProducts = (
    currentItems: unknown[],
    snapshotItems: ProductStockLocalItem[]
): ProductFeatureObject[] => {
    const current = currentItems.filter(isRecord)

    return snapshotItems.map((item) => {
        const itemId = String(item.id ?? '').trim()
        const itemSlug = normalizeText(item.slug)
        const existing = current.find((candidate) => {
            const candidateId = String(candidate.id ?? '').trim()
            const candidateSlug = normalizeText(candidate.slug)

            return (
                Boolean(itemId) && candidateId === itemId
            ) || (
                Boolean(itemSlug) && candidateSlug === itemSlug
            )
        }) || {}
        const snapshotVariants = Array.isArray(item.variants)
            ? item.variants
            : []
        const existingVariants = Array.isArray(existing.variants)
            ? existing.variants.filter(isRecord) as ProductDetailVariant[]
            : []

        return {
            ...existing,
            ...item,
            variants: mergeRawVariants(existingVariants, snapshotVariants),
        } as unknown as ProductFeatureObject
    })
}

const mergeProductStockSnapshot = (
    product: ExtendedProductType,
    snapshot: ProductStockSnapshot
): ExtendedProductType => {
    const snapshotVariants = Array.isArray(snapshot.variants)
        ? snapshot.variants
        : []
    const nextVariations = mergeDetailVariations(
        product.variation,
        snapshotVariants
    )
    const currentFeatures = isRecord(product.features)
        ? product.features
        : {}
    const immediateInventory =
        snapshot.immediate_inventory ||
        {}
    const snapshotImmediateItems = Array.isArray(immediateInventory.items)
        ? immediateInventory.items
        : []
    const currentImmediateItems = Array.isArray(currentFeatures._linkedImmediateProducts)
        ? currentFeatures._linkedImmediateProducts
        : []

    return {
        ...product,
        quantity: nextVariations.reduce(
            (sum, variation) => sum + Math.max(0, Number(variation.stockFisico) || 0),
            0
        ),
        variation: nextVariations,
        variants: mergeRawVariants(product.variants, snapshotVariants),
        features: {
            ...currentFeatures,
            _linkedImmediateProducts: mergeLinkedImmediateProducts(
                currentImmediateItems,
                snapshotImmediateItems
            ),
            _hasImmediate: Boolean(immediateInventory.has_match),
            _immediateStockTotal: Number(immediateInventory.total_stock) || 0,
        } as ProductFeatureObject,
    }
}

const normalizeLinkedImmediateProducts = (items: unknown[]): ProductFeatureObject[] => {
    return items
        .filter(isRecord)
        .map((item) => item as ProductFeatureObject)
}

const buildMainProductFromResponse = (response: ProductDetailResponse | null): ExtendedProductType | null => {
    const productRaw = response?.product

    if (!productRaw) {
        return null
    }

    const immediateInventory =
        response?.immediate_inventory ||
        {}
    const linkedImmediateProductsRaw = Array.isArray(immediateInventory.items)
        ? immediateInventory.items
        : []

    const mainProduct = mapLaravelToAnvogue(productRaw)

    mainProduct.features = {
        ...(mainProduct.features || {}),
        _linkedImmediateProducts: normalizeLinkedImmediateProducts(linkedImmediateProductsRaw),
        _hasImmediate: Boolean(immediateInventory.has_match),
        _immediateStockTotal: Number(immediateInventory.total_stock) || 0,
    } as ProductFeatureObject

    return mainProduct
}

const buildInitialCatalogData = (response: ProductDetailResponse | null): ExtendedProductType[] => {
    const mainProduct = buildMainProductFromResponse(response)
    return mainProduct ? [mainProduct] : []
}

export default function ProductoClient({
    slug,
    initialProductResponse,
}: ProductoClientProps) {
    const initialDetailResponse = isProductDetailResponse(initialProductResponse)
        ? initialProductResponse
        : null

    const [catalogData, setCatalogData] = useState<ExtendedProductType[]>(() =>
        buildInitialCatalogData(initialDetailResponse)
    )
    const [isLoading, setIsLoading] = useState(() => !initialDetailResponse?.product)

    const activeRequestRef = useRef(0)
    const refreshedProductIdsRef = useRef<Set<string>>(new Set())

    useEffect(() => {
        if (!slug) return

        const requestId = activeRequestRef.current + 1
        activeRequestRef.current = requestId

        const fetchData = async () => {
            const hasInitialProduct = Boolean(initialDetailResponse?.product)

            if (!hasInitialProduct) {
                setIsLoading(true)
            }

            try {
                const mainProductResponse = initialDetailResponse || await getProductDetail(slug)

                if (activeRequestRef.current !== requestId) return

                const mainProduct = buildMainProductFromResponse(mainProductResponse)

                if (!mainProduct) {
                    throw new Error('La respuesta del backend no contiene el producto')
                }

                let relatedProducts: ExtendedProductType[] = []

                try {
                    const relatedSourceProduct = mainProductResponse?.product

                    if (relatedSourceProduct) {
                        const relatedItems = await loadRelatedProducts(
                            relatedSourceProduct,
                            slug,
                            4,
                        )

                        if (activeRequestRef.current !== requestId) return

                        relatedProducts = relatedItems
                            .map(mapLaravelToAnvogue)
                            .filter((relatedProduct, index, source) => {
                                const key = String(
                                    relatedProduct?.slug ||
                                    relatedProduct?.id ||
                                    '',
                                ).trim()

                                if (!key) return false

                                return source.findIndex((candidate) => {
                                    const candidateKey = String(
                                        candidate?.slug ||
                                        candidate?.id ||
                                        '',
                                    ).trim()

                                    return candidateKey === key
                                }) === index
                            })
                            .slice(0, 4)
                    }
                } catch (relatedError) {
                    console.error('Error cargando productos relacionados:', relatedError)
                }

                if (activeRequestRef.current !== requestId) return

                setCatalogData((currentCatalog) => {
                    const currentMain = currentCatalog[0]
                    const sameProduct = Boolean(currentMain) && (
                        String(currentMain.backendId ?? '') === String(mainProduct.backendId ?? '') ||
                        currentMain.slug === mainProduct.slug
                    )

                    return [sameProduct ? currentMain : mainProduct, ...relatedProducts]
                })
            } catch (error) {
                if (activeRequestRef.current === requestId) {
                    console.error('Error cargando detalle:', error)
                    setCatalogData([])
                }
            } finally {
                if (activeRequestRef.current === requestId) {
                    setIsLoading(false)
                }
            }
        }

        fetchData()
    }, [slug, initialDetailResponse])

    const currentBackendProductId =
        catalogData[0]?.backendId ?? initialDetailResponse?.product?.id ?? null

    useEffect(() => {
        if (currentBackendProductId === null || currentBackendProductId === undefined) {
            return
        }

        const productId = String(currentBackendProductId).trim()

        const refreshedProductIds = refreshedProductIdsRef.current

        if (!productId || refreshedProductIds.has(productId)) {
            return
        }

        refreshedProductIds.add(productId)
        const controller = new AbortController()
        let requestFinished = false

        const applySnapshot = (snapshot: ProductStockSnapshot | null | undefined) => {
            if (!snapshot || controller.signal.aborted) return

            setCatalogData((currentCatalog) => {
                if (currentCatalog.length === 0) return currentCatalog

                const [mainProduct, ...relatedProducts] = currentCatalog
                const mainBackendId = String(mainProduct.backendId ?? '').trim()
                const snapshotProductId = String(snapshot.product_id ?? productId).trim()

                if (mainBackendId && mainBackendId !== snapshotProductId) {
                    return currentCatalog
                }

                return [
                    mergeProductStockSnapshot(mainProduct, snapshot),
                    ...relatedProducts,
                ]
            })
        }

        const refreshStock = async () => {
            const currentResponse = await fetchProductStock({
                productId,
                method: 'GET',
                signal: controller.signal,
            })

            applySnapshot(currentResponse?.stock)

            if (currentResponse?.stock?.refresh_required === false) {
                return
            }

            const refreshResponse = await fetchProductStock({
                productId,
                method: 'POST',
                signal: controller.signal,
            })

            applySnapshot(refreshResponse?.stock)

            if (!['queued', 'locked', 'refreshing'].includes(String(refreshResponse?.status))) {
                return
            }

            for (const delay of [3000, 7000, 12000]) {
                await waitForStockPoll(delay, controller.signal)

                const polledResponse = await fetchProductStock({
                    productId,
                    method: 'GET',
                    signal: controller.signal,
                })

                applySnapshot(polledResponse?.stock)

                if (polledResponse?.stock?.refresh_required === false) {
                    break
                }
            }
        }

        void refreshStock()
            .catch((error: unknown) => {
                if (
                    error instanceof DOMException &&
                    error.name === 'AbortError'
                ) {
                    return
                }

                // La actualización es silenciosa: se conserva el último stock conocido.
            })
            .finally(() => {
                requestFinished = true
            })

        return () => {
            controller.abort()

            if (!requestFinished) {
                refreshedProductIds.delete(productId)
            }
        }
    }, [currentBackendProductId, slug])

    if (isLoading) {
        return <ProductDetailSkeleton />
    }

    if (catalogData.length === 0) {
        return (
            <div className="min-h-[70vh] bg-[#F5F9FB] px-5 py-20">
                <div className="mx-auto max-w-xl rounded-[28px] border border-[#DCE6EA] bg-white p-10 text-center shadow-[0_14px_40px_rgba(31,46,83,.08)]">
                    <div className="text-2xl font-black text-[#1F2E53]">Producto no encontrado</div>
                    <p className="mt-3 text-[#6B7A90]">Este producto no está disponible en el catálogo en este momento.</p>
                    <a href="/productos" className="mt-6 inline-flex rounded-xl bg-[#21577B] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#1F2E53]">
                        Volver al catálogo
                    </a>
                </div>
            </div>
        )
    }

    return (
        <>
            <header className="bg-[#071A33] pb-6 text-white">
                <BtlHeroHeader />
            </header>

            <Default
                data={catalogData as ProductType[]}
                productId={catalogData[0].id}
            />

            <BtlCatalogFooter />
        </>
    )
}
