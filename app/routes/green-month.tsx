import {useLoaderData} from 'react-router';
import type {PageCacheRouteHandle} from '@cloudcart/nitrogen';
import type {Route} from './+types/green-month';
import {seoMeta, storeOrigin} from '~/lib/meta';
import {SHARED_PAGE} from '~/lib/page-cache';
import {skipCartAndWishlistRevalidation} from '~/lib/cart';
import type {LandingHandle} from '~/components/LandingChrome';
import {LANDING_PRODUCT_FRAGMENT} from '~/components/green-month/LandingProductCard';
import {Hero, Truths} from '~/components/green-month/Hero';
import {Rituals} from '~/components/green-month/Rituals';
import {Packs} from '~/components/green-month/Packs';
import {Manifesto} from '~/components/green-month/Manifesto';
import {Spotlight} from '~/components/green-month/Spotlight';
import {Reviews} from '~/components/green-month/Reviews';
import {Catalog} from '~/components/green-month/Catalog';
import {Faq, FinalCall, StickyCall} from '~/components/green-month/Closing';
import {CAMPAIGN_ENDS_AT, COLLECTIONS, COPY, PACKS_QUERY, REVIEWED_PRODUCTS, SPOTLIGHT} from '~/lib/green-month';

/**
 * The Green Month: a campaign landing page, the whole funnel on one page. The same for every visitor (the page
 * cache), with no menu to leave by (`LandingHandle`) and the campaign's time left in its header.
 */
export const handle = {
  ...SHARED_PAGE,
  landing: {endsAt: CAMPAIGN_ENDS_AT, label: COPY.bar.label, endsIn: COPY.bar.endsIn},
} satisfies PageCacheRouteHandle & LandingHandle;

export const meta: Route.MetaFunction = ({data, matches}) => {
  const image = data?.spotlight?.featuredImage;
  return seoMeta(matches, {
    title: COPY.seo.title,
    description: COPY.seo.description,
    url: `${storeOrigin(matches)}/green-month`,
    image: image ?? undefined,
  });
};

export const shouldRevalidate = skipCartAndWishlistRevalidation;

