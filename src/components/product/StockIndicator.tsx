'use client'
import { Product, Variant } from '@/payload-types'
import { useSearchParams } from 'next/navigation'
import { useMemo } from 'react'

type Props = {
  product: Product
}

export const StockIndicator: React.FC<Props> = ({ product }) => {
  const searchParams = useSearchParams()

  const variants = product.variants?.docs || []
  const hasVariants = Boolean(product.enableVariants && variants.length)

  const selectedVariant = useMemo<Variant | undefined>(() => {
    if (hasVariants) {
      const variantId = searchParams.get('variant')
      const validVariant = variants.find((variant) => {
        if (typeof variant === 'object') {
          return String(variant.id) === variantId
        }
        return String(variant) === variantId
      })

      if (validVariant && typeof validVariant === 'object') {
        return validVariant
      }
    }

    return undefined
  }, [hasVariants, searchParams, variants])

  const stockQuantity = useMemo<number | undefined>(() => {
    if (hasVariants) {
      if (selectedVariant) {
        return typeof selectedVariant.inventory === 'number' ? selectedVariant.inventory : undefined
      }
    }
    if (product.inStock === false) return 0
    if (product.inStock === true) return undefined
    return typeof product.inventory === 'number' ? product.inventory : undefined
  }, [hasVariants, selectedVariant, product.inventory, product.inStock])

  if (hasVariants && !selectedVariant) {
    return null
  }

  const isOutOfStock = typeof stockQuantity === 'number' ? stockQuantity === 0 : product.inStock === false

  return (
    <div className="uppercase font-mono text-sm font-medium text-gray-500">
      {typeof stockQuantity === 'number' && stockQuantity < 10 && stockQuantity > 0 && (
        <p>Only {stockQuantity} left in stock</p>
      )}
      {isOutOfStock && <p>Out of stock</p>}
    </div>
  )
}
