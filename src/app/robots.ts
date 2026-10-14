import type { MetadataRoute } from "next"
import { appPath } from "@/lib/appPaths"

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://btlmarketing.com.ni/catalogo").replace(/\/$/, "")

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: [appPath("/"), appPath("/productos"), appPath("/producto/")],
      disallow: [
        appPath("/carrito"),
        appPath("/finalizar-compra"),
        appPath("/iniciar-sesion"),
        appPath("/registro"),
        appPath("/recuperar-contrasena"),
        appPath("/restablecer-contrasena"),
        appPath("/mi-cuenta"),
        appPath("/favoritos"),
        appPath("/comparar"),
        appPath("/buscar"),
        appPath("/seguimiento-pedido"),
        "/cotizar",
        appPath("/categoria"),
        appPath("/nosotros"),
        appPath("/contacto"),
        appPath("/preguntas-frecuentes"),
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
