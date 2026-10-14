"use client"

import FinalizarCompraClient from "@/app/finalizar-compra/FinalizarCompraClient"
import type { ProductType } from "@/type/ProductType"

type QuoteClientProps = {
  product: ProductType
  initialQty?: number
  initialColor?: string
  initialSku?: string
  initialItems?: string
}

/**
 * Adaptador legacy.
 *
 * La cotización ya no tiene un motor/formulario independiente.
 * Cualquier llamada antigua a QuoteClient utiliza el mismo
 * FinalizarCompraClient que usa el carrito de cotización.
 */
export default function QuoteClient({
  product,
}: QuoteClientProps) {
  return <FinalizarCompraClient directProduct={product} />
}
