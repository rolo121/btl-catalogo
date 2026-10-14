import { appAsset } from '@/lib/appPaths'
import {
  ProductFeatureObject,
  ProductType,
  ProductVariant,
} from '@/type/ProductType'
import {
  getCommercialCategoriesCacheKey,
} from '@/lib/commercialCategories'
import type { CommercialCategoryItem } from '@/lib/commercialCategories'

export interface CatalogQuery {
  page?: number
  type?: string | null
  color?: string | null
  brand?: string | null
  search?: string | null
  commercialCategory?: string | null
}

export interface CatalogInitialData {
  products: ProductType[]
  totalPages: number
  totalProducts: number
  cacheKey: string
}

export interface CatalogInitialCategoriesData {
  categories: CommercialCategoryItem[]
  loaded: boolean
  provider: string | null
  color: string | null
  search: string
  cacheKey: string
}


interface RawProvider {
  id?: string | number | null
  code?: string | null
  name?: string | null
  default_eta_label?: string | null
}

interface RawStockLocation {
  id?: string | number | null
  provider_sku?: string | null
  available_stock?: number | string | null
  incoming_transit?: number | string | null
  dynamic_eta_label?: string | null
  source_provider?: string | null
  provider?: RawProvider | null
  [key: string]: unknown
}

interface RawVariant {
  id?: string | number
  sku?: string | null
  provider_sku?: string | null
  color?: string | null
  colorCode?: string | null
  colorImage?: string | null
  image?: string | null
  size?: string | null
  base_price?: number | string | null
  currency?: string | null
  total_aggregated_stock?: number | string | null
  available_stock?: number | string | null
  disponibilidadLabel?: string | null
  fechaLlegada?: string | null
  stockLocations?: RawStockLocation[]
  stock_locations?: RawStockLocation[]
  [key: string]: unknown
}

interface RawCategory {
  slug?: string | null
  name?: string | null
}

interface RawImageObject {
  url?: unknown
  image?: unknown
  src?: unknown
}

interface RawProductImages {
  mainImages?: unknown[]
  variantImages?: unknown[]
}

interface RawLaravelProduct {
  id?: string | number
  slug: string
  type?: string | null
  name?: string | null
  gender?: string | null
  new?: boolean | number | string | null
  brand?: string | null
  source_brand?: string | null
  sold?: number | string | null
  total_stock?: number | string | null
  quantityPurchase?: number | string | null
  description?: string | null
  images?: string | unknown[] | RawProductImages | null
  features?: string | ProductFeatureObject | null
  variants?: RawVariant[]
  categories?: RawCategory[]
  codigo_sac?: string | null
  categoria_producto_nombre?: string | null
  clase_producto_nombre?: string | null
}

interface CatalogApiResponse {
  data?: RawLaravelProduct[]
  last_page?: number | string
  total?: number | string
}


const API_URL = process.env.NEXT_PUBLIC_API_URL
const CATALOG_REVALIDATE_SECONDS = 300

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

const normalizePage = (page?: number) => {
  const value = Number(page || 1)
  return Number.isFinite(value) && value > 0 ? value : 1
}

export const getCatalogCacheKey = (query: CatalogQuery) => {
  const params = new URLSearchParams()
  const page = normalizePage(query.page)

  params.set('page', String(page))
  if (query.type) params.set('type', query.type)
  if (query.color) params.set('color', query.color)
  if (query.brand) params.set('brand', query.brand)
  if (query.search?.trim()) params.set('search', query.search.trim())
  if (query.commercialCategory) {
    params.set('commercial_category', query.commercialCategory)
  }

  return params.toString()
}

const getCommercialCategoriesProvider = (
  brand?: string | null,
): string | null => {
  if (brand === 'Premium') return 'promo'
  if (brand === 'EcoLine') return 'makito'

  const normalizedBrand = String(brand || '').trim().toUpperCase()

  if (normalizedBrand === 'KYTE' || normalizedBrand === 'LOCAL') {
    return 'kyte'
  }

  return null
}

const appendCatalogLineFilter = (
  params: URLSearchParams,
  brand?: string | null,
) => {
  if (brand === 'Premium') {
    params.set('provider', 'promo')
    return
  }

  if (brand === 'EcoLine') {
    params.set('provider', 'makito')
    return
  }

  const normalizedBrand =
    String(brand || '').trim().toUpperCase()

  if (
    normalizedBrand === 'KYTE' ||
    normalizedBrand === 'LOCAL'
  ) {
    params.set('availability', 'immediate')
    return
  }

  if (brand) params.set('brand', brand)
}


