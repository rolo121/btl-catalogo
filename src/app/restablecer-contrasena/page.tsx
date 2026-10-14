import type { Metadata } from 'next'
import { Suspense } from 'react'
import RestablecerContrasenaClient from './RestablecerContrasenaClient'

export const metadata: Metadata = {
  title: 'Restablecer contraseña',
  description: 'Crea una nueva contraseña para tu cuenta de BTL Marketing.',
  alternates: {
    canonical: '/restablecer-contrasena',
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <RestablecerContrasenaClient />
    </Suspense>
  )
}
