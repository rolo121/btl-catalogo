"use client"

import { appAsset } from '@/lib/appPaths'
import Image from "next/image"
import Link from "next/link"
import * as Icon from "@phosphor-icons/react"
import BtlQuickActions from "@/components/BTL/BtlQuickActions"

const BTL_SITE_URL = "https://btlmarketing.com.ni/"

type Props = {
  className?: string
}

export default function BtlHeroHeader({ className = "" }: Props) {
  return (
    <div className={className}>
      <div className="container flex min-h-[58px] items-center justify-between gap-4 py-3 text-sm font-bold text-white">
        <div className="flex items-center gap-4 md:gap-5">
          <a
            href="tel:+50522518021"
            className="flex items-center gap-2 transition hover:text-[#8DBC21]"
          >
            <Icon.Phone size={17} weight="fill" />
            <span className="hidden sm:inline">
              Llámanos: (505) 2251 8021
            </span>
          </a>

          <div className="hidden items-center gap-2 sm:flex">
            <a
              href="https://www.facebook.com/BTLmarketingNic/?locale=es_LA"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="grid h-8 w-8 place-items-center rounded-full bg-white/10 transition hover:bg-white/20 hover:text-[#8DBC21]"
            >
              <Icon.FacebookLogo size={18} weight="fill" />
            </a>
            <a
              href="https://www.linkedin.com/company/btl-marketing-nic/posts/?feedView=all"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className="grid h-8 w-8 place-items-center rounded-full bg-white/10 transition hover:bg-white/20 hover:text-[#8DBC21]"
            >
              <Icon.LinkedinLogo size={18} weight="fill" />
            </a>
            <a
              href="https://www.instagram.com/btlmarketing/?hl=es"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="grid h-8 w-8 place-items-center rounded-full bg-white/10 transition hover:bg-white/20 hover:text-[#8DBC21]"
            >
              <Icon.InstagramLogo size={18} weight="bold" />
            </a>
          </div>
        </div>

        <BtlQuickActions />
      </div>

      <div className="container">
        <div className="flex items-center justify-between gap-5 rounded-[18px] border-2 border-[#6B5AA8]/70 bg-[linear-gradient(90deg,rgba(53,86,59,.58),rgba(52,81,86,.40))] px-5 py-4 shadow-[0_10px_30px_rgba(0,0,0,.14)] backdrop-blur-md md:px-6">
          <a
            href={BTL_SITE_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="Ir al sitio BTL Marketing"
            className="shrink-0"
          >
            <Image
              src={appAsset(appAsset('/images/btl/logo_btl.png'))}
              alt="BTL Marketing"
              width={300}
              height={94}
              priority
              className="h-auto w-[150px] sm:w-[170px] md:w-[200px]"
            />
          </a>

          <nav
            className="hidden items-center gap-5 text-sm font-extrabold text-white lg:flex xl:gap-7 xl:text-base"
            aria-label="Navegación principal"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-white transition hover:border-[#8DBC21]/70 hover:bg-white/15 hover:text-[#8DBC21]"
              aria-label="Volver al inicio de Promocionales"
              title="Inicio de Promocionales"
            >
              <Icon.House size={16} weight="fill" />
              Inicio catálogo
            </Link>
            <a
              href="https://btlmarketing.com.ni/nuestra-esencia/"
              target="_blank"
              rel="noreferrer"
              className="text-white transition hover:text-[#8DBC21]"
            >
              Yo soy BTL
            </a>
            <a
              href="https://btlmarketing.com.ni/experiencias/"
              target="_blank"
              rel="noreferrer"
              className="text-white transition hover:text-[#8DBC21]"
            >
              Servicios
            </a>
            <a
              href="https://btlmarketing.com.ni/asi-lo-vivimos/"
              target="_blank"
              rel="noreferrer"
              className="text-white transition hover:text-[#8DBC21]"
            >
              Portafolio
            </a>
          </nav>

          <a
            href="https://btlmarketing.com.ni/contact-us/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex shrink-0 items-center gap-2 rounded-[10px] border-2 border-white bg-[#1746D2] px-2.5 py-2 font-extrabold text-white transition hover:bg-[#1238AA] sm:gap-3 sm:px-5 sm:py-3"
          >
            <span className="text-xs sm:text-sm">Contactar</span>
            <span className="grid h-8 w-8 place-items-center rounded-[8px] bg-[#071A33] sm:h-9 sm:w-9">
              <Icon.ArrowRight size={20} weight="bold" />
            </span>
          </a>
        </div>
      </div>
    </div>
  )
}
