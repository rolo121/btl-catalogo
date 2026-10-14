"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import * as Icon from "@phosphor-icons/react"
import type { ProductType } from "@/type/ProductType"
import { useWishlist } from "@/context/WishlistContext"
import HandlePagination from "@/components/Other/HandlePagination"
import BtlInnerHero from "@/components/BTL/BtlInnerHero"
import BtlCatalogFooter from "@/components/BTL/BtlCatalogFooter"
import FavoriteProductCard from "@/components/BTL/FavoriteProductCard"

export default function FavoritosClient() {
  const { wishlistState } = useWishlist()
  const [currentPage, setCurrentPage] = useState(0)
  const productsPerPage = 12

  const products = useMemo<ProductType[]>(
    () => wishlistState.wishlistArray || [],
    [wishlistState.wishlistArray],
  )

  const totalProducts = products.length
  const pageCount = Math.ceil(totalProducts / productsPerPage)

  useEffect(() => {
    if (currentPage > Math.max(0, pageCount - 1)) {
      setCurrentPage(Math.max(0, pageCount - 1))
    }
  }, [currentPage, pageCount])

  const offset = currentPage * productsPerPage
  const currentProducts = products.slice(offset, offset + productsPerPage)

  return (
    <>
      <BtlInnerHero
        eyebrow="BTL Marketing · Favoritos"
        title="Mis"
        accent="favoritos"
        description="Reúne aquí los productos que más te interesan para revisarlos con calma, compararlos y encontrar rápidamente la mejor opción para tu marca."
        type="favorites"
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
                Productos guardados
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#6B7A90] md:text-base">
                {totalProducts === 0
                  ? "Aún no has guardado productos."
                  : `${totalProducts} producto${totalProducts === 1 ? "" : "s"} guardado${totalProducts === 1 ? "" : "s"} para revisar después.`}
              </p>
            </div>

            {totalProducts > 0 ? (
              <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[#8DBC21]/12 px-4 py-2 text-sm font-extrabold text-[#648B12]">
                <Icon.Heart size={17} weight="fill" />
                {totalProducts} favorito{totalProducts === 1 ? "" : "s"}
              </div>
            ) : null}
          </div>

          {totalProducts === 0 ? (
            <section className="mt-8 rounded-[30px] border border-[#DCE6EA] bg-white px-6 py-14 text-center shadow-[0_10px_30px_rgba(31,46,83,.05)] md:py-18">
              <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-[#8DBC21]/10 text-[#8DBC21]">
                <Icon.Heart size={42} weight="regular" />
              </div>
              <h3 className="mt-6 text-2xl font-black text-[#1F2E53]">
                Aún no tienes favoritos
              </h3>
              <p className="mx-auto mt-3 max-w-[520px] text-sm leading-6 text-[#6B7A90] md:text-base">
                Usa el corazón en las tarjetas del catálogo para guardar productos y regresar a ellos cuando lo necesites.
              </p>
              <Link
                href="/productos"
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#21577B] px-6 py-3.5 text-sm font-extrabold text-white transition hover:bg-[#1F2E53]"
              >
                Explorar productos
                <Icon.ArrowRight size={16} weight="bold" />
              </Link>
            </section>
          ) : (
            <>
              <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
                {currentProducts.map((product) => (
                  <FavoriteProductCard key={product.id} product={product} />
                ))}
              </div>

              {pageCount > 1 ? (
                <div className="mt-10 flex justify-center">
                  <HandlePagination
                    pageCount={pageCount}
                    onPageChange={setCurrentPage}
                    forcePage={currentPage}
                  />
                </div>
              ) : null}

              <section className="mt-12 flex flex-col gap-5 rounded-[28px] bg-[#1F2E53] px-6 py-8 text-white md:flex-row md:items-center md:justify-between md:px-8">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[.14em] text-[#8DBC21]">
                    Sigue explorando
                  </p>
                  <h3 className="mt-2 text-xl font-black">
                    ¿Quieres agregar más opciones?
                  </h3>
                  <p className="mt-2 text-sm text-white/70">
                    Regresa al catálogo y guarda otros productos para tu selección.
                  </p>
                </div>
                <Link
                  href="/productos"
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-[#1F2E53] transition hover:bg-[#8DBC21]"
                >
                  Ver catálogo
                  <Icon.ArrowRight size={16} weight="bold" />
                </Link>
              </section>
            </>
          )}
        </div>
      </main>

      <BtlCatalogFooter />
    </>
  )
}
