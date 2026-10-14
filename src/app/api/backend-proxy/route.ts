import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "")
const BACKEND_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL || ""
).replace(/\/$/, "")

const ALLOWED_API_PREFIXES = [
  "/auth",
  "/customer",
  "/quotes",
]

const ALLOWED_METHODS = new Set([
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
])

const isAllowedApiPath = (path: string) =>
  ALLOWED_API_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`) || path.startsWith(`${prefix}?`),
  )

const getSetCookies = (headers: Headers): string[] => {
  const headersWithCookies = headers as Headers & {
    getSetCookie?: () => string[]
  }

  if (typeof headersWithCookies.getSetCookie === "function") {
    return headersWithCookies.getSetCookie()
  }

  const combined = headers.get("set-cookie")
  if (!combined) return []

  // Divide múltiples cookies sin romper fechas Expires=Wed, 21 Oct...
  return combined.split(/,(?=\s*[^;,=\s]+=[^;,]+)/g).map((cookie) => cookie.trim())
}

const rewriteCookieForFrontend = (
  cookie: string,
  isHttps: boolean,
): string => {
  let rewritten = cookie
    // La cookie debe pertenecer al host del frontend, no al admin remoto.
    .replace(/;\s*Domain=[^;]+/gi, "")
    // Las sesiones se usan desde todas las rutas del catálogo.
    .replace(/;\s*Path=[^;]+/gi, "; Path=/")

  if (!/;\s*Path=/i.test(rewritten)) {
    rewritten += "; Path=/"
  }

  if (!isHttps) {
    // Desarrollo local sobre http://localhost.
    rewritten = rewritten.replace(/;\s*Secure/gi, "")
    rewritten = rewritten.replace(/;\s*SameSite=None/gi, "; SameSite=Lax")
  }

  return rewritten
}

const buildUpstreamHeaders = (request: NextRequest, targetUrl: string) => {
  const headers = new Headers()
  const accept = request.headers.get("accept")
  const contentType = request.headers.get("content-type")
  const xsrfToken = request.headers.get("x-xsrf-token")
  const cookie = request.headers.get("cookie")

  if (accept) headers.set("Accept", accept)
  if (contentType) headers.set("Content-Type", contentType)
  if (xsrfToken) headers.set("X-XSRF-TOKEN", xsrfToken)
  if (cookie) headers.set("Cookie", cookie)

  // El backend ve la llamada como una petición propia del dominio administrativo.
  // Esto evita depender de la configuración CORS/Sanctum del localhost.
  try {
    const targetOrigin = new URL(targetUrl).origin
    headers.set("Origin", targetOrigin)
    headers.set("Referer", `${targetOrigin}/`)
  } catch {
    // No bloqueamos la llamada si la URL no se puede normalizar aquí.
  }

  return headers
}

const proxyRequest = async (request: NextRequest) => {
  const method = request.method.toUpperCase()

  if (!ALLOWED_METHODS.has(method)) {
    return NextResponse.json(
      { message: "Método no permitido." },
      { status: 405 },
    )
  }

  const isCsrfRequest = request.nextUrl.searchParams.get("csrf") === "1"
  const rawPath = request.nextUrl.searchParams.get("path") || ""

  let targetUrl: string

  if (isCsrfRequest) {
    if (!BACKEND_URL) {
      return NextResponse.json(
        { message: "NEXT_PUBLIC_BACKEND_URL no está configurada." },
        { status: 503 },
      )
    }

    if (method !== "GET") {
      return NextResponse.json(
        { message: "Método CSRF no permitido." },
        { status: 405 },
      )
    }

    targetUrl = `${BACKEND_URL}/sanctum/csrf-cookie`
  } else {
    if (!API_URL) {
      return NextResponse.json(
        { message: "NEXT_PUBLIC_API_URL no está configurada." },
        { status: 503 },
      )
    }

    if (!rawPath.startsWith("/") || !isAllowedApiPath(rawPath)) {
      return NextResponse.json(
        { message: "Ruta privada no permitida." },
        { status: 400 },
      )
    }

    targetUrl = `${API_URL}${rawPath}`
  }

  try {
    const body =
      method === "GET"
        ? undefined
        : await request.arrayBuffer()

    const upstream = await fetch(targetUrl, {
      method,
      headers: buildUpstreamHeaders(request, targetUrl),
      body: body && body.byteLength > 0 ? body : undefined,
      redirect: "manual",
      cache: "no-store",
    })

    const responseBody = await upstream.arrayBuffer()
    const responseHeaders = new Headers()

    const contentType = upstream.headers.get("content-type")
    const contentDisposition = upstream.headers.get("content-disposition")
    const retryAfter = upstream.headers.get("retry-after")

    if (contentType) responseHeaders.set("Content-Type", contentType)
    if (contentDisposition) {
      responseHeaders.set("Content-Disposition", contentDisposition)
    }
    if (retryAfter) responseHeaders.set("Retry-After", retryAfter)

    responseHeaders.set("Cache-Control", "no-store, max-age=0")

    const isHttps = request.nextUrl.protocol === "https:"

    getSetCookies(upstream.headers).forEach((cookie) => {
      responseHeaders.append(
        "Set-Cookie",
        rewriteCookieForFrontend(cookie, isHttps),
      )
    })

    return new NextResponse(responseBody, {
      status: upstream.status,
      headers: responseHeaders,
    })
  } catch (error) {
    console.error("Backend proxy error:", error)

    return NextResponse.json(
      { message: "No fue posible conectar con el backend." },
      { status: 502 },
    )
  }
}

export async function GET(request: NextRequest) {
  return proxyRequest(request)
}

export async function POST(request: NextRequest) {
  return proxyRequest(request)
}

export async function PUT(request: NextRequest) {
  return proxyRequest(request)
}

export async function PATCH(request: NextRequest) {
  return proxyRequest(request)
}

export async function DELETE(request: NextRequest) {
  return proxyRequest(request)
}
