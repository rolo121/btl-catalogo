import { appAsset } from '@/lib/appPaths'
import Image from "next/image"
import * as Icon from "@phosphor-icons/react/dist/ssr"
import BtlHeroHeader from "@/components/BTL/BtlHeroHeader"

type Props = {
  eyebrow: string
  title: string
  accent?: string
  description: string
  type?: "favorites" | "compare"
}

export default function BtlInnerHero({
  eyebrow,
  title,
  accent,
  description,
  type = "favorites",
}: Props) {
  const HeroIcon = type === "compare" ? Icon.ArrowsCounterClockwise : Icon.Heart

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
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,26,51,.97)_0%,rgba(31,46,83,.88)_42%,rgba(31,46,83,.52)_68%,rgba(31,46,83,.30)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_80%,rgba(56,160,162,.15),transparent_35%)]" />

      <div className="relative z-20">
        <BtlHeroHeader />
      </div>

      <div className="container relative z-10 pb-14 pt-12 md:pb-16 md:pt-14">
        <div className="max-w-[700px]">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[.14em] text-white backdrop-blur-sm">
            <HeroIcon size={16} weight="fill" className="text-[#8DBC21]" />
            {eyebrow}
          </div>

          <h1 className="mt-5 text-4xl font-black leading-[1.05] text-white md:text-5xl">
            {title}{" "}
            {accent ? <span className="text-[#8DBC21]">{accent}</span> : null}
          </h1>

          <p className="mt-4 max-w-[620px] text-base leading-7 text-white/80 md:text-lg">
            {description}
          </p>
        </div>
      </div>
    </section>
  )
}
