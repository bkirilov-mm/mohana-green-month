import {CAMPAIGN_MAX_PERCENT, COPY} from '~/lib/green-month';
import lemon from '~/assets/green-month/bottles/lemon.webp';
import lavender from '~/assets/green-month/bottles/lavender.webp';
import immuneBoost from '~/assets/green-month/bottles/immune-boost.webp';
import eucalyptus from '~/assets/green-month/bottles/eucalyptus.webp';
import goodNight from '~/assets/green-month/bottles/good-night.webp';
import {ArrowIcon, LeafIcon, ParcelIcon, SproutIcon} from './marks';

/**
 * The first screen: the campaign's name as a word mark in Prata, the bottles fanned over a leaf-green sun with the
 * discount's coral seal, the promise in a sentence, the two ways in (the rituals, the packs) and three facts that
 * lower the doubt - the range, free delivery, BoxNow. The header lies over it.
 */
export function Hero({oilsCount}: {oilsCount: number}) {
  const {hero} = COPY;

  return (
    <section aria-labelledby="gm-hero-title" className="gm-hero gm-grain gm-under-header">
      <div className="gm-hero-grid mx-auto max-w-page px-gutter pt-8 pb-12 md:px-gutter-md md:pt-12 lg:pt-20 lg:pb-16">
        <p className="gm-area-eyebrow gm-eyebrow gm-eyebrow-rule gm-rise self-end text-leaf-deep">{hero.eyebrow}</p>

        <h1 id="gm-hero-title" className="gm-area-title gm-display text-forest">
          <span className="gm-title-line gm-rise" style={{'--i': 1} as React.CSSProperties}>
            {hero.heading[0]}
          </span>
          <span className="gm-title-line gm-title-accent gm-rise" style={{'--i': 2} as React.CSSProperties}>
            {hero.heading[1]}
          </span>
        </h1>

        <div className="gm-area-bottles">
          <BottleFan />
        </div>

        <p className="gm-area-lead gm-lead max-w-lead text-ink">{hero.lead}</p>

        <div className="gm-area-actions flex flex-wrap items-center gap-3">
          <a href="#rituals" className="gm-button gm-button-forest">
            {hero.primary}
            <ArrowIcon className="size-4" />
          </a>
          <a href="#packs" className="gm-button gm-button-line text-forest">
            {hero.secondary}
          </a>
        </div>

        <ul className="gm-area-proofs text-small text-ink">
          <li className="gm-proof">
            <SproutIcon className="size-5 shrink-0 text-leaf-deep" />
            <span>
              <strong className="font-bold">{oilsCount}</strong> {COPY.manifesto.stats.oils}
            </span>
          </li>
          {hero.proofs.map((proof, index) => (
            <li key={proof} className="gm-proof">
              {index === 0 ? (
                <LeafIcon className="size-5 shrink-0 text-leaf-deep" />
              ) : (
                <ParcelIcon className="size-5 shrink-0 text-leaf-deep" />
              )}
              <span>{proof}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** The bottles, fanned out from the middle one, which stands tallest; the seal beside them. */
function BottleFan() {
  const middle = (BOTTLES.length - 1) / 2;

  return (
    <div className="gm-fan">
      <div aria-hidden="true" className="gm-fan-sun" />
      {BOTTLES.map((bottle, index) => {
        const offset = index - middle;
        return (
          <div
            key={bottle}
            className="gm-fan-bottle"
            data-center={offset === 0 || undefined}
            style={{'--offset': offset, '--depth': Math.abs(offset)} as React.CSSProperties}
          >
            {/* The bottles' names are on their labels and in the page below: here they are the picture. */}
            <img
              src={bottle}
              alt=""
              width={590}
              height={1102}
              decoding="async"
              fetchPriority={offset === 0 ? 'high' : undefined}
            />
          </div>
        );
      })}
      <Seal />
    </div>
  );
}

/**
 * The hero's bottles, left to right: Mohana's own product photographs (Lemon, Lavender, Immune Boost, Eucalyptus,
 * Good Night), cut out of their white studio ground so they can overlap without showing through each other.
 */
const BOTTLES = [lemon, lavender, immuneBoost, eucalyptus, goodNight];

/** "до -30%" on a coral disc, the campaign's name turning around it. */
function Seal() {
  const {hero} = COPY;
  // The ring's words, twice round.
  const ring = hero.seal.repeat(2);

  return (
    <div className="gm-seal">
      <svg aria-hidden="true" viewBox="0 0 100 100" className="gm-seal-ring">
        <defs>
          <path id="gm-seal-path" d="M50,50 m-42,0 a42,42 0 1,1 84,0 a42,42 0 1,1 -84,0" />
        </defs>
        <text>
          <textPath href="#gm-seal-path" textLength="263">
            {ring}
          </textPath>
        </text>
      </svg>
      <p className="gm-seal-value">
        <small>{hero.upTo}</small>
        <span>-{CAMPAIGN_MAX_PERCENT}%</span>
      </p>
    </div>
  );
}

/** A band of what Mohana's oils are, running across the page. */
export function Truths({oilsCount}: {oilsCount: number}) {
  const truths = [...COPY.truths, `${oilsCount} ${COPY.manifesto.stats.oils}`];
  // Twice, so the band runs on without a gap; the copy is the same words, not for a screen reader.
  return (
    <div className="gm-dark border-y border-moss py-5">
      <div className="gm-marquee">
        <div className="gm-marquee-track">
          {[0, 1].map((copy) => (
            <ul key={copy} aria-hidden={copy === 1 || undefined} className="flex items-center gap-12">
              {truths.map((truth) => (
                <li key={truth} className="flex items-center gap-12">
                  <span className="gm-serif text-heading text-cream">{truth}</span>
                  <LeafIcon className="size-5 text-leaf" />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </div>
  );
}
