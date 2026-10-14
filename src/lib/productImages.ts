import { appAsset } from '@/lib/appPaths'
export const PRODUCT_PLACEHOLDER_IMAGE =
  appAsset('/images/product-placeholder.webp')


/**
 * Algunos proveedores ya entregan imágenes procesadas por un CDN.
 * Evitamos que Next.js vuelva a descargar/transformar esas URLs,
 * lo que puede provocar timeouts del optimizador de imágenes.
 */
export const shouldBypassNextImageOptimization = (
  src: unknown,
): boolean => {
  if (typeof src !== 'string') return false

  const value = src.trim().toLowerCase()

  return (
    value.includes('ik.imagekit.io/makito/') ||
    value.includes('imgresources.makito.es/')
  )
}

type ImageKitFeatures = {
  imagekit?: {
    catalog?: {
      main?: unknown
      hover?: unknown
    }
    images?: unknown
  }
}

type ProductImageVariant = {
  image?: unknown
  colorImage?: unknown
}

type ProductImageSource = {
  cartImage?: unknown
  features?: unknown
  thumbImage?: unknown
  variation?: unknown
  images?: unknown
}

const isRecord = (
  value: unknown,
): value is Record<string, unknown> => {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  )
}

const isValidImageUrl = (
  value: unknown,
): value is string => {
  return (
    typeof value === 'string' &&
    value.trim() !== '' &&
    !value.includes('/areas/')
  )
}

const parseFeatures = (
  features: unknown,
): ImageKitFeatures | null => {
  if (!features) return null

  if (typeof features === 'string') {
    try {
      const parsed = JSON.parse(features) as unknown
      return isRecord(parsed)
        ? (parsed as ImageKitFeatures)
        : null
    } catch {
      return null
    }
  }

  if (isRecord(features)) {
    return features as ImageKitFeatures
  }

  return null
}

const getVariationImages = (
  variation: unknown,
): string[] => {
  if (!Array.isArray(variation)) return []

  return variation
    .filter(isRecord)
    .flatMap((variant): unknown[] => {
      const item = variant as ProductImageVariant
      return [item.image, item.colorImage]
    })
    .filter(isValidImageUrl)
}

export const getProductMainImage = (
  product: ProductImageSource,
): string => {
  const features = parseFeatures(product?.features)

  const imagekitCatalogMain = isValidImageUrl(
    features?.imagekit?.catalog?.main,
  )
    ? features.imagekit.catalog.main
    : ''

  const imagekitImages = Array.isArray(
    features?.imagekit?.images,
  )
    ? features.imagekit.images.filter(isValidImageUrl)
    : []

  const thumbImages = Array.isArray(product?.thumbImage)
    ? product.thumbImage.filter(isValidImageUrl)
    : []

  const variationImages = getVariationImages(
    product?.variation,
  )

  const originalImages = Array.isArray(product?.images)
    ? product.images.filter(isValidImageUrl)
    : []

  return (
    imagekitCatalogMain ||
    imagekitImages[0] ||
    thumbImages[0] ||
    variationImages[0] ||
    originalImages[0] ||
    PRODUCT_PLACEHOLDER_IMAGE
  )
}

/**
 * Imagen estable para una línea del carrito.
 *
 * Prioriza el snapshot guardado y después la variante seleccionada.
 * Solo utiliza la imagen general del producto como respaldo.
 */
export const getCartItemImage = (
  product: ProductImageSource,
): string => {
  const cartImage = isValidImageUrl(product?.cartImage)
    ? product.cartImage
    : ''

  const variationImages = getVariationImages(
    product?.variation,
  )

  return (
    cartImage ||
    variationImages[0] ||
    getProductMainImage(product)
  )
}
