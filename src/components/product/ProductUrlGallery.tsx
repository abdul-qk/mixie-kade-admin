'use client'

import type { ProductImageSlide } from '@/utilities/productImages'

import { Media } from '@/components/Media'
import { GridTileImage } from '@/components/Grid/tile'
import React from 'react'

import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'

type Props = {
  slides: ProductImageSlide[]
}

/**
 * Product gallery when images come from admin "Product Images (URL)" (no variant-specific rows).
 */
export const ProductUrlGallery: React.FC<Props> = ({ slides }) => {
  const [current, setCurrent] = React.useState(0)

  if (!slides.length) return null

  const main = slides[current] ?? slides[0]

  return (
    <div>
      <div className="relative mb-8 aspect-square w-full overflow-hidden rounded-lg bg-brand-surface/20">
        <Media
          alt={main.alt}
          className="h-full w-full"
          fill
          imgClassName="object-contain"
          src={main.url}
        />
      </div>

      {slides.length > 1 ? (
        <Carousel className="w-full" opts={{ align: 'start', loop: false }}>
          <CarouselContent>
            {slides.map((slide, i) => (
              <CarouselItem
                className="basis-1/5"
                key={`${slide.url}-${i}`}
                onClick={() => setCurrent(i)}
              >
                <GridTileImage
                  active={i === current}
                  alt={slide.alt}
                  src={slide.url}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      ) : null}
    </div>
  )
}
