"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Product, ProductRoom, ProductStyle } from "@/lib/typy";
import { ProductCard } from "@/components/sklep/KartaProduktu";
import { StoreImage } from "@/components/sklep/ObrazSklepu";
import {
  BUDGETS,
  PREFS,
  rankProducts,
  type AdvisorAnswers,
  type BudgetId,
  type PrefId,
} from "@/lib/doradca";
import { complementaryProducts } from "@/lib/uzupelnienia";
import { categoryLabels } from "@/lib/dane";
import {
  PRODUCT_STYLES,
  roomsWithProducts,
  productRooms,
} from "@/lib/stylePomieszczenia";
import * as I from "@/components/wzor/ikony";

const STEPS = ["Pomieszczenie", "Rodzaj mebla", "Styl", "Budżet", "Na co zwrócić uwagę"] as const;

function Option({
  selected,
  onClick,
  children,
  className = "",
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`rounded-md border text-left transition ${
        selected ? "border-ink bg-white ring-2 ring-ink" : "border-line bg-white hover:border-ink"
      } ${className}`}
    >
      {children}
    </button>
  );
}

export function DoradcaZakupowy({ products }: { products: Product[] }) {
  const rooms = useMemo(() => roomsWithProducts(products), [products]);
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [room, setRoom] = useState<ProductRoom | undefined>();
  const [types, setTypes] = useState<string[]>([]);
  const [style, setStyle] = useState<ProductStyle | undefined>();
  const [budget, setBudget] = useState<BudgetId>("bez-limitu");
  const [prefs, setPrefs] = useState<PrefId[]>([]);

  const typeOptions = useMemo(() => {
    const scoped = products.filter((product) => !room || productRooms(product).includes(room));
    return [...new Set(scoped.map((product) => product.category))];
  }, [products, room]);

  const answers: AdvisorAnswers = { room, types, style, budget, prefs };
  const result = useMemo(
    () => (done ? rankProducts(products, { room, types, style, budget, prefs }) : null),
    [done, products, room, types, style, budget, prefs]
  );
  const top = result?.matches[0]?.product;
  const extras = useMemo(
    () => (top ? complementaryProducts(products, top, 3) : []),
    [products, top]
  );

  const canNext = step === 0 ? Boolean(room) : true;

  function next() {
    if (step < STEPS.length - 1) setStep(step + 1);
    else setDone(true);
  }

  function restart() {
    setDone(false);
    setStep(0);
    setRoom(undefined);
    setTypes([]);
    setStyle(undefined);
    setBudget("bez-limitu");
    setPrefs([]);
  }

  const toggle = <T extends string>(list: T[], value: T) =>
    list.includes(value) ? list.filter((item) => item !== value) : [...list, value];

  const listingHref = (() => {
    const params = new URLSearchParams();
    if (answers.room) params.set("pokoj", answers.room);
    if (answers.style) params.set("styl", answers.style);
    if (answers.types.length) params.set("typ", answers.types.join(","));
    const query = params.toString();
    return query ? `/produkty?${query}` : "/produkty";
  })();

  if (done && result) {
    return (
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="flex items-center gap-1.5 text-[13px] font-medium text-accent">
              <I.Sparkle className="h-4 w-4" />
              Twoje dopasowanie
            </p>
            <h2 className="font-display mt-1.5 text-[28px] leading-tight sm:text-[38px]">
              {result.matches.length > 0 ? "Polecamy te meble" : "Nic nie pasuje do tych kryteriów"}
            </h2>
          </div>
          <button
            type="button"
            onClick={restart}
            className="flex h-11 items-center gap-2 rounded-full border border-ink px-5 text-[14px] font-semibold transition hover:bg-ink hover:text-white"
          >
            <I.Rotate className="h-4 w-4" />
            Zacznij od nowa
          </button>
        </div>

        {result.relaxedBudget ? (
          <p className="mt-4 rounded-md bg-paper px-4 py-3 text-[14px]">
            W wybranym budżecie mamy za mało modeli, więc pokazujemy najbliższe propozycje.
          </p>
        ) : null}

        {result.matches.length > 0 ? (
          <ul className="mt-8 grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-6 lg:grid-cols-3">
            {result.matches.map(({ product, reasons }) => (
              <li key={product.id}>
                <ProductCard product={product} cta="Zobacz warianty" />
                {reasons.length > 0 ? (
                  <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Dlaczego polecamy">
                    {reasons.map((reason) => (
                      <li
                        key={reason}
                        className="flex items-center gap-1 rounded-full bg-sage px-2.5 py-1 text-[12px] font-medium text-forest"
                      >
                        <I.Check className="h-3 w-3" />
                        {reason}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-6 text-[15px]">
            Zmień odpowiedzi albo{" "}
            <Link href="/produkty" className="ulink font-medium text-accent">
              zobacz całą ofertę
            </Link>
            .
          </p>
        )}

        {extras.length > 0 ? (
          <section className="mt-16">
            <h3 className="font-display text-[24px] leading-tight sm:text-[30px]">
              Czym uzupełnić {top?.name}?
            </h3>
            <p className="mt-1.5 text-[14.5px] text-meta">
              Podobny styl, inne kategorie — gotowy pomysł na kompletne wnętrze.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-6 lg:grid-cols-3">
              {extras.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        ) : null}

        <div className="mt-12 flex flex-wrap gap-3">
          <Link
            href={listingHref}
            className="grid h-12 place-items-center rounded-full bg-accent px-7 text-[15px] font-semibold text-white transition hover:bg-accent-dark"
          >
            Zobacz wszystkie w sklepie
          </Link>
          <Link
            href="/inspiracje"
            className="grid h-12 place-items-center rounded-full border border-ink px-7 text-[15px] font-semibold transition hover:bg-ink hover:text-white"
          >
            Zainspiruj się aranżacjami
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4 text-[13px]">
        <span className="font-medium text-meta">
          Krok {step + 1} z {STEPS.length} · {STEPS[step]}
        </span>
        {step > 0 ? (
          <button type="button" onClick={() => setStep(step - 1)} className="flex items-center gap-1.5 font-medium hover:underline">
            <I.ArrowLeft className="h-4 w-4" />
            Wstecz
          </button>
        ) : null}
      </div>
      <div className="mt-3 flex gap-1.5" role="progressbar" aria-valuemin={1} aria-valuemax={STEPS.length} aria-valuenow={step + 1}>
        {STEPS.map((label, index) => (
          <span key={label} className={`h-1 flex-1 rounded-full transition ${index <= step ? "bg-ink" : "bg-line"}`} />
        ))}
      </div>

      <div className="mt-8" key={step}>
        <div className="fade-up">
          {step === 0 && (
            <>
              <h2 className="font-display text-[28px] leading-tight sm:text-[38px]">Co urządzamy?</h2>
              <ul className="mt-7 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
                {rooms.map((item) => (
                  <li key={item.id}>
                    <Option selected={room === item.id} onClick={() => setRoom(item.id)} className="block w-full overflow-hidden">
                      <span className="relative block aspect-[4/3] bg-paper">
                        <StoreImage src={item.image} alt="" fill sizes="(min-width: 1024px) 30vw, 50vw" />
                      </span>
                      <span className="block p-4">
                        <span className="block text-[17px] font-semibold">{item.label}</span>
                        <span className="mt-0.5 block text-[13px] text-meta">{item.blurb}</span>
                      </span>
                    </Option>
                  </li>
                ))}
              </ul>
            </>
          )}

          {step === 1 && (
            <>
              <h2 className="font-display text-[28px] leading-tight sm:text-[38px]">Czego szukasz?</h2>
              <p className="mt-2 text-[15px] text-meta">Zaznacz jeden lub kilka rodzajów — albo pomiń, jeśli chcesz zobaczyć wszystko.</p>
              <ul className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {typeOptions.map((slug) => (
                  <li key={slug}>
                    <Option
                      selected={types.includes(slug)}
                      onClick={() => setTypes(toggle(types, slug))}
                      className="flex h-full w-full items-center justify-between gap-2 px-4 py-4 text-[15px] font-medium"
                    >
                      {categoryLabels[slug as keyof typeof categoryLabels] ?? slug}
                      {types.includes(slug) ? <I.Check className="h-4 w-4 shrink-0" /> : null}
                    </Option>
                  </li>
                ))}
              </ul>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="font-display text-[28px] leading-tight sm:text-[38px]">Jaki styl Ci się podoba?</h2>
              <ul className="mt-7 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
                {PRODUCT_STYLES.map((item) => (
                  <li key={item.id}>
                    <Option selected={style === item.id} onClick={() => setStyle(style === item.id ? undefined : item.id)} className="block w-full overflow-hidden">
                      <span className="relative block aspect-[4/3] bg-paper">
                        <StoreImage src={item.image} alt="" fill sizes="(min-width: 1024px) 30vw, 50vw" />
                      </span>
                      <span className="block p-4">
                        <span className="block text-[17px] font-semibold">{item.label}</span>
                        <span className="mt-0.5 block text-[13px] text-meta">{item.blurb}</span>
                      </span>
                    </Option>
                  </li>
                ))}
                <li>
                  <Option selected={!style} onClick={() => setStyle(undefined)} className="flex h-full min-h-[120px] w-full flex-col justify-center p-5">
                    <span className="block text-[17px] font-semibold">Nie wiem — pokaż różne</span>
                    <span className="mt-0.5 block text-[13px] text-meta">Pominiemy styl przy dopasowaniu.</span>
                  </Option>
                </li>
              </ul>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="font-display text-[28px] leading-tight sm:text-[38px]">Ile chcesz wydać na jeden mebel?</h2>
              <ul className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {BUDGETS.map((item) => (
                  <li key={item.id}>
                    <Option selected={budget === item.id} onClick={() => setBudget(item.id)} className="flex w-full items-center justify-between px-5 py-5 text-[16px] font-semibold">
                      {item.label}
                      {budget === item.id ? <I.Check className="h-4 w-4" /> : null}
                    </Option>
                  </li>
                ))}
              </ul>
            </>
          )}

          {step === 4 && (
            <>
              <h2 className="font-display text-[28px] leading-tight sm:text-[38px]">Na co zwrócić uwagę?</h2>
              <p className="mt-2 text-[15px] text-meta">Opcjonalnie — podbijemy modele, które to spełniają.</p>
              <ul className="mt-7 grid gap-3 sm:grid-cols-3">
                {PREFS.map((item) => (
                  <li key={item.id}>
                    <Option selected={prefs.includes(item.id)} onClick={() => setPrefs(toggle(prefs, item.id))} className="block h-full w-full p-5">
                      <span className="flex items-center justify-between text-[16px] font-semibold">
                        {item.label}
                        {prefs.includes(item.id) ? <I.Check className="h-4 w-4" /> : null}
                      </span>
                      <span className="mt-1 block text-[13px] text-meta">{item.hint}</span>
                    </Option>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={next}
          disabled={!canNext}
          className="grid h-12 place-items-center rounded-full bg-ink px-9 text-[15px] font-semibold text-white transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
        >
          {step === STEPS.length - 1 ? "Pokaż propozycje" : "Dalej"}
        </button>
        {step > 0 && step < STEPS.length - 1 ? (
          <button type="button" onClick={next} className="ulink text-[14px] font-medium">
            Pomiń to pytanie
          </button>
        ) : null}
      </div>
    </div>
  );
}
