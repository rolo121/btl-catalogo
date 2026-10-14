'use client'

import React, { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import ShopBreadCrumbImg from '@/components/Shop/ShopBreadCrumbImg'
import BtlHeroHeader from '@/components/BTL/BtlHeroHeader'
import BtlCatalogFooter from '@/components/BTL/BtlCatalogFooter'
import CatalogSkeleton from '@/components/BTL/CatalogSkeleton'
import type {
  CatalogInitialCategoriesData,
  CatalogInitialData,
} from '@/lib/catalogServer'

type CatalogoClientProps = {
  initialCatalog?: CatalogInitialData | null
  initialCategories?: CatalogInitialCategoriesData | null
}

function CatalogoClientContent({
  initialCatalog,
  initialCategories,
}: CatalogoClientProps) {
  const searchParams = useSearchParams()
  const type = searchParams.get('type')

  return (
    <>
      <BtlHeroHeader className="absolute inset-x-0 top-0 z-30" />

      <ShopBreadCrumbImg
        dataType={type}
        initialCatalog={initialCatalog}
        initialCategories={initialCategories}
      />

      <BtlCatalogFooter />
    </>
  )
}

export default function CatalogoClient(props: CatalogoClientProps) {
  return (
    <Suspense fallback={<CatalogSkeleton />}>
      <CatalogoClientContent {...props} />
    </Suspense>
  )
}
