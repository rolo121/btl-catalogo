import type { Metadata } from 'next'
import MiCuentaClient from './MiCuentaClient'

export const metadata: Metadata = {
  title: 'Mi cuenta',
  description:
    'Gestiona la información de tu cuenta en BTL Marketing.',
  alternates: {
    canonical: '/mi-cuenta',
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function Page() {
  return <MiCuentaClient />
}
