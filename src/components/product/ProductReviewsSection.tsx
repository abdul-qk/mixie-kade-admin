import React from 'react'

import { ProductReviewForm } from '@/components/product/ProductReviewForm'

type ReviewItem = {
  id: number
  rating?: number | null
  title?: string | null
  content?: string | null
  displayName?: string | null
  submittedAt?: string | null
  isVerifiedPurchase?: boolean | null
}

type Props = {
  productID: number
  reviews: ReviewItem[]
  enabled: boolean
  allowGuestReviews: boolean
}

const renderStars = (rating: number) => {
  const safeRating = Math.max(0, Math.min(5, rating))
  return '★'.repeat(safeRating) + '☆'.repeat(5 - safeRating)
}

export function ProductReviewsSection({ productID, reviews, enabled, allowGuestReviews }: Props) {
  if (!enabled) return null

  const reviewCount = reviews.length
  const averageRating = reviewCount
    ? reviews.reduce((sum, review) => sum + (review.rating ?? 0), 0) / reviewCount
    : 0

  return (
    <section className="bg-white border-t border-brand-surface">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          <div className="lg:col-span-2">
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-brand-navy">
              Customer Reviews
            </h2>
            <p className="font-body text-sm text-brand-muted mt-3">
              {reviewCount > 0
                ? `${averageRating.toFixed(1)} out of 5 based on ${reviewCount} review${reviewCount > 1 ? 's' : ''}.`
                : 'No reviews yet. Be the first to review this product.'}
            </p>
            <div className="text-brand-gold text-xl tracking-wide mt-2">
              {renderStars(Math.round(averageRating))}
            </div>
          </div>

          <div className="lg:col-span-3">
            {allowGuestReviews ? (
              <ProductReviewForm productID={productID} />
            ) : (
              <div className="border border-brand-surface bg-white p-5 md:p-6">
                <h3 className="font-display text-xl text-brand-navy">Write a Review</h3>
                <p className="font-body text-sm text-brand-muted mt-2">
                  Review submissions are currently limited to signed-in customers.
                </p>
              </div>
            )}
          </div>
        </div>

        {reviewCount > 0 && (
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((review) => (
              <article key={review.id} className="border border-brand-surface bg-brand-cream/40 p-5">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <p className="font-body text-sm font-semibold text-brand-navy">
                    {review.displayName || 'Verified Customer'}
                  </p>
                  {typeof review.rating === 'number' && (
                    <p className="font-body text-sm text-brand-gold">{renderStars(review.rating)}</p>
                  )}
                </div>

                {review.isVerifiedPurchase && (
                  <p className="font-body text-xs text-brand-gold font-semibold mb-1.5">
                    Verified purchase
                  </p>
                )}

                {review.title ? (
                  <h3 className="font-body text-sm font-semibold text-brand-navy mb-1.5">
                    {review.title}
                  </h3>
                ) : null}

                <p className="font-body text-sm text-brand-navy/80 leading-relaxed">
                  {review.content || ''}
                </p>

                {review.submittedAt && (
                  <p className="font-body text-xs text-brand-muted mt-3">
                    {new Date(review.submittedAt).toLocaleDateString()}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
