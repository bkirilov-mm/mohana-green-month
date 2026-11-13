/**
 * The Green Month campaign page (`/green-month`): its dates, the products it is built around and its words. The words
 * are the merchant's campaign copy, in the store's one language, as a CMS page's body would be - not the storefront's
 * interface, whose words stay in `app/locales/`. Change the campaign here; the page takes everything from this file and
 * the Storefront API (prices, discounts, stock, reviews and counts are always the store's own).
 */

/** When the campaign ends: a `DateTime` as the API gives one, UTC - 30 November 2026, 23:59:59 in Sofia (EET). */
export const CAMPAIGN_ENDS_AT = '2026-11-30T21:59:59';

/** The highest discount the campaign promises, for the seal and the headings. */
export const CAMPAIGN_MAX_PERCENT = 30;

/** Free delivery from this order total, as the store's announcement bar says it. */
export const FREE_SHIPPING_FROM = '€69';

/** The store's categories the page counts and lists. */
export const COLLECTIONS = {
  oils: 'eterichni-masla',
  singles: 'single-oil',
  blends: 'blend-aromakompoziciya',
  diffusers: 'aroma-difuzeri',
  nebulizers: 'nebyulayzeri',
} as const;

/** The best-selling diffuser the page spotlights, with what its description says about it. */
export const SPOTLIGHT = {
  handle: 'aroma-difuzeri',
  kicker: 'Бестселър',
  heading: 'Ароматна мъгла',
  lead: 'Дифузерът, който клиентите ни оценяват най-високо. Тих, красив и толкова издръжлив, че работи цяла нощ с едно зареждане.',
  facts: [
    {value: '500 мл', label: 'резервоар'},
    {value: 'до 20 ч', label: 'работа'},
    {value: '50 м²', label: 'помещение'},
    {value: '728', label: 'цвята светлина'},
  ],
} as const;

/** The diffusers whose customers' reviews the page quotes. */
export const REVIEWED_PRODUCTS = [
  'aroma-difuzeri',
  'aroma-difuzer-mohana-vaza-svetlo-darvo-i-svetlini-s-taymer',
  'aroma-difuzer-mohana-vaza-tamno-darvo-i-svetlini-s-taymer',
] as const;

/** Promo packs - a diffuser with oils - are found by the words their titles start with. */
export const PACKS_QUERY = 'Промо пакет';

export type Ritual = {
  id: string;
  label: string;
  heading: string;
  text: string;
  tip: string;
  handles: readonly string[];
};

/** What a visitor looks for: each a set of oils and blends from the store's own groupings on mohana.bg. */
export const RITUALS: readonly Ritual[] = [
  {
    id: 'immunity',
    label: 'Имунитет и дишане',
    heading: 'Защита за студените месеци',
    text: 'Масла с антибактериално и антивирусно действие и нашите готови композиции Immune Boost и Breathe Free - за дом, в който се диша леко.',
    tip: 'Дифузирай сутрин и вечер в спалнята и детската стая.',
    handles: [
      'aroma-kompoziciya-immune-boost-10-ml',
      'breathe-free',
      'congestion-relief-10ml',
      'evkalipt-obiknoven-10ml',
      'chaeno-darvo-10ml',
      'aroma-kompoziciya-stress-relief-10-ml-copy',
      'eterichno-maslo-evkalipt-radiata-eucalyptus-radiata',
      'limon-10ml',
    ],
  },
  {
    id: 'calm',
    label: 'Спокойствие и сън',
    heading: 'Вечерен ритуал за тиха глава',
    text: 'Лавандула от високите Алпи, римска лайка и композициите Good Night и Sleep Assisting - когато денят трябва да остане навън.',
    tip: 'Включи дифузера половин час преди лягане.',
    handles: [
      'aroma-kompoziciya-good-night-10-ml',
      'aroma-kompoziciya-sleep-assisting-podpomaga-zaspivaneto',
      'lavender-french-high-altitude-10ml',
      'chamomile-roman-5ml',
      'aroma-kompoziciya-relaks-relax-10-ml',
      'relaxed-mind',
      'aroma-kompoziciya-stress-relief-10-ml',
      'balance',
    ],
  },
  {
    id: 'focus',
    label: 'Енергия и фокус',
    heading: 'Ясен ум от сутрин до вечер',
    text: 'Мента, розмарин и лимон, които събуждат ума и тялото, и композициите Good Morning и Mental Clarity за следобедния спад.',
    tip: 'Сложи дифузера на бюрото в началото на работния ден.',
    handles: [
      'aroma-kompoziciya-good-morning-10-ml',
      'menta-lyutiva-10ml',
      'rosemary-spanish-10ml',
      'aroma-kompoziciya-stress-relief-10-ml-copy-copy',
      'aroma-kompoziciya-motivation-10-ml',
      'aroma-kompoziciya-study',
      'aroma-kompoziciya-revitalize-10-ml',
      'limonena-treva-10ml',
    ],
  },
  {
    id: 'fresh',
    label: 'Свежест у дома',
    heading: 'Слънце в бутилка',
    text: 'Портокал, бергамот, грейпфрут и мандарина пречистват въздуха и вдигат настроението - естествена алтернатива на освежителите с химикали.',
    tip: 'Комбинирай два цитруса за по-богат аромат.',
    handles: [
      'aroma-kompoziciya-fresh-10-ml',
      'sweet-orange-10ml',
      'greypfrut-rozov-grapefruit-pink-10ml',
      'bergamot-20-ml',
      'aroma-kompoziciya-happiness-10-ml',
      'mandarina-10ml',
      'tangerine-tangerina-10-ml',
      'div-portokal-wild-orange-10-ml',
    ],
  },
];

