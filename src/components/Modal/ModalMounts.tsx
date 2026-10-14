'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import type CountdownTimeType from '@/type/CountdownType'
import { useModalQuickviewContext } from '@/context/ModalQuickviewContext'

const DynamicModalCart = dynamic(() => import('./ModalCart'), {
  ssr: false,
  loading: () => null,
})

const DynamicModalWishlist = dynamic(() => import('./ModalWishlist'), {
  ssr: false,
  loading: () => null,
})

const DynamicModalSearch = dynamic(() => import('./ModalSearch'), {
  ssr: false,
  loading: () => null,
})

const DynamicModalQuickview = dynamic(() => import('./ModalQuickview'), {
  ssr: false,
  loading: () => null,
})

const DynamicModalCompare = dynamic(() => import('./ModalCompare'), {
  ssr: false,
  loading: () => null,
})

interface ModalMountsProps {
  serverTimeLeft: CountdownTimeType
}

const ModalMounts = ({ serverTimeLeft }: ModalMountsProps) => {
  const [shouldMountModals, setShouldMountModals] = useState(false)
  const { selectedProduct } = useModalQuickviewContext()

  useEffect(() => {
    const mountModals = () => setShouldMountModals(true)
    const idleWindow = window as Window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout?: number }) => number
      cancelIdleCallback?: (handle: number) => void
    }

    if (idleWindow.requestIdleCallback && idleWindow.cancelIdleCallback) {
      const idleId = idleWindow.requestIdleCallback(mountModals, { timeout: 700 })
      return () => idleWindow.cancelIdleCallback?.(idleId)
    }

    const timer = window.setTimeout(mountModals, 180)
    return () => window.clearTimeout(timer)
  }, [])

  if (!shouldMountModals) return null

  return (
    <>
      <DynamicModalCart serverTimeLeft={serverTimeLeft} />
      <DynamicModalWishlist />
      <DynamicModalSearch />
      {selectedProduct ? <DynamicModalQuickview /> : null}
      <DynamicModalCompare />
    </>
  )
}

export default ModalMounts
