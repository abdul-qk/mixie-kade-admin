import { Grid } from '@/components/Grid'
import React from 'react'

export default function Loading() {
  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Hero skeleton */}
      <div className="bg-brand-navy py-14 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="h-3 w-24 bg-white/20 rounded mb-4 animate-pulse" />
          <div className="h-10 w-32 bg-white/20 rounded mb-3 animate-pulse" />
          <div className="h-3 w-16 bg-white/10 rounded animate-pulse" />
        </div>
      </div>

      {/* Filter bar skeleton */}
      <div className="bg-white border-b border-brand-surface py-4 px-6">
        <div className="max-w-7xl mx-auto flex gap-2">
          <div className="h-9 flex-1 bg-brand-surface animate-pulse" />
          <div className="h-9 w-20 bg-brand-surface animate-pulse" />
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
        <Grid className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array(8)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="bg-white border border-brand-surface">
                <div className="aspect-square bg-brand-surface animate-pulse" />
                <div className="p-4 flex flex-col gap-2">
                  <div className="h-3 bg-brand-surface animate-pulse rounded" />
                  <div className="h-3 w-2/3 bg-brand-surface animate-pulse rounded" />
                  <div className="h-4 w-1/3 bg-brand-surface animate-pulse rounded mt-1" />
                </div>
              </div>
            ))}
        </Grid>
      </div>
    </div>
  )
}
