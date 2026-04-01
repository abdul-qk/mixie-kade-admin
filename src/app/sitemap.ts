import configPromise from '@payload-config'
import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'

import { SHOP_CATEGORY_SLUGS } from '@/constants/shopCategories'
import { getServerSideURL } from '@/utilities/getURL'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getServerSideURL().replace(/\/$/, '')
  const payload = await getPayload({ config: configPromise })

  const [pages, products] = await Promise.all([
    payload.find({
      collection: 'pages',
      draft: false,
      limit: 1000,
      overrideAccess: false,
      pagination: false,
      select: { slug: true, updatedAt: true },
      where: { _status: { equals: 'published' } },
    }),
    payload.find({
      collection: 'products',
      draft: false,
      limit: 5000,
      overrideAccess: false,
      pagination: false,
      select: { slug: true, updatedAt: true },
      where: { _status: { equals: 'published' } },
    }),
  ])

  const staticPaths = [
    '/',
    '/shop',
    '/about',
    '/contact',
    '/guides',
    '/guides/how-to-choose-mixer-grinder-sri-lanka',
    '/spare-parts',
    '/delivery/sri-lanka',
    '/faq',
    '/shipping-returns',
    '/privacy-policy',
  ]

  const entries: MetadataRoute.Sitemap = [
    ...staticPaths.map((path) => ({
      changeFrequency: 'weekly' as const,
      lastModified: new Date(),
      priority: path === '/' ? 1 : 0.82,
      url: `${base}${path}`,
    })),
    ...SHOP_CATEGORY_SLUGS.map((slug) => ({
      changeFrequency: 'weekly' as const,
      lastModified: new Date(),
      priority: 0.85,
      url: `${base}/shop/${slug}`,
    })),
  ]

  for (const doc of pages.docs) {
    if (!doc.slug || doc.slug === 'home') continue
    entries.push({
      changeFrequency: 'monthly',
      lastModified: doc.updatedAt ? new Date(doc.updatedAt) : new Date(),
      priority: 0.72,
      url: `${base}/${doc.slug}`,
    })
  }

  for (const doc of products.docs) {
    if (!doc.slug) continue
    entries.push({
      changeFrequency: 'weekly',
      lastModified: doc.updatedAt ? new Date(doc.updatedAt) : new Date(),
      priority: 0.78,
      url: `${base}/products/${doc.slug}`,
    })
  }

  return entries
}
