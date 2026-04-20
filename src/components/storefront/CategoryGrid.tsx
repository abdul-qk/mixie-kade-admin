'use client'

import { useReveal } from '@/hooks/useReveal'
import Link from 'next/link'
import React from 'react'

const categories = [
  { name: 'Mixer Grinders', slug: 'mixer-grinders', bg: 'bg-brand-navy', text: 'text-white' },
  { name: 'Blenders & Juicers', slug: 'blenders-juicers', bg: 'bg-brand-gold', text: 'text-white' },
  { name: 'Coconut Scrapers & Hand Mixers', slug: 'coconut-scrapers', bg: 'bg-brand-navy-light', text: 'text-white' },
  { name: 'Jars', slug: 'jars', bg: 'bg-brand-gold-light', text: 'text-brand-navy' },
  { name: 'Spare Parts', slug: 'spare-parts', bg: 'bg-brand-surface', text: 'text-brand-navy' },
  { name: 'Accessories', slug: 'accessories', bg: 'bg-brand-navy-dark', text: 'text-white' },
  { name: 'Offers', slug: '', bg: 'bg-brand-gold', text: 'text-white' },
]

export function CategoryGrid() {
  const sectionRef = useReveal()

  return (
    <section ref={sectionRef as React.RefObject<HTMLElement>} className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <h2 className="reveal font-display text-4xl md:text-5xl font-semibold text-brand-navy mb-3">
          Shop by Category
        </h2>
        <p className="reveal delay-1 font-body text-brand-muted text-base mb-12">
          Everything your kitchen — and your grinder — needs.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map(({ name, slug, bg, text }, i) => (
            <Link
              key={name}
              href={slug ? `/shop/${slug}` : '/shop'}
              className={`reveal delay-${Math.min(i + 1, 6)} group ${bg} ${text} p-6 flex flex-col justify-between min-h-36 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg`}
            >
              <span className="font-display text-xl font-semibold leading-snug">{name}</span>
              <span className="font-body text-sm font-medium mt-4 opacity-80 group-hover:opacity-100 transition-opacity">
                Browse →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
