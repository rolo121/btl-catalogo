'use client'

import React from 'react'
import Link from 'next/link'
import * as Icon from '@phosphor-icons/react/dist/ssr'
import { ProductType } from '@/type/ProductType'
import Product from '../Product/Product'

interface Props {
  data: Array<ProductType>
  start: number
  limit: number
}

const BestSeller: React.FC<Props> = ({ data, start, limit }) => {
  const products = data.filter((product) => product.category === 'Destacados').slice(start, start + limit)

  return (
    <section className="tab-features-block style-marketplace md:pt-[60px] pt-10 bg-white">
      <div className="container">
        <div className="heading flex items-end justify-between gap-5 flex-wrap w-full">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-text-secondary">
              Productos destacados
            </p>
            <h2 className="heading3 mt-2 text-primary-dark">Catálogo BTL Marketing</h2>

            <p className="body1 text-text-text-secondary mt-3 max-w-[560px]">
              Explorá artículos populares para personalizar tu marca y solicitar una cotización rápida.
            </p>
          </div>

          <Link
            href="/productos"
            className="text-button-uppercase text-primary-dark inline-flex items-center gap-2 hover:gap-3 duration-300"
          >
            Ver todos los productos
            <Icon.ArrowRight size={18} />
          </Link>
        </div>

        {products.length > 0 ? (
          <div className="list-product grid xl:grid-cols-4 lg:grid-cols-4 md:grid-cols-3 grid-cols-2 md:gap-[30px] gap-5 relative section-swiper-navigation style-outline style-small-border md:mt-10 mt-6">
            {products.map((prd, index) => (
              <Product
  data={prd}
  type="marketplace"
  style=""
  key={prd.id || index}
/>
            ))}
          </div>
        ) : (
          <div className="md:mt-10 mt-6 rounded-2xl border border-line bg-surface p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-surface-alt text-primary">
              <Icon.Package size={34} weight="duotone" />
            </div>
            <h3 className="heading6 mt-4 text-text">Aún no hay productos para mostrar</h3>
            <p className="caption1 text-text-text-secondary mt-2">
              Cuando el catálogo cargue correctamente, aquí aparecerán los productos destacados.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

export default BestSeller
