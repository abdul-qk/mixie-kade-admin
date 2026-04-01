import type { Metadata } from 'next'

import type { Page, Product } from '../payload-types'

import { canonicalUrl } from './canonicalUrl'
import { getServerSideURL } from './getURL'
import { mergeOpenGraph } from './mergeOpenGraph'
import { SITE_NAME } from './site'

export const generateMeta = async (args: { doc: Page | Product }): Promise<Metadata> => {
  const { doc } = args || {}

  const base = getServerSideURL()
  const slug = doc?.slug && typeof doc.slug === 'string' ? doc.slug : ''
  const path = slug === '' || slug === 'home' ? '/' : `/${slug}`

  const ogImage =
    typeof doc?.meta?.image === 'object' &&
    doc.meta.image !== null &&
    'url' in doc.meta.image &&
    doc.meta.image.url
      ? `${base}${doc.meta.image.url}`
      : undefined

  const title = doc?.meta?.title || doc?.title || SITE_NAME

  return {
    alternates: {
      canonical: canonicalUrl(path),
    },
    description: doc?.meta?.description,
    openGraph: mergeOpenGraph({
      ...(doc?.meta?.description
        ? {
            description: doc?.meta?.description,
          }
        : {}),
      images: ogImage
        ? [
            {
              url: ogImage,
            },
          ]
        : undefined,
      title,
      url: path,
    }),
    title,
  }
}
