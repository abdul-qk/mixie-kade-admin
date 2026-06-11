'use client'

import { useEffect, useState } from 'react'

export const FALLBACK_SHIPPING_COST = 400

export function useShopSettings() {
  const [defaultShippingCost, setDefaultShippingCost] = useState(FALLBACK_SHIPPING_COST)

  useEffect(() => {
    fetch('/api/globals/shop-settings?depth=0')
      .then((r) => r.json())
      .then((data) => {
        if (typeof data?.defaultShippingCost === 'number') {
          setDefaultShippingCost(data.defaultShippingCost)
        }
      })
      .catch(() => {})
  }, [])

  return { defaultShippingCost }
}
