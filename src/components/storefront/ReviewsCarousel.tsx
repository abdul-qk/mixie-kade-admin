'use client'

import Image from 'next/image'
import React from 'react'

const images = Array.from({ length: 18 }, (_, i) => `/reviews/${i + 1}.jpeg`)

export function ReviewsCarousel() {
  return (
    <section className="py-16 bg-brand-cream overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 mb-10">
        <p className="font-body text-sm font-semibold tracking-widest text-brand-gold uppercase mb-3">
          Happy Customers
        </p>
        <h2 className="font-display text-3xl md:text-4xl font-semibold text-brand-navy">
          Loved across Sri Lanka
        </h2>
      </div>

      <div className="relative overflow-hidden">
        <div className="reviews-track flex gap-4 w-max">
          {[...images, ...images].map((src, i) => (
            <div
              key={i}
              className="relative flex-shrink-0 w-60 h-60 overflow-hidden rounded-sm ring-1 ring-brand-navy/10 shadow-sm"
            >
              <Image
                alt={`Happy customer ${(i % 18) + 1}`}
                className="object-cover"
                fill
                sizes="240px"
                src={src}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
