import { appPath } from '@/lib/appPaths'

const API_URL = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '')
const BACKEND_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL || ''
).replace(/\/$/, '')

export type ApiFieldErrors = Record<string, string[]>

type ErrorPayload = {
  message?: string
  errors?: ApiFieldErrors
  retry_after?: number | string
}

export class ApiError extends Error {
  status: number
  errors: ApiFieldErrors
  retryAfter: number | null

  constructor(
    message: string,
    status = 500,
    errors: ApiFieldErrors = {},
    retryAfter: number | null = null,
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
    this.retryAfter = retryAfter
  }
}

const buildUrl = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  // En navegador, las solicitudes privadas pasan por Next.js para evitar CORS
  // y mantener las cookies de sesión bajo el mismo origen del catálogo.
  if (typeof window !== 'undefined') {
    return appPath(`/api/backend-proxy?path=${encodeURIComponent(normalizedPath)}`)
  }

  if (!API_URL) {
    throw new ApiError(
      'No se ha configurado NEXT_PUBLIC_API_URL para conectar con el backend.',
      503,
    )
  }

  return `${API_URL}${normalizedPath}`
}

const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') {
    return null
  }

  const cookie = document.cookie
    .split('; ')
    .find((item) => item.startsWith(`${name}=`))

  if (!cookie) {
    return null
  }

  return decodeURIComponent(cookie.substring(name.length + 1))
}

const parseResponse = async (response: Response) => {
  const contentType = response.headers.get('content-type') || ''

  if (!contentType.includes('application/json')) {
    return null
  }

  try {
    return await response.json()
  } catch {
    return null
  }
}

export const apiRequest = async <T>(
  path: string,
  options: RequestInit = {},
): Promise<T> => {
  let response: Response

  const method = (options.method || 'GET').toUpperCase()
  const csrfToken = getCookie('XSRF-TOKEN')

  const headers: HeadersInit = {
    Accept: 'application/json',
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(csrfToken && !['GET', 'HEAD', 'OPTIONS'].includes(method)
      ? { 'X-XSRF-TOKEN': csrfToken }
      : {}),
    ...options.headers,
  }

  try {
    response = await fetch(buildUrl(path), {
      ...options,
      method,
      credentials: 'include',
      headers,
    })
  } catch {
    throw new ApiError(
      'No fue posible conectar con el servidor. Verifica que el backend esté disponible.',
      503,
    )
  }

  const payload = (await parseResponse(response)) as ErrorPayload | T | null

  if (!response.ok) {
    const errorPayload = (payload || {}) as ErrorPayload
    const fallbackMessage =
      response.status === 401
        ? 'La sesión no está activa.'
        : response.status === 403
          ? 'No tienes permiso para realizar esta acción.'
          : response.status === 419
            ? 'La sesión de seguridad venció. Intenta nuevamente.'
            : response.status === 422
              ? 'Revisa los campos indicados.'
              : response.status === 429
                ? 'Has realizado demasiados intentos. Espera un momento y vuelve a intentarlo.'
                : 'No se pudo completar la solicitud.'

    const retryAfterFromPayload = Number(errorPayload.retry_after || 0)
    const retryAfterFromHeader = Number(
      response.headers.get('Retry-After') || 0,
    )
    const retryAfter =
      response.status === 429
        ? Math.max(
            1,
            retryAfterFromPayload || retryAfterFromHeader || 60,
          )
        : null

    throw new ApiError(
      errorPayload.message || fallbackMessage,
      response.status,
      errorPayload.errors || {},
      retryAfter,
    )
  }

  return payload as T
}


export const apiDownload = async (path: string): Promise<Blob> => {
  let response: Response

  try {
    response = await fetch(buildUrl(path), {
      method: 'GET',
      credentials: 'include',
      headers: {
        Accept: 'application/json, application/pdf',
      },
    })
  } catch {
    throw new ApiError(
      'No fue posible conectar con el servidor para descargar el documento.',
      503,
    )
  }

  if (!response.ok) {
    const payload = (await parseResponse(response)) as ErrorPayload | null

    const fallbackMessage =
      response.status === 401
        ? 'La sesión no está activa.'
        : response.status === 403
          ? 'No tienes permiso para descargar este documento.'
          : response.status === 404
            ? 'No fue posible localizar la propuesta solicitada.'
            : 'No se pudo descargar el documento.'

    throw new ApiError(
      payload?.message || fallbackMessage,
      response.status,
      payload?.errors || {},
    )
  }

  const blob = await response.blob()

  if (blob.size === 0) {
    throw new ApiError(
      'El documento descargado está vacío.',
      502,
    )
  }

  return blob
}

export const initializeCsrf = async () => {
  let csrfUrl: string

  if (typeof window !== 'undefined') {
    csrfUrl = appPath('/api/backend-proxy?csrf=1')
  } else {
    if (!BACKEND_URL) {
      throw new ApiError(
        'No se ha configurado NEXT_PUBLIC_BACKEND_URL para iniciar la sesión segura.',
        503,
      )
    }

    csrfUrl = `${BACKEND_URL}/sanctum/csrf-cookie`
  }

  let response: Response

  try {
    response = await fetch(csrfUrl, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
      },
    })
  } catch {
    throw new ApiError(
      'No fue posible iniciar la sesión segura con el backend.',
      503,
    )
  }

  if (!response.ok) {
    throw new ApiError(
      'No fue posible iniciar la sesión segura con el backend.',
      response.status,
    )
  }
}
