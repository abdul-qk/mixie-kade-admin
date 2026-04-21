import type { Endpoint, PayloadRequest } from 'payload'

import { checkRole } from '@/access/utilities'
import { domexClient, DomexApiError, DomexStatusEvent } from '@/lib/domex/client'
import { resolveDomexSettings } from '@/lib/domex/settings'
import type { User } from '@/payload-types'

const isAdminRequest = (req: PayloadRequest): boolean => {
  return checkRole(['admin'], req.user as User | undefined)
}

const toErrorResponse = (error: unknown, fallback = 'Something went wrong.') => {
  if (error instanceof DomexApiError) {
    return Response.json(
      {
        error: error.message,
        details: error.details,
        validation: error.validation,
      },
      { status: error.status || 500 },
    )
  }

  return Response.json({ error: fallback }, { status: 500 })
}

const normalizeShipmentStatus = (events: DomexStatusEvent[]) => {
  const latest = events[events.length - 1]
  const deliveredEvent = [...events]
    .reverse()
    .find((event) => /deliver/i.test(event.status) || event.statusCode === 'DEL')

  return {
    latestCode: latest?.statusCode || null,
    latestLabel: latest?.status || null,
    deliveredAt: deliveredEvent?.statusDate || null,
  }
}

const getOrderIDFromRoute = (req: PayloadRequest): string | number | null => {
  const rawID = req.routeParams?.id
  if (typeof rawID === 'string' || typeof rawID === 'number') {
    return rawID
  }
  return null
}

const dispatchDomex: Endpoint = {
  path: '/orders/:id/domex/dispatch',
  method: 'post',
  handler: async (req) => {
    if (!isAdminRequest(req)) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orderID = getOrderIDFromRoute(req)
    if (!orderID) {
      return Response.json({ error: 'Order id is required.' }, { status: 400 })
    }

    try {
      const domexSettings = await resolveDomexSettings(req.payload)
      const order = await req.payload.findByID({
        collection: 'orders',
        id: orderID,
        req,
        user: req.user,
        overrideAccess: false,
        depth: 0,
      })

      const trackingNo = order.trackingNo?.trim()
      const customerCode = domexSettings.defaultCustomerCode
      const receiverName = order.customerName?.trim()
      const receiverAddress = order.deliveryAddress?.trim()
      const receiverCity = order.deliveryCity?.trim()
      const receiverContactNo1 = order.customerPhone?.trim()
      const amount = Number(order.amount || 0)
      const itemCount = Array.isArray(order.items) ? order.items.length : 0
      const createdUser = req.user?.email || req.user?.id || 'admin'

      if (!trackingNo) {
        return Response.json(
          { error: 'trackingNo is required before dispatch.' },
          { status: 400 },
        )
      }
      if (!customerCode) {
        return Response.json(
          { error: 'Domex default customer code is required. Configure it in Domex Settings.' },
          { status: 400 },
        )
      }
      if (!receiverName || !receiverAddress || !receiverCity || !receiverContactNo1) {
        return Response.json(
          {
            error:
              'Order is missing delivery fields. customerName, customerPhone, deliveryAddress and deliveryCity are required.',
          },
          { status: 400 },
        )
      }

      await domexClient.createShipment({
        trackingNo,
        customerCode,
        itemType: 'ITEM',
        senderName: 'Mixie Kade',
        senderAddress: 'N/A',
        senderContactNo: domexSettings.senderContactNo,
        receiverName,
        receiverAddress,
        receiverCity,
        receiverContactNo1,
        packageDesc: 'Order items',
        weight: 1,
        createdUser: String(createdUser),
        totalCharges: amount > 0 ? amount : 1,
        noOfPcs: itemCount > 0 ? itemCount : 1,
        paymentMethod: order.paymentMethod === 'bank_transfer' ? 'Card' : 'Cash',
        isPaid: order.paymentMethod === 'bank_transfer' ? 'Yes' : 'No',
        refNo: String(order.id),
        remark: order.codNotes || '',
      }, domexSettings)

      const events = await domexClient.getStatusDetails({ trackingNo, customerCode }, domexSettings)
      const normalized = normalizeShipmentStatus(events)

      const updated = await req.payload.update({
        collection: 'orders',
        id: orderID,
        req,
        user: req.user,
        overrideAccess: false,
        data: {
          shippingCarrier: 'domex',
          dispatchedAt: new Date().toISOString(),
          shipmentStatusCode: normalized.latestCode,
          shipmentStatusLabel: normalized.latestLabel,
          deliveredAt: normalized.deliveredAt,
          shipmentEvents: events.map((event) => ({
            statusDate: event.statusDate,
            statusCode: event.statusCode,
            status: event.status,
            remark: event.remark,
          })),
          shipmentSyncMeta: {
            lastSyncedAt: new Date().toISOString(),
            lastError: null,
            retryCount: 0,
          },
        },
      })

      return Response.json({
        message: 'Shipment dispatched to Domex successfully.',
        order: {
          id: updated.id,
          trackingNo: updated.trackingNo,
          shipmentStatusCode: updated.shipmentStatusCode,
          shipmentStatusLabel: updated.shipmentStatusLabel,
        },
      })
    } catch (error) {
      return toErrorResponse(error, 'Failed to dispatch Domex shipment.')
    }
  },
}

