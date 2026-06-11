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
  const paymentMethod = searchParams.paymentMethod as 'cod' | 'bank_transfer' | undefined
  const isBankTransfer = paymentMethod === 'bank_transfer'

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

        {isBankTransfer ? (
          <div className="bg-brand-gold-light border border-brand-gold rounded-xl px-6 py-5 mb-10 text-left">
            <div className="flex items-start gap-3">
              <span className="text-brand-gold mt-0.5">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 1.343-3 3v6h6v-6c0-1.657-1.343-3-3-3zm0 0V6m0 2h.01M6 7h12a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2z" />
                </svg>
              </span>
              <div className="space-y-1">
                <p className="font-body text-sm font-semibold text-brand-navy">Online Bank Transfer</p>
                <p className="font-body text-xs text-brand-muted">
                  Please send your payment screenshot via WhatsApp with your order number as the reference.
                </p>
                <p className="font-body text-xs text-brand-muted">
                  Your order will be dispatched only after payment proof is verified.
                </p>
                <a
                  href={`https://wa.me/94776952531?text=${encodeURIComponent(`Hi, I've placed order #${orderId ?? ''} and completed the bank transfer. Please find my payment screenshot attached.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-body text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors duration-200"
                >
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Send Payment Screenshot on WhatsApp
                </a>
              </div>
            </div>
          </div>
        ) : (
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
        )}

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
