"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import * as Icon from "@phosphor-icons/react"
import { useCart } from "@/context/CartContext"
import { getCartItemImage } from "@/lib/productImages"
import CartProductImage from "@/components/Cart/CartProductImage"
import BtlHeroHeader from "@/components/BTL/BtlHeroHeader"
import BtlCatalogFooter from "@/components/BTL/BtlCatalogFooter"

export default function CarritoClient() {
  const router = useRouter()
  const {
    cartState,
    updateCart,
    removeFromCart,
    clearCart,
    isCartHydrated,
    cartTimeLeft,
  } = useCart()

  const products = cartState.cartArray
  const hasCartItems = products.length > 0
  const totalUnits = products.reduce(
    (sum, item) => sum + Math.max(1, Number(item.quantity) || 1),
    0,
  )

  const updateQuantity = (productId: string, nextQuantity: number) => {
    if (nextQuantity < 1) return

    const product = products.find((item) => item.id === productId)
    if (!product) return

    updateCart(
      productId,
      nextQuantity,
      product.selectedSize,
      product.selectedColor,
    )
  }

  return (
    <>
      <header className="bg-[#071A33] pb-6 text-white">
        <BtlHeroHeader />
      </header>

      <section className="border-b border-[#DCE6EA] bg-white">
        <div className="container py-10 md:py-12">
          <Link
            href="/productos"
            className="inline-flex items-center gap-2 text-sm font-extrabold text-[#21577B] transition hover:text-[#38A0A2]"
          >
            <Icon.ArrowLeft size={16} weight="bold" />
            Volver al catálogo
          </Link>

          <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[.16em] text-[#38A0A2]">
                BTL Marketing · Cotización
              </p>
              <h1 className="mt-2 text-3xl font-black text-[#1F2E53] md:text-4xl">
                Mi carrito de <span className="text-[#8DBC21]">cotización</span>
              </h1>
              <p className="mt-3 max-w-[680px] text-sm leading-6 text-[#6B7A90] md:text-base">
                Revisa productos, variantes y cantidades antes de enviar tu solicitud. No estás realizando una compra ni un pago en línea.
              </p>
            </div>

            {hasCartItems ? (
              <button
                type="button"
                onClick={clearCart}
                className="inline-flex w-fit items-center gap-2 rounded-xl border border-[#DCE6EA] bg-white px-4 py-2.5 text-sm font-extrabold text-[#52637A] transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                <Icon.Trash size={16} />
                Vaciar cotización
              </button>
            ) : null}
          </div>
        </div>
      </section>

      <main className="bg-[#F5F9FB] py-10 md:py-14 lg:py-16">
        <div className="container">
          {!isCartHydrated ? (
            <div className="flex min-h-[360px] items-center justify-center rounded-[28px] border border-[#DCE6EA] bg-white">
              <Icon.CircleNotch size={32} className="animate-spin text-[#38A0A2]" />
            </div>
          ) : !hasCartItems ? (
            <section className="rounded-[30px] border border-[#DCE6EA] bg-white px-6 py-14 text-center shadow-[0_10px_30px_rgba(31,46,83,.05)]">
              <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-[#38A0A2]/10 text-[#38A0A2]">
                <Icon.Handbag size={42} weight="regular" />
              </div>
              <h2 className="mt-6 text-2xl font-black text-[#1F2E53]">
                Tu cotización está vacía
              </h2>
              <p className="mx-auto mt-3 max-w-[560px] text-sm leading-6 text-[#6B7A90] md:text-base">
                Selecciona productos, variantes y cantidades para preparar una solicitud con varias opciones.
              </p>
              <Link
                href="/productos"
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#21577B] px-6 py-3.5 text-sm font-extrabold text-white transition hover:bg-[#1F2E53]"
              >
                Explorar catálogo
                <Icon.ArrowRight size={16} weight="bold" />
              </Link>
            </section>
          ) : (
            <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
              <section>
                <div className="mb-5 flex items-start gap-3 rounded-2xl border border-[#CFE4E5] bg-[#EFF8F8] px-4 py-3 text-sm text-[#21577B]">
                  <Icon.Clock size={20} weight="fill" className="mt-0.5 shrink-0 text-[#38A0A2]" />
                  <div>
                    <span className="font-extrabold">Selección temporal: </span>
                    {String(cartTimeLeft.minutes).padStart(2, "0")}:
                    {String(cartTimeLeft.seconds).padStart(2, "0")}.
                    <span className="ml-1 text-[#52637A]">
                      Completa la solicitud antes de que expire el carrito.
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {products.map((product) => {
                    const quantity = Math.max(1, Number(product.quantity) || 1)
                    const productHref = `/producto/${encodeURIComponent(product.slug || product.id)}`

                    return (
                      <article
                        key={product.id}
                        className="flex flex-col gap-5 rounded-[24px] border border-[#DCE6EA] bg-white p-4 shadow-[0_8px_26px_rgba(31,46,83,.05)] sm:flex-row sm:items-center sm:p-5"
                      >
                        <Link
                          href={productHref}
                          className="flex h-32 w-full shrink-0 items-center justify-center overflow-hidden rounded-[18px] bg-[#F7FAFB] p-3 sm:h-28 sm:w-28"
                        >
                          <CartProductImage
                            src={getCartItemImage(product)}
                            width={220}
                            height={220}
                            alt={product.name}
                            className="h-full w-full object-contain"
                          />
                        </Link>

                        <div className="min-w-0 flex-1">
                          <Link
                            href={productHref}
                            className="line-clamp-2 text-base font-black text-[#1F2E53] transition hover:text-[#21577B]"
                          >
                            {product.name}
                          </Link>

                          <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-[#6B7A90]">
                            {product.selectedColor ? (
                              <span className="rounded-full bg-[#F0F5F7] px-3 py-1.5">
                                Color: {product.selectedColor}
                              </span>
                            ) : null}
                            {product.selectedSize ? (
                              <span className="rounded-full bg-[#F0F5F7] px-3 py-1.5">
                                Talla: {product.selectedSize}
                              </span>
                            ) : null}
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                          <div className="inline-flex items-center overflow-hidden rounded-xl border border-[#DCE6EA] bg-white">
                            <button
                              type="button"
                              onClick={() => updateQuantity(product.id, quantity - 1)}
                              disabled={quantity <= 1}
                              className="grid h-10 w-10 place-items-center text-[#52637A] transition hover:bg-[#F3F8F9] disabled:cursor-not-allowed disabled:opacity-30"
                            >
                              <Icon.Minus size={14} weight="bold" />
                            </button>
                            <span className="min-w-10 text-center text-sm font-black text-[#1F2E53]">
                              {quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(product.id, quantity + 1)}
                              className="grid h-10 w-10 place-items-center text-[#52637A] transition hover:bg-[#F3F8F9]"
                            >
                              <Icon.Plus size={14} weight="bold" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeFromCart(product.id)}
                            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#8A5A5A] transition hover:text-red-600"
                          >
                            <Icon.Trash size={15} />
                            Quitar
                          </button>
                        </div>
                      </article>
                    )
                  })}
                </div>
              </section>

              <aside className="h-fit rounded-[26px] border border-[#DCE6EA] bg-white p-6 shadow-[0_12px_34px_rgba(31,46,83,.07)] xl:sticky xl:top-6">
                <p className="text-xs font-extrabold uppercase tracking-[.14em] text-[#38A0A2]">
                  Resumen
                </p>
                <h2 className="mt-2 text-xl font-black text-[#1F2E53]">
                  Solicitud de cotización
                </h2>

                <div className="mt-6 space-y-4 border-y border-[#E7EEF1] py-5 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-[#6B7A90]">Líneas de producto</span>
                    <strong className="text-[#1F2E53]">{products.length}</strong>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-[#6B7A90]">Unidades seleccionadas</span>
                    <strong className="text-[#1F2E53]">{totalUnits}</strong>
                  </div>
                </div>

                <p className="mt-5 text-xs leading-5 text-[#6B7A90]">
                  Los precios finales serán confirmados por BTL Marketing según cantidades, disponibilidad, personalización y tiempos de entrega.
                </p>

                <button
                  type="button"
                  onClick={() => router.push("/finalizar-compra")}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#21577B] px-5 py-3.5 text-sm font-extrabold text-white transition hover:bg-[#1F2E53]"
                >
                  Solicitar cotización
                  <Icon.ArrowRight size={16} weight="bold" />
                </button>

                <Link
                  href="/productos"
                  className="mt-3 flex w-full items-center justify-center rounded-xl border border-[#DCE6EA] px-5 py-3 text-sm font-extrabold text-[#52637A] transition hover:border-[#38A0A2] hover:text-[#21577B]"
                >
                  Seguir agregando productos
                </Link>
              </aside>
            </div>
          )}
        </div>
      </main>

      <BtlCatalogFooter />
    </>
  )
}
