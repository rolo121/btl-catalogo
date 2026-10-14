"use client"

import * as Icon from "@phosphor-icons/react"
import { useWishlist } from "@/context/WishlistContext"
import { useCompare } from "@/context/CompareContext"
import { useCart } from "@/context/CartContext"
import { useModalWishlistContext } from "@/context/ModalWishlistContext"
import { useModalCompareContext } from "@/context/ModalCompareContext"
import { useModalCartContext } from "@/context/ModalCartContext"

export default function BtlQuickActions() {
  const { wishlistState } = useWishlist()
  const { compareState } = useCompare()
  const { cartState, isCartHydrated } = useCart()
  const { openModalWishlist } = useModalWishlistContext()
  const { openModalCompare } = useModalCompareContext()
  const { openModalCart } = useModalCartContext()

  const favorites = wishlistState.wishlistArray.length
  const compares = compareState.compareArray.length
  const cartLines = isCartHydrated ? cartState.cartArray.length : 0

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={openModalWishlist}
        aria-label="Abrir favoritos"
        title="Favoritos"
        className="relative grid h-9 w-9 place-items-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-sm transition hover:border-[#8DBC21]/70 hover:bg-white/15 hover:text-[#8DBC21]"
      >
        <Icon.Heart size={18} weight={favorites > 0 ? "fill" : "regular"} />
        {favorites > 0 ? (
          <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#8DBC21] px-1 text-[10px] font-black leading-none text-[#1F2E53]">
            {favorites > 9 ? "9+" : favorites}
          </span>
        ) : null}
      </button>

      <button
        type="button"
        onClick={openModalCompare}
        aria-label="Abrir comparación"
        title="Comparar"
        className="relative grid h-9 w-9 place-items-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-sm transition hover:border-[#38A0A2] hover:bg-white/15 hover:text-[#38A0A2]"
      >
        <Icon.ArrowsCounterClockwise size={18} weight="bold" />
        {compares > 0 ? (
          <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#38A0A2] px-1 text-[10px] font-black leading-none text-white">
            {compares}
          </span>
        ) : null}
      </button>

      <button
        type="button"
        onClick={openModalCart}
        aria-label="Abrir carrito de cotización"
        title="Carrito de cotización"
        className="relative grid h-9 w-9 place-items-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-sm transition hover:border-[#8DBC21]/70 hover:bg-white/15 hover:text-[#8DBC21]"
      >
        <Icon.Handbag size={18} weight={cartLines > 0 ? "fill" : "regular"} />
        {cartLines > 0 ? (
          <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#8DBC21] px-1 text-[10px] font-black leading-none text-[#1F2E53]">
            {cartLines > 9 ? "9+" : cartLines}
          </span>
        ) : null}
      </button>
    </div>
  )
}
