'use client'

import { useState } from 'react'

type ShipmentEvent = {
  statusDate?: string | null
  statusCode?: string | null
  status?: string | null
  remark?: string | null
}

type Props = {
  trackingNo: string
  customerCode: string
  initialEvents: ShipmentEvent[]
}

export function TrackingTimeline({ trackingNo, customerCode, initialEvents }: Props) {
  const [events, setEvents] = useState<ShipmentEvent[]>(initialEvents)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = async () => {
    setIsRefreshing(true)
    setError(null)
    try {
      const query = new URLSearchParams({ trackingNo, customerCode }).toString()
      const response = await fetch(`/api/orders/domex/track?${query}`, {
        method: 'GET',
        credentials: 'include',
      })
      if (!response.ok) {
        throw new Error(`Refresh failed (${response.status})`)
      }
      const payload = await response.json()
      setEvents(Array.isArray(payload.events) ? payload.events : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not refresh tracking.')
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <div className="rounded-lg border p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="font-mono text-primary/50 text-sm uppercase">Tracking Timeline</p>
        <button
          type="button"
          className="rounded border px-3 py-1 text-xs"
          onClick={refresh}
          disabled={isRefreshing}
        >
          {isRefreshing ? 'Refreshing...' : 'Refresh Tracking'}
        </button>
      </div>

      {error && <p className="mb-2 text-xs text-red-600">{error}</p>}

      {events.length === 0 ? (
        <p className="text-sm text-primary/60">No tracking events available yet.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {events.map((event, idx) => (
            <li key={`${event.statusDate || 'na'}-${idx}`} className="border-l-2 pl-3">
              <p className="text-sm font-semibold">{event.status || 'Unknown status'}</p>
              <p className="text-xs text-primary/60">
                {event.statusCode || '-'} · {event.statusDate || '-'}
              </p>
              {event.remark && <p className="text-xs text-primary/70">{event.remark}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
