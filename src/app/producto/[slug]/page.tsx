import type { Metadata } from 'next'
import { permanentRedirect } from 'next/navigation'
import ProductoClient from './ProductoClient'
import JsonLd from '@/components/SEO/JsonLd'
import { buildBreadcrumbJsonLd } from '@/lib/structuredData'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://btlmarketing.com.ni/catalogo'
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || ''

type PageProps = {
    params: Promise<{
        slug: string
    }>
}

type ProductSeoCategory = {
    name?: string | null
}

type ProductSeoResponse = {
    product?: ProductSeoData | null
}

type ProductSeoData = {
    slug?: unknown
    name?: unknown
    nombre?: unknown
    title?: unknown
    display_name?: unknown
    descripcion?: unknown
    description?: unknown
    short_description?: unknown
    images?: unknown
    sku?: unknown
    ref?: unknown
    reference?: unknown
    brand?: unknown
    category?: unknown
    categories?: ProductSeoCategory[] | null
    features?: unknown
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
}

async function getProductDetailServer(
    slug: string,
): Promise<ProductSeoResponse | null> {
    if (!apiBaseUrl || !slug) return null

    try {
        const response = await fetch(`${apiBaseUrl}/catalog/${slug}`, {
            next: { revalidate: 300 },
        })

        if (!response.ok) return null

        const json = (await response.json()) as unknown

        return isRecord(json) ? (json as ProductSeoResponse) : null
    } catch {
        return null
    }
}

function cleanText(value: unknown) {
    return String(value || '')
        .replace(/<[^>]*>/g, '')
        .replace(/\s+/g, ' ')
        .trim()
}

function getCanonicalProductSlug(
    product: ProductSeoData,
    requestedSlug: string,
) {
    return cleanText(product.slug) || requestedSlug
}

function getProductName(product: ProductSeoData, slug: string) {
    return cleanText(
        product.name ||
        product.nombre ||
        product.title ||
        product.display_name ||
        product.descripcion ||
        slug,
    )
}

function getProductDescription(product: ProductSeoData, name: string) {
    const features = isRecord(product.features) ? product.features : {}

    const description = cleanText(
        product.description ||
        product.descripcion ||
        product.short_description ||
        features.description,
    )

    const fallbackDescription = `Cotizá ${name} personalizado con BTL Marketing. Producto promocional ideal para empresas, eventos, campañas publicitarias y regalos corporativos.`

    const finalDescription = description || fallbackDescription

    return finalDescription.length > 158
        ? `${finalDescription.slice(0, 155).trim()}...`
        : finalDescription
}

const normalizeImage = (image: unknown): string | null => {
    if (typeof image === 'string') {
        const cleanImage = image.trim()

        if (!cleanImage) return null
        if (cleanImage.includes('/areas/')) return null

        return cleanImage
    }

    if (!isRecord(image)) return null

    const value = image.url || image.image || image.src

    return typeof value === 'string' &&
        value.trim() !== '' &&
        !value.includes('/areas/')
        ? value.trim()
        : null
}

function getProductImage(product: ProductSeoData) {
    let images = product.images

    if (typeof images === 'string') {
        try {
            images = JSON.parse(images) as unknown
        } catch {
            images = []
        }
    }

    if (Array.isArray(images)) {
        const image = images
            .map(normalizeImage)
            .find((item): item is string => Boolean(item))

        if (image) return image
    }

    if (isRecord(images)) {
        const mainImages = Array.isArray(images.mainImages)
            ? images.mainImages
            : []

        const variantImages = Array.isArray(images.variantImages)
            ? images.variantImages
            : []

        const image = [...mainImages, ...variantImages]
            .map(normalizeImage)
            .find((item): item is string => Boolean(item))

        if (image) return image
    }

    return null
}

function buildProductJsonLd(product: ProductSeoData, slug: string) {
    const name = getProductName(product, slug)
    const description = getProductDescription(product, name)
    const image = getProductImage(product)
    const url = `${siteUrl}/producto/${slug}`
    const features = isRecord(product.features) ? product.features : {}

    return {
        '@type': 'Product',
        '@id': `${url}#product`,
        name,
        description,
        image: image ? [image] : undefined,
        url,
        sku:
            cleanText(product.sku) ||
            cleanText(product.ref) ||
            cleanText(product.reference) ||
            slug,
        brand: {
            '@type': 'Brand',
            name: cleanText(product.brand) || 'BTL Marketing',
        },
        category:
            product.categories?.[0]?.name ||
            cleanText(product.category) ||
            cleanText(features.categoria_producto_nombre) ||
            undefined,
    }
}

export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    const { slug } = await params
    const productResponse = await getProductDetailServer(slug)
    const product = productResponse?.product

    if (!product) {
        return {
            title: 'Producto no encontrado',
            description:
                'El producto solicitado no se encuentra disponible en el catálogo de BTL Marketing.',
            alternates: {
                canonical: `/producto/${slug}`,
            },
            robots: {
                index: false,
                follow: false,
            },
        }
    }

    const canonicalSlug = getCanonicalProductSlug(product, slug)
    const name = getProductName(product, canonicalSlug)
    const description = getProductDescription(product, name)
    const image = getProductImage(product)
    const canonical = `/producto/${canonicalSlug}`
    const absoluteUrl = `${siteUrl}${canonical}`

    return {
        title: `${name} personalizado`,
        description,
        alternates: {
            canonical,
        },
        openGraph: {
            title: `${name} personalizado | BTL Marketing`,
            description,
            url: absoluteUrl,
            type: 'website',
            siteName: 'BTL Marketing',
            locale: 'es_NI',
            images: image
                ? [
                      {
                          url: image,
                          width: 1200,
                          height: 630,
                          alt: `${name} personalizado con BTL Marketing`,
                      },
                  ]
                : [],
        },
        twitter: {
            card: 'summary_large_image',
            title: `${name} personalizado | BTL Marketing`,
            description,
            images: image ? [image] : [],
        },
        robots: {
            index: true,
            follow: true,
        },
    }
}

export default async function Page({ params }: PageProps) {
    const { slug } = await params
    const initialProductResponse = await getProductDetailServer(slug)
    const product = initialProductResponse?.product
    const canonicalSlug = product
        ? getCanonicalProductSlug(product, slug)
        : slug

    if (product && canonicalSlug !== slug) {
        permanentRedirect(`/producto/${canonicalSlug}`)
    }

    const productJsonLd = product
        ? buildProductJsonLd(product, canonicalSlug)
        : null
    const productName = product
        ? getProductName(product, canonicalSlug)
        : 'Producto'
    const pageJsonLd = productJsonLd
        ? [
              productJsonLd,
              buildBreadcrumbJsonLd([
                  { name: 'Inicio', url: '/' },
                  { name: 'Catálogo', url: '/productos' },
                  { name: productName, url: `/producto/${canonicalSlug}` },
              ]),
          ]
        : null

    return (
        <>
            {pageJsonLd ? <JsonLd data={pageJsonLd} /> : null}

            <ProductoClient
                slug={canonicalSlug}
                initialProductResponse={initialProductResponse}
            />
        </>
    )
}
