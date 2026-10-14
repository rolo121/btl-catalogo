import { faqGroups } from '@/lib/faqData'

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://btlmarketing.com.ni/catalogo'

const organizationId = `${siteUrl}/#organization`
const websiteId = `${siteUrl}/#website`

export type BreadcrumbJsonLdItem = {
  name: string
  url: string
}

export function absoluteUrl(path = '/') {
  if (path.startsWith('http')) return path

  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${siteUrl}${normalizedPath}`
}

export function buildOrganizationJsonLd() {
  return {
    '@id': organizationId,
    '@type': ['Organization', 'LocalBusiness'],
    name: 'BTL Marketing',
    url: siteUrl,
    logo: absoluteUrl('/images/btl/logo_btl.png'),
    description:
      'Catálogo de productos promocionales de BTL Marketing para empresas, marcas, campañas y eventos en Nicaragua.',
    telephone: '+505 2251 8021',
  }
}

export function buildWebsiteJsonLd() {
  return {
    '@id': websiteId,
    '@type': 'WebSite',
    name: 'BTL Marketing | Promocionales',
    url: siteUrl,
    publisher: {
      '@id': organizationId,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/catalogo?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }
}

export function buildBreadcrumbJsonLd(items: BreadcrumbJsonLdItem[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.url),
    })),
  }
}

export function buildWebPageJsonLd({
  name,
  description,
  url,
}: {
  name: string
  description: string
  url: string
}) {
  return {
    '@type': 'WebPage',
    name,
    description,
    url: absoluteUrl(url),
    isPartOf: {
      '@id': websiteId,
    },
    publisher: {
      '@id': organizationId,
    },
  }
}

export function buildCollectionPageJsonLd({
  name,
  description,
  url,
}: {
  name: string
  description: string
  url: string
}) {
  return {
    '@type': 'CollectionPage',
    name,
    description,
    url: absoluteUrl(url),
    isPartOf: {
      '@id': websiteId,
    },
    publisher: {
      '@id': organizationId,
    },
  }
}

export type FAQJsonLdItem = {
  question: string
  answer: string
}

export function buildFAQPageJsonLd(items?: FAQJsonLdItem[]) {
  const faqItems =
    items ||
    faqGroups.flatMap((group) =>
      group.questions.map((item) => ({
        question: item.question,
        answer: item.answer,
      })),
    )

  return {
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}
