import { GA_MEASUREMENT_ID } from '@/lib/site';

// Google Analytics runs only on the live domain, on by default without ad features; a visitor who turns it off on the privacy page stays off.
const ANALYTICS_SCRIPT = `(function(){if(location.hostname!=='addiyonkeyboard.com')return;try{if(localStorage.getItem('analytics-off')==='1')return;}catch(e){}
window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;
gtag('js',new Date());gtag('config','${GA_MEASUREMENT_ID}',{allow_google_signals:false,allow_ad_personalization_signals:false});
var s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}';document.head.appendChild(s);})();`;

export function Analytics() {
  if (!GA_MEASUREMENT_ID) return null;
  return <script dangerouslySetInnerHTML={{ __html: ANALYTICS_SCRIPT }} />;
}
