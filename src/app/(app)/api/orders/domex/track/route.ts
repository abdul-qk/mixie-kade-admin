import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

import { DomexApiError, domexClient } from '@/lib/domex/client'
import { resolveDomexSettings } from '@/lib/domex/settings'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const trackingNo = (searchParams.get('trackingNo') || '').trim()
  const customerCodeFromQuery = (searchParams.get('customerCode') || '').trim()

  const payload = await getPayload({ config: configPromise })
  const domexSettings = await resolveDomexSettings(payload)
  const customerCode = customerCodeFromQuery || domexSettings.defaultCustomerCode

  if (!trackingNo || !customerCode) {
    return NextResponse.json(
      {
        error:
          'trackingNo is required and a Domex customer code must exist in query params or Domex Settings.',
      },
      { status: 400 },
    )
  }

  try {
    const [events, waybill] = await Promise.all([
      domexClient.getStatusDetails({ trackingNo, customerCode }, domexSettings),
      domexClient.getWaybillDetails({ trackingNo, customerCode }, domexSettings),
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
