import { NextResponse } from 'next/server'

import { DomexApiError, domexClient } from '@/lib/domex/client'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const trackingNo = (searchParams.get('trackingNo') || '').trim()
  const customerCode = (searchParams.get('customerCode') || '').trim()

  if (!trackingNo || !customerCode) {
    return NextResponse.json(
      { error: 'trackingNo and customerCode are required query params.' },
      { status: 400 },
    )
  }

  try {
    const [events, waybill] = await Promise.all([
      domexClient.getStatusDetails({ trackingNo, customerCode }),
      domexClient.getWaybillDetails({ trackingNo, customerCode }),
    ])

    return NextResponse.json({ events, waybill }, { status: 200 })
  } catch (error) {
    if (error instanceof DomexApiError) {
      return NextResponse.json(
        {
          error: error.message,
          details: error.details,
          validation: error.validation,
        },
        { status: error.status || 500 },
      )
    }

    return NextResponse.json({ error: 'Failed to fetch tracking details.' }, { status: 500 })
  }
}
