'use client'

import { useMemo, useState } from 'react'
import { toast } from '@payloadcms/ui'
import { useDocumentInfo } from '@payloadcms/ui'

type ActionKind = 'dispatch' | 'sync'

const getReadableError = async (response: Response): Promise<string> => {
  try {
    const body = await response.json()
    if (body?.error) return String(body.error)
  } catch {
    // Ignore parse errors and fallback to generic status text.
  }
  return `Request failed (${response.status}).`
}

export default function DomexActions() {
  const { id } = useDocumentInfo()
  const [loadingAction, setLoadingAction] = useState<ActionKind | null>(null)

  const orderID = useMemo(() => {
    if (id) return String(id)
    if (typeof window === 'undefined') return ''

    const parts = window.location.pathname.split('/').filter(Boolean)
    return parts[parts.length - 1] || ''
  }, [id])

  const runAction = async (kind: ActionKind) => {
    if (!orderID) {
      toast.error('Order ID is unavailable on this view.')
      return
    }

    setLoadingAction(kind)
    try {
      const response = await fetch(`/api/orders/${orderID}/domex/${kind}`, {
        method: 'POST',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error(await getReadableError(response))
      }

      toast.success(kind === 'dispatch' ? 'Order dispatched to Domex.' : 'Domex tracking synced.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Action failed.')
    } finally {
      setLoadingAction(null)
    }
  }

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <button
        type="button"
        onClick={() => runAction('dispatch')}
        disabled={loadingAction !== null}
        style={{ padding: '8px 12px', border: '1px solid var(--theme-elevation-200)' }}
      >
        {loadingAction === 'dispatch' ? 'Dispatching...' : 'Dispatch to Domex'}
      </button>
      <button
        type="button"
        onClick={() => runAction('sync')}
        disabled={loadingAction !== null}
        style={{ padding: '8px 12px', border: '1px solid var(--theme-elevation-200)' }}
      >
        {loadingAction === 'sync' ? 'Syncing...' : 'Sync Tracking'}
      </button>
    </div>
  )
}
