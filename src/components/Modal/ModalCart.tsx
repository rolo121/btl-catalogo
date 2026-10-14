"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import * as Icon from "@phosphor-icons/react"
import { useModalCartContext } from "@/context/ModalCartContext"
import { useCart } from "@/context/CartContext"
import type CountdownTimeType from "@/type/CountdownType"
import { getCartItemImage } from "@/lib/productImages"
import CartProductImage from "@/components/Cart/CartProductImage"

interface ModalCartProps {
  serverTimeLeft: CountdownTimeType
}

export default function ModalCart({ serverTimeLeft }: ModalCartProps) {
  const { isModalOpen, closeModalCart } = useModalCartContext()
  const {
    cartState,
    removeFromCart,
    updateCart,
    isCartHydrated,
    cartTimeLeft,
  } = useCart()

  const [shouldRender, setShouldRender] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  const products = cartState.cartArray
  const timeLeft = isCartHydrated ? cartTimeLeft : serverTimeLeft
  const totalUnits = products.reduce(
    (sum, item) => sum + Math.max(1, Number(item.quantity) || 1),
    0,
  )

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
      if (event.key === "Escape") closeModalCart()
    }

    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [isModalOpen, closeModalCart])

  if (!shouldRender) return null

  const updateQuantity = (
    id: string,
    nextQuantity: number,
    selectedSize: string,
    selectedColor: string,
  ) => {
    if (nextQuantity < 1) return
    updateCart(id, nextQuantity, selectedSize, selectedColor)
  }

  return (
    <div
      className={`fixed inset-0 z-[140] bg-[#071A33]/55 backdrop-blur-[2px] transition-opacity duration-300 ease-out ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={closeModalCart}
      role="presentation"
    >
      <aside
        className={`absolute right-0 top-0 flex h-full w-full max-w-[500px] flex-col bg-white shadow-[-24px_0_70px_rgba(7,26,51,.22)] transition-transform duration-300 ease-out ${
          isVisible ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(event) => event.stopPropagation()}
        aria-label="Carrito de cotización"
      >
        <div className="flex items-start justify-between border-b border-[#E7EEF1] px-6 py-6">
          <div>
            <div className="flex items-center gap-2 text-[#38A0A2]">
              <Icon.Handbag size={20} weight="fill" />
              <span className="text-xs font-extrabold uppercase tracking-[.14em]">
                Cotización
              </span>
            </div>
            <h2 className="mt-2 text-2xl font-black text-[#1F2E53]">
              Carrito de cotización
            </h2>
            <p className="mt-1 text-sm text-[#6B7A90]">
              {products.length} línea{products.length === 1 ? "" : "s"} · {totalUnits} unidad{totalUnits === 1 ? "" : "es"}.
            </p>
          </div>

          <button
            type="button"
            onClick={closeModalCart}
            aria-label="Cerrar carrito de cotización"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#DCE6EA] text-[#1F2E53] transition hover:border-[#1F2E53] hover:bg-[#1F2E53] hover:text-white"
          >
            <Icon.X size={17} weight="bold" />
          </button>
        </div>

        {products.length > 0 ? (
          <div className="border-b border-[#E7EEF1] bg-[#F3F8F9] px-6 py-3 text-xs font-bold text-[#52637A]">
            Tu selección estará disponible por{" "}
            <span className="font-black text-[#21577B]">
              {String(timeLeft.minutes).padStart(2, "0")}:
              {String(timeLeft.seconds).padStart(2, "0")}
            </span>
          </div>
        ) : null}

        <div className="flex-1 overflow-y-auto px-6">
          {!isCartHydrated ? (
            <div className="flex h-full min-h-[360px] items-center justify-center">
              <Icon.CircleNotch
                size={28}
                className="animate-spin text-[#38A0A2]"
              />
            </div>
          ) : products.length === 0 ? (
            <div className="flex h-full min-h-[420px] flex-col items-center justify-center text-center">
              <div className="grid h-20 w-20 place-items-center rounded-full bg-[#38A0A2]/10 text-[#38A0A2]">
                <Icon.Handbag size={36} weight="regular" />
              </div>
              <h3 className="mt-5 text-xl font-black text-[#1F2E53]">
                Tu cotización está vacía
              </h3>
              <p className="mt-2 max-w-[320px] text-sm leading-6 text-[#6B7A90]">
                Selecciona variantes y cantidades en los productos para preparar una solicitud con varias opciones.
              </p>
              <Link
                href="/productos"
                onClick={closeModalCart}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#21577B] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#1F2E53]"
              >
                Explorar catálogo
                <Icon.ArrowRight size={16} weight="bold" />
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#EDF2F4]">
              {products.map((product) => {
                const selectedColor = String(product.selectedColor || "").trim()
                const selectedSize = String(product.selectedSize || "").trim()
                const quantity = Math.max(1, Number(product.quantity) || 1)
                const productHref = `/producto/${encodeURIComponent(product.slug || product.id)}`

                return (
                  <article key={product.id} className="flex gap-4 py-5">
                    <Link
                      href={productHref}
                      onClick={closeModalCart}
                      className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-[#F5F8F9] p-2"
                    >
                      <CartProductImage
                        src={getCartItemImage(product)}
                        width={160}
                        height={160}
                        alt={product.name}
                        className="h-full w-full object-contain"
                      />
                    </Link>

                    <div className="min-w-0 flex-1">
                      <Link
                        href={productHref}
                        onClick={closeModalCart}
                        className="line-clamp-2 text-sm font-extrabold leading-5 text-[#1F2E53] transition hover:text-[#21577B]"
                      >
                        {product.name}
                      </Link>

                      <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-bold text-[#6B7A90]">
                        {selectedColor ? (
                          <span className="rounded-full bg-[#F0F5F7] px-2.5 py-1">
                            {selectedColor}
                          </span>
                        ) : null}
                        {selectedSize ? (
                          <span className="rounded-full bg-[#F0F5F7] px-2.5 py-1">
                            {selectedSize}
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-3">
                        <div className="inline-flex items-center overflow-hidden rounded-xl border border-[#DCE6EA] bg-white">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                product.id,
                                quantity - 1,
                                selectedSize,
                                selectedColor,
                              )
                            }
                            disabled={quantity <= 1}
                            className="grid h-8 w-8 place-items-center text-[#52637A] transition hover:bg-[#F3F8F9] disabled:cursor-not-allowed disabled:opacity-30"
                            aria-label="Disminuir cantidad"
                          >
                            <Icon.Minus size={13} weight="bold" />
                          </button>
                          <span className="min-w-8 text-center text-xs font-black text-[#1F2E53]">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                product.id,
                                quantity + 1,
                                selectedSize,
                                selectedColor,
                              )
                            }
                            className="grid h-8 w-8 place-items-center text-[#52637A] transition hover:bg-[#F3F8F9]"
                            aria-label="Aumentar cantidad"
                          >
                            <Icon.Plus size={13} weight="bold" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFromCart(product.id)}
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
            <>
              <Link
                href="/carrito"
                onClick={closeModalCart}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#21577B] px-5 py-3.5 text-sm font-extrabold text-white transition hover:bg-[#1F2E53]"
              >
                Revisar cotización
                <Icon.ArrowRight size={16} weight="bold" />
              </Link>

              <Link
                href="/productos"
                onClick={closeModalCart}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-[#DCE6EA] bg-white px-5 py-3 text-sm font-extrabold text-[#52637A] transition hover:border-[#38A0A2] hover:text-[#21577B]"
              >
                Seguir agregando productos
              </Link>
            </>
          ) : null}

        </div>
      </aside>
    </div>
  )
}