/** Every product a ritual shows, once. */
export const RITUAL_HANDLES = [...new Set(RITUALS.flatMap((ritual) => ritual.handles))];

/** The page's words, section by section. */
export const COPY = {
  seo: {
    title: 'Зелен месец в Mohana - до -30% на етерични масла',
    description:
      'До 30% отстъпка на 100% чисти, неразредени етерични масла, арома композиции и дифузери. Само до 30 ноември.',
  },
  bar: {
    label: 'Зелен месец',
    endsIn: 'Остават',
  },
  hero: {
    eyebrow: 'Зелен месец · 1 - 30 ноември',
    heading: ['Зелен', 'месец'],
    lead: 'Тридесет дни, в които домът ти диша по-леко. До 30% отстъпка на най-широката колекция от терапевтични етерични масла в България - 100% чисти, неразредени, дестилирани с търпение.',
    primary: 'Избери своето масло',
    secondary: 'Пакети с дифузер',
    upTo: 'до',
    seal: 'Зелен месец · Mohana · 2026 · ',
    proofs: ['Безплатна доставка над €69', 'BoxNow от 2 €'],
  },
  truths: [
    '100% чисти и неразредени',
    'Парна дестилация и студено пресоване',
    'Терапевтичен клас',
    'Безплатна доставка над €69',
    'Етерични масла от цял свят',
    'Без синтетични аромати',
  ],
  rituals: {
    eyebrow: 'Ритуалът',
    heading: 'Какво търсиш този месец?',
    lead: 'Избери от какво имаш нужда - ние сме подбрали маслата и композициите, които работят за него.',
    tipLabel: 'Съвет',
  },
  packs: {
    eyebrow: 'Сетове с дифузер',
    heading: 'Подарък за дома. Или за някого, когото обичаш.',
    lead: 'Дифузер и подбрани масла в един пакет - на по-добра цена, отколкото поотделно. Идеалният подарък преди празниците.',
    view: 'Виж пакета',
  },
  manifesto: {
    eyebrow: 'Защо Mohana',
    quote: 'Много от популярните масла на пазара съдържат синтетични аромати, които не помагат, а могат да навредят.',
    answer: 'Нашите - не.',
    pillars: [
      {
        heading: '100% чисти и неразредени',
        text: 'Концентрирани масла без синтетични добавки и разредители. Само растението - нищо друго.',
      },
      {
        heading: 'Парна дестилация и студено пресоване',
        text: 'Всяка бутилка съдържа всички природни елементи, необходими за ефективна ароматерапия.',
      },
      {
        heading: 'Прозрачност',
        text: 'Вярваме, че грижата за човека и грижата за природата са едно и също.',
      },
    ],
    stats: {
      oils: 'етерични масла',
      blends: 'арома композиции',
      diffusers: 'дифузера и небюлайзера',
    },
    family: 'Довери се на силата на природата - за себе си и за близките си.',
  },
  spotlight: {
    reviews: 'реални ревюта',
  },
  reviews: {
    eyebrow: 'От нашите клиенти',
    heading: 'Думите на хората, които вече ни избраха',
    verified: 'Ревю от mohana.bg',
  },
  catalog: {
    eyebrow: 'Цялата колекция',
    heading: 'Всички масла в Зеления месец',
    singles: 'Единични масла',
    blends: 'Арома композиции',
    more: 'Покажи още',
  },
  faq: {
    eyebrow: 'Въпроси',
    heading: 'Преди да поръчаш',
    items: [
      {
        question: 'Как получавам отстъпката?',
        answer:
          'Отстъпките са вече приложени в цените на страницата - не ти трябва код. Важат до 30 ноември включително или до изчерпване на количествата.',
      },
      {
        question: 'Колко струва доставката?',
        answer:
          'Безплатна е за поръчки над €69. До автомат на BoxNow струва 2 € за поръчка до 1 кг и 2,60 € за поръчка до 2 кг.',
      },
      {
        question: 'Каква е разликата между етерично масло и арома композиция?',
        answer:
          'Етеричното масло е от едно растение. Арома композицията е готов бленд от няколко масла, създаден за конкретна цел - сън, имунитет, фокус. Удобна е, ако не искаш сам да смесваш.',
      },
      {
        question: 'Как да използвам маслата?',
        answer:
          'Най-лесно - в арома дифузер или небюлайзер. Всяко масло има указания за употреба на страницата си; спазвай ги и пази бутилките далеч от деца.',
      },
      {
        question: 'Как мога да платя?',
        answer: 'С карта Visa или Mastercard, чрез myPOS и Paysera, с банков превод или с наложен платеж при доставка.',
      },
    ],
  },
  final: {
    heading: 'Зеленият месец свършва на 30 ноември.',
    lead: 'После цените се връщат. Маслата остават същите - чисти, неразредени, истински.',
    cta: 'Към маслата',
    units: {days: 'дни', hours: 'часа', minutes: 'мин', seconds: 'сек'},
  },
} as const;

/**
 * A product's title as the page sets it: Mohana writes "Етерично масло Лимон, Lemon, 10ml" - the kind, the name, its
 * other name and the bottle's size. Unrecognised titles stay whole.
 */
export function splitTitle(title: string) {
  const kind = KINDS.find((prefix) => title.toLowerCase().startsWith(prefix.toLowerCase()));
  const rest = (kind ? title.slice(kind.length) : title).replace(/\s+/g, ' ').trim();
  const parts = rest
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  if (!kind || parts.length < 2) return {kind: kind ?? null, name: rest, detail: null};
  const [name, ...others] = parts;
  return {kind, name, detail: others.join(' · ').replace(/(\d)\s*(ml|мл)\.?/gi, '$1 мл')};
}

const KINDS = ['Етерично масло', 'Арома композиция', 'Промо пакет'];
