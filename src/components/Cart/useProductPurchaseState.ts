'use client'

import type { Product, Variant } from '@/payload-types'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import { useSearchParams } from 'next/navigation'
import { useMemo } from 'react'

export function disabledReasonMessage(reason: string): string | null {
  switch (reason) {
    case 'no-variant-selected':
      return 'Please select an option above before adding to cart.'
    case 'selected-variant-zero-inventory':
    case 'product-zero-inventory-or-instock-false':
      return 'This option is currently out of stock.'
    case 'existing-item-quantity-gte-selected-variant-inventory':
    case 'existing-item-quantity-gte-product-inventory':
      return 'Maximum quantity in cart for this item.'
    default:
      return null
  }
}

export function useProductPurchaseState(product: Product) {
  const { cart } = useCart()
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

  const disableDebug = useMemo(() => {
    const simpleProductInventory =
      product.inStock === false
        ? 0
        : product.inStock === true
          ? Number.POSITIVE_INFINITY
          : typeof product.inventory === 'number'
            ? product.inventory
            : Number.POSITIVE_INFINITY

    const existingItem = cart?.items?.find((item) => {
      const productID = typeof item.product === 'object' ? item.product?.id : item.product
      const variantID = item.variant
        ? typeof item.variant === 'object'
          ? item.variant?.id
          : item.variant
        : undefined

      if (productID === product.id) {
        if (hasVariants) {
          return variantID === selectedVariant?.id
        }
        return true
      }
    })

    if (existingItem) {
      const existingQuantity = existingItem.quantity

      if (hasVariants) {
        const maxVariantInventory = selectedVariant?.inventory || 0
        const isDisabled = existingQuantity >= maxVariantInventory

        return {
          isDisabled,
          reason: isDisabled ? 'existing-item-quantity-gte-selected-variant-inventory' : 'available',
          details: {
            existingQuantity,
            maxVariantInventory,
            selectedVariantId: selectedVariant?.id,
          },
        }
      }

      const isDisabled = existingQuantity >= simpleProductInventory

      return {
        isDisabled,
        reason: isDisabled ? 'existing-item-quantity-gte-product-inventory' : 'available',
        details: {
          existingQuantity,
          simpleProductInventory,
        },
      }
    }

    if (hasVariants) {
      if (!selectedVariant) {
        return {
          isDisabled: true,
          reason: 'no-variant-selected',
          details: {
            variantParam: searchParams.get('variant'),
          },
        }
      }

      if (selectedVariant.inventory === 0) {
        return {
          isDisabled: true,
          reason: 'selected-variant-zero-inventory',
          details: {
            selectedVariantId: selectedVariant.id,
            selectedVariantInventory: selectedVariant.inventory,
          },
        }
      }
    } else {
      if (simpleProductInventory === 0) {
        return {
          isDisabled: true,
          reason: 'product-zero-inventory-or-instock-false',
          details: {
            productInventory: product.inventory,
            productInStock: product.inStock,
            simpleProductInventory,
          },
        }
      }
    }

    return {
      isDisabled: false,
      reason: 'available',
      details: {
        selectedVariantId: selectedVariant?.id,
        productInventory: product.inventory,
        productInStock: product.inStock,
        simpleProductInventory,
      },
    }
  }, [selectedVariant, cart?.items, hasVariants, product, searchParams])

  const disabled = disableDebug.isDisabled
  const helperText = disabled ? disabledReasonMessage(disableDebug.reason) : null

  return {
    addItemPayload: {
      product: product.id,
      variant: selectedVariant?.id ?? undefined,
    } as const,
    disableDebug,
    disabled,
    hasVariants,
    helperText,
    selectedVariant,
  }
}
