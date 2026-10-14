"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import * as Icon from "@phosphor-icons/react"
import { useModalCompareContext } from "@/context/ModalCompareContext"
import { useCompare } from "@/context/CompareContext"
import { getProductMainImage, shouldBypassNextImageOptimization } from "@/lib/productImages"

export default function ModalCompare() {
  const { isModalOpen, closeModalCompare } = useModalCompareContext()
  const {
    compareState,
    removeFromCompare,
    clearCompare,
    isCompareReady,
    startCompareExpiry,
  } = useCompare()

  const [showCompareWarning, setShowCompareWarning] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const products = compareState.compareArray
  const canCompare = products.length >= 2

  useEffect(() => {
    if (isModalOpen) {
      setShouldRender(true)
      const frame = window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => setIsVisible(true))
      })

      return () => window.cancelAnimationFrame(frame)
    }

    setIsVisible(false)

    if (shouldRender) {
      const timeout = window.setTimeout(() => setShouldRender(false), 320)
      return () => window.clearTimeout(timeout)
    }
  }, [isModalOpen, shouldRender])

  useEffect(() => {
    if (!isModalOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModalCompare()
        if (products.length > 0) startCompareExpiry()
      }
    }

    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [isModalOpen, closeModalCompare, products.length, startCompareExpiry])

  if (!isCompareReady || !shouldRender) return null

  const handleClose = () => {
    closeModalCompare()
    if (products.length > 0) startCompareExpiry()
  }

  const handleClear = () => {
    clearCompare()
    closeModalCompare()
  }

  const handleCompare = () => {
    if (canCompare) return

    setShowCompareWarning(true)
    window.setTimeout(() => setShowCompareWarning(false), 2600)
  }

  return (
    <div
      className={`fixed inset-0 z-[140] flex items-end bg-[#071A33]/55 backdrop-blur-[2px] transition-opacity duration-300 ease-out ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleClose}
      role="presentation"
    >
      <section
        className={`relative w-full rounded-t-[30px] bg-white shadow-[0_-24px_70px_rgba(7,26,51,.20)] transition-all duration-300 ease-out ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
        onClick={(event) => event.stopPropagation()}
        aria-label="Comparar productos"
      >
        <div className="container py-6 md:py-7">
          <div className="flex items-start justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 text-[#38A0A2]">
                <Icon.ArrowsCounterClockwise size={20} weight="bold" />
                <span className="text-xs font-extrabold uppercase tracking-[.14em]">
                  Comparador
                </span>
              </div>
              <h2 className="mt-2 text-2xl font-black text-[#1F2E53]">
                Productos seleccionados
              </h2>
              <p className="mt-1 text-sm text-[#6B7A90]">
                {products.length}/3 productos en comparación.
              </p>
            </div>

            <button
              type="button"
              onClick={handleClose}
              aria-label="Cerrar comparación"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#DCE6EA] text-[#1F2E53] transition hover:border-[#1F2E53] hover:bg-[#1F2E53] hover:text-white"
            >
              <Icon.X size={17} weight="bold" />
            </button>
          </div>

          {products.length === 0 ? (
            <div className="mt-6 flex flex-col items-center rounded-[24px] border border-dashed border-[#C8D7DD] bg-[#F7FAFB] px-6 py-8 text-center">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-[#38A0A2]/10 text-[#38A0A2]">
                <Icon.ArrowsCounterClockwise size={30} weight="bold" />
              </div>
              <h3 className="mt-4 text-lg font-black text-[#1F2E53]">
                Todavía no hay productos para comparar
              </h3>
              <p className="mt-2 max-w-[520px] text-sm leading-6 text-[#6B7A90]">
                Agrega hasta tres productos desde el catálogo para revisar sus diferencias en una sola vista.
              </p>
              <Link
                href="/productos"
                onClick={closeModalCompare}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#21577B] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#1F2E53]"
              >
                Explorar catálogo
                <Icon.ArrowRight size={16} weight="bold" />
              </Link>
            </div>
          ) : (
            <>
              <div className="mt-6 grid gap-3 md:grid-cols-3">
                {products.slice(0, 3).map((product) => (
                  <article
                    key={product.id}
                    className="relative flex items-center gap-4 rounded-[20px] border border-[#DCE6EA] bg-[#FAFCFC] p-3"
                  >
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-white">
                      <Image
                        src={getProductMainImage(product)}
                        alt={product.name}
                        fill
                        className="object-contain p-2"
                        sizes="80px"
                        unoptimized={shouldBypassNextImageOptimization(getProductMainImage(product))}
                      />
                    </div>

                    <div className="min-w-0 pr-7">
                      <p className="line-clamp-2 text-sm font-extrabold leading-5 text-[#1F2E53]">
                        {product.name}
                      </p>
                      <Link
                        href={`/producto/${encodeURIComponent(product.slug || product.id)}`}
                        onClick={closeModalCompare}
                        className="mt-2 inline-block text-xs font-extrabold text-[#21577B] transition hover:text-[#38A0A2]"
                      >
                        Ver producto
                      </Link>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCompare(product.id)}
                      aria-label={`Quitar ${product.name} de comparación`}
                      className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full bg-white text-[#6B7A90] shadow-sm transition hover:bg-red-50 hover:text-red-600"
                    >
                      <Icon.X size={13} weight="bold" />
                    </button>
                  </article>
                ))}
              </div>

              <div className="mt-6 flex flex-col gap-3 border-t border-[#E7EEF1] pt-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative">
                  {!canCompare ? (
                    <p className="text-sm font-semibold text-[#6B7A90]">
                      Agrega un producto más para habilitar la comparación.
                    </p>
                  ) : (
                    <p className="text-sm font-semibold text-[#52637A]">
                      Ya puedes revisar las diferencias entre los productos seleccionados.
                    </p>
                  )}

                  {showCompareWarning ? (
                    <div className="absolute bottom-full left-0 z-10 mb-2 w-[290px] rounded-2xl border border-[#F0D9B6] bg-[#FFF9EF] p-3 text-xs font-semibold text-[#7A5B2D] shadow-lg">
                      Necesitas al menos 2 productos para comparar.
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleClear}
                    className="rounded-xl border border-[#DCE6EA] bg-white px-5 py-3 text-sm font-extrabold text-[#52637A] transition hover:border-[#1F2E53] hover:text-[#1F2E53]"
                  >
                    Limpiar
                  </button>

                  {canCompare ? (
                    <Link
                      href="/comparar"
                      onClick={closeModalCompare}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#21577B] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#1F2E53]"
                    >
                      Comparar productos
                      <Icon.ArrowRight size={16} weight="bold" />
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={handleCompare}
                      className="rounded-xl bg-[#21577B]/45 px-5 py-3 text-sm font-extrabold text-white"
                    >
                      Comparar productos
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  )
}
