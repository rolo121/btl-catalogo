"use client"

import Link from "next/link"
import Image from "next/image"
import * as Icon from "@phosphor-icons/react"
import type { ProductType } from "@/type/ProductType"
import { useCompare } from "@/context/CompareContext"
import { getProductMainImage, shouldBypassNextImageOptimization } from "@/lib/productImages"
import { getColorLabel, getColorSwatchStyle } from "@/lib/colors"
import BtlInnerHero from "@/components/BTL/BtlInnerHero"
import BtlCatalogFooter from "@/components/BTL/BtlCatalogFooter"

const getColors = (product: ProductType) =>
  Array.from(
    new Set(
      (product.variation || [])
        .map((variant) => String(variant?.color || "").trim())
        .filter((color) => color && color.toLowerCase() !== "sin color"),
    ),
  )

const getCategoryLabel = (product: ProductType) => {
  const category = String(product.category || "").trim()
  const type = String(product.type || "").trim()

  if (category && !["premium", "ecoline", "kyte", "producto"].includes(category.toLowerCase())) {
    return category
  }

  return type || "Promocional"
}

const getAvailability = (product: ProductType) => {
  const variations = product.variation || []

  if (
    variations.some(
      (variant) =>
        Number(variant?.stockFisico || 0) > 0 ||
        String(variant?.disponibilidadLabel || "").toLowerCase().includes("inmedi"),
    )
  ) {
    return "Entrega inmediata"
  }

  const label = variations
    .map((variant) => String(variant?.disponibilidadLabel || "").trim())
    .find(
      (value) =>
        value &&
        !["sin stock", "sin fecha", "no disponible"].includes(value.toLowerCase()),
    )

  return label || "Consultar disponibilidad"
}

