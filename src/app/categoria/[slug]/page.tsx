import { permanentRedirect } from "next/navigation"

type PageProps = {
  params: Promise<{ slug: string }>
}

export default async function CategoriaPage({ params }: PageProps) {
  const { slug } = await params
  permanentRedirect(`/productos?commercial_category=${encodeURIComponent(slug)}`)
}
