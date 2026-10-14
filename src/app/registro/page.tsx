import type { Metadata } from 'next'
import RegistroClient from './RegistroClient'

export const metadata: Metadata = {
  title: 'Registro',
  description:
    'Crea una cuenta en BTL Marketing.',
  alternates: {
    canonical: '/registro',
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function Page() {
  return <RegistroClient />
}
