'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import {
  PRODUCT_PLACEHOLDER_IMAGE,
  shouldBypassNextImageOptimization,
} from '@/lib/productImages'

type CartProductImageProps = {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  priority?: boolean
}

const normalizeSource = (src: string) => {
  const value = String(src || '').trim()
  return value || PRODUCT_PLACEHOLDER_IMAGE
}

const CartProductImage = ({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
}: CartProductImageProps) => {
  const [imageSource, setImageSource] = useState(
    normalizeSource(src),
  )

  useEffect(() => {
    setImageSource(normalizeSource(src))
  }, [src])

  return (
    <Image
      src={imageSource}
      width={width}
      height={height}
      alt={alt}
      className={className}
      priority={priority}
      unoptimized={shouldBypassNextImageOptimization(imageSource)}
      onError={() => {
        if (
          imageSource !== PRODUCT_PLACEHOLDER_IMAGE
        ) {
          setImageSource(
            PRODUCT_PLACEHOLDER_IMAGE,
          )
        }
      }}
    />
  )
}

export default CartProductImage
