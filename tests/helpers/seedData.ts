import type { APIRequestContext } from '@playwright/test'
import { getPayload } from 'payload'
import config from '../../src/payload.config.js'

const BASE_URL = 'http://localhost:3000'

export interface SeedResult {
  imageID: string | number
  productID: string | number
  variantPayloadID: string | number
  variantFigmaID: string | number
  noInventoryProductID: string | number
  simpleProductID: string | number
}

export async function createAdminUser(
  request: APIRequestContext,
  email: string,
  password: string,
): Promise<void> {
  await request.post(`${BASE_URL}/api/users`, {
    data: { email, password, roles: ['admin'] },
  })
  await request.post(`${BASE_URL}/api/users/login`, {
    data: { email, password },
  })
}

export async function createStorefrontUser(
  request: APIRequestContext,
  email: string,
  password: string,
): Promise<void> {
  await request.post(`${BASE_URL}/api/users`, {
    data: { email, password },
  })
}

export async function deleteUserByEmail(email: string): Promise<void> {
  const payload = await getPayload({ config })
  await payload.delete({
    collection: 'users',
    where: { email: { equals: email } },
  })
}

export async function seedProductsAndVariants(
  request: APIRequestContext,
  imageID: string | number,
): Promise<SeedResult> {
  const variantType = await request.post(`${BASE_URL}/api/variantTypes`, {
    data: { name: 'brand', label: 'Brand' },
  })
  const variantTypeID = (await variantType.json()).doc.id

  const [payloadRes, figmaRes] = await Promise.all([
    request.post(`${BASE_URL}/api/variantOptions`, {
      data: { label: 'Payload', value: 'payload', variantType: variantTypeID },
    }),
    request.post(`${BASE_URL}/api/variantOptions`, {
      data: { label: 'Figma', value: 'figma', variantType: variantTypeID },
    }),
  ])
  const payloadVariantID = (await payloadRes.json()).doc.id
  const figmaVariantID = (await figmaRes.json()).doc.id

  const productWithVariantsRes = await request.post(`${BASE_URL}/api/products`, {
    data: {
      title: 'Test Product With Variants',
      slug: 'test-product-variants',
      enableVariants: true,
      variantTypes: [variantTypeID],
      inventory: 100,
      _status: 'published',
      layout: [],
      gallery: [imageID],
      priceInUSDEnabled: true,
      priceInUSD: 1000,
    },
  })
  const productID = (await productWithVariantsRes.json()).doc.id

  await Promise.all([
    request.post(`${BASE_URL}/api/variants`, {
      data: {
        product: productID,
        variantType: variantTypeID,
        options: [payloadVariantID],
        priceInUSDEnabled: true,
        priceInUSD: 1000,
        inventory: 50,
        _status: 'published',
      },
    }),
    request.post(`${BASE_URL}/api/variants`, {
      data: {
        product: productID,
        variantType: variantTypeID,
        options: [figmaVariantID],
        priceInUSDEnabled: true,
        priceInUSD: 1000,
        inventory: 50,
        _status: 'published',
      },
    }),
  ])

  const simpleProductRes = await request.post(`${BASE_URL}/api/products`, {
    data: {
      title: 'Test Product',
      slug: 'test-product',
      inventory: 100,
      _status: 'published',
      layout: [],
      gallery: [imageID],
      priceInUSDEnabled: true,
      priceInUSD: 1000,
    },
  })
  const simpleProductID = (await simpleProductRes.json()).doc.id

  const noInventoryRes = await request.post(`${BASE_URL}/api/products`, {
    data: {
      title: 'No Inventory Product',
      slug: 'no-inventory-product',
      inventory: 0,
      _status: 'published',
      layout: [],
      gallery: [imageID],
      priceInUSDEnabled: true,
      priceInUSD: 1000,
    },
  })
  const noInventoryProductID = (await noInventoryRes.json()).doc.id

  return {
    imageID,
    productID,
    variantPayloadID: payloadVariantID,
    variantFigmaID: figmaVariantID,
    noInventoryProductID,
    simpleProductID,
  }
}

export async function cleanupTestProducts(): Promise<void> {
  const payload = await getPayload({ config })
  const slugs = ['test-product', 'test-product-variants', 'no-inventory-product']
  for (const slug of slugs) {
    await payload.delete({
      collection: 'products',
      where: { slug: { equals: slug } },
    })
  }
}
