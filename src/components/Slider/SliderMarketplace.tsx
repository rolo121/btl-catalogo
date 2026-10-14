import { appAsset } from '@/lib/appPaths'
import Link from 'next/link'
import React from 'react'
import * as Icon from '@phosphor-icons/react/dist/ssr'
import Image from 'next/image'

const highlights = [
  { icon: Icon.Package, title: 'Amplio catálogo', text: 'Miles de productos' },
  { icon: Icon.Headset, title: 'Atención personalizada', text: 'Asesoría experta' },
  { icon: Icon.Buildings, title: 'Opciones para empresas', text: 'Soluciones a medida' },
]

const SliderMarketplace = () => {
  return (
    <section className="slider-block style-marketplace w-full overflow-hidden bg-gradient-to-br from-primary-soft via-brand-secondary to-primary">
      <div className="relative">
        <div className="hidden lg:block absolute -left-32 -bottom-32 h-80 w-80 rounded-full border-[38px] border-white/15" />
        <div className="hidden lg:block absolute left-[52%] top-8 h-56 w-56 rounded-full bg-white/10 blur-sm" />
        <div className="hidden lg:block absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/15" />
        <div className="hidden lg:block absolute right-[8%] bottom-10 h-52 w-52 rounded-full border-[30px] border-white/10" />

        <div className="container relative z-[1] md:py-16 py-8">
          <div className="grid lg:grid-cols-2 grid-cols-1 items-center gap-8 lg:gap-10">
            <div className="order-2 lg:order-1 max-w-[660px] text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-bold uppercase tracking-[0.12em] text-primary-dark shadow-sm">
                <Icon.Sparkle size={18} weight="fill" />
                BTL Marketing
              </div>

              <h1 className="mt-5 lg:mt-6 text-text font-bold leading-tight xl:text-[58px] lg:text-[48px] md:text-[42px] text-[30px]">
                Artículos promocionales que hacen destacar{' '}
                <span className="text-primary-dark">tu marca</span>
              </h1>

              <p className="body1 text-text-text-secondary md:mt-5 mt-4 max-w-[560px] mx-auto lg:mx-0">
                Encontrá productos personalizados para empresas, eventos y campañas. Cotizá fácil y recibí atención personalizada.
              </p>

              <div className="hidden md:flex sm:flex-row flex-col gap-3 md:mt-8 mt-6">
                <Link
                  href="/productos"
                  className="button-main inline-flex items-center justify-center gap-2 rounded-full"
                >
                  <Icon.WhatsappLogo size={20} weight="fill" />
                  Cotizar ahora
                </Link>
                <Link
                  href="/productos"
                  className="inline-flex items-center justify-center rounded-full border border-primary-dark/25 bg-white px-7 py-4 font-bold text-text duration-300 hover:-translate-y-1 hover:border-primary-dark hover:text-primary-dark"
                >
                  Ver catálogo
                </Link>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-3 max-w-[300px] mx-auto md:mt-10 md:max-w-none md:mx-0 md:grid-cols-3 md:gap-4">
                {highlights.map((item) => {
                  const HighlightIcon = item.icon

                  return (
                    <div
                      key={item.title}
                      className="flex min-h-[76px] items-center gap-3 rounded-2xl bg-white/65 px-4 py-3 text-left shadow-[0_8px_24px_rgba(0,0,0,0.06)] backdrop-blur-sm md:min-h-0 md:bg-transparent md:px-0 md:py-0 md:shadow-none"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-primary-dark shadow-sm md:h-11 md:w-11">
                        <HighlightIcon size={20} weight="duotone" />
                      </div>

                      <div className="flex-1 leading-none">
                        <div className="text-[14px] font-semibold leading-[1.25] text-text md:text-button">
                          {item.title}
                        </div>
                        <div className="mt-1 text-[12px] leading-[1.35] text-text-text-secondary md:caption1">
                          {item.text}
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
            </div>

            <div className="relative order-1 lg:order-2">
              <div className="relative overflow-hidden rounded-[24px]  shadow-[0_24px_70px_rgba(31,31,31,0.14)]">
                <Image
                  src={appAsset(appAsset('/images/banner/imagen_banner.webp'))}
                  alt="Artículos promocionales BTL Marketing"
                  width={900}
                  height={620}
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  quality={85}
                  className="h-auto w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SliderMarketplace
