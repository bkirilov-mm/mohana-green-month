import {useLocation} from 'react-router';

/** The classic storefront that owns checkout, customer sessions and legal pages. */
export const LIVE_STORE_ORIGIN = 'https://mohana.bg';

/** Whether the Nitrogen campaign is currently framed by the classic Mohana page. */
export function useEmbeddedLanding() {
  const {search} = useLocation();
  return new URLSearchParams(search).get('embed') === '1';
}

/** An absolute URL on the live classic storefront. */
export function liveStoreUrl(path: string) {
  return new URL(path, LIVE_STORE_ORIGIN).href;
}
