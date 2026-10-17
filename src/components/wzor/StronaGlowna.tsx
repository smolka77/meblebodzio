"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Product, ProductCategory } from "@/lib/typy";
import { ProductCard } from "@/components/sklep/KartaProduktu";
import { hasSalePrice } from "@/lib/ceny";
import { formatPrice } from "@/lib/dane";
import * as I from "./ikony";

const img = (n: string) => `/wzor/${n}.jpg`;
const W = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`pw ${className}`}>{children}</div>
);

const mainCats: { slug: ProductCategory; name: string; icon: React.ReactNode }[] = [
  { slug: "sofy", name: "Sofy", icon: <><path d="M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3" /><path d="M2 16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v1.5a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5V11a2 2 0 0 0-4 0z" /><path d="M4 18v2" /><path d="M20 18v2" /><path d="M12 4v9" /></> },
  { slug: "narozniki", name: "Narożniki", icon: <><path d="M4 9V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v6" /><path d="M2 16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2H6.5a.5.5 0 0 1-.5-.5V11a2 2 0 0 0-4 0z" /><path d="M10 4v8" /><path d="M4 18v2" /><path d="M20 18v2" /></> },
  { slug: "fotele", name: "Fotele", icon: <><path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3" /><path d="M3 16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v1.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V11a2 2 0 0 0-4 0z" /><path d="M5 18v2" /><path d="M19 18v2" /></> },
  { slug: "lozka", name: "Łóżka", icon: <><path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8" /><path d="M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" /><path d="M12 4v6" /><path d="M2 18h20" /></> },
  { slug: "stoliki", name: "Stoły", icon: <><rect x="2" y="7" width="20" height="3" rx="1" /><path d="M5 10v10" /><path d="M19 10v10" /><path d="M5 14h14" /></> },
  { slug: "szafki", name: "Krzesła", icon: <><path d="M7 11V4a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v7" /><rect x="5" y="11" width="14" height="3" rx="1" /><path d="M6 14v7" /><path d="M18 14v7" /><path d="M7 7h10" /></> },
];

const HERO_MS = 900;

const heroSlides: {
  image: string;
  title: string;
  text: string;
  href: string;
  badge: string;
  category: ProductCategory;
  tone: string;
}[] = [
  {
    image: "living-cream",
    title: "Spokój,\nktóry czujesz\nw domu.",
    text: "Sofy, fotele i łóżka projektowane we Wrocławiu. Teraz do −30% na wybrane modele.",
    href: "/kategoria/sofy",
    badge: "Salon Cream",
    category: "sofy",
    tone: "#e6dfd3",
  },
  {
    image: "living-bright",
    title: "Miejsce,\nw którym\nzostajesz.",
    text: "Narożniki z głębokim siedziskiem i jasną tapicerką. Na długie popołudnia, bez pośpiechu.",
    href: "/kategoria/narozniki",
    badge: "Salon Light",
    category: "narozniki",
    tone: "#cfe0d4",
  },
  {
    image: "bedroom",
    title: "Wieczór,\nktóry\nzwalnia.",
    text: "Łóżka tapicerowane i miękkie wezgłowia. Sypialnia urządzona tak, żeby naprawdę odpocząć.",
    href: "/kategoria/lozka",
    badge: "Sypialnia",
    category: "lozka",
    tone: "#e8cfc3",
  },
];

const reviews = [
  ["Anna", "Wrocław", "Sofa", "Kolor na żywo jeszcze ładniejszy niż na zdjęciach. Siedzi się rewelacyjnie."],
  ["Marek", "Poznań", "Krzesło", "Sześć krzeseł dotarło w dwa dni, montaż zajął kwadrans."],
  ["Kasia", "Kraków", "Łóżko", "Stelaż solidny, pojemnik ogromny. Polecam każdemu."],
  ["Tomasz", "Gdańsk", "Fotel", "Kurier wniósł na 4. piętro bez windy. Pełen profesjonalizm."],
  ["Ola", "Łódź", "Lampa", "Świetna jakość wykonania, daje bardzo przyjemne światło."],
  ["Paweł", "Warszawa", "Witryna", "Wygląda drożej, niż kosztowała. Szkło bez zarzutu."],
];

const journal = [
  ["j1", "Materace\nSklep", "Dobierz materac do łóżka", "/kategoria/materace"],
  ["j2", "Biuro\nw domu", "Biurka i krzesła do pracy", "/kategoria/szafki"],
  ["j3", "Pokój\nmłodzieżowy", "Łóżka i biurka na lata", "/kategoria/lozka"],
  ["j4", "Stoły\ni krzesła", "Jadalnia na wspólne kolacje", "/kategoria/stoliki"],
  ["j5", "Wygodna\nsypialnia", "Łóżka tapicerowane i dodatki", "/kategoria/lozka"],
  ["j6", "Wszystko\nsię zmieści", "Komody i witryny z charakterem", "/kategoria/komody"],
  ["j7", "Salon\nw bieli", "Jasne sofy i miękkie tkaniny", "/kategoria/sofy"],
  ["j8", "Strefa\nrelaksu", "Fotele i stoliki kawowe", "/kategoria/fotele"],
];

function Sec({ title, href, link, children }: { title: string; href: string; link: string; children: React.ReactNode }) {
  return (
    <section className="pt-20 lg:pt-28">
      <W>
        <div className="mb-8 flex items-end justify-between gap-4 lg:mb-10">
          <h2 className="font-display text-[26px] leading-tight sm:text-[34px]">{title}</h2>
          <Link href={href} className="ulink flex shrink-0 items-center gap-1.5 text-[14.5px] font-medium text-accent">
            {link}<I.Arrow className="h-4 w-4" />
          </Link>
        </div>
        {children}
      </W>
    </section>
  );
}

function ShopTheLook({ products }: { products: Product[] }) {
  const spots = products.slice(0, 4);
  const pos = [
    { x: 47, y: 52 },
    { x: 27, y: 60 },
    { x: 52, y: 80 },
    { x: 95, y: 40 },
  ];
  const [act, setAct] = useState<number | null>(spots.length ? 0 : null);
  if (!spots.length) return null;
  const sum = spots.reduce((a, p) => a + p.price, 0);
  return (
    <section className="bg-sage pb-16 lg:pb-24">
      <W>
        <div className="border-t border-forest/10 pt-14 lg:pt-20">
          <div className="grid items-center gap-10 lg:grid-cols-[360px_1fr] lg:gap-16 xl:grid-cols-[420px_1fr]">
            <div>
              <div className="text-[13px] font-medium text-meta">Kup cały look</div>
              <h2 className="font-display mt-3 text-[30px] leading-[1.05] tracking-[-0.035em] sm:text-[42px]">Salon w odcieniach szarości</h2>
              <p className="mt-5 text-[16px] leading-relaxed">Kliknij punkty na zdjęciu i zobacz, co jest w tym wnętrzu. Każdy produkt kupisz osobno albo cały zestaw z rabatem 10%.</p>
              <ul className="mt-7 border-t border-forest/15">
                {spots.map((p, i) => (
                  <li key={p.id}>
                    <button type="button" onMouseEnter={() => setAct(i)} onClick={() => setAct(i)} className={`flex w-full items-center gap-3 border-b border-forest/15 py-3.5 text-left transition ${act === i ? "" : "opacity-60 hover:opacity-100"}`}>
                      <span className={`grid h-6 w-6 place-items-center rounded-full text-[12px] font-semibold ${act === i ? "bg-forest text-white" : "bg-white"}`}>{i + 1}</span>
                      <span className="flex-1 text-[14.5px] font-medium">{p.name}</span>
                      <span className="text-[14.5px] font-semibold">{formatPrice(p.price)}</span>
                    </button>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex items-center justify-between">
                <div>
                  <div className="text-[13px] text-meta">Cały zestaw</div>
                  <div className="text-[20px] font-semibold">{formatPrice(Math.round(sum * 0.9))} <span className="text-[14px] font-normal text-meta line-through">{formatPrice(sum)}</span></div>
                </div>
                <Link href="/kategoria/sofy" className="grid h-12 place-items-center rounded-full bg-accent px-6 text-[15px] font-medium text-white transition hover:bg-accent-dark">Kup zestaw</Link>
              </div>
            </div>
            <div className="relative aspect-[3/2] overflow-hidden rounded-md">
              <img src={img("sofa-room")} alt="" className="absolute inset-0 h-full w-full object-cover" />
              {spots.map((p, i) => (
                <div key={p.id} className="absolute" style={{ left: `${pos[i].x}%`, top: `${pos[i].y}%` }}>
                  <button type="button" onClick={() => setAct(act === i ? null : i)} onMouseEnter={() => setAct(i)} aria-label={p.name} className="relative grid h-8 w-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/95 shadow-[0_4px_14px_rgba(0,0,0,.25)] transition hover:scale-110">
                    <span className={`h-2.5 w-2.5 rounded-full bg-ink transition ${act === i ? "scale-150" : ""}`} />
                  </button>
                  {act === i && (
                    <Link href={`/produkt/${p.slug}`} className={`fade-up absolute top-6 z-10 flex w-[250px] gap-3 rounded-md bg-white p-3 shadow-[0_14px_40px_-12px_rgba(0,0,0,.35)] ${pos[i].x > 60 ? "right-2" : "left-2"}`}>
                      <img src={p.image} alt="" className="h-16 w-16 rounded object-cover" />
                      <div className="min-w-0">
                        <div className="text-[14px] leading-snug font-semibold">{p.name}</div>
                        <div className="mt-1 text-[14px] font-semibold">{formatPrice(p.price)}</div>
                      </div>
                      <I.Chevron className="h-4 w-4 shrink-0 self-center" />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </W>
    </section>
  );
}

export function HomeView({ products }: { products: Product[] }) {
  const [tab, setTab] = useState(0);
  const [slide, setSlide] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);
  const [heroMotion, setHeroMotion] = useState(true);
  const heroFrames = useMemo(() => [...heroSlides, heroSlides[0]], []);
  const tabs = ["Bestsellery", "Nowości", "Promocje"];
  const list = useMemo(() => {
    if (tab === 2) return products.filter((p) => hasSalePrice(p)).slice(0, 4);
    if (tab === 1) return [...products].reverse().slice(0, 4);
    const featured = products.filter((p) => p.featured);
    return (featured.length ? featured : products).slice(0, 4);
  }, [products, tab]);
  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of products) map.set(p.category, (map.get(p.category) ?? 0) + 1);
    return map;
  }, [products]);
  useEffect(() => {
    if (heroPaused) return;
    const id = window.setInterval(() => {
      setHeroMotion(true);
      setSlide((current) => current + 1);
    }, 4000);
    return () => window.clearInterval(id);
  }, [heroPaused]);

  useEffect(() => {
    if (slide !== heroSlides.length) return;
    const id = window.setTimeout(() => {
      setHeroMotion(false);
      setSlide(0);
    }, HERO_MS);
    return () => window.clearTimeout(id);
  }, [slide]);

  useEffect(() => {
    if (heroMotion || slide !== 0) return;
    const id = window.requestAnimationFrame(() => setHeroMotion(true));
    return () => window.cancelAnimationFrame(id);
  }, [heroMotion, slide]);

  return (
    <>
      <W className="pt-6 lg:pt-8">
        <div
          className="overflow-hidden"
          onMouseEnter={() => setHeroPaused(true)}
          onMouseLeave={() => setHeroPaused(false)}
        >
          <div
            className={`hero-track flex ${heroMotion ? "" : "is-instant"}`}
            style={{ transform: `translate3d(-${slide * 100}%, 0, 0)` }}
          >
            {heroFrames.map((item, index) => {
              const active = index === slide;
              return (
                <div
                  key={`${item.image}-${index}`}
                  className="grid w-full shrink-0 gap-4 lg:h-[640px] lg:grid-cols-[0.85fr_1.15fr] lg:gap-6"
                  aria-hidden={!active}
                  inert={!active}
                >
                  <div className="order-2 flex flex-col justify-between rounded-md p-7 sm:p-10 lg:order-1 lg:p-14" style={{ backgroundColor: item.tone }}>
                    <div className="text-[13px] font-medium text-meta">Kolekcja jesień 2026</div>
                    <div className="my-10 lg:my-0" aria-live={active ? "polite" : undefined}>
                      <h1 className="font-display text-[40px] leading-[1.0] tracking-[-0.04em] whitespace-pre-line sm:text-[56px] xl:text-[68px]">{item.title}</h1>
                      <p className="mt-6 max-w-md text-[16px] leading-relaxed sm:text-[17px]">{item.text}</p>
                      <div className="mt-8 flex flex-wrap gap-3">
                        <Link href={item.href} className="grid h-12 place-items-center rounded-full bg-accent px-7 text-[15px] font-medium text-white transition hover:bg-accent-dark">Zobacz kolekcję</Link>
                        <Link href="/promocje" className="grid h-12 place-items-center rounded-full border border-forest px-7 text-[15px] font-medium text-forest transition hover:bg-forest hover:text-white">Promocje</Link>
                      </div>
                    </div>
                    <div className="text-[13px] text-meta">Darmowa dostawa z wniesieniem od 999 zł</div>
                  </div>
                  <Link href={item.href} tabIndex={active ? 0 : -1} className="group relative order-1 min-h-[340px] overflow-hidden rounded-md sm:min-h-[460px] lg:order-2">
                    <img src={img(item.image)} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-[1200ms] group-hover:scale-[1.02]" />
                    <span className="absolute bottom-5 left-5 rounded-md bg-white px-4 py-3 text-[13.5px] shadow-sm"><span className="font-medium">{item.badge}</span> <span className="text-meta">· {counts.get(item.category) ?? 0} produktów</span></span>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </W>

      <W className="pt-6 lg:pt-8">
        <div className="grid grid-cols-2 gap-x-6 gap-y-5 border-y border-line py-6 lg:grid-cols-4">
          {([[I.Truck, "Wysyłka w 24 h", "400+ modeli z magazynu we Wrocławiu"], [I.Return, "30 dni na zwrot", "Bez podawania przyczyny"], [I.Card, "Raty 0%", "20 rat, decyzja w 15 minut"], [I.Shield, "5 lat gwarancji", "Na stelaże i konstrukcje"]] as const).map(([Ic, t, s]) => (
            <div key={t} className="flex items-center gap-3.5">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sage text-forest"><Ic className="h-5 w-5" /></span>
              <div><div className="text-[14.5px] font-semibold">{t}</div><div className="text-[13px] text-meta">{s}</div></div>
            </div>
          ))}
        </div>
      </W>

      <Sec title="Kategorie" href="/produkty" link="Wszystkie kategorie">
        <div className="grid grid-cols-3 gap-3 sm:gap-5 lg:grid-cols-6">
          {mainCats.map((c) => (
            <Link key={c.slug} href={`/kategoria/${c.slug}`} className="group flex flex-col items-center rounded-lg border border-line bg-white px-3 pt-6 pb-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,.08)] transition duration-300 hover:-translate-y-1 hover:border-ink hover:shadow-[0_18px_34px_-18px_rgba(0,0,0,.35)] sm:pt-8 sm:pb-6">
              <span className="grid h-[76px] w-[76px] place-items-center rounded-full bg-paper transition duration-300 group-hover:bg-paper sm:h-[104px] sm:w-[104px]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10 text-ink transition duration-300 group-hover:scale-105 group-hover:text-accent sm:h-14 sm:w-14">{c.icon}</svg>
              </span>
              <span className="mt-4 text-center text-[14px] leading-tight font-bold sm:mt-5 sm:text-[16px]">{c.name}</span>
              <span className="mt-0.5 text-center text-[12px] text-meta sm:text-[13px]">{counts.get(c.slug) ?? 0} produktów</span>
            </Link>
          ))}
        </div>
      </Sec>

      <Sec title="Wybrane dla Ciebie" href="/produkty" link="Zobacz wszystkie">
        <div className="-mt-4 mb-8 flex gap-6 border-b border-line">
          {tabs.map((t, i) => (
            <button key={t} type="button" onClick={() => setTab(i)} className={`-mb-px border-b pb-3 text-[15px] font-medium transition ${tab === i ? "border-ink" : "border-transparent text-meta hover:text-ink"}`}>{t}</button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-4">
          {list.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </Sec>

      <Reviews />
      <ShopTheLook products={products} />
      <Journal />
      <PromoPair />
      <Brand />
      <Guides />
    </>
  );
}

function Reviews() {
  const Card = ({ r }: { r: string[] }) => (
    <figure className="mr-4 w-[300px] shrink-0 rounded-md border border-white/10 bg-white/[0.06] px-5 py-4 text-white sm:w-[340px]">
      <div className="flex items-center justify-between">
        <span className="flex text-accent">{[1, 2, 3, 4, 5].map((i) => <I.Star key={i} className="h-3.5 w-3.5" />)}</span>
        <span className="text-[12px] text-white/60">{r[2]}</span>
      </div>
      <blockquote className="mt-2 line-clamp-2 text-[14px] leading-snug">„{r[3]}”</blockquote>
      <figcaption className="mt-2 text-[12.5px]"><b className="font-semibold">{r[0]}</b> <span className="text-white/60">· {r[1]}</span></figcaption>
    </figure>
  );
  return (
    <section className="mt-20 overflow-hidden bg-ink pt-10 pb-10 text-white lg:mt-28 lg:pt-12 lg:pb-12">
      <W className="flex flex-col gap-5 lg:flex-row lg:items-center lg:gap-10">
        <div className="shrink-0 lg:w-[220px]">
          <div className="text-[13px] font-medium text-white/60">Opinie klientów</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-[34px] leading-none font-semibold tracking-[-0.04em]">4,8/5</span>
            <span className="flex text-accent">{[1, 2, 3, 4, 5].map((i) => <I.Star key={i} className="h-4 w-4" />)}</span>
          </div>
          <div className="mt-1 text-[13.5px]">2 300+ zweryfikowanych opinii</div>
        </div>
        <div className="marquee relative min-w-0 flex-1 [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]">
          <div className="marquee-track flex w-max">{[...reviews, ...reviews].map((r, i) => <Card key={i} r={r} />)}</div>
        </div>
      </W>
    </section>
  );
}

function Journal() {
  const ref = useRef<HTMLDivElement>(null);
  const go = (d: number) => {
    const e = ref.current;
    if (!e) return;
    const c = e.firstElementChild as HTMLElement | null;
    e.scrollBy({ left: d * ((c?.offsetWidth ?? 200) + 16) * 2, behavior: "smooth" });
  };
  return (
    <Sec title="Dziennik dobrych wnętrz" href="/blog" link="Wszystkie inspiracje">
      <div className="relative">
        <button type="button" onClick={() => go(-1)} aria-label="Poprzednie" className="absolute top-1/2 -left-5 z-10 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white shadow-[0_4px_16px_rgba(0,0,0,.12)] lg:grid"><I.Chevron className="h-[18px] w-[18px] rotate-180" /></button>
        <button type="button" onClick={() => go(1)} aria-label="Następne" className="absolute top-1/2 -right-5 z-10 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white shadow-[0_4px_16px_rgba(0,0,0,.12)] lg:grid"><I.Chevron className="h-[18px] w-[18px]" /></button>
        <div ref={ref} className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 sm:gap-4 lg:mx-0 lg:px-0">
          {journal.map(([i, t, s, href]) => (
            <Link key={i} href={href} className="group relative aspect-[2/3] w-[60%] shrink-0 snap-start overflow-hidden rounded-md bg-soft sm:w-[36%] lg:w-[calc((100%-80px)/6)]">
              <img src={img(i)} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-[900ms] group-hover:scale-[1.04]" />
              <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-black/45 to-transparent" />
              <div className="absolute top-4 right-4 left-4 text-white">
                <div className="text-[22px] leading-[1.05] font-semibold tracking-[-0.03em] whitespace-pre-line sm:text-[24px]">{t}</div>
                <div className="mt-2 text-[13px] opacity-95">{s}</div>
              </div>
              <span className="absolute bottom-4 left-1/2 grid h-10 -translate-x-1/2 place-items-center rounded-full bg-white px-5 text-[13.5px] font-medium whitespace-nowrap text-ink transition group-hover:-translate-y-0.5 group-hover:bg-accent group-hover:text-white">Poznaj produkty</span>
            </Link>
          ))}
        </div>
      </div>
    </Sec>
  );
}

function PromoPair() {
  const b = [
    ["living-orange", "Fotele do −20%", "Kolor, który ociepla salon", "Zobacz fotele", "/kategoria/fotele"],
    ["bedroom2", "Tydzień sypialni", "Łóżka tapicerowane z pojemnikiem od 1899 zł", "Zobacz łóżka", "/kategoria/lozka"],
  ];
  return (
    <W className="pt-20 lg:pt-28">
      <div className="grid gap-4 md:grid-cols-2 lg:gap-6">
        {b.map(([i, t, s, c, href]) => (
          <Link key={i} href={href} className="group relative aspect-[4/3] overflow-hidden rounded-md lg:aspect-[16/11]">
            <img src={img(i)} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-[1000ms] group-hover:scale-[1.03]" />
            <div className="absolute inset-0 bg-gradient-to-t from-forest/85 via-forest/20 to-transparent" />
            <div className="absolute right-6 bottom-6 left-6 text-white lg:bottom-9 lg:left-9">
              <div className="text-[28px] leading-tight font-semibold tracking-[-0.035em] sm:text-[36px]">{t}</div>
              <div className="mt-1 text-[15px] opacity-95">{s}</div>
              <span className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-white px-6 text-[14.5px] font-medium text-ink">{c}<I.Arrow className="h-4 w-4 transition group-hover:translate-x-0.5" /></span>
            </div>
          </Link>
        ))}
      </div>
    </W>
  );
}

function Brand() {
  return (
    <section className="mt-20 bg-forest py-16 text-white lg:mt-28 lg:py-24">
      <W>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
          <div className="relative">
            <img src={img("living-boho")} alt="" className="aspect-[5/4] w-full rounded-md object-cover" />
            <div className="absolute -bottom-6 right-6 grid h-[120px] w-[120px] rotate-[-8deg] place-items-center rounded-full bg-accent text-center text-[12.5px] leading-tight font-medium text-white shadow-lg lg:-right-8">Projekt<br />i jakość<br /><b className="text-[15px]">z Polski</b></div>
          </div>
          <div className="max-w-[520px]">
            <div className="text-[13px] font-medium text-sage">Sklep Design</div>
            <h2 className="font-display mt-3 text-[30px] leading-[1.05] tracking-[-0.035em] sm:text-[42px]">Autorska kolekcja, zaprojektowana we Wrocławiu</h2>
            <p className="mt-5 text-[16px] leading-relaxed text-white/85">Każdy model zaczynamy od szkicu w naszym studiu, a kończymy w małych polskich manufakturach. Testujemy pianki, tkaniny i stelaże, żeby mebel służył Ci latami, a nie sezon.</p>
            <div className="mt-9 grid grid-cols-3 gap-6 border-y border-white/20 py-6">
              {[["120+", "autorskich modeli"], ["14", "polskich manufaktur"], ["4,8", "średnia ocen"]].map(([a, b]) => (
                <div key={b}><div className="text-[30px] leading-none font-semibold tracking-[-0.04em] sm:text-[36px]">{a}</div><div className="mt-2 text-[13px] text-white/70">{b}</div></div>
              ))}
            </div>
            <Link href="/kategoria/sofy" className="mt-8 inline-flex h-12 items-center rounded-full bg-white px-7 text-[15px] font-semibold text-forest transition hover:bg-paper">Poznaj kolekcję</Link>
          </div>
        </div>
      </W>
    </section>
  );
}

function Guides() {
  const g = [
    ["b2", "Sypialnia", "Jak wybrać materac do pozycji, w której śpisz", "6 min", "/blog"],
    ["b3", "Salon", "Ciepły minimalizm: 7 zasad, które działają w małym mieszkaniu", "8 min", "/blog"],
    ["living-bright", "Poradnik", "Sofa czy narożnik? Wymiary, które warto sprawdzić przed zakupem", "5 min", "/blog"],
  ];
  return (
    <Sec title="Poradnik sklep" href="/blog" link="Wszystkie artykuły">
      <div className="grid gap-6 md:grid-cols-3 lg:gap-8">
        {g.map(([i, c, t, m, href]) => (
          <Link key={i} href={href} className="group">
            <div className="aspect-[3/2] overflow-hidden rounded-md"><img src={img(i)} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]" /></div>
            <div className="mt-4 flex gap-2 text-[13px] text-meta"><span className="font-medium text-ink">{c}</span>·<span>{m} czytania</span></div>
            <div className="mt-1.5 text-[18px] leading-snug font-semibold tracking-[-0.02em] underline-offset-4 group-hover:underline sm:text-[20px]">{t}</div>
          </Link>
        ))}
      </div>
    </Sec>
  );
}
