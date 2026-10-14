import type { Metadata } from 'next'
import IniciarSesionClient from './IniciarSesionClient'

export const metadata: Metadata = {
  title: 'Iniciar sesión',
  description:
    'Accede a tu cuenta de BTL Marketing.',
  alternates: {
    canonical: '/iniciar-sesion',
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function Page() {
  return <IniciarSesionClient />
}
