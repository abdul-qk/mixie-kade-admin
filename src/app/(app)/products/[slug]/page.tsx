import type { Media, Product } from '@/payload-types'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { ProductGridItem } from '@/components/ProductGridItem'
import { Gallery } from '@/components/product/Gallery'
import { ProductDescription } from '@/components/product/ProductDescription'
import { ProductReviewsSection } from '@/components/product/ProductReviewsSection'
import { WhatsAppButton } from '@/components/product/WhatsAppButton'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React, { Suspense } from 'react'
import { Metadata } from 'next'

import { canonicalUrl } from '@/utilities/canonicalUrl'
import { getServerSideURL } from '@/utilities/getURL'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'

type Args = {
  params: Promise<{
    slug: string
  }>
}

function absoluteMediaUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined
  if (url.startsWith('http')) return url
  return `${getServerSideURL()}${url}`
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const product = await queryProductBySlug({ slug })

  if (!product) return notFound()

  const gallery = product.gallery?.filter((item) => typeof item.image === 'object') || []
  const metaImage = typeof product.meta?.image === 'object' ? product.meta?.image : undefined
  const canIndex = product._status === 'published'
  const seoImage = metaImage || (gallery.length ? (gallery[0]?.image as Media) : undefined)
  const ogUrl = absoluteMediaUrl(seoImage?.url ?? undefined)

  const title = product.meta?.title || product.title
  const description = product.meta?.description || ''

  return {
    alternates: {
      canonical: canonicalUrl(`/products/${slug}`),
    },
    description,
    openGraph: mergeOpenGraph({
      ...(description ? { description } : {}),
      images: ogUrl
        ? [
            {
              alt: seoImage?.alt ?? title,
              height: seoImage?.height ?? undefined,
              url: ogUrl,
              width: seoImage?.width ?? undefined,
            },
          ]
        : undefined,
      title,
      url: `/products/${slug}`,
    }),
    robots: { follow: canIndex, googleBot: { follow: canIndex, index: canIndex }, index: canIndex },
    title,
  }
}

