'use client'

import type { StaticImageData } from 'next/image'

import { cn } from '@/utilities/cn'
import NextImage from 'next/image'
import React from 'react'

import type { Props as MediaProps } from '../types'

import { cssVariables } from '@/cssVariables'

const { breakpoints } = cssVariables

export const Image: React.FC<MediaProps> = (props) => {
  const {
    alt: altFromProps,
    fill,
    height: heightFromProps,
    imgClassName,
    onClick,
    onLoad: onLoadFromProps,
    priority,
    resource,
    size: sizeFromProps,
    src: srcFromProps,
    width: widthFromProps,
  } = props

  const [isLoading, setIsLoading] = React.useState(true)

  let width: number | undefined | null
  let height: number | undefined | null
  let alt = altFromProps
  let src: StaticImageData | string = srcFromProps != null ? srcFromProps : ''

  if (!src && resource && typeof resource === 'string') {
    const trimmed = resource.trim()
    src = trimmed
      ? /^https?:\/\//i.test(trimmed)
        ? trimmed
        : `${process.env.NEXT_PUBLIC_SERVER_URL}${trimmed.startsWith('/') ? trimmed : `/${trimmed}`}`
      : ''
  }

  if (!src && resource && typeof resource === 'object') {
    const {
      alt: altFromResource,
      height: fullHeight,
      url,
      width: fullWidth,
    } = resource

    width = widthFromProps ?? fullWidth
    height = heightFromProps ?? fullHeight
    alt = altFromResource

    src = `${process.env.NEXT_PUBLIC_SERVER_URL}${url}`
  }

  let unoptimized = false
  if (typeof src === 'string' && /^https?:\/\//i.test(src)) {
    try {
      const serverBase = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
      unoptimized = new URL(src).origin !== new URL(serverBase).origin
    } catch {
      unoptimized = true
    }
  }

  // NOTE: this is used by the browser to determine which image to download at different screen sizes
  const sizes = sizeFromProps
    ? sizeFromProps
    : Object.entries(breakpoints)
        .map(([, value]) => `(max-width: ${value}px) ${value}px`)
        .join(', ')

  return (
    <NextImage
      alt={alt || ''}
      className={cn(imgClassName)}
      fill={fill}
      height={!fill ? height || heightFromProps : undefined}
      onClick={onClick}
      onLoad={() => {
        setIsLoading(false)
        if (typeof onLoadFromProps === 'function') {
          onLoadFromProps()
        }
      }}
      priority={priority}
      quality={90}
      sizes={sizes}
      src={src}
      unoptimized={unoptimized}
      width={!fill ? width || widthFromProps : undefined}
    />
  )
}
