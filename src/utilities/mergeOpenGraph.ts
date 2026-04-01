import type { Metadata } from 'next'

import { getServerSideURL } from './getURL'
import { SITE_NAME } from './site'

const base = getServerSideURL()

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  description:
    'Shop mixer grinders, genuine spare parts, and kitchen accessories. Islandwide delivery from Jaffna, Sri Lanka.',
  images: [
    {
      url: `${base}/logo.jpeg`,
      alt: SITE_NAME,
    },
  ],
  locale: 'en_LK',
  siteName: SITE_NAME,
  title: SITE_NAME,
}

export const mergeOpenGraph = (og?: Partial<Metadata['openGraph']>): Metadata['openGraph'] => {
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : defaultOpenGraph.images,
  }
}
