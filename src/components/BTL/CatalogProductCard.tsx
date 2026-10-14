"use client"

import Link from "next/link"
import * as Icon from "@phosphor-icons/react"
import type { ProductType } from "@/type/ProductType"
import { useWishlist } from "@/context/WishlistContext"
import { useModalWishlistContext } from "@/context/ModalWishlistContext"
import { useCompare } from "@/context/CompareContext"
import { useModalCompareContext } from "@/context/ModalCompareContext"
import { useModalQuickviewContext } from "@/context/ModalQuickviewContext"
import { getColorLabel, getColorSwatchStyle } from "@/lib/colors"
import { getProductMainImage } from "@/lib/productImages"
import useCatalogStore from "@/store/useCatalogStore"

type Props = {
  product: ProductType
  priorityImage?: boolean
}

export default function CatalogProductCard({
  product,
  priorityImage = false,
}: Props) {
  const { wishlistState, addToWishlist, removeFromWishlist } = useWishlist()
  const { openModalWishlist } = useModalWishlistContext()
  const { compareState, addToCompare, removeFromCompare } = useCompare()
  const { openModalCompare } = useModalCompareContext()
  const { openQuickview } = useModalQuickviewContext()
  const { updateCatalogScroll, markRestoreScroll } = useCatalogStore()

  const productId = String(product.id)
  const href = `/producto/${encodeURIComponent(product.slug || product.id)}`
  const image = getProductMainImage(product)

  const isFavorite = wishlistState.wishlistArray.some(
    (item) => String(item.id) === productId,
  )

  const isCompared = compareState.compareArray.some(
    (item) => String(item.id) === productId,
  )

  const colors = Array.from(
    new Set(
      (product.variation || [])
        .map((variation) => String(variation?.color || "").trim())
        .filter((color) => color && color.toLowerCase() !== "sin color"),
    ),
  )

  const visibleColors = colors.slice(0, 5)
  const hiddenColors = Math.max(0, colors.length - visibleColors.length)

  const handleQuickview = () => {
    openQuickview(product as Parameters<typeof openQuickview>[0])
  }

  const handleFavorite = () => {
    if (isFavorite) removeFromWishlist(productId)
    else addToWishlist(product)

    openModalWishlist()
  }

  const handleCompare = () => {
    if (isCompared) {
      removeFromCompare(productId)
      openModalCompare()
      return
    }

    if (compareState.compareArray.length >= 3) {
      alert("Podés comparar hasta 3 productos.")
      openModalCompare()
      return
    }

    addToCompare(product)
    openModalCompare()
  }

  const rememberCatalogReturn = () => {
    if (typeof window === "undefined") return

    updateCatalogScroll(window.scrollY)
    markRestoreScroll(true)
  }

  return (
    <article className="group relative overflow-hidden rounded-[22px] border border-[#DCE6EA] bg-white shadow-[0_8px_24px_rgba(31,46,83,.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(31,46,83,.12)]">
      <div className="relative aspect-square overflow-hidden bg-[#F7FAFB] p-5 transition-colors duration-300 group-hover:bg-[#F1F7F8]">
        <Link href={href} onClick={rememberCatalogReturn} aria-label={`Ver ${product.name}`} className="absolute inset-0 z-10" />

        <img
          src={image}
          alt={product.name}
          loading={priorityImage ? "eager" : "lazy"}
          className="h-full w-full object-contain transition-transform duration-500 ease-out group-hover:scale-[1.055]"
        />

        <div className="absolute right-3 top-3 z-30 flex gap-2 opacity-100 transition-all duration-300 md:-translate-y-1 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100">
          <button
            type="button"
            onClick={handleFavorite}
            aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
            title={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
            className={`grid h-9 w-9 place-items-center rounded-full border bg-white/95 shadow-[0_7px_18px_rgba(31,46,83,.12)] transition-all duration-200 hover:bg-[#21577B] hover:text-white ${
              isFavorite
                ? "border-[#21577B] bg-[#21577B] text-white"
                : "border-[#DCE6EA] text-[#1F2E53]"
            }`}
          >
            <Icon.Heart size={17} weight={isFavorite ? "fill" : "regular"} />
          </button>

          <button
            type="button"
            onClick={handleCompare}
            aria-label={isCompared ? "Quitar de comparación" : "Comparar producto"}
            title={isCompared ? "Quitar de comparación" : "Comparar producto"}
            className={`grid h-9 w-9 place-items-center rounded-full border bg-white/95 shadow-[0_7px_18px_rgba(31,46,83,.12)] transition-all duration-200 hover:bg-[#38A0A2] hover:text-white ${
              isCompared
                ? "border-[#38A0A2] bg-[#38A0A2] text-white"
                : "border-[#DCE6EA] text-[#1F2E53]"
            }`}
          >
            {isCompared ? (
              <Icon.CheckCircle size={18} weight="fill" />
            ) : (
              <Icon.ArrowsCounterClockwise size={18} weight="bold" />
            )}
          </button>

          <button
            type="button"
            onClick={handleQuickview}
            aria-label="Vista rápida"
            title="Vista rápida"
            className="grid h-9 w-9 place-items-center rounded-full border border-[#DCE6EA] bg-white/95 text-[#1F2E53] shadow-[0_7px_18px_rgba(31,46,83,.12)] transition-all duration-200 hover:border-[#8DBC21] hover:bg-[#8DBC21] hover:text-[#1F2E53]"
          >
            <Icon.Eye size={18} weight="bold" />
          </button>
        </div>
      </div>

      <div className="p-4">
        <Link href={href} onClick={rememberCatalogReturn}>
          <h3 className="line-clamp-2 min-h-11 text-[14px] font-extrabold leading-5 text-[#1F2E53] transition-colors group-hover:text-[#21577B]">
            {product.name}
          </h3>
        </Link>

        <div className="grid [grid-template-rows:0fr] transition-[grid-template-rows,margin] duration-300 ease-out group-hover:mt-2 group-hover:[grid-template-rows:1fr]">
          <div className="overflow-hidden">
            <div className="flex translate-y-1 items-center gap-2 pb-1 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
              {visibleColors.length > 0 ? (
                <>
                  {visibleColors.map((color) => (
                    <span
                      key={color}
                      title={getColorLabel(color)}
                      aria-label={getColorLabel(color)}
                      className="h-[17px] w-[17px] shrink-0 rounded-full shadow-[0_0_0_1px_rgba(31,46,83,.10)]"
                      style={getColorSwatchStyle(color)}
                    />
                  ))}
                  {hiddenColors > 0 ? (
                    <span className="text-[10px] font-extrabold text-[#52637A]">
                      +{hiddenColors}
                    </span>
                  ) : null}
                </>
              ) : (
                <span className="text-[11px] font-semibold text-[#8492A6]">
                  Colores por consultar
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-[#EEF3F5] pt-3">
          <Link
            href={href}
            onClick={rememberCatalogReturn}
            className="text-xs font-extrabold text-[#21577B] transition hover:text-[#1F2E53]"
          >
            Ver producto
          </Link>

          <Link
            href={href}
            onClick={rememberCatalogReturn}
            aria-label={`Ver ${product.name}`}
            className="grid h-8 w-8 place-items-center rounded-full border border-[#DCE6EA] text-[#21577B] transition-all duration-300 group-hover:border-[#21577B] group-hover:bg-[#21577B] group-hover:text-white"
          >
            <Icon.ArrowRight size={14} weight="bold" />
          </Link>
        </div>
      </div>
    </article>
  )
}
