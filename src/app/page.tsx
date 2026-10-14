import { appAsset } from '@/lib/appPaths'
import Image from 'next/image'
import Link from 'next/link'
import * as Icon from '@phosphor-icons/react/dist/ssr'
import JsonLd from '@/components/SEO/JsonLd'
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from '@/lib/structuredData'
import FeaturedProductCard from '@/components/BTL/FeaturedProductCard'
import BtlHeroHeader from '@/components/BTL/BtlHeroHeader'

type ApiVariant = {
  color?: string | null
}

type ApiProduct = {
  id?: string | number | null
  slug?: string | null
  name?: string | null
  description?: string | null
  brand?: string | null
  source_brand?: string | null
  variants?: ApiVariant[] | null
  image?: unknown
  main_image?: unknown
  thumbnail?: unknown
  images?: unknown
  features?: unknown
}

type CatalogResponse = {
  data?: ApiProduct[]
}

type FeaturedProduct = {
  id: string
  slug: string
  name: string
  image: string
  colors: string[]
}

const FALLBACK_PRODUCT_IMAGE = appAsset('/images/product-placeholder.webp')
const BTL_SITE_URL = 'https://btlmarketing.com.ni/'

const solutions = [
  {
    title: 'Productos para empresas',
    description: 'Soluciones promocionales para clientes, colaboradores y campañas corporativas.',
    image: appAsset('/images/btl/empresa.webp'),
  },
  {
    title: 'Promocionales para eventos',
    description: 'Artículos para activaciones, ferias, congresos y lanzamientos.',
    image: appAsset('/images/btl/promocionales-para-eventos.webp'),
  },
  {
    title: 'Regalos corporativos',
    description: 'Detalles útiles y personalizados para fortalecer relaciones comerciales.',
    image: appAsset('/images/btl/regalos-corporativos.webp'),
  },
]

const categories = [
  { label: 'Mochilas', slug: 'mochilas', image: appAsset('/images/btl/mochilas.webp') },
  { label: 'Bebidas, Bar y Termos', slug: 'bebidas-bar-termos', image: appAsset('/images/btl/bebidas.webp') },
  { label: 'Textil', slug: 'textil', image: appAsset('/images/btl/textil.webp') },
  { label: 'Escritura', slug: 'escritura', image: appAsset('/images/btl/escritura.webp') },
  { label: 'Tecnología', slug: 'tecnologia', image: appAsset('/images/btl/tecnologia.webp') },
  { label: 'Eventos y Regalos', slug: 'eventos-regalos', image: appAsset('/images/btl/eventos-y-regalos.webp') },
]

const quoteSteps = [
  {
    number: '01',
    title: 'Elegí tus productos',
    description: 'Explorá el catálogo y encontrá los artículos que mejor representan tu marca.',
    image: appAsset('/images/btl/elegi-tus-productos.webp'),
  },
  {
    number: '02',
    title: 'Enviá tu solicitud',
    description: 'Indicá cantidad, color y la información necesaria para preparar tu cotización.',
    image: appAsset('/images/btl/cotizacion-sencilla.webp'),
  },
  {
    number: '03',
    title: 'Recibí asesoría',
    description: 'Nuestro equipo te acompaña con opciones, disponibilidad y tiempos de entrega.',
    image: appAsset('/images/btl/asesoria.webp'),
  },
]

const benefits = [
  {
    title: 'Atención personalizada',
    description: 'Asesoría para elegir productos alineados a tu marca, presupuesto y objetivo.',
    image: appAsset('/images/btl/atencion-personalizada.webp'),
  },
  {
    title: 'Amplio catálogo',
    description: 'Opciones para empresas, eventos, activaciones, campañas y regalos corporativos.',
    image: appAsset('/images/btl/amplio-catalogo.webp'),
  },
  {
    title: 'Cotización sencilla',
    description: 'Seleccioná tu producto y enviá una solicitud clara en pocos pasos.',
    image: appAsset('/images/btl/cotizacion-sencilla.webp'),
  },
  {
    title: 'Entrega inmediata y bajo pedido',
    description: 'Opciones según disponibilidad, necesidad de entrega y tipo de campaña.',
    image: appAsset('/images/btl/entrega-inmediata.webp'),
  },
]


function getProductColors(product: ApiProduct): string[] {
  return Array.from(
    new Set(
      (Array.isArray(product.variants) ? product.variants : [])
        .map((variant) => String(variant?.color || '').trim())
        .filter(Boolean),
    ),
  )
}

