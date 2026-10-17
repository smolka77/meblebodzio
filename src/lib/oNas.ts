export interface AboutStat {
  value: string;
  label: string;
}

export interface AboutValue {
  number: string;
  title: string;
  text: string;
}

export interface AboutMilestone {
  year: string;
  event: string;
}

export interface AboutHero {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
}

export interface AboutStory {
  image: string;
  imageAlt: string;
  kicker: string;
  title: string;
  paragraph1: string;
  paragraph2: string;
}

export interface AboutValues {
  kicker: string;
  title: string;
  items: AboutValue[];
}

export interface AboutTimeline {
  kicker: string;
  title: string;
  items: AboutMilestone[];
}

export interface AboutCta {
  title: string;
  text: string;
  buttonLabel: string;
  buttonHref: string;
}

export interface AboutContent {
  archived: boolean;
  metaTitle: string;
  metaDescription: string;
  hero: AboutHero;
  story: AboutStory;
  stats: AboutStat[];
  values: AboutValues;
  timeline: AboutTimeline;
  cta: AboutCta;
}

export const DEFAULT_ABOUT: AboutContent = {
  archived: false,
  metaTitle: "Polska manufaktura mebli",
  metaDescription:
    "Wrohaus to meble i wyposażenie domu z Kątów Wrocławskich. Salon, sypialnia, szafy i materace — rzemiosło, które zostaje na lata.",
  hero: {
    eyebrow: "Nasza historia",
    title: "Rzemiosło spotyka nowoczesny design",
    description:
      "Wrohaus to polska marka mebli tapicerowanych, która od 2018 roku tworzy sofy, narożniki i fotele łączące komfort z ponadczasową estetyką.",
    image:
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1920&q=85",
  },
  story: {
    image:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=900&q=85",
    imageAlt: "Wnętrze Wrohaus w Kątach Wrocławskich",
    kicker: "Kim jesteśmy",
    title: "Meble, które stają się sercem domu",
    paragraph1:
      "Wierzymy, że dom to przestrzeń, w której design spotyka się z codziennym komfortem. Dlatego projektujemy meble, które są piękne, funkcjonalne i stworzone, by służyć przez lata — nie sezony.",
    paragraph2:
      "Nasz zespół projektantów, tapicerów i stolarzy pracuje ramię w ramię, tworząc kolekcje inspirowane skandynawskim minimalizmem i ciepłem polskiego rzemiosła.",
  },
  stats: [
    { value: "8+", label: "Lat na rynku" },
    { value: "48", label: "Modeli w ofercie" },
    { value: "5000+", label: "Zadowolonych klientów" },
  ],
  values: {
    kicker: "Wartości",
    title: "Co nas wyróżnia",
    items: [
      {
        number: "01",
        title: "Polska produkcja",
        text: "Każdy mebel powstaje w naszej manufakturze w Kątach Wrocławskich. Kontrolujemy jakość na każdym etapie — od ramy po ostatni szew.",
      },
      {
        number: "02",
        title: "Materiały premium",
        text: "Współpracujemy z europejskimi dostawcami tkanin i pianki. Wybieramy tylko certyfikowane, trwałe i przyjazne środowisku materiały.",
      },
      {
        number: "03",
        title: "Design ponadczasowy",
        text: "Tworzymy meble, które nie poddają się trendom. Minimalistyczna forma, miękkie linie i neutralna paleta barw — na lata.",
      },
      {
        number: "04",
        title: "Komfort bez kompromisów",
        text: "Ergonomia to dla nas priorytet. Testujemy każdy model setki godzin, zanim trafi do oferty.",
      },
    ],
  },
  timeline: {
    kicker: "Historia",
    title: "Nasza droga",
    items: [
      { year: "2018", event: "Założenie marki Wrohaus i pierwsza kolekcja sof" },
      { year: "2020", event: "Rozszerzenie działalności na Dolnym Śląsku" },
      { year: "2022", event: "Rozszerzenie oferty o narożniki modułowe" },
      { year: "2024", event: "5000+ zrealizowanych projektów w całej Polsce" },
      { year: "2026", event: "Nowa linia eko-tapicerki i ekspansja online" },
    ],
  },
  cta: {
    title: "Umebluj swój dom z nami",
    text: "Odkryj kolekcję sof, narożników i foteli stworzoną z myślą o komforcie i ponadczasowym designie. Znajdź meble idealne dla Twojego wnętrza.",
    buttonLabel: "Przeglądaj sklep",
    buttonHref: "/kategoria/sofy",
  },
};

