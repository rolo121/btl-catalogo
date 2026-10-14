import type { Metadata } from "next"
import CompararClient from "./CompararClient"

export const metadata: Metadata = {
  title: "Comparar productos | BTL Marketing",
  description:
    "Compara los productos promocionales seleccionados dentro del catálogo de BTL Marketing.",
  alternates: {
    canonical: "/comparar",
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function Page() {
  return <CompararClient />
}
