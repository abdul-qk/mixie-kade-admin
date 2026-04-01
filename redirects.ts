import type { NextConfig } from 'next'

export const redirects: NextConfig['redirects'] = async () => {
  const internetExplorerRedirect = {
    destination: '/ie-incompatible.html',
    has: [
      {
        type: 'header' as const,
        key: 'user-agent',
        value: '(.*Trident.*)', // all ie browsers
      },
    ],
    permanent: false,
    source: '/:path((?!ie-incompatible.html$).*)', // all pages except the incompatibility page
  }

  /** Apex domain is canonical; www → apex */
  const wwwToApex = {
    destination: 'https://mixiekadai.lk/:path*',
    has: [{ type: 'host' as const, value: 'www.mixiekadai.lk' }],
    permanent: true,
    source: '/:path*',
  }

  return [internetExplorerRedirect, wwwToApex]
}