function ProductHead({
  product,
  onRemove,
}: {
  product: ProductType
  onRemove: () => void
}) {
  const href = `/producto/${encodeURIComponent(product.slug || product.id)}`
  const productImage = getProductMainImage(product)

  return (
    <div className="relative h-full rounded-[22px] border border-[#DCE6EA] bg-white p-4 shadow-[0_8px_24px_rgba(31,46,83,.05)]">
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Quitar ${product.name}`}
        className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full border border-[#DCE6EA] bg-white text-[#6B7A90] transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
      >
        <Icon.X size={14} weight="bold" />
      </button>

      <Link
        href={href}
        className="relative block aspect-square overflow-hidden rounded-2xl bg-[#F7FAFB]"
      >
        <Image
          src={productImage}
          alt={product.name}
          fill
          className="object-contain p-4"
          sizes="(max-width: 1024px) 80vw, 28vw"
          unoptimized={shouldBypassNextImageOptimization(productImage)}
        />
      </Link>

      <Link
        href={href}
        className="mt-4 block line-clamp-2 min-h-11 text-sm font-extrabold leading-5 text-[#1F2E53] transition hover:text-[#21577B]"
      >
        {product.name}
      </Link>
    </div>
  )
}

export default function CompararClient() {
  const { compareState, removeFromCompare, clearCompare } = useCompare()
  const products = compareState.compareArray.slice(0, 3)

  const gridTemplate =
    products.length > 0
      ? { gridTemplateColumns: `repeat(${products.length}, minmax(0, 1fr))` }
      : undefined

  return (
    <>
      <BtlInnerHero
        eyebrow="BTL Marketing · Comparador"
        title="Comparar"
        accent="productos"
        description="Revisa lado a lado las opciones seleccionadas y compara la información más útil antes de elegir el producto ideal para tu marca."
        type="compare"
      />

      <main className="bg-[#F5F9FB] py-10 md:py-14 lg:py-16">
        <div className="container">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <Link
                href="/productos"
                className="inline-flex items-center gap-2 text-sm font-extrabold text-[#21577B] transition hover:text-[#38A0A2]"
              >
                <Icon.ArrowLeft size={16} weight="bold" />
                Volver al catálogo
              </Link>
              <h2 className="mt-4 text-2xl font-black text-[#1F2E53] md:text-3xl">
                Comparación de productos
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#6B7A90] md:text-base">
                {products.length}/3 productos seleccionados.
              </p>
            </div>

            {products.length > 0 ? (
              <button
                type="button"
                onClick={clearCompare}
                className="inline-flex w-fit items-center gap-2 rounded-xl border border-[#DCE6EA] bg-white px-4 py-2.5 text-sm font-extrabold text-[#52637A] transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                <Icon.Trash size={16} />
                Limpiar comparación
              </button>
            ) : null}
          </div>

          {products.length === 0 ? (
            <section className="mt-8 rounded-[30px] border border-[#DCE6EA] bg-white px-6 py-14 text-center shadow-[0_10px_30px_rgba(31,46,83,.05)]">
              <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-[#38A0A2]/10 text-[#38A0A2]">
                <Icon.ArrowsCounterClockwise size={42} weight="bold" />
              </div>
              <h3 className="mt-6 text-2xl font-black text-[#1F2E53]">
                No hay productos para comparar
              </h3>
              <p className="mx-auto mt-3 max-w-[560px] text-sm leading-6 text-[#6B7A90] md:text-base">
                Selecciona entre dos y tres productos desde el catálogo para revisar sus diferencias en esta vista.
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
            <>
              {products.length === 1 ? (
                <div className="mt-8 flex items-start gap-3 rounded-2xl border border-[#CFE4E5] bg-[#EFF8F8] px-4 py-3 text-sm text-[#21577B]">
                  <Icon.Info size={20} weight="fill" className="mt-0.5 shrink-0 text-[#38A0A2]" />
                  <span>
                    Agrega al menos un producto más para aprovechar la comparación lado a lado.
                  </span>
                </div>
              ) : null}

              <section className="mt-8 hidden lg:block">
                <div className="grid grid-cols-[180px_1fr] gap-4">
                  <div />
                  <div className="grid gap-4" style={gridTemplate}>
                    {products.map((product) => (
                      <ProductHead
                        key={product.id}
                        product={product}
                        onRemove={() => removeFromCompare(product.id)}
                      />
                    ))}
                  </div>

                  {[
                    {
                      label: "Código",
                      render: (product: ProductType) => (
                        <span className="font-extrabold text-[#1F2E53]">
                          {product.slug || product.id}
                        </span>
                      ),
                    },
                    {
                      label: "Categoría",
                      render: (product: ProductType) => (
                        <span>{getCategoryLabel(product)}</span>
                      ),
                    },
                    {
                      label: "Disponibilidad",
                      render: (product: ProductType) => (
                        <span className="inline-flex rounded-full bg-[#8DBC21]/12 px-3 py-1.5 text-xs font-extrabold text-[#648B12]">
                          {getAvailability(product)}
                        </span>
                      ),
                    },
                    {
                      label: "Colores",
                      render: (product: ProductType) => {
                        const colors = getColors(product)
                        const visible = colors.slice(0, 6)
                        const extra = Math.max(0, colors.length - visible.length)

                        return colors.length > 0 ? (
                          <div className="flex flex-wrap items-center gap-2">
                            {visible.map((color) => (
                              <span
                                key={color}
                                title={getColorLabel(color)}
                                className="h-[18px] w-[18px] rounded-full shadow-[0_0_0_1px_rgba(31,46,83,.10)]"
                                style={getColorSwatchStyle(color)}
                              />
                            ))}
                            {extra > 0 ? (
                              <span className="text-xs font-extrabold text-[#52637A]">
                                +{extra}
                              </span>
                            ) : null}
                          </div>
                        ) : (
                          <span className="text-[#8492A6]">Por consultar</span>
                        )
                      },
                    },
                  ].map((row) => (
                    <div className="contents" key={row.label}>
                      <div className="flex items-center rounded-2xl bg-[#EAF1F4] px-5 py-4 text-sm font-extrabold text-[#1F2E53]">
                        {row.label}
                      </div>
                      <div className="grid gap-4" style={gridTemplate}>
                        {products.map((product) => (
                          <div
                            key={`${row.label}-${product.id}`}
                            className="flex min-h-16 items-center rounded-2xl border border-[#DCE6EA] bg-white px-5 py-4 text-sm text-[#52637A]"
                          >
                            {row.render(product)}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div className="flex items-center rounded-2xl bg-[#EAF1F4] px-5 py-4 text-sm font-extrabold text-[#1F2E53]">
                    Acción
                  </div>
                  <div className="grid gap-4" style={gridTemplate}>
                    {products.map((product) => (
                      <Link
                        key={`action-${product.id}`}
                        href={`/producto/${encodeURIComponent(product.slug || product.id)}`}
                        className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-[#21577B] px-4 py-3 text-sm font-extrabold text-white transition hover:bg-[#1F2E53]"
                      >
                        Ver producto
                        <Icon.ArrowRight size={15} weight="bold" />
                      </Link>
                    ))}
                  </div>
                </div>
              </section>

              <section className="mt-8 lg:hidden">
                <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4">
                  {products.map((product) => {
                    const colors = getColors(product)
                    const href = `/producto/${encodeURIComponent(product.slug || product.id)}`
                    const productImage = getProductMainImage(product)

                    return (
                      <article
                        key={product.id}
                        className="w-[86%] shrink-0 snap-center overflow-hidden rounded-[24px] border border-[#DCE6EA] bg-white shadow-[0_10px_28px_rgba(31,46,83,.06)] sm:w-[58%]"
                      >
                        <div className="relative aspect-square bg-[#F7FAFB]">
                          <Image
                            src={productImage}
                            alt={product.name}
                            fill
                            className="object-contain p-5"
                            sizes="86vw"
                            unoptimized={shouldBypassNextImageOptimization(productImage)}
                          />
                          <button
                            type="button"
                            onClick={() => removeFromCompare(product.id)}
                            className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white text-[#6B7A90] shadow-md"
                            aria-label={`Quitar ${product.name}`}
                          >
                            <Icon.X size={15} weight="bold" />
                          </button>
                        </div>

                        <div className="p-5">
                          <h3 className="text-base font-black text-[#1F2E53]">
                            {product.name}
                          </h3>

                          <div className="mt-5 space-y-4 text-sm">
                            <div className="flex justify-between gap-4 border-b border-[#EEF3F5] pb-3">
                              <span className="font-bold text-[#6B7A90]">Código</span>
                              <span className="text-right font-extrabold text-[#1F2E53]">
                                {product.slug || product.id}
                              </span>
                            </div>
                            <div className="flex justify-between gap-4 border-b border-[#EEF3F5] pb-3">
                              <span className="font-bold text-[#6B7A90]">Categoría</span>
                              <span className="text-right text-[#52637A]">
                                {getCategoryLabel(product)}
                              </span>
                            </div>
                            <div className="flex justify-between gap-4 border-b border-[#EEF3F5] pb-3">
                              <span className="font-bold text-[#6B7A90]">Disponibilidad</span>
                              <span className="text-right font-bold text-[#648B12]">
                                {getAvailability(product)}
                              </span>
                            </div>
                            <div>
                              <span className="font-bold text-[#6B7A90]">Colores</span>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {colors.slice(0, 8).map((color) => (
                                  <span
                                    key={color}
                                    title={getColorLabel(color)}
                                    className="h-[18px] w-[18px] rounded-full shadow-[0_0_0_1px_rgba(31,46,83,.10)]"
                                    style={getColorSwatchStyle(color)}
                                  />
                                ))}
                                {colors.length === 0 ? (
                                  <span className="text-xs text-[#8492A6]">Por consultar</span>
                                ) : null}
                              </div>
                            </div>
                          </div>

                          <Link
                            href={href}
                            className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-[#21577B] px-5 py-3 text-sm font-extrabold text-white"
                          >
                            Ver producto
                            <Icon.ArrowRight size={15} weight="bold" />
                          </Link>
                        </div>
                      </article>
                    )
                  })}
                </div>
              </section>

              <div className="mt-10 flex flex-col gap-4 rounded-[26px] border border-[#DCE6EA] bg-white p-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-lg font-black text-[#1F2E53]">
                    ¿Quieres comparar otra opción?
                  </h3>
                  <p className="mt-1 text-sm text-[#6B7A90]">
                    Puedes mantener hasta tres productos seleccionados.
                  </p>
                </div>
                <Link
                  href="/productos"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#21577B] px-5 py-3 text-sm font-extrabold text-[#21577B] transition hover:bg-[#21577B] hover:text-white"
                >
                  Volver al catálogo
                  <Icon.ArrowRight size={15} weight="bold" />
                </Link>
              </div>
            </>
          )}
        </div>
      </main>

      <BtlCatalogFooter />
    </>
  )
}
