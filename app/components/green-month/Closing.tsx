import {useEffect, useState} from 'react';
import {parseDateTime} from '@cloudcart/nitrogen';
import {AccordionItem} from '~/components/ui/Accordion';
import {useNow} from '~/components/ui/Countdown';
import {CAMPAIGN_ENDS_AT, CAMPAIGN_MAX_PERCENT, COPY} from '~/lib/green-month';
import {ArrowIcon} from './marks';

/** The questions that stop an order - the discount, delivery, which oil, how to pay - answered before they are asked. */
export function Faq() {
  const {faq} = COPY;

  return (
    <section aria-labelledby="gm-faq-title" className="bg-cream py-20 md:py-28">
      <div className="mx-auto grid max-w-page gap-10 px-gutter md:px-gutter-md lg:grid-cols-12">
        <div className="gm-reveal lg:col-span-4">
          <p className="gm-eyebrow gm-eyebrow-rule text-leaf-deep">{faq.eyebrow}</p>
          <h2 id="gm-faq-title" className="gm-heading mt-5 text-forest">
            {faq.heading}
          </h2>
        </div>
        <div className="gm-faq lg:col-span-7 lg:col-start-6">
          {faq.items.map((item, index) => (
            <AccordionItem key={item.question} name="gm-faq" title={item.question} defaultOpen={index === 0}>
              <p className="gm-lead max-w-reading pb-2 text-ink-muted">{item.answer}</p>
            </AccordionItem>
          ))}
        </div>
      </div>
    </section>
  );
}

/** The last word: the time left, cell by cell, and the way back to the oils. */
export function FinalCall() {
  const {final} = COPY;

  return (
    <section aria-labelledby="gm-final-title" className="gm-final gm-grain gm-dark py-24 text-center md:py-36">
      <div className="mx-auto flex max-w-wide flex-col items-center px-gutter md:px-gutter-md">
        <p className="gm-eyebrow text-leaf">
          {COPY.hero.upTo} -{CAMPAIGN_MAX_PERCENT}%
        </p>
        <h2 id="gm-final-title" className="gm-heading gm-reveal mt-6">
          {final.heading}
        </h2>
        <p className="gm-lead mt-6 max-w-lead text-cream/80">{final.lead}</p>
        <Clock />
        <a href="#rituals" className="gm-button gm-button-leaf mt-12">
          {final.cta}
          <ArrowIcon className="size-4" />
        </a>
      </div>
    </section>
  );
}

/** Days, hours, minutes and seconds to the campaign's end; in the browser only, and nothing once it is over. */
function Clock() {
  const now = useNow();
  const end = parseDateTime(CAMPAIGN_ENDS_AT)?.getTime();
  const {units} = COPY.final;
  // Its place, so the button does not jump when the time arrives.
  if (now === null || end === undefined) return <div className="gm-clock mt-12 h-28 w-full" aria-hidden="true" />;
  if (end <= now) return null;

  const seconds = Math.floor((end - now) / 1000);
  const cells = [
    {value: Math.floor(seconds / 86400), unit: units.days},
    {value: Math.floor(seconds / 3600) % 24, unit: units.hours},
    {value: Math.floor(seconds / 60) % 60, unit: units.minutes},
    {value: seconds % 60, unit: units.seconds},
  ];

  return (
    <div role="timer" aria-live="off" className="gm-clock mt-12 w-full">
      {cells.map((cell) => (
        <p key={cell.unit} className="gm-clock-cell">
          <span className="gm-clock-value">{String(cell.value).padStart(2, '0')}</span>
          <span className="gm-eyebrow mt-2 block text-cream/70">{cell.unit}</span>
        </p>
      ))}
    </div>
  );
}

/**
 * On a phone, once the hero has scrolled away and until the closing call shows: the discount and the way to the oils,
 * always under the thumb.
 */
export function StickyCall() {
  const hidden = useStickyHidden();

  return (
    <div
      data-hidden={hidden || undefined}
      aria-hidden={hidden || undefined}
      className="gm-sticky fixed inset-x-3 bottom-3 z-30 md:hidden"
    >
      <div className="gm-sticky-inner flex items-center justify-between gap-3 rounded-full py-2 pr-2 pl-5">
        <p className="text-small">
          <span className="gm-eyebrow block whitespace-nowrap text-leaf">{COPY.bar.label}</span>
          <strong className="font-bold">
            {COPY.hero.upTo} -{CAMPAIGN_MAX_PERCENT}%
          </strong>
        </p>
        <a href="#rituals" tabIndex={hidden ? -1 : undefined} className="gm-button gm-button-leaf min-h-11 px-5">
          {COPY.final.cta}
        </a>
      </div>
    </div>
  );
}

/** Hidden over the hero and over the closing call, which carry the same action. */
function useStickyHidden() {
  const [hidden, setHidden] = useState(true);
  useEffect(() => {
    const hero = document.querySelector('#gm-hero-title')?.closest('section');
    const final = document.querySelector('#gm-final-title')?.closest('section');
    if (!hero || !final) return;
    const visible = new Map<Element, boolean>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) visible.set(entry.target, entry.isIntersecting);
      setHidden(Boolean(visible.get(hero) || visible.get(final)));
    });
    observer.observe(hero);
    observer.observe(final);
    return () => observer.disconnect();
  }, []);
  return hidden;
}
