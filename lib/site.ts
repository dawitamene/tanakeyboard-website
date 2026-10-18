// Site-wide constants and the English and Amharic interface copy.
export const ORIGIN = 'https://addiyonkeyboard.com';
export const PLAY_URL = 'https://play.google.com/store/apps/details?id=com.addiyon.keyboard';
export const ASSET_VERSION = '20261018';
export const GA_MEASUREMENT_ID = 'G-HVXJCY4MR8';
export const SITE_NAME = 'Addiyon Keyboard';
export const DEFAULT_IMAGE = '/img/feature-graphic-v2.webp';

export type Lang = 'en' | 'am' | 'om' | 'ti';

/** Each language's home page, Open Graph locale and the short label used by the nav's language links. */
export const LANGS: Record<Lang, { home: string; locale: string; label: string }> = {
  en: { home: '/', locale: 'en_US', label: 'EN' },
  am: { home: '/am', locale: 'am_ET', label: 'አማ' },
  om: { home: '/om', locale: 'om_ET', label: 'AO' },
  ti: { home: '/ti', locale: 'ti_ET', label: 'ትግ' }
};
type Link = [string, string];

export interface SiteCopy {
  nav: Link[];
  getApp: string;
  getAppLabel: string;
  playButton: string;
  toggleTheme: string;
  switchLang: [Lang, string, string];
  readIn: string;
  footDesc: string;
  footCols: [string, Link[]][];
  contact: string;
  telegram: string;
  rights: string;
  madeWith: string;
  ctaTitle: string;
  ctaBody: string;
  ctaSecondary: Link;
  faqTitle: string;
  relatedTitle: string;
  updated: string;
  home: string;
}

