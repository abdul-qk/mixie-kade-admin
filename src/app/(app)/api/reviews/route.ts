import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { NextResponse } from 'next/server'

type ReviewBody = {
  productID?: number
  rating?: number
  title?: string
  content?: string
  displayName?: string
  email?: string
}

export async function POST(request: Request) {
  try {
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers: request.headers })
    const body = (await request.json()) as ReviewBody
    const reviewSettings = await payload.findGlobal({
      slug: 'review-settings',
    })

    const productID = Number(body.productID)
    const rating = Number(body.rating)
    const content = body.content?.trim() ?? ''
    const displayName = body.displayName?.trim() ?? ''
    const email = body.email?.trim() ?? ''
    const title = body.title?.trim() ?? ''

    const minLength = Math.max(0, reviewSettings?.minReviewLength ?? 0)
    const maxLength = Math.max(minLength, reviewSettings?.maxReviewLength ?? 5000)

    if (reviewSettings?.enabled === false) {
      return NextResponse.json({ message: 'Reviews are currently disabled.' }, { status: 403 })
    }

    if (reviewSettings?.allowGuestReviews === false && !user) {
      return NextResponse.json(
        { message: 'Please log in to submit a review for this product.' },
        { status: 401 },
      )
    }

    if (!productID || Number.isNaN(productID)) {
      return NextResponse.json({ message: 'Invalid product.' }, { status: 400 })
    }

    if (Number.isNaN(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ message: 'Rating must be between 1 and 5.' }, { status: 400 })
    }

    if (!content || content.length < minLength || content.length > maxLength) {
      return NextResponse.json(
        { message: `Review must be between ${minLength} and ${maxLength} characters.` },
        { status: 400 },
      )
    }

    if (!displayName) {
      return NextResponse.json({ message: 'Please provide your name.' }, { status: 400 })
    }

    if (!email || !email.includes('@')) {
      return NextResponse.json({ message: 'Please provide a valid email address.' }, { status: 400 })
    }

    await payload.create({
      collection: 'product-reviews',
      context: {
        autoApprove: reviewSettings?.requireApproval === false,
      },
      data: {
        content,
        displayName,
        email,
        product: productID,
        rating,
        status: reviewSettings?.requireApproval === false ? 'approved' : 'pending',
        submittedAt: new Date().toISOString(),
        title: title || null,
      },
    })

    return NextResponse.json(
      {
        message:
          reviewSettings?.requireApproval === false
            ? 'Thanks! Your review was published.'
            : 'Thanks! Your review was submitted and is pending approval.',
      },
      { status: 201 },
    )
  } catch (error) {
    return NextResponse.json(
      {
        message: 'Could not submit review at the moment. Please try again.',
        ...(error instanceof Error ? { error: error.message } : {}),
      },
      { status: 500 },
    )
  }
}