function normalizeImage(value: unknown): string | null {
  if (typeof value === 'string') {
    const cleaned = value.trim()
    return cleaned && cleaned !== 'null' && cleaned !== 'undefined' ? cleaned : null
  }

  if (!value || typeof value !== 'object' || Array.isArray(value)) return null

  const record = value as Record<string, unknown>
  return normalizeImage(record.url || record.image || record.src || record.main || record.main_image)
}

function collectImages(value: unknown): string[] {
  if (!value) return []

  if (typeof value === 'string') {
    try {
      return collectImages(JSON.parse(value))
    } catch {
      const direct = normalizeImage(value)
      return direct ? [direct] : []
    }
  }

  if (Array.isArray(value)) {
    return value.map(normalizeImage).filter((item): item is string => Boolean(item))
  }

  if (typeof value === 'object') {
    const record = value as Record<string, unknown>
    const nested = [
      record.url,
      record.image,
      record.src,
      record.main,
      record.main_image,
      ...(Array.isArray(record.mainImages) ? record.mainImages : []),
      ...(Array.isArray(record.variantImages) ? record.variantImages : []),
      ...(Array.isArray(record.gallery) ? record.gallery : []),
      ...(Array.isArray(record.images) ? record.images : []),
    ]

    return nested.map(normalizeImage).filter((item): item is string => Boolean(item))
  }

  return []
}

function getProductImage(product: ApiProduct): string {
  const candidates = [
    normalizeImage(product.image),
    normalizeImage(product.main_image),
    normalizeImage(product.thumbnail),
    ...collectImages(product.images),
  ].filter((item): item is string => Boolean(item))

  if (product.features) {
    try {
      const features = typeof product.features === 'string'
        ? JSON.parse(product.features)
        : product.features

      if (features && typeof features === 'object') {
        const imagekit = (features as Record<string, unknown>).imagekit
        if (imagekit && typeof imagekit === 'object') {
          const imagekitRecord = imagekit as Record<string, unknown>
          const catalog = imagekitRecord.catalog
          if (catalog && typeof catalog === 'object') {
            const main = normalizeImage((catalog as Record<string, unknown>).main)
            if (main) candidates.unshift(main)
          }
        }
      }
    } catch {
      // Los datos del producto siguen siendo utilizables aunque features no sea JSON válido.
    }
  }

  return Array.from(new Set(candidates))[0] || FALLBACK_PRODUCT_IMAGE
}

async function getFeaturedProducts(): Promise<FeaturedProduct[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  if (!apiUrl) return []

  try {
    const response = await fetch(`${apiUrl}/catalog?per_page=8`, {
      next: { revalidate: 900 },
    })

    if (!response.ok) return []

    const json = (await response.json()) as CatalogResponse
    const products = Array.isArray(json.data) ? json.data : []

    return products.slice(0, 8).map((product, index) => {
      const slug = String(product.slug || product.id || index)
      return {
        id: String(product.id || slug),
        slug,
        name: String(product.name || 'Producto promocional'),
        image: getProductImage(product),
        colors: getProductColors(product),
      }
    })
  } catch (error) {
    console.error('No se pudieron cargar los productos destacados del home BTL:', error)
    return []
  }
}

