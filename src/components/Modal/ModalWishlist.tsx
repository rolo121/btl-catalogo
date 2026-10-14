"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import * as Icon from "@phosphor-icons/react"
import { useModalWishlistContext } from "@/context/ModalWishlistContext"
import { useWishlist } from "@/context/WishlistContext"
import { getProductMainImage, shouldBypassNextImageOptimization } from "@/lib/productImages"

export default function ModalWishlist() {
  const { isModalOpen, closeModalWishlist } = useModalWishlistContext()
  const { wishlistState, removeFromWishlist } = useWishlist()
  const [shouldRender, setShouldRender] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

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
      const timeout = window.setTimeout(() => setShouldRender(false), 280)
      return () => window.clearTimeout(timeout)
    }
  }, [isModalOpen, shouldRender])

  useEffect(() => {
    if (!isModalOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeModalWishlist()
    }

    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [isModalOpen, closeModalWishlist])

  if (!shouldRender) return null

  const products = wishlistState.wishlistArray

  return (
    <div
      className={`fixed inset-0 z-[140] bg-[#071A33]/55 backdrop-blur-[2px] transition-opacity duration-300 ease-out ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={closeModalWishlist}
      role="presentation"
    >
      <aside
        className={`absolute right-0 top-0 flex h-full w-full max-w-[470px] flex-col bg-white shadow-[-24px_0_70px_rgba(7,26,51,.22)] transition-transform duration-300 ease-out ${
          isVisible ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(event) => event.stopPropagation()}
        aria-label="Mis favoritos"
      >
        <div className="flex items-start justify-between border-b border-[#E7EEF1] px-6 py-6">
          <div>
            <div className="flex items-center gap-2 text-[#21577B]">
              <Icon.Heart size={20} weight="fill" />
              <span className="text-xs font-extrabold uppercase tracking-[.14em]">
                Favoritos
              </span>
            </div>
            <h2 className="mt-2 text-2xl font-black text-[#1F2E53]">
              Mis productos guardados
            </h2>
            <p className="mt-1 text-sm text-[#6B7A90]">
              {products.length} producto{products.length === 1 ? "" : "s"} guardado{products.length === 1 ? "" : "s"}.
            </p>
          </div>

          <button
            type="button"
            onClick={closeModalWishlist}
            aria-label="Cerrar favoritos"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#DCE6EA] text-[#1F2E53] transition hover:border-[#1F2E53] hover:bg-[#1F2E53] hover:text-white"
          >
            <Icon.X size={17} weight="bold" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6">
          {products.length === 0 ? (
            <div className="flex h-full min-h-[420px] flex-col items-center justify-center text-center">
              <div className="grid h-20 w-20 place-items-center rounded-full bg-[#8DBC21]/12 text-[#8DBC21]">
                <Icon.Heart size={36} weight="regular" />
              </div>
              <h3 className="mt-5 text-xl font-black text-[#1F2E53]">
                Aún no tienes favoritos
              </h3>
              <p className="mt-2 max-w-[310px] text-sm leading-6 text-[#6B7A90]">
                Guarda los productos que más te interesen y podrás encontrarlos rápidamente aquí.
              </p>
              <Link
                href="/productos"
                onClick={closeModalWishlist}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#21577B] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#1F2E53]"
              >
                Explorar catálogo
                <Icon.ArrowRight size={16} weight="bold" />
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#EDF2F4]">
              {products.map((product) => {
                const href = `/producto/${encodeURIComponent(product.slug || product.id)}`

                return (
                  <article key={product.id} className="flex gap-4 py-5">
                    <Link
                      href={href}
                      onClick={closeModalWishlist}
                      className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-[#F5F8F9] p-2"
                    >
                      <Image
                        src={getProductMainImage(product)}
                        alt={product.name}
                        fill
                        className="object-contain p-2"
                        sizes="96px"
                        unoptimized={shouldBypassNextImageOptimization(getProductMainImage(product))}
                      />
                    </Link>

                    <div className="min-w-0 flex-1">
                      <Link
                        href={href}
                        onClick={closeModalWishlist}
                        className="line-clamp-2 text-sm font-extrabold leading-5 text-[#1F2E53] transition hover:text-[#21577B]"
                      >
                        {product.name}
                      </Link>

                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <Link
                          href={href}
                          onClick={closeModalWishlist}
                          className="text-xs font-extrabold text-[#21577B] transition hover:text-[#38A0A2]"
                        >
                          Ver producto
                        </Link>

                        <button
                          type="button"
                          onClick={() => removeFromWishlist(String(product.id))}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#8A5A5A] transition hover:text-red-600"
                        >
                          <Icon.Trash size={14} />
                          Quitar
                        </button>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>

        <div className="border-t border-[#E7EEF1] bg-[#FAFCFC] p-6">
          {products.length > 0 ? (
            <Link
              href="/favoritos"
              onClick={closeModalWishlist}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#21577B] px-5 py-3.5 text-sm font-extrabold text-white transition hover:bg-[#1F2E53]"
            >
              Ver todos mis favoritos
              <Icon.ArrowRight size={16} weight="bold" />
            </Link>
          ) : null}

          <button
            type="button"
            onClick={closeModalWishlist}
            className="mt-3 w-full text-center text-sm font-bold text-[#52637A] transition hover:text-[#21577B]"
          >
            Continuar explorando
          </button>
        </div>
      </aside>
    </div>
  )
}