const normalizeImage = (img: unknown): string | null => {
  if (!img) return null

  if (typeof img === 'string') {
    return img.trim() !== '' ? img : null
  }

  if (!isRecord(img)) return null

  const imageObject = img as RawImageObject
  const value = imageObject.url || imageObject.image || imageObject.src

  return typeof value === 'string' && value.trim() !== '' ? value : null
}

const cleanImmediateProductName = (name?: string | null) => {
  if (!name) return ''
  return name.replace(/^[\d-]+\s*-\s*/, '').trim()
}

const parseProductImages = (images: RawLaravelProduct['images']): string[] => {
  let imageUrls = [appAsset('/images/product-placeholder.webp')]

  try {
    const imgs =
      typeof images === 'string'
        ? (JSON.parse(images) as unknown)
        : images

    if (Array.isArray(imgs) && imgs.length > 0) {
      const validImages = imgs.map(normalizeImage).filter(Boolean) as string[]

      if (validImages.length > 0) {
        imageUrls = validImages
      }
    } else if (isRecord(imgs)) {
      const mainImages = Array.isArray(imgs.mainImages) ? imgs.mainImages : []
      const fallbackImages = Array.isArray(imgs.variantImages)
        ? imgs.variantImages
        : []

      const mergedImages = [...mainImages, ...fallbackImages]
        .map(normalizeImage)
        .filter(Boolean) as string[]

      if (mergedImages.length > 0) {
        imageUrls = Array.from(new Set(mergedImages))
      }
    }
  } catch {
    return imageUrls
  }

  return imageUrls
}

const parseFeatures = (
  features: RawLaravelProduct['features'],
  slug: string,
): ProductFeatureObject => {
  try {
    const parsed =
      typeof features === 'string'
        ? (JSON.parse(features) as unknown)
        : features || {}

    return isRecord(parsed) ? (parsed as ProductFeatureObject) : {}
  } catch (error) {
    console.error('Error parseando features SSR:', slug, error)
    return {}
  }
}

const getVariantStockLocations = (variant: RawVariant): RawStockLocation[] => {
  if (Array.isArray(variant.stockLocations)) return variant.stockLocations
  if (Array.isArray(variant.stock_locations)) return variant.stock_locations
  return []
}

const getRawStockLocationProviderCode = (
  location: RawStockLocation,
) => {
  return String(
    location?.source_provider ||
      location?.provider?.code ||
      '',
  )
    .trim()
    .toLowerCase()
}

const isImmediateProviderCode = (code: unknown) => {
  const normalized = String(code || '')
    .trim()
    .toLowerCase()

  return normalized === 'kyte' || normalized === 'local'
}

const isImmediateProduct = (
  product: RawLaravelProduct,
) => {
  const sourceBrand = String(
    product.source_brand || '',
  )
    .trim()
    .toUpperCase()

  const brand = String(product.brand || '')
    .trim()
    .toUpperCase()

  return (
    sourceBrand === 'KYTE' ||
    brand === 'KYTE' ||
    brand === 'LOCAL'
  )
}


const sumVariantLocations = (
  variants: RawVariant[] | undefined,
  stockKey: 'available_stock' | 'incoming_transit',
) => {
  return (
    variants?.reduce((sum, variant) => {
      const locations = getVariantStockLocations(variant)

      return (
        sum +
        locations.reduce(
          (locSum, loc) => locSum + Number(loc?.[stockKey] || 0),
          0,
        )
      )
    }, 0) || 0
  )
}