function BtlFooter() {
  return (
    <footer className="bg-[#1F2E53] text-white">
      <div className="container grid gap-10 py-12 md:grid-cols-[1.25fr_.75fr_.75fr]">
        <div>
          <Image
            src={appAsset(appAsset('/images/btl/logo_btl.png'))}
            alt="BTL Marketing"
            width={300}
            height={94}
            className="h-auto w-[210px]"
          />
          <p className="mt-5 max-w-[460px] text-sm leading-6 text-white/70">
            Soluciones promocionales para empresas, marcas, campañas y eventos. Convertimos tus ideas en experiencias que conectan con tu audiencia.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-[.16em] text-[#8DBC21]">Navegación</h3>
          <div className="mt-4 grid gap-2 text-sm text-white/75">
            <Link href="/">Inicio</Link>
            <Link href="/productos">Catálogo</Link>
            <a href={BTL_SITE_URL} target="_blank" rel="noreferrer">BTL Marketing</a>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-[.16em] text-[#8DBC21]">Contacto</h3>
          <div className="mt-4 grid gap-3 text-sm text-white/75">
            <a href="tel:+50522518021" className="flex items-center gap-2">
              <Icon.Phone size={17} /> (505) 2251 8021
            </a>
            <a href={BTL_SITE_URL} target="_blank" rel="noreferrer" className="flex items-center gap-2">
              <Icon.Globe size={17} /> btlmarketing.com.ni
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-5">
        <div className="container text-xs text-white/55">© BTL Marketing. Todos los derechos reservados.</div>
      </div>
    </footer>
  )
}

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts()
  const homeJsonLd = [
    buildWebPageJsonLd({
      name: 'BTL Marketing | Productos promocionales',
      description: 'Catálogo de productos promocionales para empresas, marcas y eventos en Nicaragua.',
      url: '/',
    }),
    buildBreadcrumbJsonLd([{ name: 'Inicio', url: '/' }]),
  ]

  return (
    <>
      <JsonLd data={homeJsonLd} />
      <main className="bg-white">
        <section className="relative min-h-[720px] overflow-hidden bg-[#071A33] text-white">
          <Image
            src={appAsset(appAsset('/images/btl/catalogo-hero-btl.webp'))}
            alt="Promocionales BTL Marketing"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />

          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,18,55,.95)_0%,rgba(0,21,54,.82)_32%,rgba(3,35,58,.15)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_45%,rgba(141,188,33,.24),transparent_22%)]" />

          <div className="relative z-10">
            <BtlHeroHeader />

            <div className="container">
              <div className="flex min-h-[500px] items-center py-12">
                <div className="max-w-[620px]">
                  <h1 className="text-[52px] font-black leading-[1.02] text-[#8DBC21] sm:text-[64px] lg:text-[72px]">
                    Promocionales
                  </h1>

                  <p className="mt-10 max-w-[500px] text-lg font-medium leading-7 text-[#A7D400]">
                    ¿Souvenirs? ¿Camisetas? ¿Termos? ¿Gorras?
                    <br />
                    ¡Damos la mejor exposición a tu marca
                    <br />
                    en TODO lo que te imagines!
                  </p>
                </div>
              </div>
            </div>

          </div>
        </section>

        <section className="relative z-10 py-10">
          <div className="container flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-3 md:overflow-visible md:pb-0">
            {solutions.map((item) => (
              <article
                key={item.title}
                className="group min-w-[84%] snap-start rounded-[24px] border border-[#DCE6EA] bg-white p-5 shadow-[0_12px_34px_rgba(31,46,83,.07)] transition hover:-translate-y-1 hover:border-[#38A0A2]/55 sm:min-w-[58%] md:min-w-0"
              >
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 shrink-0">
                    <Image
                      src={item.image}
                      alt=""
                      fill
                      className="object-contain"
                      sizes="64px"
                    />
                  </div>
                  <div>
                    <h2 className="font-extrabold text-[#1F2E53]">{item.title}</h2>
                    <p className="mt-1 text-sm leading-5 text-[#52637A]">{item.description}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="py-10 md:py-20">
          <div className="container">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[.22em] text-[#38A0A2]">Explorá rápido</p>
                <h2 className="mt-2 text-3xl font-extrabold text-[#1F2E53] md:text-4xl">Categorías más cotizadas</h2>
                <p className="mt-3 max-w-[620px] text-[#52637A]">Encontrá opciones para empresas, eventos y campañas promocionales.</p>
              </div>
              <Link href="/productos" className="inline-flex items-center gap-2 text-sm font-bold text-[#21577B] hover:text-[#38A0A2]">
                Ver todo el catálogo <Icon.ArrowRight size={16} weight="bold" />
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              {categories.map((category) => (
                <a
                  key={category.slug}
                  href={`/productos?commercial_category=${encodeURIComponent(category.slug)}`}
                  className="group relative min-h-[190px] overflow-hidden rounded-[24px] border border-[#DCE6EA] bg-white p-5 shadow-[0_8px_26px_rgba(31,46,83,.05)] transition hover:-translate-y-1 hover:border-[#38A0A2]/70 hover:shadow-[0_16px_34px_rgba(31,46,83,.10)]"
                >
                  <div className="relative mx-auto h-[112px] w-[112px] transition duration-300 group-hover:scale-105">
                    <Image
                      src={category.image}
                      alt={category.label}
                      fill
                      className="object-contain"
                      sizes="112px"
                    />
                  </div>

                  <div className="mt-5 flex items-end justify-between gap-3">
                    <span className="text-sm font-extrabold leading-5 text-[#1F2E53]">
                      {category.label}
                    </span>
                    <Icon.ArrowUpRight
                      size={18}
                      weight="bold"
                      className="shrink-0 text-[#38A0A2] transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#F7FAFC] py-10 md:py-20">
          <div className="container">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[.22em] text-[#8DBC21]">Selección BTL</p>
                <h2 className="mt-2 text-3xl font-extrabold text-[#1F2E53] md:text-4xl">Productos destacados</h2>
                <p className="mt-3 max-w-[620px] text-[#52637A]">Explorá artículos promocionales y encontrá la opción ideal para tu próxima campaña.</p>
              </div>
              <Link href="/productos" className="inline-flex items-center gap-2 text-sm font-bold text-[#21577B] hover:text-[#38A0A2]">
                Ver todos los productos <Icon.ArrowRight size={16} weight="bold" />
              </Link>
            </div>

            {featuredProducts.length > 0 ? (
              <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {featuredProducts.map((product) => (
                  <FeaturedProductCard
                    key={product.id}
                    product={product}
                  />
                ))}
              </div>
            ) : (
              <div className="mt-8 rounded-[24px] border border-[#DCE6EA] bg-white p-8 text-center text-[#52637A]">
                El catálogo está disponible desde el botón “Ver todos los productos”.
              </div>
            )}
          </div>
        </section>

        <section className="py-10 md:py-20">
          <div className="container">
            <div className="mx-auto max-w-[720px] text-center">
              <p className="text-xs font-extrabold uppercase tracking-[.22em] text-[#38A0A2]">Proceso simple</p>
              <h2 className="mt-2 text-3xl font-extrabold text-[#1F2E53] md:text-4xl">Cotizar es fácil</h2>
              <p className="mt-3 text-[#52637A]">Pasá de la idea a una solicitud clara en pocos pasos.</p>
            </div>

            <div className="mt-9 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-3 md:overflow-visible md:pb-0">
              {quoteSteps.map((step) => (
                <article
                  key={step.number}
                  className="relative min-w-[86%] snap-start overflow-hidden rounded-[26px] border border-[#DCE6EA] bg-white p-5 shadow-[0_10px_30px_rgba(31,46,83,.06)] sm:min-w-[62%] md:min-w-0 md:p-6"
                >
                  <span className="absolute right-5 top-5 text-5xl font-black leading-none text-[#1F2E53]/[.045]">
                    {step.number}
                  </span>

                  <div className="relative h-16 w-16">
                    <Image
                      src={step.image}
                      alt=""
                      fill
                      className="object-contain"
                      sizes="64px"
                    />
                  </div>

                  <div className="mt-5 inline-flex rounded-full bg-[#8DBC21]/15 px-3 py-1 text-xs font-extrabold text-[#648B12]">
                    Paso {step.number}
                  </div>

                  <h3 className="mt-4 text-xl font-extrabold text-[#1F2E53]">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#52637A]">{step.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="pb-16 md:pb-20">
          <div className="container">
            <div className="relative overflow-hidden rounded-[30px] bg-gradient-to-r from-[#1F2E53] via-[#21577B] to-[#38A0A2] p-7 text-white md:p-10">
              <div className="absolute -right-10 -top-16 h-48 w-48 rounded-full border-[28px] border-[#8DBC21]/40" />
              <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-[720px]">
                  <p className="text-xs font-extrabold uppercase tracking-[.2em] text-[#B9D96B]">¿Necesitás orientación?</p>
                  <h2 className="mt-2 text-3xl font-extrabold text-white md:text-4xl">¿No sabés qué producto elegir?</h2>
                  <p className="mt-3 max-w-[680px] text-white/80">Explorá el catálogo y encontrá opciones para tu presupuesto, evento o campaña. Desde cada producto podés iniciar tu solicitud de cotización.</p>
                </div>
                <Link href="/productos" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#8DBC21] px-7 py-4 font-bold text-[#1F2E53] transition hover:bg-white">
                  Ver catálogo <Icon.ArrowRight size={18} weight="bold" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#F2F7F5] py-10 md:py-16">
          <div className="container flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-4">
            {benefits.map((benefit) => (
              <article
                key={benefit.title}
                className="min-w-[82%] snap-start rounded-[24px] border border-white bg-white p-5 shadow-[0_8px_24px_rgba(31,46,83,.05)] sm:min-w-0"
              >
                <div className="relative h-14 w-14">
                  <Image
                    src={benefit.image}
                    alt=""
                    fill
                    className="object-contain"
                    sizes="56px"
                  />
                </div>
                <h3 className="mt-4 font-extrabold text-[#1F2E53]">{benefit.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#52637A]">{benefit.description}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <BtlFooter />
    </>
  )
}
