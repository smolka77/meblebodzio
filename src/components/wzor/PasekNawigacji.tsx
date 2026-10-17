"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { StoreImage } from "@/components/sklep/ObrazSklepu";
import { Chevron, Star } from "./ikony";

type Karta = { label: string; href: string; image: string };
type Grupa = { title: string; cards: Karta[] };
type Pozycja =
  | { type: "menu"; label: string; groups: Grupa[] }
  | { type: "link"; label: string; href: string; highlight?: boolean };

const nav: Pozycja[] = [
  {
    type: "menu",
    label: "Meble",
    groups: [
      {
        title: "Meble wypoczynkowe",
        cards: [
          { label: "Zobacz wszystkie", href: "/produkty", image: "/katalog/sofa-aura.jpg" },
          { label: "Narożniki", href: "/kategoria/narozniki", image: "/katalog/naroznik-oslo.jpg" },
          { label: "Kanapy i sofy", href: "/kategoria/sofy", image: "/katalog/sofa-milano.jpg" },
          { label: "Kolekcje", href: "/kategoria/kolekcje", image: "/katalog/kolekcja-terra.jpg" },
          { label: "Fotele", href: "/kategoria/fotele", image: "/katalog/fotel-nordic.jpg" },
        ],
      },
      {
        title: "Łóżka",
        cards: [
          { label: "Zobacz wszystkie", href: "/kategoria/lozka", image: "/katalog/lozko-loft.jpg" },
          { label: "Łóżka tapicerowane", href: "/kategoria/lozka", image: "/katalog/lozko-linen.jpg" },
          { label: "Materace", href: "/kategoria/materace", image: "/katalog/materac-cloud-sleep.jpg" },
          { label: "Łóżka dziecięce", href: "/kategoria/meble-dzieciece", image: "/katalog/lozko-mini-nest.jpg" },
        ],
      },
      {
        title: "Meble do przechowywania",
        cards: [
          { label: "Zobacz wszystkie", href: "/kategoria/szafy", image: "/katalog/szafa-haven.jpg" },
          { label: "Szafy", href: "/kategoria/szafy", image: "/katalog/szafa-line.jpg" },
          { label: "Komody", href: "/kategoria/komody", image: "/katalog/komoda-grove.jpg" },
          { label: "Szafki RTV", href: "/kategoria/szafki-rtv", image: "/katalog/szafka-rtv-frame.jpg" },
          { label: "Szafki nocne", href: "/kategoria/szafki", image: "/katalog/szafka-oak.jpg" },
        ],
      },
      {
        title: "Stoły i stoliki",
        cards: [
          { label: "Zobacz wszystkie", href: "/kategoria/stoliki", image: "/katalog/stolik-kawowy-pebble.jpg" },
          { label: "Stoliki kawowe", href: "/kategoria/stoliki", image: "/katalog/stolik-kawowy-pebble.jpg" },
          { label: "Stoliki boczne", href: "/kategoria/stoliki", image: "/katalog/stolik-boczny-nook.jpg" },
        ],
      },
    ],
  },
  {
    type: "menu",
    label: "Oświetlenie",
    groups: [
      {
        title: "Lampy",
        cards: [
          { label: "Zobacz wszystkie", href: "/kategoria/oswietlenie", image: "/katalog/lampa-arc.jpg" },
          { label: "Lampy podłogowe", href: "/kategoria/oswietlenie", image: "/katalog/lampa-arc.jpg" },
          { label: "Lampy stołowe", href: "/kategoria/oswietlenie", image: "/katalog/lampa-halo.jpg" },
        ],
      },
    ],
  },
  {
    type: "menu",
    label: "Dodatki",
    groups: [
      {
        title: "Dla zwierząt",
        cards: [
          { label: "Zobacz wszystkie", href: "/kategoria/akcesoria-dla-zwierzat", image: "/katalog/legowisko-nest.jpg" },
          { label: "Legowiska", href: "/kategoria/akcesoria-dla-zwierzat", image: "/katalog/legowisko-nest.jpg" },
          { label: "Drapaki", href: "/kategoria/akcesoria-dla-zwierzat", image: "/katalog/drapak-grove.jpg" },
        ],
      },
    ],
  },
  {
    type: "menu",
    label: "Pomieszczenia",
    groups: [
      {
        title: "Salon",
        cards: [
          { label: "Narożniki", href: "/kategoria/narozniki", image: "/katalog/naroznik-cloud.jpg" },
          { label: "Kanapy i sofy", href: "/kategoria/sofy", image: "/katalog/sofa-como.jpg" },
          { label: "Szafki RTV", href: "/kategoria/szafki-rtv", image: "/katalog/szafka-rtv-line.jpg" },
          { label: "Komody", href: "/kategoria/komody", image: "/katalog/komoda-mira.jpg" },
          { label: "Stoliki kawowe", href: "/kategoria/stoliki", image: "/katalog/stolik-kawowy-pebble.jpg" },
          { label: "Fotele", href: "/kategoria/fotele", image: "/katalog/fotel-lounge.jpg" },
          { label: "Oświetlenie", href: "/kategoria/oswietlenie", image: "/katalog/lampa-halo.jpg" },
        ],
      },
      {
        title: "Sypialnia",
        cards: [
          { label: "Łóżka", href: "/kategoria/lozka", image: "/katalog/lozko-loft.jpg" },
          { label: "Materace", href: "/kategoria/materace", image: "/katalog/materac-dual-comfort.jpg" },
          { label: "Szafy", href: "/kategoria/szafy", image: "/katalog/szafa-haven.jpg" },
          { label: "Komody", href: "/kategoria/komody", image: "/katalog/komoda-grove.jpg" },
          { label: "Szafki nocne", href: "/kategoria/szafki", image: "/katalog/szafka-cube.jpg" },
        ],
      },
      {
        title: "Pokój dziecka",
        cards: [
          { label: "Łóżka dziecięce", href: "/kategoria/meble-dzieciece", image: "/katalog/lozko-mini-nest.jpg" },
          { label: "Komody", href: "/kategoria/meble-dzieciece", image: "/katalog/komoda-play.jpg" },
        ],
      },
    ],
  },
  { type: "link", label: "Nowości", href: "/produkty?widok=nowosci" },
  { type: "link", label: "Bestsellery", href: "/produkty?widok=bestsellery" },
  { type: "link", label: "Promocje", href: "/promocje" },
  { type: "link", label: "Kolekcje", href: "/kategoria/kolekcje", highlight: true },
];

