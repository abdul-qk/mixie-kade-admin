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
          <a
            className="inline-flex items-center gap-2 font-body text-sm bg-[#25D366] text-white px-6 py-2.5 hover:bg-[#1da851] transition-colors"
            href={`https://wa.me/94776952531?text=${encodeURIComponent(
              "Hi Mixie Kadai! I'm looking for spare parts. Could you help me find the right fit for my model?",
            )}`}
            rel="noopener noreferrer"
            target="_blank"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Contact via WhatsApp
          </a>
          <Link
            className="inline-block font-body text-sm border border-brand-navy text-brand-navy px-6 py-2.5 hover:bg-brand-navy hover:text-white transition-colors"
            href="/contact"
          >
            Ask about compatibility
          </Link>
        </div>
        <div className="pt-4">
          <h2 className="font-display text-xl font-semibold text-brand-navy mb-4">
            Parts catalogue
          </h2>
          <iframe
            className="w-full border border-brand-navy/20"
            height={800}
            src="/spare-parts.pdf"
            title="Spare parts catalogue"
          />
          <a
            className="inline-block mt-3 font-body text-sm text-brand-navy underline underline-offset-2 hover:text-brand-gold transition-colors"
            download
            href="/spare-parts.pdf"
          >
            Download PDF
          </a>
        </div>
      </div>
    </div>
  )
}
