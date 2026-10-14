import type { ProductType, ProductVariant } from '@/type/ProductType'
import {
  formatNicaraguaPhone,
  normalizeNicaraguaPhone,
} from '@/lib/formValidation'
import { getCartItemImage } from '@/lib/productImages'

type CartQuoteVariation = ProductType['variation'][number] & {
  id?: string | number | null
  providerCode?: string | null
  providerName?: string | null
  disponibilidadLabel?: string | null
}

type CartQuoteProduct = ProductType & {
  databaseId?: string | number | null
  product_id?: string | number | null
  catalog_product_id?: string | number | null
  numericId?: string | number | null
  providerType?: string | null
  isImmediateVariant?: boolean

  // Compatibilidad temporal de lectura.
  isLocalVariant?: boolean

  cartImage?: string | null
  selectedSize?: string | null
  selectedColor?: string | null
  variation?: CartQuoteVariation[]
  variants?: ProductVariant[]
}

export type CartQuoteCustomerData = {
  fullName: string
  taxId: string
  email: string
  phone: string
  city: string
  address: string
  observations: string
}

export type CartQuoteAccountData = {
  create: boolean
  password: string
  passwordConfirmation: string
  termsAccepted: boolean
}

export type CartQuoteItemPayload = {
  product_variant_id: number | null
  product_name: string
  sku: string | null
  color: string | null
  size: string | null
  quantity: number
  unit_price: null
  line_total: null
  marking_area: null
  marking_technique: null
  marking_area_image: null
  image: string | null
  extra_data: {
    source: 'cart_checkout'
    cart_item_id: string
    product_slug: string | null
    catalog_product_id: number | null
    provider: string | null
    brand: string | null
    category: string | null
    selected_color: string | null
    selected_size: string | null
    stock_fisico: number | null
    stock_transito: number | null
    stock_controlled: boolean | null
    stock_status: string | null
    fecha_llegada: string | null
    image: string | null
  }
}

export type CartQuotePayload = {
  product_id: null
  product_name: string
  product_image: string | null
  provider: null
  source_site: 'btl'
  client_name: string
  company: string | null
  email: string
  phone: string | null
  city: string | null
  address: string | null
  contact_person: string
  observations: string | null
  currency: 'NIO'
  create_account: boolean
  password?: string
  password_confirmation?: string
  terms_accepted?: boolean
  items: CartQuoteItemPayload[]
}

export type CartQuoteSubmissionResponse = {
  message?: string
  account_created?: boolean
  authenticated?: boolean
  mail_queued?: {
    welcome?: boolean
    quote?: boolean
  }
  data?: {
    id?: number
    quote_number?: string
    customer_user_id?: number | null
    items?: unknown[]
  }
}

const cleanText = (value: unknown) => String(value ?? '').trim()

const nullableText = (value: unknown) => {
  const text = cleanText(value)
  return text || null
}

