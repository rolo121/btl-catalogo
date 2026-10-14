import React from 'react'
import * as Icon from '@phosphor-icons/react/dist/ssr'

const banners = [
  {
    title: 'Productos para empresas',
    text: 'Soluciones promocionales para clientes, colaboradores y campañas corporativas.',
    icon: Icon.Buildings,
    imageIcon: Icon.Briefcase,
    accent: 'bg-[#F97316]',
    soft: 'bg-[#FFF4EC]',
    border: 'border-[#F6E3D4]',
    iconColor: 'text-[#F97316]',
    ghostColor: 'text-[#F97316]/10',
  },
  {
    title: 'Promocionales para eventos',
    text: 'Artículos ideales para activaciones, ferias, congresos y lanzamientos.',
    icon: Icon.CalendarBlank,
    imageIcon: Icon.Tote,
    accent: 'bg-[#D97706]',
    soft: 'bg-[#FFF7E8]',
    border: 'border-[#F2E6C7]',
    iconColor: 'text-[#D97706]',
    ghostColor: 'text-[#D97706]/10',
  },
  {
    title: 'Regalos corporativos',
    text: 'Detalles útiles y personalizados para fortalecer relaciones comerciales.',
    icon: Icon.Gift,
    imageIcon: Icon.Package,
    accent: 'bg-[#6B8E23]',
    soft: 'bg-[#F3F8ED]',
    border: 'border-[#DFE8D3]',
    iconColor: 'text-[#6B8E23]',
    ghostColor: 'text-[#6B8E23]/10',
  },
]

const BannerAbove = () => {
  return (
    <section className="banner-block bg-white pt-8 md:pt-10">
      <div className="container">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-[24px]">
          {banners.map((banner, index) => {
            const BannerIcon = banner.icon
            const ImageIcon = banner.imageIcon

            return (
              <article
                key={banner.title}
                className={`group relative overflow-hidden rounded-[24px] border ${banner.border} bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(31,31,31,0.10)] md:p-6 ${
                  index === 2 ? 'max-lg:hidden max-sm:block' : ''
                }`}
              >
                {/* Acento superior */}
                <div className={`absolute left-0 top-0 h-1.5 w-full ${banner.accent}`} />

                {/* Mancha suave decorativa */}
                <div
                  className={`absolute -right-10 -top-10 h-32 w-32 rounded-full ${banner.soft} opacity-80`}
                />

                {/* Ícono decorativo de fondo */}
                <div className="absolute right-4 top-4 hidden md:block">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#FAFAFA]">
                    <ImageIcon size={42} weight="duotone" className={banner.ghostColor} />
                  </div>
                </div>

                <div className="relative z-[1]">
                  {/* Header */}
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${banner.soft} ${banner.iconColor}`}
                    >
                      <BannerIcon size={24} weight="duotone" />
                    </div>

                    <div className="pr-2 md:pr-20">
                      <h3 className="text-[18px] font-semibold leading-[1.25] text-[var(--text)]">
                        {banner.title}
                      </h3>
                    </div>
                  </div>

                  {/* Texto */}
                  <p className="mt-4 text-[14px] leading-[1.65] text-[var(--text-secondary)]">
                    {banner.text}
                  </p>

                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default BannerAbove