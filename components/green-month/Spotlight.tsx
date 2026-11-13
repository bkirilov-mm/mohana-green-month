import {useState} from 'react';
import {useTranslation} from '@cloudcart/nitrogen';
import {AddToCartButton, Image, KeptLink} from '@cloudcart/nitrogen-react';
import type {GreenMonthHeroQuery} from 'storefrontapi.generated';
import {AddToCartOffers} from '~/components/AddToCartOffers';
import {CardPrice} from '~/components/CardPrice';
import {ADD_TO_CART_FETCHER_KEY} from '~/lib/cart';
import {COPY, SPOTLIGHT} from '~/lib/green-month';
import {quickAddOf} from '~/lib/quick-add';
import {ArrowIcon} from './marks';

type SpotlightProduct = NonNullable<GreenMonthHeroQuery['spotlight']>;

/**
 * The best-selling diffuser, on its own: its pictures, its rating from real reviews, four facts from its description,
 * the price and one button to the cart. The oils need something to breathe through.
 */
export function Spotlight({product}: {product: SpotlightProduct}) {
  const pictures = product.images.nodes.length
    ? product.images.nodes.slice(0, 5)
    : product.featuredImage
      ? [product.featuredImage]
      : [];
  const [shown, setShown] = useState(0);
  const picture = pictures[shown];
  const rating = product.reviewSummary;

  return (
    <section aria-labelledby="gm-spotlight-title" className="py-20 md:py-28">
      <div className="mx-auto grid max-w-page gap-10 px-gutter md:px-gutter-md lg:grid-cols-12 lg:items-center lg:gap-16">
        <div className="gm-reveal lg:col-span-6">
          <div className="gm-spotlight-media">
            {picture && (
              <Image
                key={picture.url}
                data={picture}
                alt={product.title}
                sizes="(min-width: 990px) 45vw, 100vw"
                className="gm-ritual-enter"
              />
            )}
          </div>
          {pictures.length > 1 && (
            <div className="mt-4 grid grid-cols-5 gap-3">
              {pictures.map((image, index) => (
                <button
                  key={image.url}
                  type="button"
                  aria-pressed={index === shown}
                  aria-label={`${product.title} - ${index + 1}/${pictures.length}`}
                  onClick={() => setShown(index)}
                  className="gm-thumb aspect-square bg-cream"
                >
                  <Image data={image} alt="" sizes="10vw" className="size-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="gm-reveal lg:col-span-6">
          <p className="gm-eyebrow gm-eyebrow-rule text-leaf-deep">{SPOTLIGHT.kicker}</p>
          <h2 id="gm-spotlight-title" className="gm-heading mt-5 text-forest">
            {SPOTLIGHT.heading}
          </h2>
          {rating && rating.totalCount > 0 && (
            <p className="mt-5 flex items-center gap-3 text-ink">
              <span className="gm-stars" aria-hidden="true">
                {'★'.repeat(Math.round(rating.averageRating))}
              </span>
              <span>
                <strong className="font-bold">{rating.averageRating.toFixed(1).replace('.', ',')}</strong> ·{' '}
                {rating.totalCount} {COPY.spotlight.reviews}
              </span>
            </p>
          )}
          <p className="gm-lead mt-6 max-w-lead text-ink-muted">{SPOTLIGHT.lead}</p>

          <dl className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4">
            {SPOTLIGHT.facts.map((fact) => (
              <div key={fact.label} className="gm-fact">
                <dt className="sr-only">{fact.label}</dt>
                <dd className="gm-serif text-heading text-forest">{fact.value}</dd>
                <dd aria-hidden="true" className="mt-1 text-small text-ink-muted">
                  {fact.label}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-5 border-t border-ink/10 pt-8">
            <p className="text-heading" aria-live="polite">
              <CardPrice
                priceRange={product.priceRange}
                variant={product.selectedOrFirstAvailableVariant}
                discount={product.discount}
              />
            </p>
            <SpotlightAction product={product} />
          </div>
        </div>
      </div>
    </section>
  );
}

function SpotlightAction({product}: {product: SpotlightProduct}) {
  const {t} = useTranslation();
  const [asked, setAsked] = useState(false);
  const variant = product.selectedOrFirstAvailableVariant;
  const url = `/product/${product.handle}`;

  if (!product.availableForSale || !variant?.availableForSale) {
    return <span className="text-ink-muted">{t('product.soldOut')}</span>;
  }
  const {needsChoice, line} = quickAddOf(product, variant);
  if (needsChoice) {
    return (
      <KeptLink to={url} prefetch="intent" className="gm-button gm-button-forest">
        {t('product.chooseOptions')}
        <ArrowIcon className="size-4" />
      </KeptLink>
    );
  }

  return (
    <>
      <AddToCartButton
        className="gm-button gm-button-forest"
        onClick={() => setAsked(true)}
        fetcherKey={ADD_TO_CART_FETCHER_KEY}
        upSell="check"
        showErrors={false}
        lines={[line]}
      >
        {t('product.addToCart')}
        <ArrowIcon className="size-4" />
      </AddToCartButton>
      {asked && (
        <AddToCartOffers
          fetcherKey={ADD_TO_CART_FETCHER_KEY}
          line={line}
          refusals="cart"
          onSettled={() => setAsked(false)}
        />
      )}
    </>
  );
}
