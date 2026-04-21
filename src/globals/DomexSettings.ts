import type { GlobalConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'

export const DomexSettings: GlobalConfig = {
  slug: 'domex-settings',
  access: {
    read: adminOnly,
    update: adminOnly,
  },
  admin: {
    group: 'Shop',
  },
  fields: [
    {
      name: 'defaultCustomerCode',
      type: 'text',
      required: true,
      maxLength: 6,
      label: 'Default Domex Customer Code',
      admin: {
        description: 'Used for dispatch and tracking when order-level customer code is deprecated.',
      },
    },
    {
      name: 'apiKey',
      type: 'text',
      required: false,
      label: 'Domex API Key',
      admin: {
        description:
          'If empty, the server falls back to DOMEX_API_KEY from environment variables.',
      },
    },
    {
      name: 'baseUrl',
      type: 'text',
      required: false,
      label: 'Domex Base URL',
      defaultValue: 'https://www.connectmesecure.com/api/CustomerInwards',
      admin: {
        description:
          'If empty, the server falls back to DOMEX_BASE_URL from environment variables.',
      },
    },
    {
      name: 'senderContactNo',
      type: 'text',
      required: false,
      maxLength: 15,
      label: 'Domex Sender Contact Number',
      admin: {
        description:
          'If empty, the server falls back to DOMEX_SENDER_CONTACT_NO from environment variables.',
      },
    },
  ],
}
