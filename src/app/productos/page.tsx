import type { Metadata } from 'next'
import CatalogoClient from '../catalogo/CatalogoClient'
import {
  fetchCatalogInitialCategories,
  fetchCatalogInitialData,
} from '@/lib/catalogServer'
import JsonLd from '@/components/SEO/JsonLd'
import { buildBreadcrumbJsonLd, buildCollectionPageJsonLd } from '@/lib/structuredData'

export const metadata: Metadata = {
  title: 'Catálogo de productos promocionales',
  description:
    'Explora el catálogo BTL de productos promocionales, regalos corporativos y artículos personalizados para empresas, marcas y eventos en Nicaragua.',
  alternates: {
    canonical: '/productos',
  },
  openGraph: {
    title: 'Catálogo de productos promocionales | BTL Marketing',
    description:
      'Encuentra productos promocionales, artículos corporativos y regalos empresariales para cotizar en Nicaragua.',
    url: '/productos',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

type CatalogSearchParams = {
  type?: string
  color?: string
  brand?: string
  search?: string
  commercial_category?: string
  page?: string
}

type PageProps = {
  searchParams?: Promise<CatalogSearchParams>
}

export default async function Page({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) || {}

  const initialQuery = {
    page: Number(resolvedSearchParams.page || 1),
    type: resolvedSearchParams.type || null,
    color: resolvedSearchParams.color || null,
    brand: resolvedSearchParams.brand || null,
    search: resolvedSearchParams.search || null,
    commercialCategory: resolvedSearchParams.commercial_category || null,
  }

  const [initialCatalog, initialCategories] = await Promise.all([
    fetchCatalogInitialData(initialQuery),
    fetchCatalogInitialCategories(initialQuery),
  ])

  const catalogJsonLd = [
    buildCollectionPageJsonLd({
      name: 'Catálogo de productos promocionales',
      description:
        'Explora el catálogo de productos promocionales, regalos corporativos y artículos personalizados para empresas, marcas y eventos en Nicaragua.',
      url: '/productos',
    }),
    buildBreadcrumbJsonLd([
      { name: 'Inicio', url: '/' },
      { name: 'Catálogo', url: '/productos' },
    ]),
  ]

  return (
    <>
      <JsonLd data={catalogJsonLd} />
      <CatalogoClient
        initialCatalog={initialCatalog}
        initialCategories={initialCategories}
      />
    </>
  )
}
