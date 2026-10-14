export const COMMERCIAL_SITE = 'btl' as const

export type CommercialSite = typeof COMMERCIAL_SITE

export const withCommercialSitePayload = <T extends Record<string, unknown>>(
  payload: T,
): T & { source_site: CommercialSite } => ({
  ...payload,
  source_site: COMMERCIAL_SITE,
})

export const withCommercialSiteQuery = (path: string): string => {
  const separator = path.includes('?') ? '&' : '?'
  return `${path}${separator}source_site=${encodeURIComponent(COMMERCIAL_SITE)}`
}
