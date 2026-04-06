'use client'

import { Button } from '@/components/ui/button'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import Link from 'next/link'
import React, { useCallback, useState } from 'react'
import { toast } from 'sonner'

type Props = {
  hasVariants: boolean
  inStock: boolean
  productId: number
  productURL: string
}

export function ShopCardActions({ hasVariants, inStock, productId, productURL }: Props) {
  const { addItem } = useCart()
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = useCallback(() => {
    setIsAdding(true)
    addItem({ product: productId })
      .then(() => {
        toast.success('Item added to cart.')
      })
      .finally(() => {
        setIsAdding(false)
      })
  }, [addItem, productId])

  if (hasVariants) {
    return (
      <Link
        className="inline-flex h-9 items-center justify-center border border-brand-navy px-3 font-body text-xs font-semibold text-brand-navy transition-colors duration-200 hover:bg-brand-navy hover:text-white"
        href={productURL}
      >
        View Options
      </Link>
    )
  }

  return (
    <Button
      className="h-9 rounded-none bg-brand-navy px-3 font-body text-xs font-semibold text-white hover:bg-brand-navy/90"
      disabled={!inStock || isAdding}
      onClick={handleAddToCart}
      type="button"
    >
      {isAdding ? 'Adding...' : inStock ? 'Add to Cart' : 'Out of Stock'}
    </Button>
  )
}
