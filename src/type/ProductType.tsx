export type ProductFeatureValue =
    | string
    | number
    | boolean
    | null
    | ProductFeatureObject
    | ProductFeatureValue[]

export type ProductFeatureObject = {
    [key: string]: ProductFeatureValue
}

export interface StockProvider {
    id?: string | number
    code?: string
    name?: string
}

export interface StockLocation {
    id?: string | number
    provider_sku?: string
    available_stock?: number | string | null
    incoming_transit?: number | string | null
    stock_controlled?: boolean | number | string | null
    stock_status?: string | null
    source_provider?: string | null
    provider?: StockProvider | null
}

export interface ProductVariant {
    id?: string | number
    sku?: string
    provider_sku?: string
    color?: string | null
    colorCode?: string | null
    colorImage?: string | null
    image?: string | null
    size?: string | null
    base_price?: string | number | null
    currency?: string | null
    total_aggregated_stock?: number | string | null
    stockFisico?: number
    stockTransito?: number
    fechaLlegada?: string
    stockLocations?: StockLocation[]
    stock_locations?: StockLocation[]
}

interface Variation {
    color: string
    colorCode: string
    colorImage: string
    image: string
    sku?: string
    size?: string
    variantId?: string | number | null
    immediateVariantId?: string | number | null
    base_price?: string | number | null
    currency?: string | null
    stockFisico?: number
    stockTransito?: number
    stockControlled?: boolean | null
    stockStatus?: string | null
    disponibilidadLabel?: string
    fechaLlegada?: string
    providerCode?: string | null
    providerName?: string | null
}

export interface ProductType {
    id: string
    category: string
    type: string
    name: string
    gender: string
    new: boolean
    sale: boolean
    rate: number
    price: number
    originPrice: number
    brand: string
    sold: number
    quantity: number
    quantityPurchase: number
    sizes: Array<string>
    variation: Variation[]
    thumbImage: Array<string>
    images: Array<string>
    description: string
    action: string
    slug: string
    features?: ProductFeatureObject | string | null
    variants?: ProductVariant[]
    stockFisico?: number
    stockTransito?: number
}
