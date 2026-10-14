'use client'

import { appAsset } from '@/lib/appPaths'
import React, { Suspense, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import BtlPageHero from "@/components/BTL/BtlPageHero"
import BtlCatalogFooter from "@/components/BTL/BtlCatalogFooter"
import { useRouter, useSearchParams } from 'next/navigation'
import { ProductType } from '@/type/ProductType'
import CatalogProductCard from '@/components/BTL/CatalogProductCard'
import HandlePagination from '@/components/Other/HandlePagination'
import * as Icon from '@phosphor-icons/react/dist/ssr'
import { getCatalogJson } from '@/lib/catalogClient'

type SearchProvider = {
    code?: string | null
    default_eta_label?: string | null
}

type SearchStockLocation = {
    available_stock?: string | number | null
    incoming_transit?: string | number | null
    dynamic_eta_label?: string | null
    source_provider?: string | null
    provider?: SearchProvider | null
    [key: string]: unknown
}

type SearchVariant = {
    base_price?: string | number | null
    total_aggregated_stock?: string | number | null
    available_stock?: string | number | null
    color?: string | null
    size?: string | null
    sku?: string | null
    disponibilidadLabel?: string | null
    fechaLlegada?: string | null
    stockLocations?: SearchStockLocation[] | null
    stock_locations?: SearchStockLocation[] | null
    [key: string]: unknown
}

type SearchFeatures = {
    imagekit?: {
        images?: unknown[]
        catalog?: {
            main?: unknown
            hover?: unknown
        }
    }
    [key: string]: unknown
}

type SearchLaravelProduct = {
    id?: string | number | null
    slug?: string | null
    type?: string | null
    name?: string | null
    gender?: string | null
    brand?: string | null
    source_brand?: string | null
    sold?: string | number | null
    total_stock?: string | number | null
    quantityPurchase?: string | number | null
    description?: string | null
    new?: unknown
    image?: unknown
    main_image?: unknown
    thumbnail?: unknown
    images?: unknown
    features?: string | SearchFeatures | null
    variants?: SearchVariant[] | null
}

type SearchCatalogResponse = {
    data?: SearchLaravelProduct[]
    total?: string | number | null
    last_page?: string | number | null
}

const fallbackImage = appAsset('/images/product-placeholder.webp')

const isRecord = (value: unknown): value is Record<string, unknown> => {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
}

const normalizeImage = (img: unknown): string | null => {
    if (!img) return null

    if (typeof img === 'string') {
        const clean = img.trim()
        return clean && clean !== 'null' && clean !== 'undefined' ? clean : null
    }

    if (isRecord(img)) {
        const clean = String(
            img.url || img.image || img.src || img.path || '',
        ).trim()

        return clean && clean !== 'null' && clean !== 'undefined' ? clean : null
    }

    return null
}

const isValidImage = (value: string | null): value is string => {
    return typeof value === 'string' && value.trim() !== ''
}

const collectImages = (rawImages: unknown): string[] => {
    if (!rawImages) return []

    if (Array.isArray(rawImages)) {
        return rawImages.map(normalizeImage).filter(isValidImage)
    }

    if (isRecord(rawImages)) {
        const mainImages = Array.isArray(rawImages.mainImages)
            ? rawImages.mainImages
            : []

        const variantImages = Array.isArray(rawImages.variantImages)
            ? rawImages.variantImages
            : []

        const gallery = Array.isArray(rawImages.gallery)
            ? rawImages.gallery
            : []

        const images = Array.isArray(rawImages.images)
            ? rawImages.images
            : []

        return [
            rawImages.url,
            rawImages.image,
            rawImages.src,
            rawImages.main,
            rawImages.main_image,
            ...mainImages,
            ...variantImages,
            ...gallery,
            ...images,
        ]
            .map(normalizeImage)
            .filter(isValidImage)
    }

    return []
}

const parseProductImages = (laravelProduct: SearchLaravelProduct): string[] => {
    let imageUrls = [fallbackImage]

    try {
        const imgs =
            typeof laravelProduct.images === 'string'
                ? (JSON.parse(laravelProduct.images) as unknown)
                : laravelProduct.images

        const mergedImages = [
            laravelProduct.image,
            laravelProduct.main_image,
            laravelProduct.thumbnail,
            ...collectImages(imgs),
        ]
            .map(normalizeImage)
            .filter(isValidImage)

        const validImages = Array.from(new Set(mergedImages))

        if (validImages.length > 0) {
            imageUrls = validImages
        }
    } catch (error) {
        console.error(
            'Error parseando imágenes del producto:',
            laravelProduct.slug,
            error,
        )
    }

    return imageUrls
}

const parseFeatures = (
    features: SearchLaravelProduct['features'],
): SearchFeatures => {
    if (!features) return {}

    if (typeof features === 'string') {
        try {
            const parsed = JSON.parse(features) as unknown
            return isRecord(parsed) ? (parsed as SearchFeatures) : {}
        } catch {
            return {}
        }
    }

    return isRecord(features) ? (features as SearchFeatures) : {}
}

const getImageKitImages = (features: SearchFeatures) => {
    return Array.isArray(features.imagekit?.images)
        ? features.imagekit.images
              .filter(
                  (url): url is string =>
                      typeof url === 'string' &&
                      url.trim() !== '' &&
                      !url.includes('/areas/'),
              )
        : []
}

const getVariantStockLocations = (
    variant: SearchVariant,
): SearchStockLocation[] => {
    if (Array.isArray(variant.stockLocations)) return variant.stockLocations
    if (Array.isArray(variant.stock_locations)) return variant.stock_locations
    return []
}

const getSearchStockLocationProviderCode = (
    location: SearchStockLocation,
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
    product: SearchLaravelProduct,
) => {
    const sourceBrand = String(
        product.source_brand || '',
    )
        .trim()
        .toUpperCase()

    const legacyBrand = String(
        product.brand || '',
    )
        .trim()
        .toUpperCase()

    return (
        sourceBrand === 'KYTE' ||
        legacyBrand === 'LOCAL' ||
        legacyBrand === 'KYTE'
    )
}


const sumVariantStock = (
    variants: SearchVariant[] | null | undefined,
    stockKey: 'available_stock' | 'incoming_transit',
) => {
    return (
        variants?.reduce((sum, variant) => {
            const locations = getVariantStockLocations(variant)

            const variantStock = locations.reduce(
                (locSum, loc) => locSum + Number(loc?.[stockKey] || 0),
                0,
            )

            return sum + variantStock
        }, 0) || 0
    )
}

const cleanImmediateProductName = (name?: string | null) => {
    if (!name) return ''
    return name.replace(/^[\d-]+\s*-\s*/, '').trim()
}

const getCommercialBrand = (
    product: SearchLaravelProduct,
) => {
    if (isImmediateProduct(product)) return 'KYTE'
    if (product.brand === 'PROMO') return 'Premium'
    if (product.brand === 'MAKITO') return 'EcoLine'

    return product.brand || 'Producto'
}

const mapSearchProduct = (laravelProduct: SearchLaravelProduct): ProductType => {
    const imageUrls = parseProductImages(laravelProduct)
    const parsedFeatures = parseFeatures(laravelProduct.features)

    const imagekitImages = getImageKitImages(parsedFeatures)

    const imagekitCatalogMain =
        typeof parsedFeatures.imagekit?.catalog?.main === 'string'
            ? parsedFeatures.imagekit.catalog.main
            : ''

    const imagekitCatalogHover =
        typeof parsedFeatures.imagekit?.catalog?.hover === 'string'
            ? parsedFeatures.imagekit.catalog.hover
            : ''

    const catalogImages = [
        imagekitCatalogMain || imagekitImages[0] || imageUrls[0],
        imagekitCatalogHover || imagekitImages[1] || imageUrls[1],
    ].filter(
        (url): url is string =>
            typeof url === 'string' &&
            url.trim() !== '' &&
            !url.includes('/areas/'),
    )

    const mainDisplayImage = catalogImages[0] || imageUrls[0] || fallbackImage

    const basePrice = laravelProduct.variants?.[0]?.base_price
        ? parseFloat(String(laravelProduct.variants[0].base_price))
        : 0

    const isPromo = laravelProduct.brand === 'PROMO'
    const isImmediate = isImmediateProduct(laravelProduct)

    const promoAvailableStock = isPromo
        ? sumVariantStock(laravelProduct.variants, 'available_stock')
        : 0

    const promoTransitStock = isPromo
        ? sumVariantStock(laravelProduct.variants, 'incoming_transit')
        : 0

    const makitoAvailableStock = !isPromo
        ? sumVariantStock(laravelProduct.variants, 'available_stock')
        : 0

    const makitoTransitStock = !isPromo
        ? sumVariantStock(laravelProduct.variants, 'incoming_transit')
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

    const comercialBrand = getCommercialBrand(laravelProduct)

    return {
        id: String(laravelProduct.slug || laravelProduct.id || ''),
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
                : [catalogImages[0] || imageUrls[0] || fallbackImage],
        stockFisico: isImmediate
            ? immediateAvailableStock
            : isPromo
                ? promoAvailableStock
                : makitoAvailableStock,
        stockTransito: isImmediate
            ? 0
            : isPromo
                ? promoTransitStock
                : makitoTransitStock,
        description:
            laravelProduct.description ||
            'Producto promocional de alta calidad',
        action: 'add to cart',
        slug: String(laravelProduct.slug || ''),
        features: parsedFeatures as ProductType['features'],
        variants: (laravelProduct.variants || []) as ProductType['variants'],
        variation: (laravelProduct.variants?.map((variant) => {
            const stockLocations = getVariantStockLocations(variant)

            const providerStockLocations = isImmediate
                ? stockLocations
                : stockLocations.filter((loc) => {
                      const providerCode =
                          getSearchStockLocationProviderCode(loc)

                      return !isImmediateProviderCode(
                          providerCode
                      )
                  })

            const variantAvailableStock = providerStockLocations.reduce(
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
                colorCode: String(variant?.color || 'Sin color'),
                colorImage: mainDisplayImage,
                image: mainDisplayImage,
                stockFisico: variantAvailableStock,
                stockTransito: variantTransitStock,
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

const BuscarClientContent = () => {
    const router = useRouter()
    const searchParams = useSearchParams()

    const query = searchParams.get('query') || ''
    const pageParam = Number(searchParams.get('page') || 1)

    const [searchKeyword, setSearchKeyword] = useState<string>(query)
    const [currentPage, setCurrentPage] = useState<number>(pageParam)
    const [products, setProducts] = useState<ProductType[]>([])
    const [totalProducts, setTotalProducts] = useState<number>(0)
    const [totalPages, setTotalPages] = useState<number>(1)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const previousQueryRef = useRef<string>(query)

    useEffect(() => {
        setSearchKeyword(query)
        setCurrentPage(pageParam)
    }, [query, pageParam])

    const handleSearch = (value: string) => {
        const cleanValue = value.trim()

        if (!cleanValue) return

        router.push(`/buscar?query=${encodeURIComponent(cleanValue)}`)
    }

    const handlePageChange = (selected: number) => {
        const nextPage = selected + 1

        setCurrentPage(nextPage)
        router.push(`/buscar?query=${encodeURIComponent(query)}&page=${nextPage}`)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    useEffect(() => {
        if (!query.trim()) {
            setProducts([])
            setTotalProducts(0)
            setTotalPages(1)
            return
        }

        const fetchSearchResults = async () => {
            setIsLoading(true)

            try {
                const params = new URLSearchParams({
                    search: query.trim(),
                    page: String(currentPage),
                })

                const url = `${process.env.NEXT_PUBLIC_API_URL}/catalog?${params.toString()}`
                const json = await getCatalogJson<SearchCatalogResponse>(url)
                const sourceProducts = Array.isArray(json.data) ? json.data : []
                const mappedProducts = sourceProducts.map(mapSearchProduct)

                setProducts(mappedProducts)
                setTotalProducts(Number(json.total || mappedProducts.length || 0))
                setTotalPages(Number(json.last_page || 1))
            } catch (error) {
                console.error('Error cargando resultados de búsqueda:', error)
                setProducts([])
                setTotalProducts(0)
                setTotalPages(1)
            } finally {
                setIsLoading(false)
            }
        }

        const queryChanged = previousQueryRef.current !== query
        const timeoutId = setTimeout(() => {
            fetchSearchResults().finally(() => {
                previousQueryRef.current = query
            })
        }, queryChanged ? 300 : 0)

        return () => clearTimeout(timeoutId)
    }, [query, currentPage])

    return (
        <>
      <BtlPageHero
                eyebrow="BTL Marketing · Catálogo"
                title="Buscar"
                accent="productos"
                description="Encuentra rápidamente promocionales por nombre, color, categoría o código."
                type="search"
            />

<div className="shop-product bg-[#F5F9FB] lg:py-16 md:py-14 py-10">
                <div className="container">
                    <div className="heading flex flex-col items-center">
                        <h2 className="heading4 text-center">
                            {query.trim()
                                ? `${totalProducts} resultado${totalProducts === 1 ? '' : 's'} para "${query}"`
                                : 'Buscá productos promocionales'}
                        </h2>

                        <div className="input-block lg:w-1/2 sm:w-3/5 w-full md:h-[52px] h-[44px] sm:mt-8 mt-5">
                            <div className="w-full h-full relative">
                                <input
                                    type="text"
                                    placeholder="Buscar por producto, color, categoría o código..."
                                    className="caption1 w-full h-full pl-4 md:pr-[150px] pr-32 rounded-xl border border-line"
                                    value={searchKeyword}
                                    onChange={(e) => setSearchKeyword(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchKeyword)}
                                />
                                <button
                                    className="button-main absolute top-1 bottom-1 right-1 flex items-center justify-center"
                                    onClick={() => handleSearch(searchKeyword)}
                                >
                                    Buscar
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="list-product-block relative md:pt-10 pt-6">
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                            <h3 className="heading6">
                                {query.trim() ? `Búsqueda: ${query}` : 'Ingresá un término para buscar'}
                            </h3>

                            <Link href="/productos" className="caption1 text-text-secondary hover:text-black duration-300 flex items-center gap-1">
                                Ver catálogo completo
                                <Icon.CaretRight size={14} />
                            </Link>
                        </div>

                        {isLoading ? (
                            <div className="w-full flex justify-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
                            </div>
                        ) : (
                            <div className="list-product hide-product-sold grid lg:grid-cols-4 sm:grid-cols-3 grid-cols-2 sm:gap-[30px] gap-[20px] mt-5">
                                {!query.trim() ? (
                                    <div className="col-span-full text-center py-10 text-text-secondary">
                                        Escribí una palabra clave para encontrar productos del catálogo.
                                    </div>
                                ) : products.length === 0 ? (
                                    <div className="col-span-full text-center py-10 text-text-secondary">
                                        No encontramos productos relacionados con “{query}”. Probá con otro término o revisá el catálogo completo.
                                    </div>
                                ) : (
                                    products.map((item) => (
                                        <CatalogProductCard
                                            key={item.id}
                                            product={item}
                                        />
                                    ))
                                )}
                            </div>
                        )}

                        {totalPages > 1 && query.trim() && (
                            <div
                                className="list-pagination flex items-center justify-center md:mt-10 mt-7"
                                style={{
                                    opacity: isLoading ? 0.6 : 1,
                                    pointerEvents: isLoading ? 'none' : 'auto',
                                }}
                            >
                                <HandlePagination
                                    pageCount={totalPages}
                                    onPageChange={handlePageChange}
                                    forcePage={currentPage - 1}
                                />
                            </div>
                        )}
                    </div>
                </div>
                </div>
            <BtlCatalogFooter />
        </>
    )
}

const BuscarClient = () => {
    return (
        <Suspense fallback={<div className="py-20 text-center">Cargando búsqueda...</div>}>
            <BuscarClientContent />
        </Suspense>
    )
}

export default BuscarClient
