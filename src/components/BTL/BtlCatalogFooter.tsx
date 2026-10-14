import { appAsset } from '@/lib/appPaths'
import Image from "next/image"
import Link from "next/link"
import * as Icon from "@phosphor-icons/react/dist/ssr"

export default function BtlCatalogFooter() {
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
            Soluciones promocionales para empresas, marcas, campañas y eventos.
            Convertimos tus ideas en experiencias que conectan con tu audiencia.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-[.16em] text-[#8DBC21]">
            Navegación
          </h3>
          <div className="mt-4 grid gap-2 text-sm text-white/75">
            <Link href="/">Inicio catálogo</Link>
            <Link href="/productos">Catálogo</Link>
            <a href="https://btlmarketing.com.ni/nuestra-esencia/" target="_blank" rel="noreferrer">Yo soy BTL</a>
            <a href="https://btlmarketing.com.ni/experiencias/" target="_blank" rel="noreferrer">Servicios</a>
            <a href="https://btlmarketing.com.ni/asi-lo-vivimos/" target="_blank" rel="noreferrer">Portafolio</a>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-[.16em] text-[#8DBC21]">
            Contacto
          </h3>
          <div className="mt-4 grid gap-3 text-sm text-white/75">
            <a href="tel:+50522518021" className="flex items-center gap-2">
              <Icon.Phone size={17} /> (505) 2251 8021
            </a>
            <a
              href="https://btlmarketing.com.ni/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2"
            >
              <Icon.Globe size={17} /> btlmarketing.com.ni
            </a>
          </div>
          <div className="mt-5 flex items-center gap-2">
            <a href="https://www.facebook.com/BTLmarketingNic/?locale=es_LA" target="_blank" rel="noreferrer" aria-label="Facebook" className="grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-white/5 transition hover:border-[#8DBC21]/50 hover:bg-white/10 hover:text-[#8DBC21]">
              <Icon.FacebookLogo size={18} weight="fill" />
            </a>
            <a href="https://www.instagram.com/btlmarketing/?hl=es" target="_blank" rel="noreferrer" aria-label="Instagram" className="grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-white/5 transition hover:border-[#8DBC21]/50 hover:bg-white/10 hover:text-[#8DBC21]">
              <Icon.InstagramLogo size={18} weight="bold" />
            </a>
            <a href="https://www.linkedin.com/company/btl-marketing-nic/posts/?feedView=all" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-white/5 transition hover:border-[#8DBC21]/50 hover:bg-white/10 hover:text-[#8DBC21]">
              <Icon.LinkedinLogo size={18} weight="fill" />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-5">
        <div className="container text-xs text-white/55">
          © BTL Marketing. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  )
}
