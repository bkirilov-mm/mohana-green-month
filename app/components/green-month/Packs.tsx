import {Suspense} from 'react';
import {Await} from 'react-router';
import type {LandingProductFragment, LandingReviewFragment} from 'storefrontapi.generated';
import {COPY} from '~/lib/green-month';
import {LandingProductCard, LandingProductCardPlaceholder} from './LandingProductCard';

export type ExtrasData = Promise<{
  packs: LandingProductFragment[];
  reviews: (LandingReviewFragment & {product: string})[];
} | null>;

/**
 * The promo packs - a diffuser and chosen oils for less than apart - on a rail that scrolls sideways: the larger
 * basket, and the gift before the holidays. A pack is chosen on its page (a bundle), so its card links there.
 */
export function Packs({extras}: {extras: ExtrasData}) {
  const {packs} = COPY;

  return (
    <section id="packs" aria-labelledby="gm-packs-title" className="scroll-mt-16 bg-cream py-20 md:py-28">
      <div className="mx-auto grid max-w-page gap-6 px-gutter md:grid-cols-12 md:items-end md:px-gutter-md">
        <div className="gm-reveal md:col-span-7">
          <p className="gm-eyebrow gm-eyebrow-rule text-leaf-deep">{packs.eyebrow}</p>
          <h2 id="gm-packs-title" className="gm-heading mt-5 text-forest">
            {packs.heading}
          </h2>
        </div>
        <p className="gm-lead gm-reveal text-ink-muted md:col-span-4 md:col-start-9">{packs.lead}</p>
      </div>
      <div className="mx-auto mt-12 max-w-page">
        <Suspense fallback={<Rail />}>
          <Await resolve={extras}>{(data) => (data?.packs.length ? <Rail packs={data.packs} /> : null)}</Await>
        </Suspense>
      </div>
    </section>
  );
}

function Rail({packs}: {packs?: LandingProductFragment[]}) {
  return (
    <ul className="gm-rail">
      {packs
        ? packs.slice(0, 10).map((pack) => (
            <li key={pack.id}>
              <LandingProductCard
                product={pack}
                cover
                viewLabel={COPY.packs.view}
                sizes="(min-width: 990px) 30vw, (min-width: 750px) 42vw, 78vw"
              />
            </li>
          ))
        : Array.from({length: 4}, (_, index) => (
            <li key={index}>
              <LandingProductCardPlaceholder />
            </li>
          ))}
    </ul>
  );
}