export const mapLaravelProductToProduct = (
  laravelProduct: RawLaravelProduct,
): ProductType => {
  const imageUrls = parseProductImages(laravelProduct.images)
  const parsedFeatures = parseFeatures(laravelProduct.features, laravelProduct.slug)

  const imagekit = isRecord(parsedFeatures.imagekit)
    ? parsedFeatures.imagekit
    : null

  const imagekitImages = Array.isArray(imagekit?.images)
    ? imagekit.images.filter(
        (url): url is string => typeof url === 'string' && url.trim() !== '',
      )
    : []

  const imagekitCatalog = isRecord(imagekit?.catalog)
    ? imagekit.catalog
    : null

  const imagekitCatalogMain =
    typeof imagekitCatalog?.main === 'string'
      ? imagekitCatalog.main
      : ''

  const imagekitCatalogHover =
    typeof imagekitCatalog?.hover === 'string'
      ? imagekitCatalog.hover
      : ''

  const catalogImages = [
    imagekitCatalogMain || imagekitImages[0] || imageUrls[0],
    imagekitCatalogHover || imagekitImages[1] || imageUrls[1],
  ].filter(
    (url): url is string => typeof url === 'string' && url.trim() !== '',
  )

  const basePrice = laravelProduct.variants?.[0]?.base_price
    ? parseFloat(String(laravelProduct.variants[0].base_price))
    : 0

  const isPromo = laravelProduct.brand === 'PROMO'
  const isImmediate = isImmediateProduct(laravelProduct)

  const promoAvailableStock = isPromo
    ? sumVariantLocations(laravelProduct.variants, 'available_stock')
    : 0

  const promoTransitStock = isPromo
    ? sumVariantLocations(laravelProduct.variants, 'incoming_transit')
    : 0

  const makitoAvailableStock = !isPromo
    ? sumVariantLocations(laravelProduct.variants, 'available_stock')
    : 0

  const makitoTransitStock = !isPromo
    ? sumVariantLocations(laravelProduct.variants, 'incoming_transit')
    : 0

  const immediateAvailableStock = isImmediate
    ? Number(laravelProduct.total_stock || 0) ||
      laravelProduct.variants?.reduce(
        (sum, variant) =>
          sum +
          Number(
            variant?.available_stock ||
              variant?.total_aggregated_stock ||
              0,
          ),
        0,
      ) ||
      0
    : 0

  const totalStock = isImmediate
    ? immediateAvailableStock
    : isPromo
      ? promoAvailableStock
      : makitoAvailableStock

  const comercialBrand =
    laravelProduct.brand === 'PROMO'
      ? 'Premium'
      : laravelProduct.brand === 'MAKITO'
        ? 'EcoLine'
        : isImmediate
          ? 'KYTE'
          : laravelProduct.brand || 'Producto'

  return {
    id: laravelProduct.slug,
    type: laravelProduct.type || comercialBrand || 'Producto',
    name: isImmediate
      ? cleanImmediateProductName(laravelProduct.name)
      : laravelProduct.name || '',
    gender: laravelProduct.gender || comercialBrand || 'general',
    new: Boolean(laravelProduct.new),
    sale: false,
    rate: 5,
    price: 0,
    originPrice: basePrice > 0 ? basePrice * 1.2 : 0,
    brand: comercialBrand,
    category: comercialBrand,
    sold: Number(laravelProduct.sold || 0),
    quantity: totalStock,
    quantityPurchase: Number(laravelProduct.quantityPurchase || 1),
    sizes: Array.from(
      new Set(
        (laravelProduct.variants || [])
          .map((variant) => String(variant?.size || 'S/T'))
          .filter(Boolean),
      ),
    ),
    images: imageUrls,
    thumbImage:
      catalogImages.length > 1
        ? [catalogImages[0], catalogImages[1]]
        : [catalogImages[0] || imageUrls[0]],
    stockFisico: isImmediate
      ? immediateAvailableStock
      : isPromo
        ? promoAvailableStock
        : makitoAvailableStock,
    stockTransito: isImmediate ? 0 : isPromo ? promoTransitStock : makitoTransitStock,
    description:
      laravelProduct.description || 'Producto promocional de alta calidad',
    action: 'add to cart',
    slug: laravelProduct.slug,
    features: parsedFeatures,
    variants: (laravelProduct.variants || []) as ProductVariant[],
    variation: (laravelProduct.variants?.map((variant) => {
      const stockLocations = getVariantStockLocations(variant)

      const providerStockLocations = isImmediate
        ? stockLocations
        : stockLocations.filter((loc) => {
            const providerCode =
              getRawStockLocationProviderCode(loc)

            return !isImmediateProviderCode(
              providerCode
            )
          })

      const controlledStockLocations = providerStockLocations.filter((loc) => {
        return (
          loc?.stock_controlled === true ||
          loc?.stock_controlled === 1 ||
          String(loc?.stock_controlled ?? '').toLowerCase() === 'true'
        )
      })

      const variantAvailableStock = controlledStockLocations.reduce(
        (sum, loc) => sum + Number(loc?.available_stock || 0),
        0,
      )

      const variantTransitStock = providerStockLocations.reduce(
        (sum, loc) => sum + Number(loc?.incoming_transit || 0),
        0,
      )

      const firstLocation = providerStockLocations[0]

      return {
        color: String(variant?.color || 'Sin color'),
        size: String(variant?.size || 'S/T'),
        sku: String(variant?.sku || ''),
        variantId: variant?.id ?? null,
        immediateVariantId:
          isImmediate ? (variant?.id ?? null) : null,
        colorCode: String(variant?.color || 'Sin color'),
        colorImage: catalogImages[0] || imageUrls[0],
        image: catalogImages[0] || imageUrls[0],
        stockFisico: variantAvailableStock,
        stockTransito: variantTransitStock,
        stockControlled: controlledStockLocations.length > 0,
        stockStatus:
          String(firstLocation?.stock_status || '').trim() || null,
        disponibilidadLabel:
          String(variant?.disponibilidadLabel || '').trim() ||
          String(firstLocation?.dynamic_eta_label || '').trim() ||
          String(firstLocation?.provider?.default_eta_label || '').trim() ||
          'Sin stock',
        fechaLlegada:
          String(variant?.fechaLlegada || '').trim() ||
          String(firstLocation?.dynamic_eta_label || '').trim() ||
          String(firstLocation?.provider?.default_eta_label || '').trim() ||
          '',
        stockLocations,
      }
    }) || []) as ProductType['variation'],
  }
}

