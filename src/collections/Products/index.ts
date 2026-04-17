import { CallToAction } from '@/blocks/CallToAction/config'
import { Content } from '@/blocks/Content/config'
import { MediaBlock } from '@/blocks/MediaBlock/config'
import { slugField } from 'payload'
import { generatePreviewPath } from '@/utilities/generatePreviewPath'
import { CollectionOverride } from '@payloadcms/plugin-ecommerce/types'
import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import {
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import { DefaultDocumentIDType, Where } from 'payload'

const toLexicalRichText = (value: unknown) => {
  if (typeof value !== 'string') return value

  return {
    root: {
      type: 'root',
      version: 1,
      direction: null,
      format: '',
      indent: 0,
      children: [
        {
          type: 'paragraph',
          version: 1,
          direction: null,
          format: '',
          indent: 0,
          textFormat: 0,
          textStyle: '',
          children: [
            {
              type: 'text',
              version: 1,
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text: value,
            },
          ],
        },
      ],
    },
  }
}

export const ProductsCollection: CollectionOverride = ({ defaultCollection }) => ({
  ...defaultCollection,
  admin: {
    ...defaultCollection?.admin,
    defaultColumns: ['title', 'brand', 'enableVariants', '_status', 'variants.variants'],
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'products',
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: 'products',
        req,
      }),
    useAsTitle: 'title',
  },
  defaultPopulate: {
    ...defaultCollection?.defaultPopulate,
    title: true,
    slug: true,
    variantOptions: true,
    variants: true,
    enableVariants: true,
    gallery: true,
    images: true,
    priceInUSD: true,
    inventory: true,
    meta: true,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      type: 'tabs',
      tabs: [
        {
          fields: [
            {
              name: 'description',
              type: 'richText',
              hooks: {
                beforeValidate: [({ value }) => toLexicalRichText(value)],
                afterRead: [({ value }) => toLexicalRichText(value)],
              },
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                    FixedToolbarFeature(),
                    InlineToolbarFeature(),
                    HorizontalRuleFeature(),
                  ]
                },
              }),
              label: false,
              required: false,
            },
            {
              name: 'gallery',
              type: 'array',
              minRows: 1,
              fields: [
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  required: true,
                },
                {
                  name: 'variantOption',
                  type: 'relationship',
                  relationTo: 'variantOptions',
                  admin: {
                    condition: (data) => {
                      return data?.enableVariants === true && data?.variantTypes?.length > 0
                    },
                  },
                  filterOptions: ({ data }) => {
                    if (data?.enableVariants && data?.variantTypes?.length) {
                      const variantTypeIDs = data.variantTypes.map((item: any) => {
                        if (typeof item === 'object' && item?.id) {
                          return item.id
                        }
                        return item
                      }) as DefaultDocumentIDType[]

                      if (variantTypeIDs.length === 0)
                        return {
                          variantType: {
                            in: [],
                          },
                        }

                      const query: Where = {
                        variantType: {
                          in: variantTypeIDs,
                        },
                      }

                      return query
                    }

                    return {
                      variantType: {
                        in: [],
                      },
                    }
                  },
                },
              ],
            },

            {
              name: 'layout',
              type: 'blocks',
              blocks: [CallToAction, Content, MediaBlock],
            },
          ],
          label: 'Content',
        },
        {
          fields: [
            ...defaultCollection.fields,
            {
              name: 'relatedProducts',
              type: 'relationship',
              filterOptions: ({ id }) => {
                if (id) {
                  return {
                    id: {
                      not_in: [id],
                    },
                  }
                }

                // ID comes back as undefined during seeding so we need to handle that case
                return {
                  id: {
                    exists: true,
                  },
                }
              },
              hasMany: true,
              relationTo: 'products',
            },
          ],
          label: 'Product Details',
        },
        {
          name: 'meta',
          label: 'SEO',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({
              hasGenerateFn: true,
            }),
            MetaImageField({
              relationTo: 'media',
            }),

            MetaDescriptionField({}),
            PreviewField({
              // if the `generateUrl` function is configured
              hasGenerateFn: true,

              // field paths to match the target field for data
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
    {
      name: 'categories',
      type: 'relationship',
      admin: {
        position: 'sidebar',
        sortOptions: 'title',
      },
      hasMany: true,
      relationTo: 'categories',
    },
    // ── Mixie Kadai custom fields ─────────────────────────────
    {
      name: 'brand',
      type: 'relationship',
      relationTo: 'brands',
      label: 'Brand',
      admin: { position: 'sidebar' },
    },
    {
      name: 'inStock',
      type: 'checkbox',
      defaultValue: true,
      label: 'In Stock',
      admin: { position: 'sidebar' },
    },
    {
      name: 'price',
      type: 'number',
      label: 'Selling Price (Rs.)',
      admin: { description: 'Price in Sri Lankan Rupees shown to customers.' },
    },
    {
      name: 'shippingCost',
      type: 'number',
      label: 'Shipping Cost (Rs.)',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Fixed shipping fee per unit for this product.',
      },
    },
    {
      name: 'originalPrice',
      type: 'number',
      label: 'Compare-At Price (Rs.)',
      admin: { description: 'Optional. Shown as strikethrough to indicate a discount.' },
    },
    {
      type: 'row',
      fields: [
        { name: 'wattage',  type: 'number', label: 'Wattage (W)' },
        { name: 'jars',     type: 'number', label: 'Number of Jars' },
        { name: 'warranty', type: 'text',   label: 'Warranty' },
      ],
    },
    {
      name: 'features',
      type: 'array',
      label: 'Key Features',
      admin: { description: 'Bullet-point features shown on the product page.' },
      fields: [
        { name: 'feature', type: 'text', required: true, label: 'Feature' },
      ],
    },
    {
      name: 'images',
      type: 'array',
      label: 'Product Images (URL)',
      admin: {
        description:
          'When any URL is set, the storefront uses these images first (product page, shop grid, cart). Prefer full https URLs. Leave empty to use Content → Gallery uploads instead (supports variant-specific images).',
      },
      fields: [
        { name: 'url', type: 'text', required: true, label: 'Image URL' },
        { name: 'alt', type: 'text', label: 'Alt Text' },
      ],
    },
    slugField(),
  ],
})
