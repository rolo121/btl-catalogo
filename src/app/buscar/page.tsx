import type { Metadata } from 'next'
import { Suspense } from 'react'
import BuscarClient from './BuscarClient'

export const metadata: Metadata = {
  title: 'Buscar productos',
  description:
    'Busca productos promocionales dentro del catálogo de BTL Marketing.',
  alternates: {
    canonical: '/buscar',
  },
  robots: {
    index: false,
    follow: true,
  },
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="container py-10">
          <div className="text-center text-secondary">Cargando búsqueda...</div>
        </div>
      }
    >
      <BuscarClient />
    </Suspense>
  )
}
