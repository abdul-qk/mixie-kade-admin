'use client'

import Link from 'next/link'
import React from 'react'
import { useReveal } from '@/hooks/useReveal'

export function AboutSnippet() {
  const sectionRef = useReveal()

  return (
    <section ref={sectionRef as React.RefObject<HTMLElement>} className="py-20 bg-brand-surface">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

        {/* Text — left */}
        <div className="reveal reveal-left w-full lg:w-1/2">
          <p className="font-body text-sm font-semibold tracking-widest text-brand-gold uppercase mb-4">
            Our Story
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-brand-navy leading-tight mb-6">
            About Mixie Kadai
          </h2>
          <p className="font-body text-brand-muted text-base leading-relaxed mb-4">
            Mixie Kadai is Sri Lanka&apos;s trusted destination for mixer grinders, blenders, and kitchen appliances.
            We carry 20+ grinder models and 50+ genuine spare parts to serve families, home cooks, and repair
            technicians across the country.
          </p>
          <p className="font-body text-brand-muted text-base leading-relaxed mb-8">
            Whether you need a new appliance or a hard-to-find spare part, we stock professional-grade products
            so your kitchen never skips a beat.
          </p>
          <Link
            href="/about"
            className="inline-block font-body font-semibold text-sm text-brand-navy underline underline-offset-4 decoration-brand-gold hover:text-brand-gold transition-colors duration-200"
          >
            Read our story →
          </Link>
        </div>

        {/* Image placeholder — right */}
        <div className="reveal reveal-right delay-2 w-full lg:w-1/2 flex justify-center">
          <div className="relative w-full max-w-md aspect-[4/3] bg-brand-navy overflow-hidden">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-navy-light opacity-50" />
            <div className="absolute bottom-0 left-0 w-2/3 h-1/2 bg-brand-gold opacity-20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="font-display text-2xl text-white/30 italic">Mixie Kadai</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
