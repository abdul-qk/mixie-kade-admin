/** Must match `category` select values on products (Mixie Kadai). */
export const SHOP_CATEGORY_SLUGS = [
  'mixer-grinders',
  'blenders-juicers',
  'coconut-scrapers',
  'jars',
  'spare-parts',
  'accessories',
] as const

export type ShopCategorySlug = (typeof SHOP_CATEGORY_SLUGS)[number]

export const SHOP_CATEGORY_LABELS: Record<ShopCategorySlug, string> = {
  'mixer-grinders': 'Mixer Grinders',
  'blenders-juicers': 'Blenders & Juicers',
  'coconut-scrapers': 'Coconut Scrapers & Grinders',
  jars: 'Jars',
  'spare-parts': 'Spare Parts',
  accessories: 'Accessories',
}

export function isShopCategorySlug(value: string): value is ShopCategorySlug {
  return (SHOP_CATEGORY_SLUGS as readonly string[]).includes(value)
}
