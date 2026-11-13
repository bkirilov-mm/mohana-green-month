import {COPY} from '~/lib/green-month';
import familyImage from '~/assets/green-month/family.jpg';
import {Sprig} from './marks';

/**
 * Why Mohana, on the forest ground: the market's synthetic scents against oils that are only the plant, three
 * pillars, the range in the store's own live counts, and Mohana's photograph of a family running into the sun.
 */
export function Manifesto({counts}: {counts: {oils: number; blends: number; diffusers: number}}) {
  const {manifesto} = COPY;
  const stats = [
    {value: counts.oils, label: manifesto.stats.oils},
    {value: counts.blends, label: manifesto.stats.blends},
    {value: counts.diffusers, label: manifesto.stats.diffusers},
  ].filter((stat) => stat.value > 0);

  return (
    <section aria-labelledby="gm-manifesto-title" className="gm-dark gm-grain relative overflow-clip py-20 md:py-32">
      <Sprig className="pointer-events-none absolute -top-6 -left-6 h-80 text-leaf opacity-15" />
      <div className="mx-auto max-w-page px-gutter md:px-gutter-md">
        <p className="gm-eyebrow gm-eyebrow-rule text-leaf">{manifesto.eyebrow}</p>
        <div className="gm-reveal mt-8 grid gap-8 lg:grid-cols-12">
          <span aria-hidden="true" className="gm-quote-mark hidden lg:col-span-1 lg:block">
            “
          </span>
          <h2 id="gm-manifesto-title" className="gm-heading lg:col-span-10">
            {manifesto.quote} <span className="text-leaf">{manifesto.answer}</span>
          </h2>
        </div>

        <ol className="mt-16 grid gap-10 md:grid-cols-3 md:gap-8">
          {manifesto.pillars.map((pillar, index) => (
            <li key={pillar.heading} className="gm-pillar gm-reveal">
              <span className="gm-pillar-index text-heading">{String(index + 1).padStart(2, '0')}</span>
              <h3 className="mt-4 text-subheading text-cream">{pillar.heading}</h3>
              <p className="mt-3 text-cream/75">{pillar.text}</p>
            </li>
          ))}
        </ol>

        {stats.length > 0 && (
          <dl className="mt-20 grid grid-cols-3 gap-4 border-t border-cream/20 pt-10">
            {stats.map((stat) => (
              <div key={stat.label} className="gm-reveal">
                <dt className="sr-only">{stat.label}</dt>
                <dd className="gm-stat">{stat.value}</dd>
                <dd aria-hidden="true" className="mt-2 text-small text-cream/75 md:text-body">
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>
        )}

        <figure className="gm-family gm-reveal mt-20">
          <img src={familyImage} alt="" loading="lazy" decoding="async" width={2400} height={892} />
          <figcaption className="gm-serif absolute inset-x-0 bottom-0 z-10 p-6 text-heading text-cream md:p-10 md:text-title">
            {manifesto.family}
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
