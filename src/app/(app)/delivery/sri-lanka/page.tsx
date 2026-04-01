import { canonicalUrl } from '@/utilities/canonicalUrl'
import type { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'

export const metadata: Metadata = {
  alternates: { canonical: canonicalUrl('/delivery/sri-lanka') },
  description:
    'Islandwide delivery for mixer grinders and spare parts across Sri Lanka. Dispatch from Jaffna, tracked shipping, secure packaging.',
  openGraph: { url: '/delivery/sri-lanka' },
  title: 'Delivery across Sri Lanka',
}

export default function DeliverySriLankaPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-brand-navy text-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="font-body text-brand-gold text-xs font-semibold tracking-widest uppercase mb-3">
            Logistics
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold mb-4">
            Islandwide delivery
          </h1>
          <p className="font-body text-white/70 max-w-2xl">
            We ship mixer grinders, spare parts, and accessories to every province — from Jaffna to
            Matara.
          </p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-14 font-body text-brand-muted space-y-4">
        <ul className="list-disc pl-5 space-y-2">
          <li>Orders dispatched within 1–2 business days where stock allows</li>
          <li>Secure packaging for motors, glass jars, and fragile parts</li>
          <li>Cash on delivery available on selected orders — see checkout for details</li>
        </ul>
        <p>
          Exact delivery times depend on courier routes and your location. Contact us on WhatsApp
          for a quick estimate before you order.
        </p>
        <Link
          className="inline-block font-body text-sm bg-brand-navy text-white px-6 py-2.5 hover:bg-brand-gold transition-colors"
          href="/shop"
        >
          Shop now
        </Link>
      </div>
    </div>
  )
}
