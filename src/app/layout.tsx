import type { Metadata } from 'next'
import { appAsset } from '@/lib/appPaths'
import { Instrument_Sans } from 'next/font/google'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import '@/styles/styles.scss'
import GlobalProvider from './GlobalProvider'
import ModalMounts from '@/components/Modal/ModalMounts'
import CountdownTimeType from '@/type/CountdownType'
import { countdownTime } from '@/store/countdownTime'
import JsonLd from '@/components/SEO/JsonLd'
import { buildOrganizationJsonLd, buildWebsiteJsonLd } from '@/lib/structuredData'

const serverTimeLeft: CountdownTimeType = countdownTime()

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://btlmarketing.com.ni/catalogo'

const instrument = Instrument_Sans({
  subsets: ['latin'],
  display: 'swap',
  adjustFontFallback: false,
})

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'BTL Marketing | Productos promocionales',
    template: '%s | BTL Marketing',
  },
  description:
    'Explorá productos promocionales, regalos corporativos y artículos personalizados para impulsar tu marca con BTL Marketing.',
  keywords: [
    'BTL Marketing Nicaragua',
    'productos promocionales Nicaragua',
    'regalos corporativos',
    'artículos promocionales personalizados',
    'merchandising empresarial',
    'promocionales para eventos',
  ],
  applicationName: 'BTL Marketing Promocionales',
  authors: [{ name: 'BTL Marketing' }],
  creator: 'BTL Marketing',
  publisher: 'BTL Marketing',
  openGraph: {
    title: 'BTL Marketing | Productos promocionales',
    description:
      'Productos promocionales, regalos corporativos y soluciones personalizadas para empresas, campañas y eventos.',
    url: siteUrl,
    siteName: 'BTL Marketing',
    locale: 'es_NI',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BTL Marketing | Productos promocionales',
    description:
      'Catálogo de productos promocionales para empresas, marcas y eventos en Nicaragua.',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: appAsset('/favicon.ico') },
      { url: appAsset('/icon.png'), type: 'image/png' },
    ],
    apple: appAsset('/apple-icon.png'),
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={instrument.className}>
        <JsonLd data={[buildOrganizationJsonLd(), buildWebsiteJsonLd()]} />
        <GlobalProvider>
          {children}
          <ModalMounts serverTimeLeft={serverTimeLeft} />
        </GlobalProvider>
      </body>
    </html>
  )
}
