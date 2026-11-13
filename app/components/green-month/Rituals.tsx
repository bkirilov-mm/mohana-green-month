import {Suspense, useId, useState} from 'react';
import {Await} from 'react-router';
import type {LandingProductFragment} from 'storefrontapi.generated';
import {COPY, RITUALS} from '~/lib/green-month';
import {LandingProductCard, LandingProductCardPlaceholder} from './LandingProductCard';
import {DropIcon, Sprig} from './marks';

export type CatalogData = Promise<{singles: LandingProductFragment[]; blends: LandingProductFragment[]} | null>;

/**
 * The funnel's heart: the visitor says what they need - immunity, sleep, focus, a fresh home - and gets the oils and
 * blends for it, each one tap from the cart. Tabs (the ARIA pattern, arrow keys between them) over one panel.
 */
export function Rituals({catalog}: {catalog: CatalogData}) {
  const {rituals} = COPY;
  const [active, setActive] = useState(0);
  const id = useId();
  const ritual = RITUALS[active];

  const move = (index: number) => {
    const next = (index + RITUALS.length) % RITUALS.length;
    setActive(next);
    document.getElementById(`${id}-tab-${next}`)?.focus();
  };

  return (
    <section id="rituals" aria-labelledby={`${id}-title`} className="gm-grain relative scroll-mt-16 py-20 md:py-28">
      <Sprig className="pointer-events-none absolute top-10 right-0 hidden h-64 text-leaf-deep opacity-20 md:block" />
      <div className="mx-auto max-w-page px-gutter md:px-gutter-md">
        <div className="gm-reveal max-w-campaign-heading">
          <p className="gm-eyebrow gm-eyebrow-rule text-leaf-deep">{rituals.eyebrow}</p>
          <h2 id={`${id}-title`} className="gm-heading mt-5 text-forest">
            {rituals.heading}
          </h2>
          <p className="gm-lead mt-5 max-w-lead text-ink-muted">{rituals.lead}</p>
        </div>

        <div
          role="tablist"
          aria-label={rituals.heading}
          className="gm-tabs -mx-gutter mt-10 flex gap-2 overflow-x-auto px-gutter md:mx-0 md:flex-wrap md:px-0"
        >
          {RITUALS.map((item, index) => (
            <button
              key={item.id}
              id={`${id}-tab-${index}`}
              type="button"
              role="tab"
              aria-selected={index === active}
              aria-controls={`${id}-panel`}
              tabIndex={index === active ? 0 : -1}
              onClick={() => setActive(index)}
              onKeyDown={(event) => {
                if (event.key === 'ArrowRight') move(index + 1);
                if (event.key === 'ArrowLeft') move(index - 1);
              }}
              className="gm-tab"
            >
              {item.label}
            </button>
          ))}
        </div>

        <div
          id={`${id}-panel`}
          role="tabpanel"
          aria-labelledby={`${id}-tab-${active}`}
          className="mt-6 grid gap-4 lg:grid-cols-12 lg:gap-6"
        >
          <div key={ritual.id} className="gm-ritual-panel gm-ritual-enter flex flex-col p-7 md:p-10 lg:col-span-4">
            <h3 className="gm-serif text-title text-forest">{ritual.heading}</h3>
            <p className="gm-lead mt-4 text-ink">{ritual.text}</p>
            <div className="mt-auto flex gap-3 border-t border-forest/15 pt-6 text-small text-ink">
              <DropIcon className="mt-0.5 size-5 shrink-0 text-leaf-deep" />
              <p>
                <strong className="font-bold">{rituals.tipLabel}:</strong> {ritual.tip}
              </p>
            </div>
          </div>
          <div className="lg:col-span-8">
            <Suspense fallback={<RitualGrid />}>
              <Await resolve={catalog}>
                {(data) => <RitualGrid products={data ? pick(data, ritual.handles) : []} ritualId={ritual.id} />}
              </Await>
            </Suspense>
          </div>
        </div>
      </div>
    </section>
  );
}

/** The ritual's products, those in stock first; their places while they load. */
function RitualGrid({products, ritualId}: {products?: LandingProductFragment[]; ritualId?: string}) {
  return (
    <ul key={ritualId} className="gm-ritual-enter grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
      {products
        ? products.slice(0, 8).map((product) => (
            <li key={product.id}>
              <LandingProductCard product={product} sizes="(min-width: 990px) 15vw, (min-width: 750px) 22vw, 46vw" />
            </li>
          ))
        : Array.from({length: 8}, (_, index) => (
            <li key={index}>
              <LandingProductCardPlaceholder />
            </li>
          ))}
    </ul>
  );
}

/** The products with these handles, in their order, those for sale first. */
function pick(data: {singles: LandingProductFragment[]; blends: LandingProductFragment[]}, handles: readonly string[]) {
  const byHandle = new Map([...data.singles, ...data.blends].map((product) => [product.handle, product]));
  const found = handles.map((handle) => byHandle.get(handle)).filter((product) => product !== undefined);
  return [
    ...found.filter((product) => product.availableForSale),
    ...found.filter((product) => !product.availableForSale),
  ];
}
