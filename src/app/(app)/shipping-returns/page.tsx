import { canonicalUrl } from '@/utilities/canonicalUrl'
import type { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'

export const metadata: Metadata = {
  alternates: { canonical: canonicalUrl('/shipping-returns') },
  description:
    'Shipping, delivery, and returns policy for Mixie Kadai orders — mixer grinders and spare parts in Sri Lanka.',
  openGraph: { url: '/shipping-returns' },
  title: 'Shipping & Returns',
}

export default function ShippingReturnsPage() {
  return (
    <article className="min-h-screen bg-white">
      <div className="bg-brand-navy text-white py-14 px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-display text-3xl md:text-4xl font-semibold">Shipping &amp; returns</h1>
          <p className="font-body text-white/70 mt-3 text-sm">
            Last updated for customers shopping at mixiekadai.lk
          </p>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-6 lg:px-10 py-12 font-body text-brand-muted space-y-6 leading-relaxed">
        <section>
          <h2 className="font-display text-xl text-brand-navy mb-2">Shipping</h2>
          <p>
            We ship orders from our base in Jaffna to addresses across Sri Lanka. Delivery time
            depends on courier routes and your location; we share tracking or courier details when
            applicable.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl text-brand-navy mb-2">Damaged or wrong items</h2>
          <p>
            If something arrives damaged or incorrect, contact us within 48 hours of delivery with
            photos and your order reference. We will arrange a replacement or refund where
            appropriate.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl text-brand-navy mb-2">Returns</h2>
          <p>
            Spare parts and opened electrical items may not be eligible for return unless faulty.
            If you are unsure about compatibility, ask us before ordering. For eligible returns
            we will confirm the process by WhatsApp or email.
          </p>
        </section>
        <p className="text-sm">
          <Link className="text-brand-navy font-medium underline" href="/contact">
            Contact
          </Link>{' '}
          for order-specific questions.
        </p>
      </div>
    </article>
  )
}
