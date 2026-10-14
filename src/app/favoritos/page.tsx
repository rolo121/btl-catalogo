import type { Metadata } from "next"
import FavoritosClient from "./FavoritosClient"

export const metadata: Metadata = {
  title: "Favoritos | BTL Marketing",
  description:
    "Revisa los productos promocionales que guardaste como favoritos en el catálogo de BTL Marketing.",
  alternates: {
    canonical: "/favoritos",
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function Page() {
  return <FavoritosClient />
}