const finiteNumber = (value: unknown): number | null => {
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

const positiveInteger = (value: unknown, fallback = 1) => {
  const number = Math.trunc(Number(value))
  return Number.isFinite(number) && number > 0 ? number : fallback
}

const sameText = (left: unknown, right: unknown) => {
  const normalizedLeft = cleanText(left).toLocaleLowerCase('es')
  const normalizedRight = cleanText(right).toLocaleLowerCase('es')

  return normalizedLeft !== '' && normalizedLeft === normalizedRight
}

const selectedVariation = (
  product: CartQuoteProduct,
): CartQuoteVariation | null => {
  const variations = Array.isArray(product.variation)
    ? product.variation
    : []

  if (variations.length === 0) return null
  if (variations.length === 1) return variations[0]

  const selectedColor = cleanText(product.selectedColor)
  const selectedSize = cleanText(product.selectedSize)
  const cartItemId = cleanText(product.id)

  return (
    variations.find((variant) => sameText(variant.sku, cartItemId)) ||
    variations.find(
      (variant) =>
        (!selectedColor || sameText(variant.color, selectedColor)) &&
        (!selectedSize || sameText(variant.size, selectedSize)),
    ) ||
    variations.find((variant) => sameText(variant.color, selectedColor)) ||
    variations[0]
  )
}

const databaseVariant = (
  product: CartQuoteProduct,
  variation: CartQuoteVariation | null,
): ProductVariant | null => {
  const variants = Array.isArray(product.variants)
    ? product.variants
    : []

  if (variants.length === 0) return null

  const selectedSku = cleanText(variation?.sku || product.id)
  const selectedColor = cleanText(
    variation?.color || product.selectedColor,
  )
  const selectedSize = cleanText(
    variation?.size || product.selectedSize,
  )

  return (
    variants.find((variant) => sameText(variant.sku, selectedSku)) ||
    variants.find(
      (variant) =>
        (!selectedColor || sameText(variant.color, selectedColor)) &&
        (!selectedSize || sameText(variant.size, selectedSize)),
    ) ||
    (variants.length === 1 ? variants[0] : null)
  )
}

const resolveCatalogProductId = (
  product: CartQuoteProduct,
): number | null => {
  const rawId =
    product.databaseId ??
    product.product_id ??
    product.catalog_product_id ??
    product.numericId

  return finiteNumber(rawId)
}

const normalizeProvider = (value: unknown): string | null => {
  const normalized = cleanText(value).toUpperCase()

  if (!normalized) return null

  /*
   * LOCAL fue la identidad pública temporal del inventario
   * inmediato. Operacionalmente ese inventario ahora es KYTE.
   */
  if (
    normalized === 'LOCAL' ||
    normalized === 'IMMEDIATE' ||
    normalized === 'KYTE'
  ) {
    return 'KYTE'
  }

  if (normalized === 'PREMIUM' || normalized === 'PROMO') {
    return 'PROMO'
  }

  if (normalized === 'ECOLINE' || normalized === 'MAKITO') {
    return 'MAKITO'
  }

  return normalized
}

const resolveProvider = (
  product: CartQuoteProduct,
  variation: CartQuoteVariation | null,
) => {
  const explicitProvider = normalizeProvider(
    variation?.providerCode || product.providerType,
  )

  if (explicitProvider) return explicitProvider

  const slug = cleanText(product.slug || product.id).toUpperCase()

  if (slug.startsWith('MAK-')) return 'MAKITO'

  /*
   * La modalidad inmediata pertenece operativamente a KYTE.
   * isLocalVariant queda únicamente como lectura legacy.
   */
  if (
    product.isImmediateVariant ||
    product.isLocalVariant
  ) {
    return 'KYTE'
  }

  return normalizeProvider(product.brand)
}

const normalizePhoneForPayload = (value: string) => {
  const digits = normalizeNicaraguaPhone(value)
  return digits ? `+505 ${formatNicaraguaPhone(digits)}` : null
}

export const buildCartQuoteItems = (
  products: CartQuoteProduct[],
): CartQuoteItemPayload[] => {
  return products.map((product) => {
    const variation = selectedVariation(product)
    const variant = databaseVariant(product, variation)
    const image = nullableText(getCartItemImage(product))
    const selectedColor = nullableText(
      product.selectedColor || variation?.color || variant?.color,
    )
    const selectedSize = nullableText(
      product.selectedSize || variation?.size || variant?.size,
    )
    const sku = nullableText(
      variation?.sku || variant?.sku || product.id,
    )

    return {
      product_variant_id: finiteNumber(
        variation?.variantId ??
        variation?.immediateVariantId ??
        variant?.id
      ),
      product_name:
        cleanText(product.name) || 'Producto promocional',
      sku,
      color: selectedColor,
      size: selectedSize,
      quantity: positiveInteger(product.quantity),
      unit_price: null,
      line_total: null,
      marking_area: null,
      marking_technique: null,
      marking_area_image: null,
      image,
      extra_data: {
        source: 'cart_checkout',
        cart_item_id: cleanText(product.id),
        product_slug: nullableText(product.slug),
        catalog_product_id: resolveCatalogProductId(product),
        provider: resolveProvider(product, variation),
        brand: nullableText(product.brand),
        category: nullableText(product.category),
        selected_color: selectedColor,
        selected_size: selectedSize,
        stock_fisico: finiteNumber(variation?.stockFisico),
        stock_transito: finiteNumber(variation?.stockTransito),
        stock_controlled:
          typeof variation?.stockControlled === 'boolean'
            ? variation.stockControlled
            : null,
        stock_status: nullableText(variation?.stockStatus),
        fecha_llegada: nullableText(variation?.fechaLlegada),
        image,
      },
    }
  })
}

export const buildCartQuotePayload = ({
  products,
  customer,
  account,
}: {
  products: CartQuoteProduct[]
  customer: CartQuoteCustomerData
  account?: CartQuoteAccountData
}): CartQuotePayload => {
  const items = buildCartQuoteItems(products)
  const firstImage = items.find((item) => item.image)?.image || null
  const linesLabel = items.length === 1 ? 'producto' : 'productos'

  const createAccount = Boolean(account?.create)

  return {
    // Se mantiene nulo porque una solicitud de carrito puede contener
    // variantes pertenecientes a productos distintos.
    product_id: null,
    product_name: `Solicitud multiproducto (${items.length} ${linesLabel})`,
    product_image: firstImage,
    provider: null,
    source_site: 'btl',
    client_name: cleanText(customer.fullName),
    company: nullableText(customer.taxId),
    email: cleanText(customer.email).toLowerCase(),
    phone: normalizePhoneForPayload(customer.phone),
    city: nullableText(customer.city),
    address: nullableText(customer.address),
    contact_person: cleanText(customer.fullName),
    observations: nullableText(customer.observations),
    currency: 'NIO',
    create_account: createAccount,
    ...(createAccount
      ? {
          password: account?.password || '',
          password_confirmation:
            account?.passwordConfirmation || '',
          terms_accepted: Boolean(account?.termsAccepted),
        }
      : {}),
    items,
  }
}
