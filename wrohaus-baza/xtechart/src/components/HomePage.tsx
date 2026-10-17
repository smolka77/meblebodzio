"use client";

import { FormEvent, useState } from "react";
import { CursorMark } from "@/components/atmosphere";
import { Wordmark, XTMark } from "@/components/brand";
import { Hero } from "@/components/Hero";
import { Work } from "@/components/Work";

const nav = [
  { href: "#prace", label: "Prace" },
  { href: "#uslugi", label: "Usługi" },
  { href: "#kontakt", label: "Kontakt" },
];

export function HomePage() {
  return (
    <>
      <CursorMark />
      <Nav />
      <main>
        <Hero />
        <Work />
        <Services />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 right-0 left-0 z-50 border-b border-ink bg-paper">
      <div className="flex h-16 items-center justify-between px-5 sm:px-8 lg:px-10">
        <Wordmark />
        <nav className="hidden items-center gap-8 md:flex">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="font-mono text-[11px] tracking-[0.18em] text-gray-3 uppercase hover:text-ink"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <button
          type="button"
          className="grid h-8 w-8 place-items-center border border-ink md:hidden"
          aria-label={open ? "Zamknij menu" : "Otwórz menu"}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="font-mono text-sm">{open ? "×" : "≡"}</span>
        </button>
      </div>
      {open ? (
        <div className="border-t border-ink bg-paper md:hidden">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block border-b border-line px-5 py-4 font-mono text-[11px] tracking-[0.18em] uppercase"
            >
              {item.label}
            </a>
          ))}
        </div>
      ) : null}
    </header>
  );
}

function Services() {
  const services = ["Strony", "E-commerce", "Produkty", "Systemy"];

  return (
    <section id="uslugi" className="scroll-mt-16">
      <div className="border-b border-ink px-5 py-6 sm:px-8 lg:px-10">
        <h2 className="text-sm font-medium tracking-tight">Usługi</h2>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4">
        {services.map((title, index) => (
          <article
            key={title}
            className="min-h-[220px] border-b border-ink p-6 hover:bg-green sm:odd:border-r lg:border-r lg:[&:nth-child(4n)]:border-r-0"
          >
            <p className="font-mono text-[11px] text-gray-3">
              {String(index + 1).padStart(2, "0")}
            </p>
            <h3 className="mt-16 text-2xl font-medium tracking-tight">{title}</h3>
            <div className="mt-8 space-y-2">
              <div className="h-px w-16 bg-ink/20" />
              <div className="h-px w-24 bg-ink/10" />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Contact() {
  const [sent, setSent] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") || "");
    const email = String(data.get("email") || "");
    const message = String(data.get("message") || "");
    const body = encodeURIComponent(`${name}\n${email}\n\n${message}`);
    window.location.href = `mailto:hello@xtechart.pl?subject=${encodeURIComponent(
      "xtechart",
    )}&body=${body}`;
    setSent(true);
  }

  return (
    <section id="kontakt" className="scroll-mt-16 grid lg:grid-cols-2">
      <div className="flex min-h-[320px] flex-col justify-between border-b border-ink bg-ink p-6 text-white sm:p-10 lg:border-r lg:border-b-0">
        <h2 className="text-sm font-medium tracking-tight">Kontakt</h2>
        <a href="mailto:hello@xtechart.pl" className="text-2xl tracking-tight sm:text-3xl">
          hello@xtechart.pl
        </a>
      </div>
      <form onSubmit={onSubmit} className="p-6 sm:p-10">
        {sent ? (
          <p className="text-2xl tracking-tight">OK</p>
        ) : (
          <div className="grid gap-6">
            <label className="block font-mono text-[11px] tracking-[0.16em] text-gray-3 uppercase">
              Imię
              <input
                required
                name="name"
                className="mt-2 w-full border-b border-ink bg-transparent py-2 outline-none focus:border-green"
              />
            </label>
            <label className="block font-mono text-[11px] tracking-[0.16em] text-gray-3 uppercase">
              E-mail
              <input
                required
                type="email"
                name="email"
                className="mt-2 w-full border-b border-ink bg-transparent py-2 outline-none focus:border-green"
              />
            </label>
            <label className="block font-mono text-[11px] tracking-[0.16em] text-gray-3 uppercase">
              Wiadomość
              <textarea
                required
                name="message"
                rows={4}
                className="mt-2 w-full resize-none border-b border-ink bg-transparent py-2 outline-none focus:border-green"
              />
            </label>
            <button
              type="submit"
              className="mt-2 w-full bg-ink py-3 text-sm text-white hover:bg-green hover:text-ink"
            >
              Wyślij
            </button>
          </div>
        )}
      </form>
    </section>
  );
}

function Footer() {
  return (
    <footer className="flex items-center justify-between border-t border-ink bg-ink px-5 py-6 text-white sm:px-8 lg:px-10">
      <div className="flex items-center gap-3">
        <XTMark className="h-7 w-7" />
        <span className="text-sm">xtechart</span>
      </div>
      <a href="#top" className="font-mono text-[11px] tracking-[0.16em] text-green uppercase">
        ↑
      </a>
    </footer>
  );
}
