import type { Access, CollectionConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'
import { checkRole } from '@/access/utilities'

const adminOrApproved: Access = ({ req: { user } }) => {
  if (user && checkRole(['admin'], user)) return true

  return {
    status: {
      equals: 'approved',
    },
  }
}

export const ProductReviews: CollectionConfig = {
  slug: 'product-reviews',
  access: {
    create: () => true,
    delete: adminOnly,
    read: adminOrApproved,
    update: adminOnly,
  },
  admin: {
    defaultColumns: ['product', 'rating', 'status', 'displayName', 'submittedAt'],
    group: 'Shop',
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      required: true,
      index: true,
    },
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'users',
    },
    {
      name: 'order',
      type: 'relationship',
      relationTo: 'orders',
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      index: true,
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
      ],
      required: true,
    },
    {
      name: 'rating',
      type: 'number',
      min: 1,
      max: 5,
      required: true,
      index: true,
    },
    {
      name: 'title',
      type: 'text',
    },
    {
      name: 'content',
      type: 'textarea',
      required: true,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'displayName',
          type: 'text',
          required: true,
        },
        {
          name: 'email',
          type: 'email',
          required: true,
          access: {
            read: ({ req: { user } }) => Boolean(user && checkRole(['admin'], user)),
            update: ({ req: { user } }) => Boolean(user && checkRole(['admin'], user)),
          },
        },
      ],
    },
    {
      name: 'isVerifiedPurchase',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'moderationNotes',
      type: 'textarea',
      access: {
        read: ({ req: { user } }) => Boolean(user && checkRole(['admin'], user)),
        update: ({ req: { user } }) => Boolean(user && checkRole(['admin'], user)),
      },
    },
    {
      name: 'source',
      type: 'select',
      defaultValue: 'web',
      options: [
        { label: 'Web', value: 'web' },
        { label: 'Admin', value: 'admin' },
        { label: 'Import', value: 'import' },
      ],
    },
    {
      name: 'submittedAt',
      type: 'date',
      defaultValue: () => new Date().toISOString(),
      required: true,
    },
    {
      name: 'approvedAt',
      type: 'date',
      admin: {
        readOnly: true,
      },
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data, operation, req, context }) => {
        if (!data) return data

        if (operation === 'create') {
          const isAdminUser = Boolean(req.user && checkRole(['admin'], req.user))
          const autoApprove = context?.autoApprove === true

          if (isAdminUser) {
            if (!data.status) data.status = 'approved'
          } else if (autoApprove) {
            data.status = 'approved'
          } else {
            data.status = 'pending'
          }

          if (!data.submittedAt) {
            data.submittedAt = new Date().toISOString()
          }
        }

        return data
      },
    ],
    beforeChange: [
      ({ data, originalDoc }) => {
        if (!data) return data

        if (data.status === 'approved' && originalDoc?.status !== 'approved') {
          data.approvedAt = new Date().toISOString()
        }

        if (data.status !== 'approved') {
          data.approvedAt = null
        }

        return data
      },
    ],
  },
}
