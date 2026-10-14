import type { Metadata } from 'next'
import RecuperarContrasenaClient from './RecuperarContrasenaClient'

export const metadata: Metadata = {
  title: 'Recuperar contraseña',
  description:
    'Recupera el acceso a tu cuenta de BTL Marketing.',
  alternates: {
    canonical: '/recuperar-contrasena',
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function Page() {
  return <RecuperarContrasenaClient />
}
