"use client"

import Link from "next/link"
import * as Icon from "@phosphor-icons/react"
import { useWishlist } from "@/context/WishlistContext"
import { useModalWishlistContext } from "@/context/ModalWishlistContext"
import { useCompare } from "@/context/CompareContext"
import { useModalCompareContext } from "@/context/ModalCompareContext"
import { getColorLabel, getColorSwatchStyle } from "@/lib/colors"
import type { ProductType } from "@/type/ProductType"

export type FeaturedProductCardData = {
  id: string
  slug: string
  name: string
  image: string
  colors: string[]
}

type Props = {
  product: FeaturedProductCardData
}

function toProductType(product: FeaturedProductCardData): ProductType {
  return {
    id: product.id,
    category: "Promocional",
    type: "Producto",
    name: product.name,
    gender: "general",
    new: false,
    sale: false,
    rate: 5,
    price: 0,
    originPrice: 0,
    brand: "",
    sold: 0,
    quantity: 0,
    quantityPurchase: 1,
    sizes: ["S/T"],
    variation: product.colors.map((color) => ({
      color,
      colorCode: color,
      colorImage: product.image,
      image: product.image,
      size: "S/T",
      stockFisico: 0,
      stockTransito: 0,
      fechaLlegada: "",
    })),
    thumbImage: [product.image],
    images: [product.image],
    description: "Producto promocional",
    action: "detail",
    slug: product.slug,
  }
}

export default function FeaturedProductCard({ product }: Props) {
  const { wishlistState, addToWishlist, removeFromWishlist } = useWishlist()
  const { openModalWishlist } = useModalWishlistContext()

  const {
    compareState,
    addToCompare,
    removeFromCompare,
  } = useCompare()
  const { openModalCompare } = useModalCompareContext()

  const productForActions = toProductType(product)

  const isFavorite = wishlistState.wishlistArray.some(
    (item) => String(item.id) === String(product.id),
  )

  const isCompared = compareState.compareArray.some(
    (item) => String(item.id) === String(product.id),
  )


  const handleFavorite = () => {
    if (isFavorite) {
      removeFromWishlist(product.id)
    } else {
      addToWishlist(productForActions)
    }

    openModalWishlist()
  }

  const handleCompare = () => {
    if (isCompared) {
      removeFromCompare(product.id)
      openModalCompare()
      return
    }

    if (compareState.compareArray.length >= 3) {
      alert("Podés comparar hasta 3 productos.")
      openModalCompare()
      return
    }

    addToCompare(productForActions)
    openModalCompare()
  }

  const visibleColors = product.colors.slice(0, 5)
  const hiddenColors = Math.max(0, product.colors.length - visibleColors.length)

  return (
    <article className="group relative overflow-hidden rounded-[24px] border border-[#DCE6EA] bg-white shadow-[0_8px_26px_rgba(31,46,83,.05)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_46px_rgba(31,46,83,.14)]">
      <div className="relative aspect-[1/1.02] overflow-hidden bg-[#F8FAFB] p-6 transition-colors duration-300 group-hover:bg-[#F2F8F8]">
        <Link
          href={`/producto/${encodeURIComponent(product.slug)}`}
          aria-label={`Ver ${product.name}`}
          className="absolute inset-0 z-10"
        />

        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-contain transition-transform duration-500 ease-out group-hover:scale-[1.06]"
        />

        <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(56,160,162,.10),transparent_58%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="absolute right-4 top-4 z-30 flex gap-2 opacity-100 transition-all duration-300 md:-translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100">
          <button
            type="button"
            onClick={handleFavorite}
            aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
            title={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
            className={`grid h-10 w-10 place-items-center rounded-full border bg-white/95 shadow-[0_8px_20px_rgba(31,46,83,.13)] backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:border-[#21577B] hover:bg-[#21577B] hover:text-white ${
              isFavorite
                ? "border-[#21577B] bg-[#21577B] text-white"
                : "border-[#DCE6EA] text-[#1F2E53]"
            }`}
          >
            <Icon.Heart size={18} weight={isFavorite ? "fill" : "regular"} />
          </button>

          <button
            type="button"
            onClick={handleCompare}
            aria-label={isCompared ? "Quitar de comparación" : "Comparar producto"}
            title={isCompared ? "Quitar de comparación" : "Comparar producto"}
            className={`grid h-10 w-10 place-items-center rounded-full border bg-white/95 shadow-[0_8px_20px_rgba(31,46,83,.13)] backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:border-[#38A0A2] hover:bg-[#38A0A2] hover:text-white ${
              isCompared
                ? "border-[#38A0A2] bg-[#38A0A2] text-white"
                : "border-[#DCE6EA] text-[#1F2E53]"
            }`}
          >
            {isCompared ? (
              <Icon.CheckCircle size={19} weight="fill" />
            ) : (
              <Icon.ArrowsCounterClockwise size={19} weight="bold" />
            )}
          </button>
        </div>

      </div>

      <div className="border-t border-[#EEF3F5] p-5">
        <Link
          href={`/producto/${encodeURIComponent(product.slug)}`}
          className="block"
        >
          <h3 className="line-clamp-2 min-h-12 text-base font-extrabold leading-6 text-[#1F2E53] transition-colors duration-300 group-hover:text-[#21577B]">
            {product.name}
          </h3>
        </Link>

        <div className="grid [grid-template-rows:0fr] transition-[grid-template-rows,margin] duration-300 ease-out group-hover:mt-2 group-hover:[grid-template-rows:1fr]">
          <div className="overflow-hidden">
            <div className="flex translate-y-1 items-center gap-2 pb-1 opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100">
              {visibleColors.length > 0 ? (
                <>
                  {visibleColors.map((color) => (
                    <span
                      key={color}
                      title={getColorLabel(color)}
                      aria-label={getColorLabel(color)}
                      className="h-[18px] w-[18px] shrink-0 rounded-full shadow-[0_0_0_1px_rgba(31,46,83,.10)]"
                      style={getColorSwatchStyle(color)}
                    />
                  ))}

                  {hiddenColors > 0 ? (
                    <span
                      className="ml-0.5 text-[11px] font-extrabold text-[#52637A]"
                      title={`${hiddenColors} colores adicionales`}
                    >
                      +{hiddenColors}
                    </span>
                  ) : null}
                </>
              ) : (
                <span className="text-xs font-semibold text-[#8492A6]">
                  Colores por consultar
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-[#EEF3F5] pt-4">
          <Link
            href={`/producto/${encodeURIComponent(product.slug)}`}
            className="text-sm font-extrabold text-[#21577B] transition-colors duration-300 hover:text-[#1F2E53]"
          >
            Ver producto
          </Link>

          <Link
            href={`/producto/${encodeURIComponent(product.slug)}`}
            aria-label={`Ver ${product.name}`}
            className="grid h-9 w-9 place-items-center rounded-full border border-[#DCE6EA] text-[#21577B] transition-all duration-300 group-hover:border-[#21577B] group-hover:bg-[#21577B] group-hover:text-white"
          >
            <Icon.ArrowRight
              size={16}
              weight="bold"
              className="transition-transform duration-300 group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </div>
    </article>
  )
}
