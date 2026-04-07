'use client'

import { Button } from '@/components/ui/button'
import type { Product } from '@/payload-types'

import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import clsx from 'clsx'
import { useRouter } from 'next/navigation'
import React, { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { useProductPurchaseState } from '@/components/Cart/useProductPurchaseState'

type Props = {
  product: Product
}

export function ProductCartActions({ product }: Props) {
  const { addItem, isLoading } = useCart()
  const router = useRouter()
  const [isBuying, setIsBuying] = useState(false)
  const { addItemPayload, disabled, disableDebug, hasVariants, helperText, selectedVariant } =
    useProductPurchaseState(product)

  const addToCart = useCallback(
    (e: React.FormEvent<HTMLButtonElement>) => {
      e.preventDefault()
      addItem(addItemPayload).then(() => {
        toast.success('Item added to cart.')
      })
    },
    [addItem, addItemPayload],
  )

  const buyNow = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()
      setIsBuying(true)
      addItem(addItemPayload)
        .then(() => {
          toast.success('Taking you to checkout…')
          router.push('/checkout')
        })
        .catch(() => {
          toast.error('Could not update your cart. Please try again.')
        })
        .finally(() => {
          setIsBuying(false)
        })
    },
    [addItem, addItemPayload, router],
  )

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log('[ProductCartActions debug]', {
        productId: product.id,
        productTitle: product.title,
        hasVariants,
        selectedVariantId: selectedVariant?.id,
        disabledByLogic: disabled,
        disabledFinalAdd: disabled || isLoading,
        disabledFinalBuy: disabled || isBuying,
        reason: disableDebug.reason,
      })
    }
  }, [product, hasVariants, selectedVariant, disabled, isLoading, isBuying, disableDebug.reason])

  return (
    <div className="w-full space-y-2">
      {helperText ? (
        <p className="font-body text-sm text-brand-muted leading-snug" role="status">
          {helperText}
        </p>
      ) : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-3">
        <Button
          aria-label="Add to cart"
          variant="default"
          className={clsx(
            'h-[52px] flex-1 rounded-none border-2 border-brand-navy bg-white !text-brand-navy shadow-none hover:bg-brand-cream hover:!text-brand-navy',
          )}
          disabled={disabled || isLoading || isBuying}
          onClick={addToCart}
          type="button"
        >
          {isLoading ? 'Adding…' : 'Add To Cart'}
        </Button>
        <Button
          aria-label="Buy now"
          variant="default"
          className={clsx(
            'h-[52px] flex-1 rounded-none border-2 border-brand-gold bg-brand-gold !text-brand-navy font-semibold shadow-none hover:bg-brand-navy hover:!text-white hover:border-brand-navy',
          )}
          disabled={disabled || isBuying || isLoading}
          onClick={buyNow}
          type="button"
        >
          {isBuying ? 'Please wait…' : 'Buy Now'}
        </Button>
      </div>
    </div>
  )
}
