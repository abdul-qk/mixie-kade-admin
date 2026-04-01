/* eslint-disable no-restricted-exports */
import type { MetadataRoute } from 'next'

import { getServerSideURL } from '@/utilities/getURL'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getServerSideURL().replace(/\/$/, '')

  return {
    host: baseUrl,
    rules: [
      {
        allow: '/',
        disallow: ['/api/', '/admin'],
        userAgent: '*',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
