const normalizeBasePath = (value: unknown): string => {
  const clean = String(value ?? '').trim()

  if (!clean || clean === '/') return ''

  return `/${clean.replace(/^\/+|\/+$/g, '')}`
}

export const APP_BASE_PATH = normalizeBasePath(
  process.env.NEXT_PUBLIC_APP_BASE_PATH,
)

/**
 * Use only for browser/server URLs that Next does NOT prefix automatically:
 * raw fetch() calls, local API routes and public/ assets.
 *
 * Do not use for next/link or router.push() internal routes because Next's
 * basePath support already handles those.
 */
export const appPath = (path: string): string => {
  const clean = String(path || '').trim()

  if (!clean) return APP_BASE_PATH || '/'

  if (/^https?:\/\//i.test(clean)) return clean

  const normalized = clean.startsWith('/') ? clean : `/${clean}`

  if (!APP_BASE_PATH) return normalized

  if (
    normalized === APP_BASE_PATH ||
    normalized.startsWith(`${APP_BASE_PATH}/`)
  ) {
    return normalized
  }

  return `${APP_BASE_PATH}${normalized}`
}

export const appAsset = appPath
