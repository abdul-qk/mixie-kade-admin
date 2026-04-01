'use client'

import React from 'react'

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="mx-auto my-4 flex max-w-xl flex-col border border-brand-surface bg-white p-8 md:p-12">
      <h2 className="font-display text-xl font-semibold text-brand-navy">Something went wrong</h2>
      <p className="my-2 font-body text-sm text-brand-muted leading-relaxed">
        There was an issue with our storefront. This could be temporary — please try again.
      </p>
      <button
        className="mx-auto mt-4 flex w-full min-h-[44px] items-center justify-center bg-brand-navy px-4 font-body text-sm font-semibold tracking-wide text-white transition-colors duration-200 hover:bg-brand-gold hover:text-brand-navy"
        onClick={() => reset()}
        type="button"
      >
        Try again
      </button>
    </div>
  )
}
