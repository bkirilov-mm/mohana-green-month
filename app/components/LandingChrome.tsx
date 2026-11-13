import {Suspense, useEffect, useState} from 'react';
import {Await, Link, useAsyncValue, useMatches} from 'react-router';
import {useOptimisticCart, useTranslation} from '@cloudcart/nitrogen';
import {Image} from '@cloudcart/nitrogen-react';
import type {CartApiQueryFragment, FooterQuery, HeaderQuery} from 'storefrontapi.generated';
import {FooterPolicies} from '~/components/Footer';
import {useOpenCart} from '~/components/Header';
import {CartIcon} from '~/components/ui/icons';
import {Countdown} from '~/components/ui/Countdown';
import type {Streamed} from '~/lib/visitor';

/**
 * The `handle` of a campaign landing page: the page is the whole funnel, so it has no menu, search or footer links to
 * leave by - only the logo, the cart and the store's legal links (`PageLayout`).
 */
export type LandingHandle = {
  landing: {
    /** When the campaign ends (a `DateTime`, UTC): the header counts down to it. */
    endsAt?: string;
    /** The campaign's name, and the words before the time left ("Остават"), in the campaign's language. */
    label?: string;
    endsIn?: string;
  };
};

/** The landing page's own settings, when the page shown is one (its route's `handle.landing`). */
export function useLanding() {
  const matches = useMatches();
  for (const match of matches) {
    const landing = (match.handle as Partial<LandingHandle> | undefined)?.landing;
    if (landing) return landing;
  }
  return null;
}

/**
 * A landing page's header: the logo, which leads nowhere, the campaign's time left and the cart. Over the page's top
 * it is clear; once the visitor scrolls it gets the paper ground.
 */
export function LandingHeader({
  header,
  cart,
  landing,
}: {
  header: HeaderQuery;
  cart: Streamed<CartApiQueryFragment | null>;
  landing: LandingHandle['landing'];
}) {
  const {t} = useTranslation();
  const logo = header.shop.brand.logo?.image;
  const scrolled = useScrolled();

  return (
    <header data-scrolled={scrolled || undefined} className="gm-header sticky top-0 z-40">
      <div className="mx-auto flex h-16 max-w-page items-center gap-4 px-gutter md:h-20 md:px-gutter-md">
        <span className="shrink-0">
          {logo ? (
            <Image
              data={logo}
              alt={header.shop.name}
              width="auto"
              height={44}
              loading="eager"
              className="h-11 w-auto"
            />
          ) : (
            <span className="font-display text-h4">{header.shop.name}</span>
          )}
        </span>
        {landing.endsAt && (
          <p className="mx-auto hidden items-center gap-3 text-small text-ink md:flex">
            {landing.label && (
              <span className="gm-eyebrow flex items-center gap-2 text-leaf-deep">
                <span aria-hidden="true" className="gm-pulse size-1.5 rounded-full bg-leaf" />
                {landing.label}
              </span>
            )}
            <Countdown
              endsAt={landing.endsAt}
              className="font-medium"
              label={(time) => (landing.endsIn ? `${landing.endsIn} ${time}` : t('cart.endsIn', {time}))}
            />
          </p>
        )}
        <div className="ml-auto">
          <Suspense fallback={<CartPill count={0} />}>
            <Await resolve={cart}>
              <CartPillFromCart />
            </Await>
          </Suspense>
        </div>
      </div>
    </header>
  );
}

function CartPillFromCart() {
  const original = useAsyncValue() as CartApiQueryFragment | null;
  const cart = useOptimisticCart(original);
  return <CartPill count={cart?.totalQuantity ?? 0} />;
}

/** The cart as a pill: its icon and how many items it holds; it opens the cart drawer. */
function CartPill({count}: {count: number}) {
  const {t} = useTranslation();
  const openCart = useOpenCart();

  return (
    <Link
      to="/cart"
      onClick={openCart}
      aria-label={t('header.cart', {count})}
      className="gm-cart-pill inline-flex h-11 items-center gap-2 rounded-full px-4 font-medium hover:no-underline"
    >
      <CartIcon className="size-5" />
      <span aria-hidden="true" className="tabular-nums">
        {count}
      </span>
    </Link>
  );
}

/** Whether the page has scrolled from its top. */
function useScrolled() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 8);
    update();
    window.addEventListener('scroll', update, {passive: true});
    return () => window.removeEventListener('scroll', update);
  }, []);
  return scrolled;
}

/** A landing page's footer: the store's name and the legal links every page must keep - no menus to wander off by. */
export function LandingFooter({
  footer,
  header,
  hasCookieConsent,
}: {
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  hasCookieConsent: boolean;
}) {
  return (
    <footer className="bg-forest text-small text-cream">
      <div className="mx-auto flex max-w-page flex-col gap-4 px-gutter py-8 md:flex-row md:items-center md:justify-between md:px-gutter-md">
        <p>
          © {new Date().getFullYear()} {header.shop.name}
        </p>
        <div className="gm-footer-links flex flex-wrap items-center gap-x-4 gap-y-2">
          <Suspense fallback={null}>
            <Await resolve={footer}>
              {(data) => (
                <FooterPolicies
                  policies={data?.policies ?? []}
                  hasCookieConsent={hasCookieConsent}
                  takesPrivacyRequests={Boolean(data?.shop.gdprRequestTypes.length)}
                />
              )}
            </Await>
          </Suspense>
        </div>
      </div>
    </footer>
  );
}
