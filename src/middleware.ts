import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Legacy `/shop?category=slug` → `/shop/slug` (preserve `sort`, drop empty category param).
 * Slug is validated on the shop page against the Categories collection.
 */
export function middleware(request: NextRequest) {
  const url = request.nextUrl
  if (url.pathname !== '/shop') {
    return NextResponse.next()
  }

  const category = url.searchParams.get('category')
  if (!category || category.includes('/') || category.includes('..')) {
    return NextResponse.next()
  }

  const q = url.searchParams.get('q')
  if (q) {
    return NextResponse.next()
  }

  const next = new URL(request.url)
  next.pathname = `/shop/${category}`
  next.searchParams.delete('category')
  const sort = next.searchParams.get('sort')
  if (!sort) {
    next.searchParams.delete('sort')
  }

  return NextResponse.redirect(next)
}

export const config = {
  matcher: ['/shop'],
}