function Caret({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <path d="M16.25 7.5 10 13.75 3.75 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function KartaMenu({ card, onPick }: { card: Karta; onPick: () => void }) {
  return (
    <Link href={card.href} onClick={onPick} className="group grid gap-3 text-black">
      <span className="block overflow-hidden rounded-[6px] bg-[#f4f4f4]">
        <span className="relative block aspect-[4/3]">
          <StoreImage
            src={card.image}
            alt=""
            fill
            className="transition duration-300 group-hover:scale-[1.04]"
            sizes="240px"
          />
        </span>
      </span>
      <span className="text-[15px] leading-snug">{card.label}</span>
    </Link>
  );
}

export function ShopNav({
  mobileOpen,
  onNavigate,
}: {
  mobileOpen: boolean;
  onNavigate: () => void;
}) {
  const path = usePathname();
  const [mounted, setMounted] = useState(false);
  const [menu, setMenu] = useState<string | null>(null);
  const [group, setGroup] = useState(0);
  const [tilesIn, setTilesIn] = useState(false);
  const [mobileGroup, setMobileGroup] = useState<string | null>(null);
  const closeTimer = useRef<number | null>(null);

  function cancelClose() {
    if (closeTimer.current != null) window.clearTimeout(closeTimer.current);
    closeTimer.current = null;
  }

  function scheduleClose() {
    cancelClose();
    closeTimer.current = window.setTimeout(() => setMenu(null), 140);
  }

  function openMenu(label: string) {
    cancelClose();
    setTilesIn(false);
    setMenu(label);
    setGroup(0);
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!menu) return;
    setTilesIn(false);
    let inner = 0;
    const outer = window.requestAnimationFrame(() => {
      inner = window.requestAnimationFrame(() => setTilesIn(true));
    });
    return () => {
      window.cancelAnimationFrame(outer);
      window.cancelAnimationFrame(inner);
    };
  }, [menu]);

  useEffect(() => {
    setMenu(null);
    setMobileGroup(null);
  }, [path]);

  useEffect(() => () => cancelClose(), []);

  const open = nav.find((item) => item.type === "menu" && item.label === menu);
  const groups = open?.type === "menu" ? open.groups : [];

  return (
    <>
      <nav
        className="relative z-50 hidden lg:block"
        onMouseLeave={scheduleClose}
        onMouseEnter={cancelClose}
      >
        <div className="pw flex h-[45px] items-center">
          {nav.map((item) =>
            item.type === "link" ? (
              <Link
                key={item.label}
                href={item.href}
                className="inline-flex h-8 items-center gap-1.5 px-4 text-[15px] font-bold text-black"
              >
                {item.highlight ? <Star className="h-3.5 w-3.5" /> : null}
                {item.label}
              </Link>
            ) : (
              <button
                key={item.label}
                type="button"
                className="inline-flex h-8 items-center px-4 text-[15px] font-bold text-black"
                aria-expanded={menu === item.label}
                onMouseEnter={() => openMenu(item.label)}
                onFocus={() => openMenu(item.label)}
              >
                <span className="inline-flex items-center gap-1">
                  {item.label}
                  <Caret className="h-3.5 w-3.5" />
                </span>
              </button>
            )
          )}
        </div>
        {open?.type === "menu" ? (
          <div className="menu-panel absolute inset-x-0 top-full z-50 border-t border-black/10 bg-white shadow-[0_18px_40px_rgba(0,0,0,0.06)]">
            <div className="pw flex gap-10 py-6">
              <div className="w-[240px] shrink-0">
                {groups.map((item, index) => {
                  const active = index === group;
                  return (
                    <button
                      key={item.title}
                      type="button"
                      className={`flex w-full items-center justify-between rounded-[5px] px-[7px] py-[7px] text-left text-[15px] text-black transition-colors duration-300 ease-[cubic-bezier(0.7,0,0.3,1)] ${
                        active ? "bg-[#ededed]" : "hover:bg-[#f6f6f6]"
                      }`}
                      onMouseEnter={() => setGroup(index)}
                      onFocus={() => setGroup(index)}
                    >
                      {item.title}
                      <Chevron className="h-4 w-4 shrink-0" />
                    </button>
                  );
                })}
              </div>
              <div className="grid min-w-0 flex-1 overflow-hidden border-l border-black/10">
                {groups.map((item, index) => {
                  const active = tilesIn && index === group;
                  return (
                    <div
                      key={item.title}
                      className={`menu-kafelki col-start-1 row-start-1 px-10 ${
                        active ? "is-shown z-10" : "pointer-events-none z-0"
                      }`}
                      aria-hidden={!active}
                    >
                      <div className="grid grid-cols-3 content-start gap-x-[30px] gap-y-[30px] xl:grid-cols-5">
                        {item.cards.map((card) => (
                          <KartaMenu
                            key={`${card.href}-${card.label}`}
                            card={card}
                            onPick={() => setMenu(null)}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}
      </nav>
      {mounted && menu
        ? createPortal(
            <button
              type="button"
              aria-label="Zamknij menu"
              className="menu-overlay fixed inset-0 z-30 bg-black/45"
              onClick={() => setMenu(null)}
            />,
            document.body
          )
        : null}
      {mobileOpen ? (
        <div className="border-t border-line bg-white lg:hidden">
          <div className="pw flex flex-col py-2">
            {nav.map((item) =>
              item.type === "link" ? (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={onNavigate}
                  className="flex h-12 items-center text-[16px] font-bold text-black"
                >
                  {item.label}
                </Link>
              ) : (
                <div key={item.label} className="border-b border-black/5">
                  <button
                    type="button"
                    className="flex h-12 w-full items-center justify-between text-[16px] font-bold text-black"
                    aria-expanded={mobileGroup === item.label}
                    onClick={() =>
                      setMobileGroup((current) => (current === item.label ? null : item.label))
                    }
                  >
                    {item.label}
                    <Caret className={`h-4 w-4 transition ${mobileGroup === item.label ? "rotate-180" : ""}`} />
                  </button>
                  {mobileGroup === item.label
                    ? item.groups.map((grupa) => (
                        <div key={grupa.title} className="pb-3">
                          <p className="px-1 pb-1 text-[13px] font-semibold text-black/50">{grupa.title}</p>
                          {grupa.cards.map((card) => (
                            <Link
                              key={`${grupa.title}-${card.label}`}
                              href={card.href}
                              onClick={onNavigate}
                              className="flex h-10 items-center px-1 text-[15px] text-black"
                            >
                              {card.label}
                            </Link>
                          ))}
                        </div>
                      ))
                    : null}
                </div>
              )
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
