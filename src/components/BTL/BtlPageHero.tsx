import { appAsset } from '@/lib/appPaths'
import Image from "next/image"
import * as Icon from "@phosphor-icons/react/dist/ssr"
import BtlHeroHeader from "@/components/BTL/BtlHeroHeader"

type HeroType = "account" | "security" | "search"

type Props = {
  eyebrow: string
  title: string
  accent?: string
  description: string
  type?: HeroType
}

export default function BtlPageHero({
  eyebrow,
  title,
  accent,
  description,
  type = "account",
}: Props) {
  const HeroIcon =
    type === "search"
      ? Icon.MagnifyingGlass
      : type === "security"
        ? Icon.ShieldCheck
        : Icon.UserCircle

  return (
    <section className="relative isolate overflow-hidden bg-[#071A33] text-white">
      <Image
        src={appAsset(appAsset('/images/btl/banner_catalogo.webp'))}
        alt=""
        fill
        priority
        className="object-cover object-[58%_center]"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,26,51,.98)_0%,rgba(31,46,83,.91)_43%,rgba(31,46,83,.58)_70%,rgba(31,46,83,.34)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_82%,rgba(56,160,162,.17),transparent_35%)]" />

      <div className="relative z-20">
        <BtlHeroHeader />
      </div>

      <div className="container relative z-10 pb-12 pt-10 md:pb-14 md:pt-12">
        <div className="max-w-[720px]">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[.14em] text-white backdrop-blur-sm">
            <HeroIcon size={16} weight="fill" className="text-[#8DBC21]" />
            {eyebrow}
          </div>

          <h1 className="mt-5 text-4xl font-black leading-[1.05] text-white md:text-5xl">
            {title}{" "}
            {accent ? <span className="text-[#8DBC21]">{accent}</span> : null}
          </h1>

          <p className="mt-4 max-w-[640px] text-base leading-7 text-white/80 md:text-lg">
            {description}
          </p>
        </div>
      </div>
    </section>
  )
}
