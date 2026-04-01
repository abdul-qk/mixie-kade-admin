'use client'

import React, { useState } from 'react'

type Props = {
  productID: number
}

export function ProductReviewForm({ productID }: Props) {
  const [rating, setRating] = useState(5)
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)
    setError(null)

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          displayName,
          email,
          productID,
          rating,
          title,
        }),
      })

      const data = (await response.json()) as { message?: string }

      if (!response.ok) {
        throw new Error(data?.message || 'Failed to submit review.')
      }

      setMessage(data?.message || 'Review submitted successfully.')
      setDisplayName('')
      setEmail('')
      setTitle('')
      setContent('')
      setRating(5)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="border border-brand-surface bg-white p-5 md:p-6 space-y-4">
      <h3 className="font-display text-xl text-brand-navy">Write a Review</h3>
      <p className="font-body text-sm text-brand-muted">
        Reviews are moderated before they appear on the product page.
      </p>

      <div>
        <label className="block font-body text-sm text-brand-navy mb-1.5">Rating</label>
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="w-full border border-brand-surface h-11 px-3 bg-white text-brand-navy"
        >
          <option value={5}>5 - Excellent</option>
          <option value={4}>4 - Very good</option>
          <option value={3}>3 - Good</option>
          <option value={2}>2 - Fair</option>
          <option value={1}>1 - Poor</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block font-body text-sm text-brand-navy mb-1.5">Name</label>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            className="w-full border border-brand-surface h-11 px-3 bg-white text-brand-navy"
          />
        </div>
        <div>
          <label className="block font-body text-sm text-brand-navy mb-1.5">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-brand-surface h-11 px-3 bg-white text-brand-navy"
          />
        </div>
      </div>

      <div>
        <label className="block font-body text-sm text-brand-navy mb-1.5">Review Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-brand-surface h-11 px-3 bg-white text-brand-navy"
        />
      </div>

      <div>
        <label className="block font-body text-sm text-brand-navy mb-1.5">Review</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
          required
          className="w-full border border-brand-surface px-3 py-2 bg-white text-brand-navy resize-y"
        />
      </div>

      {message && <p className="font-body text-sm text-green-700">{message}</p>}
      {error && <p className="font-body text-sm text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="h-[52px] px-6 bg-brand-navy text-white font-body text-sm font-semibold hover:bg-brand-navy/90 disabled:opacity-60"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  )
}