export default async function ProductPage({ params }: Args) {
  const { slug } = await params
  const product = await queryProductBySlug({ slug })

  if (!product) return notFound()

  const gallery =
    product.gallery
      ?.filter((item) => typeof item.image === 'object')
      .map((item) => ({ ...item, image: item.image as Media })) || []

  const lkrPrice = (product as any).price as number | undefined

  const productPageUrl = canonicalUrl(`/products/${slug}`)
  const metaDesc =
    typeof product.meta?.description === 'string' && product.meta.description.trim()
      ? product.meta.description
      : `${product.title} — mixer grinders & kitchen products from Mixie Kadai, Sri Lanka.`

  const imageUrls: string[] = []
  for (const item of gallery) {
    const im = item.image as Media
    const u = absoluteMediaUrl(im?.url ?? undefined)
    if (u) imageUrls.push(u)
  }
  const primaryImage =
    absoluteMediaUrl(
      typeof product.meta?.image === 'object' && product.meta?.image?.url
        ? product.meta.image.url
        : undefined,
    ) || imageUrls[0]

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@id': `${productPageUrl}#product`,
    '@type': 'Product',
    brand: {
      '@type': 'Brand',
      name: 'Mixie Kadai',
    },
    description: metaDesc,
    image: imageUrls.length ? imageUrls : primaryImage ? [primaryImage] : undefined,
    name: product.title,
    offers: {
      '@type': 'Offer',
      availability:
        (product.inventory ?? 0) > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      price: lkrPrice ?? product.priceInUSD,
      priceCurrency: lkrPrice ? 'LKR' : 'USD',
      url: productPageUrl,
    },
    url: productPageUrl,
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        item: canonicalUrl('/'),
        name: 'Home',
        position: 1,
      },
      {
        '@type': 'ListItem',
        item: canonicalUrl('/shop'),
        name: 'Shop',
        position: 2,
      },
      {
        '@type': 'ListItem',
        item: productPageUrl,
        name: product.title,
        position: 3,
      },
    ],
  }

  const payload = await getPayload({ config: configPromise })
  const relatedProducts = await queryRelatedProducts({ payload, product })
  const reviewsData = await payload.find({
    collection: 'product-reviews',
    limit: 6,
    pagination: false,
    sort: '-approvedAt',
    where: {
      and: [
        {
          product: {
            equals: product.id,
          },
        },
        {
          status: {
            equals: 'approved',
          },
        },
      ],
    },
  })
  const reviewSettings = await payload.findGlobal({
    slug: 'review-settings',
  })

  return (
    <React.Fragment>
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        type="application/ld+json"
      />
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        type="application/ld+json"
      />

      {/* Breadcrumb */}
      <div className="bg-brand-cream border-b border-brand-surface">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-3 flex items-center gap-2 font-body text-xs text-brand-muted">
          <Link href="/" className="hover:text-brand-navy transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-brand-navy transition-colors">Shop</Link>
          <span>/</span>
          <span className="text-brand-navy font-medium">{product.title}</span>
        </div>
      </div>

      {/* Product section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8 lg:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

            {/* Gallery */}
            <div>
              <Suspense
                fallback={
                  <div className="aspect-square w-full bg-brand-surface animate-pulse" />
                }
              >
                {gallery.length ? (
                  <Gallery gallery={gallery} />
                ) : (
                  <div className="aspect-square w-full border border-brand-surface bg-brand-cream flex items-center justify-center text-center p-8">
                    <div>
                      <p className="font-display text-2xl text-brand-navy mb-2">{product.title}</p>
                      <p className="font-body text-sm text-brand-muted">
                        Product images will appear here once uploaded.
                      </p>
                    </div>
                  </div>
                )}
              </Suspense>
            </div>

            {/* Details */}
            <div className="flex flex-col gap-6">
              <div>
                <h1 className="font-display text-3xl lg:text-4xl font-semibold text-brand-navy leading-snug mb-3">
                  {product.title}
                </h1>

                {/* LKR price badge */}
                {lkrPrice ? (
                  <p className="font-body text-2xl font-bold text-brand-navy">
                    Rs. {lkrPrice.toLocaleString()}
                  </p>
                ) : null}
              </div>

              {/* Product details */}
              <ProductDescription product={product} />

              {/* WhatsApp CTA */}
              <WhatsAppButton title={product.title} />

              {/* COD notice */}
              <div className="bg-brand-gold-light border-l-4 border-brand-gold px-4 py-3">
                <p className="font-body text-sm font-semibold text-brand-navy">Cash on Delivery</p>
                <p className="font-body text-xs text-brand-muted mt-0.5">
                  No online payment needed. Pay when your order arrives.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content blocks */}
      {product.layout?.length ? <RenderBlocks blocks={product.layout} /> : null}

      {/* Related products */}
      {relatedProducts.length ? (
        <div className="bg-brand-surface">
          <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8 lg:py-10">
            <RelatedProducts products={relatedProducts as Product[]} />
          </div>
        </div>
      ) : null}

      <ProductReviewsSection
        allowGuestReviews={reviewSettings?.allowGuestReviews !== false}
        enabled={reviewSettings?.enabled !== false}
        productID={product.id}
        reviews={(reviewsData.docs as any[]) ?? []}
      />
    </React.Fragment>
  )
}

function RelatedProducts({ products }: { products: Product[] }) {
  return (
    <div>
      <h2 className="font-display text-2xl font-semibold text-brand-navy mb-6">
        You Might Also Like
      </h2>
      <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 list-none p-0 m-0">
        {products.map((product) => (
          <li key={product.id}>
            <ProductGridItem product={product} />
          </li>
        ))}
      </ul>
    </div>
  )
}

const queryRelatedProducts = async ({
  payload,
  product,
}: {
  payload: Awaited<ReturnType<typeof getPayload>>
  product: Product
}) => {
  const curated = (product.relatedProducts?.filter((p) => typeof p === 'object') ?? []) as Product[]

  if (curated.length) return curated.slice(0, 4)

  if (!product.category) return []

  const fallback = await payload.find({
    collection: 'products',
    limit: 4,
    pagination: false,
    sort: '-updatedAt',
    where: {
      and: [
        {
          category: {
            equals: product.category,
          },
        },
        {
          id: {
            not_equals: product.id,
          },
        },
        {
          _status: {
            equals: 'published',
          },
        },
      ],
    },
  })

  return fallback.docs as Product[]
}

const queryProductBySlug = async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'products',
    depth: 3,
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: {
      and: [
        { slug: { equals: slug } },
        ...(draft ? [] : [{ _status: { equals: 'published' } }]),
      ],
    },
    populate: {
      variants: {
        title: true,
        priceInUSD: true,
        inventory: true,
        options: true,
      },
    },
  })

  return result.docs?.[0] || null
}
