import { canonicalUrl } from '@/utilities/canonicalUrl'
import type { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'

export const metadata: Metadata = {
  alternates: {
    canonical: canonicalUrl('/guides/how-to-choose-mixer-grinder-sri-lanka'),
  },
  description:
    'Choose the right mixer grinder for your family: wattage, jar set, wet vs dry grinding, and spare parts availability in Sri Lanka.',
  openGraph: {
    url: '/guides/how-to-choose-mixer-grinder-sri-lanka',
  },
  title: 'How to Choose a Mixer Grinder in Sri Lanka',
}

export default function ChooseMixerGrinderGuidePage() {
  return (
    <article className="min-h-screen bg-white">
      <div className="bg-brand-navy text-white py-14 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="font-body text-brand-gold text-xs font-semibold tracking-widest uppercase mb-3">
            Guide
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-semibold mb-4">
            How to Choose a Mixer Grinder in Sri Lanka
          </h1>
          <p className="font-body text-white/70 text-sm">
            Practical tips before you buy — whether you’re upgrading or buying your first mixie.
          </p>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-6 lg:px-10 py-12 font-body text-brand-muted space-y-6 text-base leading-relaxed">
        <p>
          A good mixer grinder depends on how you cook: family size, how often you grind spices,
          whether you need juicing or blending, and how easy it is to find genuine spare parts
          (jars, couplers, blades) in Sri Lanka.
        </p>
        <h2 className="font-display text-2xl text-brand-navy">Wattage</h2>
        <p>
          Higher wattage (750W and above) suits heavier grinding and larger batches. Smaller
          households can do well with 500–750W models if daily load is moderate. Match wattage to
          your jar size and usage — don’t pay for power you won’t use.
        </p>
        <h2 className="font-display text-2xl text-brand-navy">Jars and accessories</h2>
        <p>
          Look for a set that covers wet grinding, dry masalas, and chutneys. If you blend or juice,
          confirm jar types and compatibility with replacements — spare jars are easier to source for
          popular brands.
        </p>
        <h2 className="font-display text-2xl text-brand-navy">Warranty and genuine parts</h2>
        <p>
          Prefer sellers who stock genuine spare parts and honour manufacturer warranty. That keeps
          your appliance running for years and avoids counterfeit blades and couplers.
        </p>
        <div className="border border-brand-surface bg-brand-cream p-6 rounded-lg not-prose">
          <p className="font-body text-brand-navy font-semibold mb-2">Shop mixer grinders</p>
          <p className="text-sm mb-4">
            Browse our range with islandwide delivery and cash on delivery options.
          </p>
          <Link
            className="inline-block font-body text-sm bg-brand-navy text-white px-6 py-2.5 hover:bg-brand-gold transition-colors"
            href="/shop/mixer-grinders"
          >
            View mixer grinders
          </Link>
        </div>
      </div>
    </article>
  )
}
