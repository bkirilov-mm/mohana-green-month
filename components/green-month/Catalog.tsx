import {Suspense, useState} from 'react';
import {Await} from 'react-router';
import type {LandingProductFragment} from 'storefrontapi.generated';
import {COPY} from '~/lib/green-month';
import {LandingProductCard, LandingProductCardPlaceholder} from './LandingProductCard';
import type {CatalogData} from './Rituals';

/** How many products the catalogue shows at first, and adds with each "Show more". */
const STEP = 12;

/**
 * Everything in the campaign, for the visitor who knows what they want: the single oils and the blends, best-selling
 * first, a dozen at a time. It stays on the page: no listing to wander off to.
 */
export function Catalog({catalog}: {catalog: CatalogData}) {
  const {catalog: copy} = COPY;
  const [kind, setKind] = useState<'singles' | 'blends'>('singles');

  return (
    <section id="catalog" aria-labelledby="gm-catalog-title" className="scroll-mt-16 py-20 md:py-28">
      <div className="mx-auto max-w-page px-gutter md:px-gutter-md">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="gm-reveal">
            <p className="gm-eyebrow gm-eyebrow-rule text-leaf-deep">{copy.eyebrow}</p>
            <h2 id="gm-catalog-title" className="gm-heading mt-5 text-forest">
              {copy.heading}
            </h2>
          </div>
          <div role="group" aria-label={copy.heading} className="gm-toggle grid grid-cols-2 gap-2 md:flex">
            {(['singles', 'blends'] as const).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={kind === option}
                onClick={() => setKind(option)}
                className="gm-tab aria-pressed:border-forest aria-pressed:bg-forest aria-pressed:text-cream"
              >
                {copy[option]}
              </button>
            ))}
          </div>
        </div>
        <Suspense fallback={<Grid />}>
          <Await resolve={catalog}>{(data) => (data ? <Grid key={kind} products={data[kind]} /> : null)}</Await>
        </Suspense>
      </div>
    </section>
  );
}

function Grid({products}: {products?: LandingProductFragment[]}) {
  const [shown, setShown] = useState(STEP);
  const list = products
    ? [...products.filter((p) => p.availableForSale), ...products.filter((p) => !p.availableForSale)]
    : null;

  return (
    <>
      <ul className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
        {list
          ? list.slice(0, shown).map((product) => (
              <li key={product.id} className="gm-ritual-enter">
                <LandingProductCard product={product} />
              </li>
            ))
          : Array.from({length: 8}, (_, index) => (
              <li key={index}>
                <LandingProductCardPlaceholder />
              </li>
            ))}
      </ul>
      {list && list.length > shown && (
        <div className="mt-12 flex justify-center">
          <button type="button" onClick={() => setShown(shown + STEP)} className="gm-button gm-button-line text-forest">
            {COPY.catalog.more} ({list.length - shown})
          </button>
        </div>
      )}
    </>
  );
}
