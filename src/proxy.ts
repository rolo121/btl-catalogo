import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, '')
const HISTORICAL_PRODUCT_PREFIX = 'LOC-'

const PRODUCT_ROUTE_PREFIXES = [
  '/producto/',
  '/cotizar/',
] as const

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

async function resolveCanonicalProductSlug(
  slug: string,
): Promise<string | null> {
  if (!API_BASE_URL) return null

  try {
    const response = await fetch(
      `${API_BASE_URL}/catalog/${encodeURIComponent(slug)}`,
      {
        cache: 'no-store',
        headers: {
          Accept: 'application/json',
        },
      },
    )

    if (!response.ok) return null

    const payload = (await response.json()) as unknown

    if (
      !isRecord(payload) ||
      !isRecord(payload.product)
    ) {
      return null
    }

    const canonicalSlug = String(
      payload.product.slug || '',
    ).trim()

    if (!canonicalSlug || canonicalSlug === slug) {
      return null
    }

    return canonicalSlug
  } catch {
    /*
     * Si el API no está disponible, no bloqueamos la navegación.
     * La propia página manejará 404/error según corresponda.
     */
    return null
  }
}

export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  /*
   * Canonicalización del antiguo contrato LOCAL.
   *
   * La URL pública conserva la selección comercial como KYTE;
   * el catálogo traducirá KYTE a availability=immediate antes
   * de consultar Laravel.
   */
  const isCatalogRoute =
    pathname === '/productos' ||
    pathname.startsWith('/categoria/')

  if (isCatalogRoute) {
    const legacyProvider = String(
      searchParams.get('provider') || '',
    )
      .trim()
      .toLowerCase()

    const legacyBrand = String(
      searchParams.get('brand') || '',
    )
      .trim()
      .toLowerCase()

    if (
      legacyProvider === 'local' ||
      legacyBrand === 'local'
    ) {
      const redirectUrl = request.nextUrl.clone()

      redirectUrl.searchParams.delete('provider')
      redirectUrl.searchParams.set('brand', 'KYTE')

      return NextResponse.redirect(redirectUrl, 308)
    }
  }

  /*
   * Compatibilidad histórica anterior ya existente.
   */
  if (pathname === '/product/default') {
    const productId = searchParams.get('id')
    const redirectUrl = request.nextUrl.clone()

    if (productId) {
      redirectUrl.pathname =
        `/producto/${encodeURIComponent(productId)}`
      redirectUrl.search = ''

      return NextResponse.redirect(redirectUrl, 308)
    }

    redirectUrl.pathname = '/productos'
    redirectUrl.search = ''

    return NextResponse.redirect(redirectUrl, 308)
  }

  /*
   * Los LOC-* dejaron de ser identidad canónica.
   *
   * Solo las URLs históricas pasan por esta consulta.
   * Las URLs KYT-*, MAK-*, etc. continúan directamente
   * sin realizar un fetch adicional desde Proxy.
   */
  const routePrefix = PRODUCT_ROUTE_PREFIXES.find(
    (prefix) => pathname.startsWith(prefix),
  )

  if (!routePrefix) {
    return NextResponse.next()
  }

  const rawSlug = pathname.slice(routePrefix.length)

  if (!rawSlug || rawSlug.includes('/')) {
    return NextResponse.next()
  }

  let slug = rawSlug

  try {
    slug = decodeURIComponent(rawSlug)
  } catch {
    return NextResponse.next()
  }

  if (
    !slug
      .trim()
      .toUpperCase()
      .startsWith(HISTORICAL_PRODUCT_PREFIX)
  ) {
    return NextResponse.next()
  }

  const canonicalSlug =
    await resolveCanonicalProductSlug(slug)

  if (!canonicalSlug) {
    return NextResponse.next()
  }

  const redirectUrl = request.nextUrl.clone()

  redirectUrl.pathname =
    `${routePrefix}${canonicalSlug}`

  return NextResponse.redirect(redirectUrl, 308)
}

export const config = {
  matcher: [
    '/productos',
    '/categoria/:path*',
    '/product/default',
    '/producto/:path*',
    '/cotizar/:path*',
  ],
}
