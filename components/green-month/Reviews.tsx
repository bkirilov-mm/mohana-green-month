import {Suspense} from 'react';
import {Await} from 'react-router';
import {COPY} from '~/lib/green-month';
import type {ExtrasData} from './Packs';

/** How many reviews the wall shows, and the least a comment says to be worth quoting. */
const SHOWN = 6;
const MIN_COMMENT = 50;
/** A five-star review with a reservation in it ("my only remark…") belongs on the product's page, not on the wall. */
const RESERVATION = /забележк|не ми харесва|единственото|минус|непременно/i;

/** The API gives a review's words as the customer's form stored them, with HTML's entities ("&quot;"): as plain text. */
const ENTITIES: Record<string, string> = {
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
};
const plain = (text: string) => text.replace(/&(?:quot|#39|apos|amp|lt|gt);/g, (entity) => ENTITIES[entity]);

/**
 * Customers' own words, as they wrote them on mohana.bg: the five-star reviews with something to say, newest first.
 * Nothing written here - with no such reviews the section is not shown.
 */
export function Reviews({extras}: {extras: ExtrasData}) {
  return (
    <Suspense fallback={null}>
      <Await resolve={extras}>
        {(data) => {
          const reviews = (data?.reviews ?? [])
            .filter(
              (review) =>
                review.rating === 5 &&
                (review.comment?.trim().length ?? 0) >= MIN_COMMENT &&
                !RESERVATION.test(review.comment ?? ''),
            )
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
            .filter((review, index, all) => all.findIndex((other) => other.comment === review.comment) === index)
            .slice(0, SHOWN);
          return reviews.length ? <ReviewWall reviews={reviews} /> : null;
        }}
      </Await>
    </Suspense>
  );
}

type Review = NonNullable<Awaited<ExtrasData>>['reviews'][number];

function ReviewWall({reviews}: {reviews: Review[]}) {
  const {reviews: copy} = COPY;

  return (
    <section aria-labelledby="gm-reviews-title" className="gm-grain bg-sage py-20 md:py-28">
      <div className="mx-auto max-w-page px-gutter md:px-gutter-md">
        <div className="gm-reveal max-w-campaign-heading">
          <p className="gm-eyebrow gm-eyebrow-rule text-leaf-deep">{copy.eyebrow}</p>
          <h2 id="gm-reviews-title" className="gm-heading mt-5 text-forest">
            {copy.heading}
          </h2>
        </div>
        <ul className="mt-12 grid gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-3">
          {reviews.map((review) => (
            <li key={review.id} className="gm-review gm-reveal p-6 md:p-8">
              <figure className="flex h-full flex-col">
                <p className="gm-stars" aria-hidden="true">
                  {'★'.repeat(review.rating)}
                </p>
                {review.title && review.title.trim().length > 1 && (
                  <p className="gm-serif mt-4 text-card text-forest">{plain(review.title)}</p>
                )}
                <blockquote className="mt-3 mb-6 text-ink">
                  <p>{plain(review.comment ?? '')}</p>
                </blockquote>
                <figcaption className="mt-auto flex items-center gap-3 border-t border-ink/10 pt-5 text-small">
                  <span aria-hidden="true" className="gm-avatar shrink-0">
                    {review.author?.initials}
                  </span>
                  <span>
                    <strong className="block font-bold text-ink">{plain(review.author?.name ?? '')}</strong>
                    <span className="text-ink-muted">
                      {copy.verified} · {plain(review.product.split(',')[0])}
                    </span>
                  </span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
