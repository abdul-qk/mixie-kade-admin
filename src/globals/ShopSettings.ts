import type { GlobalConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'

export const ShopSettings: GlobalConfig = {
  slug: 'shop-settings',
  access: {
    read: () => true,
    update: adminOnly,
  },
  admin: {
    group: 'Shop',
  },
  fields: [
    {
      name: 'defaultShippingCost',
      type: 'number',
      defaultValue: 400,
      label: 'Default Shipping Cost (Rs.)',
      admin: {
        description:
          'Applied to any product that does not have a per-product shipping cost set. Set to 0 for free shipping by default.',
      },
    },
  ],
}
