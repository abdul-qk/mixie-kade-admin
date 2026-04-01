import type { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'

export const metadata: Metadata = {
  description: 'Your order has been placed successfully.',
  robots: { follow: false, index: false },
  title: 'Order Confirmed',
}

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function ConfirmOrderPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: SearchParams
}) {
  const searchParams = await searchParamsPromise
  const orderId = searchParams.id as string | undefined

  return (
    <div className="min-h-screen bg-brand-cream flex items-center justify-center px-6">
      <div className="max-w-lg w-full text-center py-20">

        {/* Checkmark icon */}
        <div className="w-20 h-20 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="#C9A84C" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="font-display text-4xl font-semibold text-brand-navy mb-4">
          Order Placed!
        </h1>
        <p className="font-body text-brand-muted text-base mb-2">
          Thank you for your order. We&apos;ve received it and will be in touch shortly.
        </p>
        {orderId && (
          <p className="font-body text-sm text-brand-muted mb-8">
            Order reference: <span className="font-semibold text-brand-navy">#{orderId}</span>
          </p>
        )}

        {/* COD reminder */}
        <div className="bg-brand-gold-light border border-brand-gold rounded-xl px-6 py-5 mb-10 text-left">
          <div className="flex items-start gap-3">
            <span className="text-brand-gold mt-0.5">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </span>
            <div>
              <p className="font-body text-sm font-semibold text-brand-navy">Cash on Delivery</p>
              <p className="font-body text-xs text-brand-muted mt-1">
                Payment will be collected when your order is delivered. We&apos;ll call you to confirm delivery details.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/shop"
            className="font-body text-sm font-semibold bg-brand-navy text-white px-8 py-3 hover:bg-brand-gold transition-colors duration-200"
          >
            Continue Shopping
          </Link>
          <Link
            href="/orders"
            className="font-body text-sm font-medium border border-brand-navy/20 text-brand-navy px-8 py-3 hover:border-brand-navy transition-colors duration-200"
          >
            View My Orders
          </Link>
        </div>

      </div>
    </div>
  )
}
