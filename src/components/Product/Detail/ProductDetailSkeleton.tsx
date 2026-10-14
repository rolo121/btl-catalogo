"use client"

import BtlHeroHeader from "@/components/BTL/BtlHeroHeader"

const Pulse = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse rounded-xl bg-[#E7EEF1] ${className}`} />
)

export default function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-[#F5F9FB]">
      <header className="bg-[#071A33] pb-6 text-white">
        <BtlHeroHeader />
      </header>

      <main
        className="container py-8 md:py-12"
        aria-busy="true"
        aria-label="Cargando detalle del producto"
      >
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,.92fr)_minmax(0,1.08fr)] lg:gap-10 xl:gap-12">
          <section>
            <div className="rounded-[28px] border border-[#DCE6EA] bg-white p-4 shadow-[0_14px_40px_rgba(31,46,83,.07)]">
              <Pulse className="aspect-square w-full rounded-[22px]" />
            </div>
            <div className="mt-4 grid grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <Pulse key={index} className="aspect-square border border-[#DCE6EA]" />
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-[#DCE6EA] bg-white p-6 shadow-[0_14px_40px_rgba(31,46,83,.07)] lg:p-8">
            <Pulse className="h-9 w-44 rounded-full" />
            <Pulse className="mt-7 h-10 w-3/4" />
            <Pulse className="mt-4 h-5 w-52" />

            <div className="mt-7 border-t border-[#E7EEF1] pt-6">
              <Pulse className="h-4 w-28" />
              <Pulse className="mt-3 h-7 w-64" />
            </div>

            <div className="mt-5 overflow-hidden rounded-[20px] border border-[#DCE6EA]">
              <Pulse className="h-12 w-full rounded-none" />
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center gap-4 border-t border-[#E7EEF1] bg-white p-4">
                  <Pulse className="h-4 w-4 rounded-full" />
                  <Pulse className="h-4 flex-1" />
                  <Pulse className="h-4 w-20" />
                  <Pulse className="h-9 w-24" />
                </div>
              ))}
            </div>

            <Pulse className="mt-6 h-14 w-full rounded-xl bg-[#D5E2E8]" />
          </section>
        </div>
      </main>
    </div>
  )
}
