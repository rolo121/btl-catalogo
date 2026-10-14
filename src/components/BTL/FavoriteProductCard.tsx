"use client"

import Link from "next/link"
import Image from "next/image"
import * as Icon from "@phosphor-icons/react"
import type { ProductType } from "@/type/ProductType"
import { useWishlist } from "@/context/WishlistContext"
import { useCompare } from "@/context/CompareContext"
import { useModalCompareContext } from "@/context/ModalCompareContext"
import { useModalQuickviewContext } from "@/context/ModalQuickviewContext"
import { getProductMainImage, shouldBypassNextImageOptimization } from "@/lib/productImages"
import { getColorLabel, getColorSwatchStyle } from "@/lib/colors"

type Props = {
  product: ProductType
}

export default function FavoriteProductCard({ product }: Props) {
  const { removeFromWishlist } = useWishlist()
  const { compareState, addToCompare, removeFromCompare } = useCompare()
  const { openModalCompare } = useModalCompareContext()
  const { openQuickview } = useModalQuickviewContext()
  const productImage = getProductMainImage(product)

  const productId = String(product.id)
  const href = `/producto/${encodeURIComponent(product.slug || product.id)}`
  const isCompared = compareState.compareArray.some(
    (item) => String(item.id) === productId,
  )

  const colors = Array.from(
    new Set(
      (product.variation || [])
        .map((variant) => String(variant?.color || "").trim())
        .filter((color) => color && color.toLowerCase() !== "sin color"),
    ),
  )

  const visibleColors = colors.slice(0, 5)
  const hiddenColors = Math.max(0, colors.length - visibleColors.length)

  const handleQuickview = () => {
    openQuickview(product as Parameters<typeof openQuickview>[0])
  }

  const handleCompare = () => {
    if (isCompared) {
      removeFromCompare(productId)
      openModalCompare()
      return
    }

    if (compareState.compareArray.length >= 3) {
      openModalCompare()
      return
    }

    addToCompare(product)
    openModalCompare()
  }

  return (
    <article className="group overflow-hidden rounded-[22px] border border-[#DCE6EA] bg-white shadow-[0_8px_24px_rgba(31,46,83,.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(31,46,83,.12)]">
      <div className="relative aspect-square overflow-hidden bg-[#F7FAFB] p-5">
        <Link href={href} className="absolute inset-0 z-10" aria-label={`Ver ${product.name}`} />

        <Image
          src={productImage}
          alt={product.name}
          fill
          className="object-contain p-5 transition-transform duration-500 group-hover:scale-[1.055]"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          unoptimized={shouldBypassNextImageOptimization(productImage)}
        />

        <div className="absolute right-3 top-3 z-20 flex gap-2">
          <button
            type="button"
            onClick={() => removeFromWishlist(productId)}
            aria-label="Quitar de favoritos"
            title="Quitar de favoritos"
            className="grid h-9 w-9 place-items-center rounded-full border border-[#21577B] bg-[#21577B] text-white shadow-[0_7px_18px_rgba(31,46,83,.13)] transition hover:bg-[#1F2E53]"
          >
            <Icon.Heart size={17} weight="fill" />
          </button>

          <button
            type="button"
            onClick={handleCompare}
            aria-label={isCompared ? "Quitar de comparación" : "Comparar producto"}
            title={isCompared ? "Quitar de comparación" : "Comparar producto"}
            className={`grid h-9 w-9 place-items-center rounded-full border shadow-[0_7px_18px_rgba(31,46,83,.13)] transition ${
              isCompared
                ? "border-[#38A0A2] bg-[#38A0A2] text-white"
                : "border-[#DCE6EA] bg-white text-[#1F2E53] hover:border-[#38A0A2] hover:bg-[#38A0A2] hover:text-white"
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
        <Link href={href}>
          <h3 className="line-clamp-2 min-h-11 text-[14px] font-extrabold leading-5 text-[#1F2E53] transition group-hover:text-[#21577B]">
            {product.name}
          </h3>
        </Link>

        <div className="mt-3 flex min-h-6 items-center gap-2">
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

        <div className="mt-4 flex items-center justify-between border-t border-[#EEF3F5] pt-3">
          <Link
            href={href}
            className="text-xs font-extrabold text-[#21577B] transition hover:text-[#1F2E53]"
          >
            Ver producto
          </Link>

          <Icon.ArrowRight size={15} weight="bold" className="text-[#21577B]" />
        </div>
      </div>
    </article>
  )
}
