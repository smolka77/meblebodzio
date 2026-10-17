"use client";

import { useState } from "react";
import Link from "next/link";
import * as I from "./ikony";

const W = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`pw ${className}`}>{children}</div>
);

const cols = [
  ["Sklep", [
    ["Salon", "/kategoria/sofy"],
    ["Sypialnia", "/kategoria/lozka"],
    ["Jadalnia", "/kategoria/stoliki"],
    ["Oświetlenie", "/kategoria/oswietlenie"],
    ["Promocje", "/promocje"],
  ]],
  ["Pomoc", [
    ["Dostawa i wniesienie", "/dostawa"],
    ["Raty 0%", "/faq"],
    ["Zwroty i reklamacje", "/polityka-zwrotow"],
    ["Status zamówienia", "/konto"],
    ["FAQ", "/faq"],
  ]],
  ["Sklep", [
    ["O nas", "/o-nas"],
    ["Blog", "/blog"],
    ["Kontakt", "/kontakt"],
    ["B2B", "/b2b"],
    ["Regulamin", "/regulamin"],
  ]],
] as const;

export function Footer(_props?: { hideAbout?: boolean }) {
  const [done, setDone] = useState(false);
  const [email, setEmail] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch {
      /* pokazujemy potwierdzenie także gdy sieć padnie — adres zostaje w polu */
    }
    setDone(true);
  }

  return (
    <footer className="mt-20 bg-forest text-[14.5px] text-white lg:mt-28">
      <div className="relative overflow-hidden bg-forest-2">
        <img src="/wzor/living-orange.jpg" alt="" className="absolute top-0 right-0 hidden h-full w-[38%] object-cover lg:block" />
        <div className="absolute top-0 right-0 hidden h-full w-[38%] bg-gradient-to-r from-forest-2 via-forest-2/40 to-transparent lg:block" />
        <W className="relative py-14 lg:py-20">
          <div className="max-w-[720px]">
            <span className="inline-flex h-8 items-center gap-2 rounded-full bg-accent px-3.5 text-[13px] font-semibold text-white">−10% na start</span>
            <h3 className="font-display mt-5 text-[34px] leading-[1.02] tracking-[-0.04em] sm:text-[48px] xl:text-[56px]">Dołącz do nas i zgarnij −10% na pierwsze zakupy</h3>
            <p className="mt-4 max-w-lg text-[16px] text-white/80">Raz w tygodniu: nowe kolekcje, inspiracje i promocje tylko dla subskrybentów. Bez spamu.</p>
            {done ? (
              <div className="fade-up mt-8 inline-flex h-14 items-center gap-3 rounded-full bg-white px-6 font-semibold text-forest">
                <I.Check className="h-5 w-5" />Gotowe! Kod −10% jest już w Twojej skrzynce.
              </div>
            ) : (
              <form onSubmit={submit} className="mt-8 flex max-w-[600px] flex-col gap-3 sm:flex-row">
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Twój adres e-mail" className="h-14 w-full shrink-0 rounded-full bg-white px-6 text-[16px] text-ink outline-none placeholder:text-meta focus:ring-4 focus:ring-accent/40 sm:flex-1" />
                <button className="h-14 rounded-full bg-accent px-8 text-[16px] font-semibold text-white transition hover:bg-accent-dark">Odbierz rabat</button>
              </form>
            )}
            <div className="mt-3 text-[12.5px] text-white/60">Zapisując się, akceptujesz politykę prywatności. Wypiszesz się jednym kliknięciem.</div>
          </div>
        </W>
      </div>
      <W className="grid gap-6 border-b border-white/15 py-8 sm:grid-cols-3">
        {[[I.Phone, "71 123 45 67", "pon–pt 8–18, sob 9–14"], [I.Card, "kontakt@sklep.pl", "Odpowiadamy w ciągu 2 godzin"], [I.User, "Czat na żywo", "Codziennie 8–22"]].map(([Ic, t, s]) => {
          const Icon = Ic as typeof I.Phone;
          return (
            <div key={String(t)} className="flex items-center gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white/10"><Icon className="h-5 w-5" /></span>
              <div>
                <div className="text-[16px] font-semibold">{String(t)}</div>
                <div className="text-[13px] text-white/70">{String(s)}</div>
              </div>
            </div>
          );
        })}
      </W>
      <W className="grid grid-cols-2 gap-10 py-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:py-14">
        <div className="col-span-2 max-w-sm lg:col-span-1">
          <div className="text-[28px] leading-none font-semibold tracking-[-0.04em]">sklep</div>
          <p className="mt-3 text-white/70">Meble projektowane we Wrocławiu i produkowane w Polsce. Dostarczamy z wniesieniem w całym kraju.</p>
          <div className="mt-5 flex gap-2.5">
            {["IG", "FB", "PIN", "YT", "TT"].map((x) => (
              <span key={x} className="grid h-10 w-10 place-items-center rounded-full border border-white/25 text-[11.5px] font-semibold">{x}</span>
            ))}
          </div>
        </div>
        {cols.map(([title, links], i) => (
          <div key={`${title}-${i}`}>
            <div className="mb-4 font-semibold">{title}</div>
            <ul className="space-y-2.5 text-white/70">
              {links.map(([label, href]) => (
                <li key={label}><Link href={href} className="ulink hover:text-white">{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </W>
      <W className="flex flex-col justify-between gap-4 border-t border-white/15 py-6 text-[12.5px] lg:flex-row lg:items-center">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-white/60">Płatności:</span>
          {["BLIK", "Visa", "Mastercard", "Przelewy24", "PayPo", "Raty 0%"].map((x) => (
            <span key={x} className="rounded bg-white px-2 py-1 font-semibold text-forest">{x}</span>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-white/60">Dostawa:</span>
          {["Kurier z wniesieniem", "DPD", "InPost"].map((x) => (
            <span key={x} className="rounded border border-white/25 px-2 py-1 font-semibold">{x}</span>
          ))}
        </div>
        <span className="text-white/60">© 2026 Sklep</span>
      </W>
    </footer>
  );
}
