import { canonicalUrl } from '@/utilities/canonicalUrl'
import type { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'

export const metadata: Metadata = {
  alternates: { canonical: canonicalUrl('/spare-parts') },
  description:
    'Genuine mixer grinder spare parts in Sri Lanka — jars, blades, gaskets, couplers. Islandwide delivery from Mixie Kadai.',
  openGraph: { url: '/spare-parts' },
  title: 'Spare Parts',
}

export default function SparePartsHubPage() {
  return (
    <div className="min-h-screen bg-brand-cream">
      <div className="bg-brand-navy text-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="font-body text-brand-gold text-xs font-semibold tracking-widest uppercase mb-3">
            Support
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold mb-4">
            Genuine spare parts
          </h1>
          <p className="font-body text-white/70 max-w-2xl">
            Keep your mixer grinder running with authentic parts. We stock popular jars, blades,
            and accessories — with delivery across Sri Lanka.
          </p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-14 font-body text-brand-muted space-y-6">
        <p>
          Counterfeit parts can damage motors and void warranty. Mixie Kadai focuses on genuine
          components and compatibility guidance so you order the right fit for your model.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            className="inline-block font-body text-sm bg-brand-navy text-white px-6 py-2.5 hover:bg-brand-gold transition-colors"
            href="/shop/spare-parts"
          >
            Browse spare parts in shop
          </Link>
          <Link
            className="inline-block font-body text-sm border border-brand-navy text-brand-navy px-6 py-2.5 hover:bg-brand-navy hover:text-white transition-colors"
            href="/contact"
          >
            Ask about compatibility
          </Link>
        </div>
      </div>
    </div>
  )
}
