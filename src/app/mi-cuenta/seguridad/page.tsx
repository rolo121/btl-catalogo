import type { Metadata } from 'next'
import SeguridadCuentaClient from './SeguridadCuentaClient'

export const metadata: Metadata = {
  title: 'Seguridad de la cuenta',
  description: 'Actualiza la contraseña de tu cuenta de BTL Marketing.',
  alternates: {
    canonical: '/mi-cuenta/seguridad',
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function Page() {
  return <SeguridadCuentaClient />
}
