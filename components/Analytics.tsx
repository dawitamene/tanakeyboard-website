import { ASSET_VERSION, GA_MEASUREMENT_ID } from '@/lib/site';

// Google Analytics runs only on the live domain, for verified human visitors, without ad features;
// a visitor who turns it off on the privacy page stays off. See public/js/analytics.js.
export function Analytics() {
  if (!GA_MEASUREMENT_ID) return null;
  return <script src={`/js/analytics.js?v=${ASSET_VERSION}`} data-ga-id={GA_MEASUREMENT_ID} defer />;
}
