"use client"

import BtlHeroHeader from "@/components/BTL/BtlHeroHeader"

type Props = {
  overlay?: boolean
  includeHero?: boolean
}

const Pulse = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-[#E4ECEF] ${className}`} />
)

export default function CatalogSkeleton({
  overlay = false,
  includeHero = true,
}: Props) {
  return (
    <div
      className={`${
        overlay
          ? "absolute inset-0 z-20 bg-[#F5F9FB]/96 backdrop-blur-[1px]"
          : "min-h-screen bg-[#F5F9FB]"
      }`}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Cargando catálogo"
    >
      {includeHero ? (
        <section className="relative min-h-[680px] overflow-hidden bg-[#071A33] text-white md:min-h-[720px]">
          <BtlHeroHeader className="absolute inset-x-0 top-0 z-20" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,#071A33_0%,#16354C_50%,#21577B_100%)]" />
          <div className="container relative z-10 flex min-h-[680px] items-center pt-32 md:min-h-[720px]">
            <div className="w-full max-w-[600px]">
              <Pulse className="h-7 w-52 rounded-full bg-white/15" />
              <Pulse className="mt-6 h-14 w-[82%] rounded-2xl bg-white/15" />
              <Pulse className="mt-3 h-14 w-[58%] rounded-2xl bg-white/15" />
              <Pulse className="mt-6 h-5 w-full rounded-lg bg-white/10" />
              <Pulse className="mt-3 h-5 w-[86%] rounded-lg bg-white/10" />
            </div>
          </div>
        </section>
      ) : null}

      <section className="bg-[#F5F9FB] py-10 md:py-12">
        <div className="container">
          <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
            <div>
              <Pulse className="h-6 w-40 rounded-lg" />
              <Pulse className="mt-2 h-4 w-28 rounded-lg" />
            </div>
            <Pulse className="h-11 w-40 rounded-xl" />
          </div>

          <div className="grid gap-7 lg:grid-cols-[270px_minmax(0,1fr)]">
            <aside className="hidden lg:block">
              <div className="rounded-[24px] border border-[#DCE6EA] bg-white p-5">
                <Pulse className="h-11 w-full rounded-xl" />
                <div className="mt-7 space-y-7">
                  {Array.from({ length: 4 }).map((_, group) => (
                    <div key={group}>
                      <Pulse className="h-5 w-28 rounded-lg" />
                      <div className="mt-4 space-y-3">
                        {Array.from({ length: group === 1 ? 6 : 4 }).map((__, row) => (
                          <div key={row} className="flex items-center gap-3">
                            <Pulse className="h-4 w-4 rounded-[4px]" />
                            <Pulse className={row % 2 ? "h-4 w-28 rounded-lg" : "h-4 w-36 rounded-lg"} />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 xl:grid-cols-4">
              {Array.from({ length: 12 }).map((_, index) => (
                <article
                  key={index}
                  className="overflow-hidden rounded-[22px] border border-[#DCE6EA] bg-white"
                >
                  <Pulse className="aspect-square w-full rounded-none bg-[#EDF3F5]" />
                  <div className="p-4">
                    <Pulse className="h-4 w-[88%] rounded-lg" />
                    <Pulse className="mt-2 h-4 w-[64%] rounded-lg" />
                    <div className="mt-5 flex gap-2">
                      <Pulse className="h-4 w-4 rounded-full" />
                      <Pulse className="h-4 w-4 rounded-full" />
                      <Pulse className="h-4 w-4 rounded-full" />
                    </div>
                    <div className="mt-4 border-t border-[#EEF3F5] pt-3">
                      <Pulse className="h-4 w-24 rounded-lg" />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
