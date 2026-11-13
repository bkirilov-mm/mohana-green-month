import {useState} from 'react';
import {useTranslation} from '@cloudcart/nitrogen';
import {AddToCartButton, Image, KeptLink} from '@cloudcart/nitrogen-react';
import type {LandingProductFragment} from 'storefrontapi.generated';
import {AddToCartOffers} from '~/components/AddToCartOffers';
import {CardPrice} from '~/components/CardPrice';
import {ChevronRightIcon, PlusIcon} from '~/components/ui/icons';
import {ImagePlaceholder} from '~/components/ui/ImagePlaceholder';
import {ADD_TO_CART_FETCHER_KEY} from '~/lib/cart';
import {splitTitle} from '~/lib/green-month';
import {quickAddOf} from '~/lib/quick-add';

/**
 * A product as a campaign page shows it: lean, for the many it lists at once - the picture, the price, the discount
 * and what quick add needs, nothing a listing's filters or swatches would.
 */
export const LANDING_PRODUCT_FRAGMENT = `#graphql
  fragment LandingMoney on MoneyV2 {
    amount
    currencyCode
    formatted
  }
  fragment LandingImage on Image {
    altText
    url
    width
    height
  }
  fragment LandingProduct on Product {
    id
    handle
    title
    availableForSale
    productType
    options {
      name
      values
    }
    featuredImage {
      ...LandingImage
    }
    discount {
      percent
      hideDiscountPrice
    }
    priceRange {
      minVariantPrice {
        ...LandingMoney
      }
      maxVariantPrice {
        ...LandingMoney
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: [], ignoreUnknownOptions: true) {
      id
      sku
      availableForSale
      currentlyNotInStock
      minimumQuantity
      price {
        ...LandingMoney
      }
      compareAtPrice {
        ...LandingMoney
      }
    }
    reviewSummary {
      averageRating
      totalCount
    }
  }
` as const;

/**
 * A campaign card: the bottle on the cream ground (its white multiplied away), the kind of product over its name in
 * Prata, the price as the store gives it, and a round button that adds the product straight to the cart - or, for a
 * bundle or a product with a choice to make, a link to its page. The whole card opens the product.
 * `cover`: a picture with a scene of its own (a promo pack's) fills the frame.
 */
export function LandingProductCard({
  product,
  cover = false,
  loading = 'lazy',
  sizes = '(min-width: 990px) 22vw, (min-width: 750px) 30vw, 46vw',
  viewLabel,
}: {
  product: LandingProductFragment;
  cover?: boolean;
  loading?: 'eager' | 'lazy';
  sizes?: string;
  /** The words of the link that replaces quick add, for a product chosen on its page (a pack's "View the pack"). */
  viewLabel?: string;
}) {
  const {t} = useTranslation();
  const {kind, name, detail} = splitTitle(product.title);
  const variant = product.selectedOrFirstAvailableVariant;
  const url = `/product/${product.handle}`;
  const percent = product.discount?.percent;

  return (
    <article className="gm-card h-full">
      <div className="gm-card-media" data-cover={cover || undefined}>
        {product.featuredImage ? (
          <Image data={product.featuredImage} alt="" sizes={sizes} loading={loading} />
        ) : (
          <ImagePlaceholder />
        )}
        {percent ? (
          <span className="gm-badge absolute top-3 left-3">{t('product.discountBadge', {percent})}</span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4 md:p-5">
        {kind && <p className="gm-eyebrow text-ink-muted">{kind}</p>}
        <h3 className="gm-serif text-card text-ink">
          <KeptLink to={url} prefetch="intent" className="gm-card-link">
            {name}
          </KeptLink>
        </h3>
        {detail && <p className="text-small text-ink-muted">{detail}</p>}
        <div className="mt-auto flex items-end justify-between gap-3 pt-3">
          <p className="text-subheading" aria-live="polite">
            <CardPrice priceRange={product.priceRange} variant={variant} discount={product.discount} />
          </p>
          <CardAction product={product} url={url} viewLabel={viewLabel} />
        </div>
      </div>
    </article>
  );
}

/** Quick add, or the link to the product's page when it must be chosen there. Nothing for a product sold out. */
function CardAction({product, url, viewLabel}: {product: LandingProductFragment; url: string; viewLabel?: string}) {
  const {t} = useTranslation();
  const [asked, setAsked] = useState(false);
  const variant = product.selectedOrFirstAvailableVariant;

  if (!product.availableForSale || !variant?.availableForSale) {
    return <span className="text-small text-ink-muted">{t('product.soldOut')}</span>;
  }

  const {needsChoice, line} = quickAddOf(product, variant);

  if (needsChoice) {
    return (
      <KeptLink
        to={url}
        prefetch="intent"
        className="gm-card-add inline-flex min-h-11 items-center gap-1 text-small font-bold text-leaf-deep"
      >
        {viewLabel ?? t('product.chooseOptions')}
        <ChevronRightIcon className="size-4" />
      </KeptLink>
    );
  }

  return (
    <div className="gm-card-add">
      <AddToCartButton
        className="gm-add"
        onClick={() => setAsked(true)}
        fetcherKey={ADD_TO_CART_FETCHER_KEY}
        // The store's up-sell first, as its listings ask it; the cart says why an add was refused.
        upSell="check"
        showErrors={false}
        lines={[line]}
      >
        <PlusIcon className="size-5" />
        <span className="sr-only">{t('product.addToCart')}</span>
      </AddToCartButton>
      {asked && (
        <AddToCartOffers
          fetcherKey={ADD_TO_CART_FETCHER_KEY}
          line={line}
          refusals="cart"
          onSettled={() => setAsked(false)}
        />
      )}
    </div>
  );
}

/** A card's place while its product loads. */
export function LandingProductCardPlaceholder() {
  return (
    <div aria-hidden="true" className="gm-card">
      <div className="gm-card-media" />
      <div className="flex flex-col gap-2 p-5">
        <span className="h-3 w-1/3 rounded-full bg-cream" />
        <span className="h-5 w-2/3 rounded-full bg-cream" />
        <span className="mt-4 h-5 w-1/4 rounded-full bg-cream" />
      </div>
    </div>
  );
}
