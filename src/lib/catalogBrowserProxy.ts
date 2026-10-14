import { appPath } from '@/lib/appPaths'

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "")

export function getCatalogBrowserSafeUrl(url: string): string {
  const normalizedUrl = String(url || "").trim()

  if (!normalizedUrl) return normalizedUrl

  // Server-side requests can continue hitting the production API directly.
  if (typeof window === "undefined") {
    return normalizedUrl
  }

  // Browser-side catalog requests go through the local Next.js proxy.
  // This avoids depending on cross-origin CORS from the remote catalog backend.
  if (API_URL && normalizedUrl.startsWith(API_URL)) {
    const relativePath = normalizedUrl.slice(API_URL.length) || "/"
    return appPath(`/api/catalog-proxy?path=${encodeURIComponent(relativePath)}`)
  }

  return normalizedUrl
}
