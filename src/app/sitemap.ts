import type { MetadataRoute } from "next"

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://btlmarketing.com.ni/catalogo").replace(/\/$/, "")
const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "")

type SitemapProduct = {
  slug?: string
  updated_at?: string
}

async function getProductsForSitemap(): Promise<SitemapProduct[]> {
  if (!apiUrl) return []

  try {
    const response = await fetch(`${apiUrl}/catalog/sitemap-products`, {
      next: { revalidate: 3600, tags: ["catalog-sitemap"] },
    })

    if (!response.ok) return []

    const json = (await response.json()) as { data?: SitemapProduct[] }

    return Array.isArray(json.data)
      ? json.data.filter((product) => Boolean(product?.slug))
      : []
  } catch {
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const products = await getProductsForSitemap()

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/catalogo`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
  ]

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${siteUrl}/producto/${product.slug}`,
    lastModified: product.updated_at ? new Date(product.updated_at) : now,
    changeFrequency: "weekly",
    priority: 0.8,
  }))

  return [...staticRoutes, ...productRoutes]
}