export const fetchCatalogInitialData = async (
  query: CatalogQuery,
): Promise<CatalogInitialData> => {
  const page = normalizePage(query.page)
  const cacheKey = getCatalogCacheKey({ ...query, page })

  if (!API_URL) {
    return { products: [], totalPages: 1, totalProducts: 0, cacheKey }
  }

  try {
    const params = new URLSearchParams()

    params.set('page', String(page))

    if (query.type) params.set('type', query.type)
    if (query.color) params.set('color', query.color)

    appendCatalogLineFilter(params, query.brand)

    if (query.search?.trim()) params.set('search', query.search.trim())
    if (query.commercialCategory) {
      params.set('commercial_category', query.commercialCategory)
    }

    const url = `${API_URL}/catalog?${params.toString()}`

    const res = await fetch(url, {
      next: {
        revalidate: CATALOG_REVALIDATE_SECONDS,
        tags: ['catalog'],
      },
    })

    if (res.status === 429) {
      return {
        products: [],
        totalPages: 1,
        totalProducts: 0,
        cacheKey,
      }
    }

    if (!res.ok) {
      throw new Error(`Error al cargar catálogo SSR: ${res.status}`)
    }

    const json = (await res.json()) as CatalogApiResponse
    const sourceProducts = Array.isArray(json.data) ? json.data : []

    const products = sourceProducts.map((product) =>
      mapLaravelProductToProduct(product),
    )

    return {
      products,
      totalPages: Number(json.last_page || 1),
      totalProducts: Number(json.total || products.length || 0),
      cacheKey,
    }
  } catch (error) {
    console.error('Error preparando catálogo inicial SSR:', error)
    return { products: [], totalPages: 1, totalProducts: 0, cacheKey }
  }
}

export const fetchCatalogInitialCategories = async (
  query: CatalogQuery,
): Promise<CatalogInitialCategoriesData> => {
  const provider = getCommercialCategoriesProvider(query.brand)
  const color = query.color || null
  const search = String(query.search || '').trim()
  const filters = { color, search }
  const cacheKey = getCommercialCategoriesCacheKey(provider, filters)

  if (!API_URL) {
    return {
      categories: [],
      loaded: false,
      provider,
      color,
      search,
      cacheKey,
    }
  }

  try {
    const params = new URLSearchParams()

    if (provider) params.set('provider', provider)
    if (color) params.set('color', color)
    if (search) params.set('search', search)

    const queryString = params.toString()
    const requestUrl = `${API_URL}/commercial-categories${
      queryString ? `?${queryString}` : ''
    }`

    /*
     * Esta petición corre desde Server Components. Debe ser compatible con
     * generateStaticParams() en /categoria/[slug], por lo que no usamos
     * cache: 'no-store'. Los facets dinámicos del cliente continúan usando
     * getCommercialCategories(), que sí consulta en tiempo real al cambiar
     * línea, color o búsqueda.
     */
    const response = await fetch(requestUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      next: { revalidate: CATALOG_REVALIDATE_SECONDS },
    })

    if (!response.ok) {
      throw new Error(
        `No fue posible precargar categorías comerciales (${response.status}).`,
      )
    }

    const json = (await response.json()) as unknown
    let categories: CommercialCategoryItem[] = []

    if (Array.isArray(json)) {
      categories = json as CommercialCategoryItem[]
    } else if (isRecord(json) && Array.isArray(json.data)) {
      categories = json.data as CommercialCategoryItem[]
    }

    return { categories, loaded: true, provider, color, search, cacheKey }
  } catch (error) {
    console.error('Error preparando categorías iniciales SSR:', error)
    return {
      categories: [],
      loaded: false,
      provider,
      color,
      search,
      cacheKey,
    }
  }
}