const syncDomex: Endpoint = {
  path: '/orders/:id/domex/sync',
  method: 'post',
  handler: async (req) => {
    if (!isAdminRequest(req)) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orderID = getOrderIDFromRoute(req)
    if (!orderID) {
      return Response.json({ error: 'Order id is required.' }, { status: 400 })
    }

    try {
      const domexSettings = await resolveDomexSettings(req.payload)
      const order = await req.payload.findByID({
        collection: 'orders',
        id: orderID,
        req,
        user: req.user,
        overrideAccess: false,
        depth: 0,
      })

      const trackingNo = order.trackingNo?.trim()
      const customerCode = domexSettings.defaultCustomerCode
      if (!trackingNo) {
        return Response.json(
          { error: 'trackingNo is required to sync tracking.' },
          { status: 400 },
        )
      }
      if (!customerCode) {
        return Response.json(
          { error: 'Domex default customer code is required. Configure it in Domex Settings.' },
          { status: 400 },
        )
      }

      const [events, waybill] = await Promise.all([
        domexClient.getStatusDetails({ trackingNo, customerCode }, domexSettings),
        domexClient.getWaybillDetails({ trackingNo, customerCode }, domexSettings),
      ])
      const normalized = normalizeShipmentStatus(events)

      const currentRetryCount = order.shipmentSyncMeta?.retryCount || 0
      const updated = await req.payload.update({
        collection: 'orders',
        id: orderID,
        req,
        user: req.user,
        overrideAccess: false,
        data: {
          shipmentStatusCode: normalized.latestCode,
          shipmentStatusLabel: normalized.latestLabel,
          deliveredAt: normalized.deliveredAt || order.deliveredAt,
          shipmentEvents: events.map((event) => ({
            statusDate: event.statusDate,
            statusCode: event.statusCode,
            status: event.status,
            remark: event.remark,
          })),
          shipmentSyncMeta: {
            lastSyncedAt: new Date().toISOString(),
            lastError: null,
            retryCount: currentRetryCount,
          },
          paymentInstructions:
            order.paymentInstructions ||
            `Last Domex receiver: ${waybill.receiverName || '-'} (${waybill.receiverCity || '-'})`,
        },
      })

      return Response.json({
        message: 'Tracking synced successfully.',
        order: {
          id: updated.id,
          shipmentStatusCode: updated.shipmentStatusCode,
          shipmentStatusLabel: updated.shipmentStatusLabel,
          eventsCount: updated.shipmentEvents?.length || 0,
        },
      })
    } catch (error) {
      try {
        const order = await req.payload.findByID({
          collection: 'orders',
          id: orderID,
          req,
          user: req.user,
          overrideAccess: false,
          depth: 0,
        })

        await req.payload.update({
          collection: 'orders',
          id: orderID,
          req,
          user: req.user,
          overrideAccess: false,
          data: {
            shipmentSyncMeta: {
              lastSyncedAt: new Date().toISOString(),
              lastError: error instanceof Error ? error.message : 'Unknown sync error',
              retryCount: (order.shipmentSyncMeta?.retryCount || 0) + 1,
            },
          },
        })
      } catch {
        // Ignore metadata update failure.
      }

      return toErrorResponse(error, 'Failed to sync Domex tracking.')
    }
  },
}

const publicTrackDomex: Endpoint = {
  path: '/orders/domex/track',
  method: 'get',
  handler: async (req) => {
    const trackingNo = String(req.query?.trackingNo || '').trim()
    const domexSettings = await resolveDomexSettings(req.payload)
    const customerCode = String(req.query?.customerCode || '').trim() || domexSettings.defaultCustomerCode

    if (!trackingNo || !customerCode) {
      return Response.json(
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
      return Response.json({ events, waybill })
    } catch (error) {
      return toErrorResponse(error, 'Failed to fetch tracking details.')
    }
  },
}

export const domexOrderEndpoints: Endpoint[] = [dispatchDomex, syncDomex, publicTrackDomex]
