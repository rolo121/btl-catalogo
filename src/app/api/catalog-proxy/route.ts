import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "")

const ALLOWED_PREFIXES = [
  "/catalog",
  "/commercial-categories",
  "/categories",
]

const isAllowedPath = (path: string) => {
  return ALLOWED_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`) || path.startsWith(`${prefix}?`),
  )
}

export async function GET(request: NextRequest) {
  if (!API_URL) {
    return NextResponse.json(
      { message: "NEXT_PUBLIC_API_URL no está configurada." },
      { status: 503 },
    )
  }

  const rawPath = request.nextUrl.searchParams.get("path") || ""

  if (!rawPath.startsWith("/") || !isAllowedPath(rawPath)) {
    return NextResponse.json(
      { message: "Ruta de catálogo no permitida." },
      { status: 400 },
    )
  }

  const targetUrl = `${API_URL}${rawPath}`

  try {
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    })

    const body = await response.text()

    return new NextResponse(body, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("content-type") || "application/json; charset=utf-8",
        "Cache-Control": "no-store, max-age=0",
      },
    })
  } catch (error) {
    console.error("Catalog proxy error:", error)

    return NextResponse.json(
      { message: "No fue posible conectar con el catálogo de producción." },
      { status: 502 },
    )
  }
}