export const copy: Record<Lang, SiteCopy> = {
  en: {
    nav: [['/amharic-typing', 'Type online'], ['/amharic-alphabet', 'Alphabet'], ['/guides/', 'Guides']],
    getApp: 'Get the app',
    getAppLabel: 'Get Addiyon Keyboard on Google Play',
    playButton: 'Get it on Google Play',
    toggleTheme: 'Toggle dark mode',
    switchLang: ['am', 'አማ', 'ይህን ገጽ በአማርኛ ያንብቡ'],
    readIn: 'Read this page in English',
    footDesc: 'The fast, private way to type Amharic in the Ge&#8217;ez script.',
    footCols: [
      ['Product', [['/features', 'Features'], ['/privacy', 'Privacy Policy'], [PLAY_URL, 'Google Play']]],
      ['Languages', [['/', 'Amharic keyboard'], ['/afaan-oromoo-keyboard', 'Afaan Oromoo keyboard'], ['/tigrinya-keyboard', 'Tigrinya keyboard'], ['/ethiopian-keyboard', 'Ethiopian keyboard'], ['/tigrinya-typing', 'Type Tigrinya online'], ['/om', 'Afaan Oromoo'], ['/ti', 'ትግርኛ']]],
      ['Free tools', [['/amharic-typing', 'Type Amharic online'], ['/amharic-alphabet', 'Amharic alphabet chart'], ['/ethiopian-calendar-converter', 'Ethiopian calendar converter'], ['/ethiopian-time', 'Ethiopian time'], ['/ethiopian-calendar-2019', 'Ethiopian calendar 2019'], ['/geez-numbers', 'Ge&#8217;ez number converter'], ['/amharic-phrases', 'Amharic phrases'], ['/amharic-name', 'Your name in Amharic'], ['/amharic-numbers', 'Amharic numbers'], ['/amharic-days-and-months', 'Days and months'], ['/am/', 'በአማርኛ']]],
      ['Guides', [['/guides/how-to-type-amharic-on-android', 'Type Amharic on Android'], ['/guides/amharic-typing-rules', 'Amharic spelling rules'], ['/guides/amharic-keyboard-for-whatsapp', 'Amharic on WhatsApp'], ['/guides/amharic-keyboard-xiaomi-redmi', 'Amharic on Xiaomi'], ['/compare/', 'Compare keyboards']]],
      ['Ethiopian calendar', [['/holidays/', 'Ethiopian holidays'], ['/ethiopian-age-calculator', 'Age calculator'], ['/ethiopian-calendar-2020', 'Calendar 2020 E.C.'], ['/learn/', 'Learn Amharic'], ['/amharic-holiday-greetings', 'Holiday greetings']]]
    ],
    contact: 'Contact',
    telegram: 'Join our Telegram group',
    rights: '© 2026 Addiyon LLC. All rights reserved.',
    madeWith: 'Made with care for the <span class="eth">አማርኛ</span> community.',
    ctaTitle: 'Type Amharic in every app.',
    ctaBody: 'Addiyon Keyboard is free on Google Play. It turns English letters into Fidel as you type, works offline, and keeps your typing on your phone.',
    ctaSecondary: ['/features', 'See all features'],
    faqTitle: 'Common questions.',
    relatedTitle: 'Keep reading',
    updated: 'Updated',
    home: 'Addiyon Keyboard'
  },
  am: {
    nav: [['/am/amharic-typing', 'በኦንላይን ይጻፉ'], ['/am/amharic-alphabet', 'ፊደል'], ['/am/geez-numbers', 'ቁጥሮች']],
    getApp: 'አውርድ',
    getAppLabel: 'አዲዮን ኪቦርድን ከGoogle Play ያውርዱ',
    playButton: 'ከGoogle Play ያውርዱ',
    toggleTheme: 'ጨለማ ገጽታ',
    switchLang: ['en', 'EN', 'Read this page in English'],
    readIn: 'ይህን ገጽ በአማርኛ ያንብቡ',
    footDesc: 'አማርኛን በግዕዝ ፊደል በፍጥነትና በግል ለመጻፍ።',
    footCols: [
      ['አዲዮን ኪቦርድ', [['/am/', 'መነሻ'], ['/features', 'ባህሪያት (English)'], ['/privacy', 'የግላዊነት መመሪያ (English)'], [PLAY_URL, 'Google Play']]],
      ['ነጻ መሣሪያዎች', [['/am/amharic-typing', 'አማርኛ በኦንላይን መጻፊያ'], ['/am/amharic-alphabet', 'የአማርኛ ፊደል ገበታ'], ['/am/ethiopian-calendar-converter', 'የቀን መቀየሪያ'], ['/am/ethiopian-time', 'የኢትዮጵያ ሰዓት'], ['/am/geez-numbers', 'የግዕዝ ቁጥሮች መቀየሪያ']]],
      ['ቋንቋዎች', [['/am/ethiopian-keyboard', 'አማርኛ፣ ኦሮምኛ፣ ትግርኛ'], ['/om', 'Afaan Oromoo'], ['/ti', 'ትግርኛ']]],
      ['English', [['/', 'Home'], ['/amharic-typing', 'Type Amharic online'], ['/guides/', 'Guides']]]
    ],
    contact: 'ያግኙን',
    telegram: 'የቴሌግራም ቡድናችንን ይቀላቀሉ',
    rights: '© 2026 Addiyon LLC። መብቱ በሕግ የተጠበቀ ነው።',
    madeWith: 'ለአማርኛ ተናጋሪዎች በጥንቃቄ የተሠራ።',
    ctaTitle: 'በሁሉም መተግበሪያ አማርኛ ይጻፉ።',
    ctaBody: 'አዲዮን ኪቦርድ በGoogle Play በነጻ ይገኛል። በላቲን ፊደል ሲጽፉ ወዲያው ወደ ግዕዝ ፊደል ይቀይራል፣ ያለ ኢንተርኔት ይሠራል፣ የሚጽፉትም በስልክዎ ላይ ይቀራል።',
    ctaSecondary: ['/am/amharic-typing', 'በኦንላይን ይሞክሩ'],
    faqTitle: 'ተደጋጋሚ ጥያቄዎች።',
    relatedTitle: 'ተጨማሪ ያንብቡ',
    updated: 'የተሻሻለው',
    home: 'አዲዮን ኪቦርድ'
  },
  om: {
    nav: [['/guides/oromo-apostrophe-hudhaa', 'Hudhaa']],
    getApp: 'Buusi',
    getAppLabel: 'Addiyon Keyboard Google Play irraa buusi',
    playButton: 'Google Play irraa buusi',
    toggleTheme: 'Halluu dukkanaa',
    switchLang: ['en', 'EN', 'Read this page in English'],
    readIn: 'Fuula kana Afaan Oromootiin dubbisi',
    footDesc: 'Kiyboordii Android bilisaa: Afaan Oromoo, Amaariffaa, Tigrinyaa fi Ingiliffaa.',
    footCols: [
      ['Addiyon Keyboard', [['/om', 'Fuula jalqabaa'], ['/afaan-oromoo-keyboard', 'Oromo keyboard (English)'], ['/privacy', 'Privacy Policy (English)'], [PLAY_URL, 'Google Play']]],
      ['Afaanota', [['/ethiopian-keyboard', 'Ethiopian keyboard (English)'], ['/am', 'አማርኛ'], ['/ti', 'ትግርኛ'], ['/', 'English']]]
    ],
    contact: 'Nu quunnamaa',
    telegram: 'Garee Telegram keenyatti makamaa',
    rights: '© 2026 Addiyon LLC. Mirgi hundi seeraan eegamaadha.',
    madeWith: 'Afaan keessaniin akka barreessitaniif kan hojjetame.',
    ctaTitle: 'Appii hunda keessatti Afaan Oromoon barreessi.',
    ctaBody: 'Addiyon Keyboard Google Play irraa bilisaan argama. Afaan Oromoo appii keessaa Settings › Languages irraa bilisaan buufadhu.',
    ctaSecondary: ['/afaan-oromoo-keyboard', 'Ibsa guutuu (English)'],
    faqTitle: 'Gaaffilee yeroo baay&#8217;ee gaafataman.',
    relatedTitle: 'Dabalataan dubbisi',
    updated: 'Kan haaromfame',
    home: 'Addiyon Keyboard'
  },
  ti: {
    nav: [['/tigrinya-typing', 'ኦንላይን ጽሓፍ']],
    getApp: 'ኣውርድ',
    getAppLabel: 'ኣዲዮን ኪቦርድ ካብ Google Play ኣውርድ',
    playButton: 'ካብ Google Play ኣውርድ',
    toggleTheme: 'ጸልማት ገጽታ',
    switchLang: ['en', 'EN', 'Read this page in English'],
    readIn: 'ነዚ ገጽ ብትግርኛ ኣንብቦ',
    footDesc: 'ትግርኛ ብግእዝ ፊደል ብቐሊሉ ንምጽሓፍ ናይ Android ኪቦርድ።',
    footCols: [
      ['ኣዲዮን ኪቦርድ', [['/ti', 'መእተዊ'], ['/tigrinya-keyboard', 'Tigrinya keyboard (English)'], ['/tigrinya-typing', 'ትግርኛ ኦንላይን ጽሓፍ'], ['/privacy', 'Privacy Policy (English)'], [PLAY_URL, 'Google Play']]],
      ['ቋንቋታት', [['/ethiopian-keyboard', 'Ethiopian keyboard (English)'], ['/am', 'አማርኛ'], ['/om', 'Afaan Oromoo'], ['/', 'English']]]
    ],
    contact: 'ርኸቡና',
    telegram: 'ናብ ጉጅለ ቴሌግራምና ተጸንበሩ',
    rights: '© 2026 Addiyon LLC። ኩሉ መሰል ብሕጊ ዝተሓለወ እዩ።',
    madeWith: 'ብቋንቋኹም ክትጽሕፉ ተባሂሉ ዝተሰርሐ።',
    ctaTitle: 'ኣብ ኩሉ ኣፕ ብትግርኛ ጽሓፍ።',
    ctaBody: 'ኣዲዮን ኪቦርድ ኣብ Google Play ብነጻ ይርከብ። ትግርኛ ኣብቲ ኣፕ ካብ Settings › Languages ብነጻ ኣውርዶ።',
    ctaSecondary: ['/tigrinya-typing', 'ኦንላይን ፈትኖ'],
    faqTitle: 'ብተደጋጋሚ ዝሕተቱ ሕቶታት።',
    relatedTitle: 'ተወሳኺ ኣንብብ',
    updated: 'ዝተሓደሰሉ',
    home: 'ኣዲዮን ኪቦርድ'
  }
};

export const PLAY_ICON = `<svg width="17" height="18" viewBox="30 336.7 120.9 129.2" aria-hidden="true">
          <path fill="#FFD400" d="M119.2,421.2c15.3-8.4,27-14.8,28-15.3c3.2-1.7,6.5-6.2,0-9.7c-2.1-1.1-13.4-7.3-28-15.3l-20.1,20.2L119.2,421.2z"/>
          <path fill="#FF3333" d="M99.1,401.1l-64.2,64.7c1.5,0.2,3.2-0.2,5.2-1.3c4.2-2.3,48.8-26.7,79.1-43.3L99.1,401.1L99.1,401.1z"/>
          <path fill="#48FF48" d="M99.1,401.1l20.1-20.2c0,0-74.6-40.7-79.1-43.1c-1.7-1-3.6-1.3-5.3-1L99.1,401.1z"/>
          <path fill="#3BCCFF" d="M99.1,401.1l-64.3-64.3c-2.6,0.6-4.8,2.9-4.8,7.6c0,7.5,0,107.5,0,113.8c0,4.3,1.7,7.4,4.9,7.7L99.1,401.1z"/>
        </svg>`;;
