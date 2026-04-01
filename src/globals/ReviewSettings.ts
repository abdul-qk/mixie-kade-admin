import type { GlobalConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'

export const ReviewSettings: GlobalConfig = {
  slug: 'review-settings',
  access: {
    read: () => true,
    update: adminOnly,
  },
  admin: {
    group: 'Shop',
  },
  fields: [
    {
      name: 'enabled',
      type: 'checkbox',
      defaultValue: true,
      label: 'Enable Reviews',
    },
    {
      name: 'requireApproval',
      type: 'checkbox',
      defaultValue: true,
      label: 'Require Manual Approval',
    },
    {
      name: 'allowGuestReviews',
      type: 'checkbox',
      defaultValue: true,
      label: 'Allow Guest Reviews',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'minReviewLength',
          type: 'number',
          defaultValue: 20,
          min: 0,
          label: 'Minimum Review Length',
        },
        {
          name: 'maxReviewLength',
          type: 'number',
          defaultValue: 800,
          min: 50,
          label: 'Maximum Review Length',
        },
      ],
    },
  ],
}
