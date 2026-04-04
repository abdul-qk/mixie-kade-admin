import type { Media, Product, Variant } from '@/payload-types'

export type ProductImageSlide = {
  alt: string
  url: string
}

/**
 * Turn a stored URL (absolute or site-relative) into a full URL for `<img>` / `next/image`.
 */
export function normalizeProductImageUrl(url: string, siteBaseUrl?: string): string {
  const trimmed = (url || '').trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  const base = (siteBaseUrl || process.env.NEXT_PUBLIC_SERVER_URL || '').replace(/\/$/, '')
  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  return base ? `${base}${path}` : path
}

export function hasUrlFieldImageRows(product: Product): boolean {
  return Boolean(product.images?.some((r) => (r?.url || '').trim()))
}

/** Slides built only from the "Product Images (URL)" admin field (not gallery fallback). */
export function getUrlFieldImageSlides(product: Product, siteBaseUrl?: string): ProductImageSlide[] {
  return slidesFromUrlField(product.images, siteBaseUrl)
}

function slidesFromUrlField(
  images: Product['images'],
  siteBaseUrl?: string,
): ProductImageSlide[] {
  if (!images?.length) return []
  const out: ProductImageSlide[] = []
  for (const row of images) {
    const u = normalizeProductImageUrl(row?.url || '', siteBaseUrl)
    if (u) out.push({ url: u, alt: (row?.alt || '').trim() })
  }
  return out
}

function slidesFromGallery(product: Product, siteBaseUrl?: string): ProductImageSlide[] {
  const rows = product.gallery?.filter((item) => typeof item.image === 'object') || []
  return rows.map((item) => {
    const im = item.image as Media
    return {
      url: normalizeProductImageUrl(im.url || '', siteBaseUrl),
      alt: (im.alt || '').trim(),
    }
  })
}

/**
 * Prefer admin "Product Images (URL)"; if empty, fall back to Payload gallery uploads.
 */
export function getProductImageSlides(
  product: Product,
  siteBaseUrl?: string,
): ProductImageSlide[] {
  const fromUrls = slidesFromUrlField(product.images, siteBaseUrl)
  if (fromUrls.length) return fromUrls

  const fromGallery = slidesFromGallery(product, siteBaseUrl)
  if (fromGallery.length) return fromGallery

  const meta = product.meta?.image
  if (meta && typeof meta === 'object' && meta.url) {
    return [
      {
        url: normalizeProductImageUrl(meta.url, siteBaseUrl),
        alt: (meta.alt || product.title || '').trim(),
      },
    ]
  }

  return []
}

/**
 * Thumbnail / line-item image. URL field wins; otherwise gallery + optional variant row + meta.
 */
export function getProductPrimarySlide(
  product: Product,
  variant?: Variant | null,
  siteBaseUrl?: string,
): ProductImageSlide | null {
  const urlSlides = slidesFromUrlField(product.images, siteBaseUrl)
  if (urlSlides.length) return urlSlides[0]

  const metaImage =
    product.meta?.image && typeof product.meta.image === 'object' ? product.meta.image : undefined

  let image: Media | undefined =
    typeof product.gallery?.[0]?.image === 'object'
      ? (product.gallery![0].image as Media)
      : undefined
  image = image || metaImage

  const isVariant = Boolean(variant) && typeof variant === 'object'
  if (isVariant && variant && product.gallery) {
    const imageVariant = product.gallery.find((item) => {
      if (!item.variantOption) return false
      const variantOptionID =
        typeof item.variantOption === 'object' ? item.variantOption.id : item.variantOption

      return variant.options?.some((option) => {
        if (typeof option === 'object') return option.id === variantOptionID
        return option === variantOptionID
      })
    })

    if (imageVariant && typeof imageVariant.image === 'object') {
      image = imageVariant.image as Media
    }
  }

  if (!image?.url) return null
  return {
    url: normalizeProductImageUrl(image.url, siteBaseUrl),
    alt: (image.alt || product.title || '').trim(),
  }
}
