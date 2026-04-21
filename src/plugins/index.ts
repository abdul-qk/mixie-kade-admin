import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { Plugin } from 'payload'
import { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { ecommercePlugin } from '@payloadcms/plugin-ecommerce'

import { stripeAdapter } from '@payloadcms/plugin-ecommerce/payments/stripe'

import { Page, Product } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'
import { SITE_NAME } from '@/utilities/site'
import { ProductsCollection } from '@/collections/Products'
import { adminOrPublishedStatus } from '@/access/adminOrPublishedStatus'
import { adminOnlyFieldAccess } from '@/access/adminOnlyFieldAccess'
import { customerOnlyFieldAccess } from '@/access/customerOnlyFieldAccess'
import { isAdmin } from '@/access/isAdmin'
import { isDocumentOwner } from '@/access/isDocumentOwner'

const generateTitle: GenerateTitle<Product | Page> = ({ doc }) => {
  return doc?.title ? `${doc.title} | ${SITE_NAME}` : SITE_NAME
}

const generateURL: GenerateURL<Product | Page> = ({ collectionSlug, doc }) => {
  const base = getServerSideURL().replace(/\/$/, '')
  if (!doc?.slug) return base
  const isProduct =
    collectionSlug === 'products' || (doc && typeof doc === 'object' && 'variants' in doc)
  if (isProduct) {
    return `${base}/products/${doc.slug}`
  }
  return `${base}/${doc.slug}`
}

export const plugins: Plugin[] = [
  seoPlugin({
    generateTitle,
    generateURL,
  }),
  formBuilderPlugin({
    fields: {
      payment: false,
    },
    formSubmissionOverrides: {
      access: {
        delete: isAdmin,
        read: isAdmin,
        update: isAdmin,
      },
      admin: {
        group: 'Content',
      },
    },
    formOverrides: {
      access: {
        delete: isAdmin,
        read: isAdmin,
        update: isAdmin,
        create: isAdmin,
      },
      admin: {
        group: 'Content',
      },
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'confirmationMessage') {
            return {
              ...field,
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    FixedToolbarFeature(),
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                  ]
                },
              }),
            }
          }
          return field
        })
      },
    },
  }),
  ecommercePlugin({
    access: {
      adminOnlyFieldAccess,
      adminOrPublishedStatus,
      customerOnlyFieldAccess,
      isAdmin,
      isDocumentOwner,
    },
    customers: {
      slug: 'users',
    },
    orders: {
      ordersCollectionOverride: ({ defaultCollection }) => ({
        ...defaultCollection,
        // Allow unauthenticated POSTs so the Vite frontend can submit COD orders
        access: {
          ...defaultCollection.access,
          create: () => true,
        },
        fields: [
          ...defaultCollection.fields,
          // ── Mixie Kadai COD fields ──────────────────────────────
          {
            name: 'customerName',
            type: 'text',
            label: 'Customer Name',
            admin: { position: 'sidebar' },
          },
          {
            name: 'customerPhone',
            type: 'text',
            label: 'Phone Number',
            admin: { position: 'sidebar' },
          },
          {
            name: 'deliveryAddress',
            type: 'textarea',
            label: 'Delivery Address',
          },
          {
            name: 'deliveryCity',
            type: 'text',
            label: 'City',
            admin: { position: 'sidebar' },
          },
          {
            name: 'codItemsJson',
            type: 'textarea',
            label: 'Order Items (JSON)',
            admin: {
              readOnly: true,
              description: 'Auto-generated snapshot of the cart items at time of order.',
            },
          },
          {
            name: 'codNotes',
            type: 'textarea',
            label: 'Order Notes',
            admin: { position: 'sidebar' },
          },
          {
            name: 'paymentMethod',
            type: 'select',
            label: 'Payment Method',
            defaultValue: 'cod',
            required: true,
            options: [
              {
                label: 'Cash on Delivery',
                value: 'cod',
              },
              {
                label: 'Online Bank Transfer',
                value: 'bank_transfer',
              },
            ],
            admin: { position: 'sidebar' },
          },
          {
            name: 'paymentInstructions',
            type: 'textarea',
            label: 'Payment Instructions',
            defaultValue:
              'For bank transfer orders: Customer must send payment screenshot via WhatsApp with the order number as reference. Dispatch only after proof verification.',
            admin: {
              position: 'sidebar',
              readOnly: true,
            },
          },
          {
            name: 'accessToken',
            type: 'text',
            unique: true,
            index: true,
            admin: {
              position: 'sidebar',
              readOnly: true,
            },
            hooks: {
              beforeValidate: [
                ({ value, operation }) => {
                  if (operation === 'create' || !value) {
                    return crypto.randomUUID()
                  }
                  return value
                },
              ],
            },
          },
          {
            name: 'shippingCarrier',
            type: 'text',
            label: 'Shipping Carrier',
            defaultValue: 'domex',
            admin: {
              position: 'sidebar',
              readOnly: true,
            },
          },
          {
            name: 'trackingNo',
            type: 'text',
            label: 'Tracking Number',
            maxLength: 25,
            admin: {
              position: 'sidebar',
              description: 'Domex tracking number (max 25 characters).',
            },
          },
          {
            name: 'dispatchedAt',
            type: 'date',
            label: 'Dispatched At',
            admin: {
              position: 'sidebar',
              date: {
                pickerAppearance: 'dayAndTime',
              },
            },
          },
          {
            name: 'deliveredAt',
            type: 'date',
            label: 'Delivered At',
            admin: {
              position: 'sidebar',
              date: {
                pickerAppearance: 'dayAndTime',
              },
            },
          },
          {
            name: 'shipmentStatusCode',
            type: 'text',
            label: 'Shipment Status Code',
            admin: {
              position: 'sidebar',
              readOnly: true,
            },
          },
          {
            name: 'shipmentStatusLabel',
            type: 'text',
            label: 'Shipment Status',
            admin: {
              position: 'sidebar',
              readOnly: true,
            },
          },
          {
            name: 'shipmentEvents',
            type: 'array',
            label: 'Shipment Events',
            admin: {
              readOnly: true,
              description: 'Latest Domex tracking events for this order.',
            },
            fields: [
              {
                name: 'statusDate',
                type: 'text',
              },
              {
                name: 'statusCode',
                type: 'text',
              },
              {
                name: 'status',
                type: 'text',
              },
              {
                name: 'remark',
                type: 'text',
              },
            ],
          },
          {
            name: 'shipmentSyncMeta',
            type: 'group',
            label: 'Shipment Sync Meta',
            admin: {
              position: 'sidebar',
            },
            fields: [
              {
                name: 'lastSyncedAt',
                type: 'date',
                admin: {
                  date: {
                    pickerAppearance: 'dayAndTime',
                  },
                  readOnly: true,
                },
              },
              {
                name: 'lastError',
                type: 'textarea',
                admin: {
                  readOnly: true,
                },
              },
              {
                name: 'retryCount',
                type: 'number',
                defaultValue: 0,
                min: 0,
                admin: {
                  readOnly: true,
                },
              },
            ],
          },
          {
            name: 'domexActions',
            type: 'ui',
            label: 'Domex Actions',
            admin: {
              components: {
                Field: '@/components/orders/DomexActions',
              },
              condition: (_, __, { user }) => Boolean(user),
            },
          },
        ],
      }),
    },
    payments: {
      paymentMethods: [
        stripeAdapter({
          secretKey: process.env.STRIPE_SECRET_KEY!,
          publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
          webhookSecret: process.env.STRIPE_WEBHOOKS_SIGNING_SECRET!,
        }),
      ],
    },
    products: {
      productsCollectionOverride: ProductsCollection,
    },
  }),
]
