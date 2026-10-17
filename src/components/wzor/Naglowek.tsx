"use client";

import Link from "next/link";
import { useState } from "react";
import { useShop } from "@/kontekst/KontekstSklepu";
import { HeaderSearch } from "@/components/uklad/SzukajkaNaglowka";
import { ShopNav } from "./PasekNawigacji";
import * as I from "./ikony";

const W = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`pw ${className}`}>{children}</div>
);

export function Header() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { cartCount } = useShop();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white">
      <div className="bg-forest text-[12.5px] text-white/85">
        <W className="flex h-[calc(2.25rem*1.3)] items-center justify-between">
          <span>Darmowa dostawa od 999 zł · 30 dni na zwrot</span>
          <span className="hidden gap-6 md:flex">
            <Link href="/konto" className="ulink">Status zamówienia</Link>
            <Link href="/faq" className="ulink">Pomoc</Link>
            <span>71 123 45 67</span>
          </span>
        </W>
      </div>
      <W className="flex h-[68px] items-center gap-5 lg:h-[88px] lg:gap-10">
        <button className="-ml-1 p-1 lg:hidden" onClick={() => setOpen(!open)} aria-label="Menu" type="button">
          <I.Menu className="h-7 w-7" />
        </button>
        <Link href="/" className="shrink-0 text-[28px] leading-none font-bold tracking-[-0.05em] lg:text-[36px]">
          sklep<span className="text-accent">.</span>
        </Link>
        <HeaderSearch />
        <div className="ml-auto flex items-center gap-1 sm:gap-3">
          <button className="p-1.5 lg:hidden" aria-label="Szukaj" type="button" onClick={() => setSearchOpen((v) => !v)}>
            <I.Search className="h-6 w-6" />
          </button>
          <Link href="/konto" className="hidden flex-col items-center gap-1 px-2 text-[13px] font-semibold transition hover:text-accent sm:flex">
            <I.User className="h-[26px] w-[26px]" />Konto
          </Link>
          <Link href="/konto" className="hidden flex-col items-center gap-1 px-2 text-[13px] font-semibold transition hover:text-accent sm:flex">
            <I.Heart className="h-[26px] w-[26px]" />Ulubione
          </Link>
          <Link href="/koszyk" className="relative flex flex-col items-center gap-1 px-2 text-[13px] font-semibold transition hover:text-accent" aria-label="Koszyk">
            <I.Bag className="h-[26px] w-[26px]" />
            <span className="hidden sm:block">Koszyk</span>
            {cartCount > 0 && (
              <span className="fade-up absolute -top-1 right-0 grid h-[19px] min-w-[19px] place-items-center rounded-full bg-accent px-1 text-[11px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </W>
      {searchOpen && (
        <W className="pb-3 lg:hidden">
          <HeaderSearch className="relative block w-full" />
        </W>
      )}
      <ShopNav mobileOpen={open} onNavigate={() => setOpen(false)} />
    </header>
  );
}
