import type { Metadata } from "next"
import FinalizarCompraClient from "./FinalizarCompraClient"

export const metadata: Metadata = {
  title: "Solicitar cotización | BTL Marketing",
  description:
    "Completa tus datos para enviar a BTL Marketing una solicitud de cotización con los productos promocionales seleccionados.",
  alternates: {
    canonical: "/finalizar-compra",
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function Page() {
  return <FinalizarCompraClient />
}