export function emptyAboutStat(): AboutStat {
  return { value: "", label: "" };
}

export function emptyAboutValue(): AboutValue {
  return { number: "", title: "", text: "" };
}

export function emptyAboutMilestone(): AboutMilestone {
  return { year: "", event: "" };
}

function textOr(value: string | undefined, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function textOrFilled(value: string | undefined, fallback: string): string {
  return value?.trim() || fallback;
}

function mergeStats(base: AboutStat[], patch?: AboutStat[]): AboutStat[] {
  if (!Array.isArray(patch)) return base;
  return patch.map((item, i) => ({
    value: textOr(item?.value, base[i]?.value ?? ""),
    label: textOr(item?.label, base[i]?.label ?? ""),
  }));
}

function mergeValues(base: AboutValue[], patch?: AboutValue[]): AboutValue[] {
  if (!Array.isArray(patch)) return base;
  return patch.map((item, i) => ({
    number: textOrFilled(item?.number, base[i]?.number ?? ""),
    title: textOr(item?.title, base[i]?.title ?? ""),
    text: textOr(item?.text, base[i]?.text ?? ""),
  }));
}

function mergeMilestones(
  base: AboutMilestone[],
  patch?: AboutMilestone[]
): AboutMilestone[] {
  if (!Array.isArray(patch)) return base;
  return patch.map((item, i) => ({
    year: textOrFilled(item?.year, base[i]?.year ?? ""),
    event: textOr(item?.event, base[i]?.event ?? ""),
  }));
}

export function mergeAbout(stored?: Partial<AboutContent> | null): AboutContent {
  return {
    archived: Boolean(stored?.archived),
    metaTitle: textOrFilled(stored?.metaTitle, DEFAULT_ABOUT.metaTitle),
    metaDescription: textOrFilled(
      stored?.metaDescription,
      DEFAULT_ABOUT.metaDescription
    ),
    hero: {
      eyebrow: textOr(stored?.hero?.eyebrow, DEFAULT_ABOUT.hero.eyebrow),
      title: textOrFilled(stored?.hero?.title, DEFAULT_ABOUT.hero.title),
      description: textOr(
        stored?.hero?.description,
        DEFAULT_ABOUT.hero.description
      ),
      image: stored?.hero?.image?.trim() || DEFAULT_ABOUT.hero.image,
    },
    story: {
      image: stored?.story?.image?.trim() || DEFAULT_ABOUT.story.image,
      imageAlt: textOrFilled(
        stored?.story?.imageAlt,
        DEFAULT_ABOUT.story.imageAlt
      ),
      kicker: textOr(stored?.story?.kicker, DEFAULT_ABOUT.story.kicker),
      title: textOrFilled(stored?.story?.title, DEFAULT_ABOUT.story.title),
      paragraph1: textOr(
        stored?.story?.paragraph1,
        DEFAULT_ABOUT.story.paragraph1
      ),
      paragraph2: textOr(
        stored?.story?.paragraph2,
        DEFAULT_ABOUT.story.paragraph2
      ),
    },
    stats: mergeStats(DEFAULT_ABOUT.stats, stored?.stats),
    values: {
      kicker: textOr(stored?.values?.kicker, DEFAULT_ABOUT.values.kicker),
      title: textOrFilled(stored?.values?.title, DEFAULT_ABOUT.values.title),
      items: mergeValues(DEFAULT_ABOUT.values.items, stored?.values?.items),
    },
    timeline: {
      kicker: textOr(stored?.timeline?.kicker, DEFAULT_ABOUT.timeline.kicker),
      title: textOrFilled(
        stored?.timeline?.title,
        DEFAULT_ABOUT.timeline.title
      ),
      items: mergeMilestones(
        DEFAULT_ABOUT.timeline.items,
        stored?.timeline?.items
      ),
    },
    cta: {
      title: textOrFilled(stored?.cta?.title, DEFAULT_ABOUT.cta.title),
      text: textOr(stored?.cta?.text, DEFAULT_ABOUT.cta.text),
      buttonLabel: textOrFilled(
        stored?.cta?.buttonLabel,
        DEFAULT_ABOUT.cta.buttonLabel
      ),
      buttonHref:
        stored?.cta?.buttonHref?.trim() || DEFAULT_ABOUT.cta.buttonHref,
    },
  };
}
