import Link from 'next/link'
import React from 'react'

import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-28">
      <div className="mb-6">
        <p className="font-body text-xs font-semibold uppercase tracking-widest text-brand-gold mb-2">
          404
        </p>
        <h1 className="font-display text-4xl font-semibold text-brand-navy mb-3">Page not found</h1>
        <p className="font-body text-brand-muted max-w-md">
          The page you’re looking for doesn’t exist or may have been moved.
        </p>
      </div>
      <Button asChild variant="default" className="bg-brand-navy hover:bg-brand-gold text-white">
        <Link href="/">Back to home</Link>
      </Button>
    </div>
  )
}
