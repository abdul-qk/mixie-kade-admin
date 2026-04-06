import { Media } from '@/components/Media'
import { Price } from '@/components/Price'
import { Product, Variant } from '@/payload-types'
import { formatDateTime } from '@/utilities/formatDateTime'
import { getServerSideURL } from '@/utilities/getURL'
import { getProductPrimarySlide } from '@/utilities/productImages'
import { formatStorefrontMoney, resolveCompareAtPrice, resolveUnitPrice } from '@/lib/productPrice'
import Link from 'next/link'

type Props = {
  product: Product
  style?: 'compact' | 'default'
  variant?: Variant
  quantity?: number
  /**
   * Force all formatting to a particular currency.
   */
  currencyCode?: string
}

export const ProductItem: React.FC<Props> = ({
  product,
  style = 'default',
  quantity,
  variant,
  currencyCode,
}) => {
  const { title } = product

  const slide = getProductPrimarySlide(product, variant ?? null, getServerSideURL())

  const itemPrice = resolveUnitPrice(product, variant ?? null)
  const compareAtPrice = resolveCompareAtPrice(product, variant ?? null)
  const hasCompare = typeof compareAtPrice === 'number' && compareAtPrice > itemPrice
  const itemURL = `/products/${product.slug}${variant ? `?variant=${variant.id}` : ''}`

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-stretch justify-stretch h-20 w-20 p-2 rounded-lg border">
        <div className="relative w-full h-full">
          {slide?.url ? (
            <Media
              alt={slide.alt || title}
              className=""
              fill
              imgClassName="rounded-lg object-cover"
              src={slide.url}
            />
          ) : null}
        </div>
      </div>
      <div className="flex grow justify-between items-center">
        <div className="flex flex-col gap-1">
          <p className="font-medium text-lg">
            <Link href={itemURL}>{title}</Link>
          </p>
          {variant && (
            <p className="text-sm font-mono text-primary/50 tracking-widest">
              {variant.options
                ?.map((option) => {
                  if (typeof option === 'object') return option.label
                  return null
                })
                .join(', ')}
            </p>
          )}
          <div>
            {'x'}
            {quantity}
          </div>
        </div>

        {quantity ? (
          <div className="text-right">
            <p className="font-medium text-lg">Subtotal</p>
            <p className="font-mono text-primary/50 text-sm tabular-nums">
              {formatStorefrontMoney(itemPrice * quantity, product)}
            </p>
            {hasCompare ? (
              <p className="font-mono text-xs text-primary/40 line-through tabular-nums">
                {formatStorefrontMoney((compareAtPrice as number) * quantity, product)}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}
