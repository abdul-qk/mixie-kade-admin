'use client'

import { shopPhotos } from '@/constants/shopPhotos'
import { useReveal } from '@/hooks/useReveal'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

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
            We carry 100+ grinder models and 50+ genuine spare parts to serve families, home cooks, and repair
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

        {/* Store photo — right */}
        <div className="reveal reveal-right delay-2 w-full lg:w-1/2 flex justify-center">
          <div className="relative w-full max-w-md aspect-[4/3] overflow-hidden rounded-sm ring-1 ring-brand-navy/10 shadow-md">
            <Image
              alt="Mixie Kadai showroom — mixer grinders and kitchen appliances in Jaffna"
              className="object-cover"
              fill
              sizes="(max-width: 1024px) 100vw, 448px"
              src={shopPhotos.homeAbout}
            />
          </div>
        </div>

      </div>
    </section>
  )
}
