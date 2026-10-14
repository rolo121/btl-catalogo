import type { Metadata } from "next"
import CarritoClient from "./CarritoClient"

export const metadata: Metadata = {
  title: "Carrito de cotización | BTL Marketing",
  description:
    "Revisa los productos, variantes y cantidades agregados a tu solicitud de cotización con BTL Marketing.",
  alternates: {
    canonical: "/carrito",
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function Page() {
  return <CarritoClient />
}
