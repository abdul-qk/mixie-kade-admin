import { getServerSideURL } from './getURL'

/** Absolute canonical URL for a path (leading slash). */
export function canonicalUrl(path: string): string {
  const base = getServerSideURL().replace(/\/$/, '')
  const p = path.startsWith('/') ? path : `/${path}`
  return `${base}${p}`
}