export async function loader(args: Route.LoaderArgs) {
  // Start the data below the fold without holding up the first byte…
  const deferredData = loadDeferredData(args);

  // …and wait only for what the first screen needs.
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/** The collection's counts and the spotlit diffuser. If they fail, the page fails. */
async function loadCriticalData({context}: Route.LoaderArgs) {
  const {storefront, customerAccount} = context;
  const buyer = await customerAccount.getBuyer();
  const data = await storefront.query(GREEN_MONTH_HERO_QUERY, {
    variables: {
      buyer,
      oils: COLLECTIONS.oils,
      blends: COLLECTIONS.blends,
      diffusers: COLLECTIONS.diffusers,
      nebulizers: COLLECTIONS.nebulizers,
      spotlight: SPOTLIGHT.handle,
    },
  });

  return {
    counts: {
      oils: data.oils?.productsCount ?? 0,
      blends: data.blends?.productsCount ?? 0,
      diffusers: (data.diffusers?.productsCount ?? 0) + (data.nebulizers?.productsCount ?? 0),
    },
    spotlight: data.spotlight,
  };
}

/**
 * Below the fold: the oils and blends (the rituals and the catalogue), the promo packs and the customers' reviews.
 * The page renders without any of them if they fail.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  const {storefront, customerAccount} = context;
  // Prices are the signed-in customer's own: their customer group's prices and discounts.
  const buyer = customerAccount.getBuyer();

  const catalog = buyer
    .then((buyer) =>
      storefront.query(GREEN_MONTH_CATALOG_QUERY, {
        variables: {buyer, singles: COLLECTIONS.singles, blends: COLLECTIONS.blends},
      }),
    )
    .then((data) => ({
      singles: data.singles?.products.nodes ?? [],
      blends: data.blends?.products.nodes ?? [],
    }))
    .catch((error: Error) => {
      console.error(error);
      return null;
    });

  const [r1, r2, r3] = REVIEWED_PRODUCTS;
  const extras = buyer
    .then((buyer) => storefront.query(GREEN_MONTH_EXTRAS_QUERY, {variables: {buyer, packs: PACKS_QUERY, r1, r2, r3}}))
    .then((data) => ({
      packs: data.packs.nodes.filter((pack) => pack.availableForSale && pack.title.startsWith(PACKS_QUERY_START)),
      reviews: [data.r1, data.r2, data.r3].flatMap((product) =>
        product ? (product.reviews?.nodes ?? []).map((review) => ({...review, product: product.title})) : [],
      ),
    }))
    .catch((error: Error) => {
      console.error(error);
      return null;
    });

  return {catalog, extras};
}

/** A promo pack's title starts with these words, whatever their case ("Промо пакет", "Промо Пакет"). */
const PACKS_QUERY_START = PACKS_QUERY.split(' ')[0];

export default function GreenMonth() {
  const {counts, spotlight, catalog, extras} = useLoaderData<typeof loader>();

  return (
    <div className="gm-page">
      <Hero oilsCount={counts.oils} />
      <Truths oilsCount={counts.oils} />
      <Rituals catalog={catalog} />
      <Packs extras={extras} />
      <Manifesto counts={counts} />
      {spotlight && <Spotlight product={spotlight} />}
      <Reviews extras={extras} />
      <Catalog catalog={catalog} />
      <Faq />
      <FinalCall />
      <StickyCall />
    </div>
  );
}

const GREEN_MONTH_HERO_QUERY = `#graphql
  query GreenMonthHero(
    $buyer: BuyerInput
    $oils: String!
    $blends: String!
    $diffusers: String!
    $nebulizers: String!
    $spotlight: String!
  ) @inContext(buyer: $buyer) {
    oils: collection(handle: $oils) {
      productsCount
    }
    blends: collection(handle: $blends) {
      productsCount
    }
    diffusers: collection(handle: $diffusers) {
      productsCount
    }
    nebulizers: collection(handle: $nebulizers) {
      productsCount
    }
    spotlight: product(handle: $spotlight) {
      ...LandingProduct
      images(first: 6) {
        nodes {
          ...LandingImage
        }
      }
    }
  }
  ${LANDING_PRODUCT_FRAGMENT}
` as const;

const GREEN_MONTH_CATALOG_QUERY = `#graphql
  query GreenMonthCatalog($buyer: BuyerInput, $singles: String!, $blends: String!) @inContext(buyer: $buyer) {
    singles: collection(handle: $singles) {
      products(first: 100, sortKey: BEST_SELLING) {
        nodes {
          ...LandingProduct
        }
      }
    }
    blends: collection(handle: $blends) {
      products(first: 60, sortKey: BEST_SELLING) {
        nodes {
          ...LandingProduct
        }
      }
    }
  }
  ${LANDING_PRODUCT_FRAGMENT}
` as const;

const GREEN_MONTH_EXTRAS_QUERY = `#graphql
  fragment LandingReview on ProductReview {
    id
    rating
    title
    comment
    createdAt
    author {
      name
      initials
    }
  }
  fragment ReviewedProduct on Product {
    title
    reviews(first: 20) {
      nodes {
        ...LandingReview
      }
    }
  }
  query GreenMonthExtras($buyer: BuyerInput, $packs: String!, $r1: String!, $r2: String!, $r3: String!)
  @inContext(buyer: $buyer) {
    packs: products(first: 24, query: $packs) {
      nodes {
        ...LandingProduct
      }
    }
    r1: product(handle: $r1) {
      ...ReviewedProduct
    }
    r2: product(handle: $r2) {
      ...ReviewedProduct
    }
    r3: product(handle: $r3) {
      ...ReviewedProduct
    }
  }
  ${LANDING_PRODUCT_FRAGMENT}
` as const;
